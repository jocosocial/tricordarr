import AVFoundation

public typealias TricordarrPromiseResolveBlock = @convention(block) (Any?) -> Void
public typealias TricordarrPromiseRejectBlock = @convention(block) (String, String, Error?) -> Void

@objc public protocol AudioEngineCoreDelegate: AnyObject {
	func audioEngineDidCaptureAudioData(_ samples: [NSNumber])
}

@objc(AudioEngineCore)
public class AudioEngine: NSObject {
	@objc public weak var delegate: AudioEngineCoreDelegate?

	private var audioEngine: AVAudioEngine?
	private var inputNode: AVAudioInputNode?
	private var playerNode: AVAudioPlayerNode?
	private var sourceNode: AVAudioSourceNode?
	private var formatConverter: AVAudioConverter?
	private var audioFormat: AVAudioFormat?
	private var mixerFormat: AVAudioFormat?

	private var isRunning = false
	private var isMuted = false

	// Graph-repair bookkeeping. Main queue only.
	private var isReconfiguring = false
	private var pendingRebuild: DispatchWorkItem?
	private var pendingSessionReactivation = false
	private var speakerOn = false

	// playAudio() runs on the JS thread while rebuilds run on the main queue, so the graph handles
	// they both touch are guarded. Scheduling a buffer whose format does not match the one the
	// player node was connected with is a crash, not a glitch.
	private let graphLock = NSLock()

	// Audio configuration matching server requirements
	private let sampleRate: Double = 16000.0
	private let channelCount: AVAudioChannelCount = 1
	private let amplificationFactor: Float = 4.0

	public override init() {
		super.init()
		// Intentionally do NOT activate AVAudioSession here.
		// Doing so during module initialization can pause external audio on app launch.
		setupConfigurationChangeObserver()
	}

	deinit {
		NotificationCenter.default.removeObserver(self)
	}

	// MARK: - Audio Session Setup

	private func setupConfigurationChangeObserver() {
		// AVAudioEngineConfigurationChange is the authoritative "your graph is no longer valid"
		// signal and is posted whenever the hardware format changes underneath us.
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(handleConfigurationChange),
			name: .AVAudioEngineConfigurationChange,
			object: nil
		)

		// Route changes usually also produce a configuration change, but not always: overriding the
		// output port to the speaker on a route whose hardware format is unchanged posts only this.
		// Both feed the same coalesced repair, so handling both is cheap and missing either is not.
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(handleRouteChange),
			name: AVAudioSession.routeChangeNotification,
			object: nil
		)

		// Without these two the engine simply dies. A phone call, Siri, or a media services reset
		// stops the engine and nothing was listening, so the call stayed up with no audio until the
		// user hung up.
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(handleInterruption),
			name: AVAudioSession.interruptionNotification,
			object: nil
		)
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(handleMediaServicesReset),
			name: AVAudioSession.mediaServicesWereResetNotification,
			object: nil
		)
	}

	// MARK: - Graph repair
	//
	// Everything that mutates the engine graph funnels through scheduleRebuild() so that it happens
	// on the main queue, one at a time, and at most once per burst of notifications. The previous
	// implementation had four independent repair paths -- two dispatched timers plus two observers,
	// none of which hopped to the main queue -- so a single speaker toggle could tear down and
	// rebuild the graph from several threads at once. That race is what dropped the audio stream.

	@objc private func handleConfigurationChange(notification: Notification) {
		print("[AudioEngine] Configuration changed")
		scheduleRebuild()
	}

	@objc private func handleRouteChange(notification: Notification) {
		if let userInfo = notification.userInfo,
			let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt
		{
			print("[AudioEngine] Route changed, reason: \(reasonValue)")
		}
		scheduleRebuild()
	}

	@objc private func handleInterruption(notification: Notification) {
		guard let userInfo = notification.userInfo,
			let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
			let type = AVAudioSession.InterruptionType(rawValue: typeValue)
		else {
			return
		}

		switch type {
		case .began:
			// The system has already stopped our engine. Nothing to do but note it; the call's socket
			// stays open so audio resumes if and when we are allowed back.
			print("[AudioEngine] Interruption began")
		case .ended:
			let options = (userInfo[AVAudioSessionInterruptionOptionKey] as? UInt).map {
				AVAudioSession.InterruptionOptions(rawValue: $0)
			}
			print("[AudioEngine] Interruption ended, shouldResume: \(options?.contains(.shouldResume) ?? false)")
			// Rebuild regardless of shouldResume: this is a call, and the user expects it back.
			scheduleRebuild(reactivateSession: true)
		@unknown default:
			break
		}
	}

	@objc private func handleMediaServicesReset(notification: Notification) {
		// Every audio object is invalid after this, including the session configuration.
		print("[AudioEngine] Media services were reset")
		scheduleRebuild(reactivateSession: true)
	}

	/// Coalesce a burst of notifications into one rebuild on the main queue.
	private func scheduleRebuild(reactivateSession: Bool = false) {
		if reactivateSession {
			pendingSessionReactivation = true
		}

		DispatchQueue.main.async { [weak self] in
			guard let self = self, self.isRunning else { return }

			self.pendingRebuild?.cancel()
			let work = DispatchWorkItem { [weak self] in
				self?.performRebuild()
			}
			self.pendingRebuild = work
			// A route change and a configuration change for the same event arrive milliseconds apart.
			DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: work)
		}
	}

	/// Tear the engine down and build a fresh one. Main queue only.
	private func performRebuild() {
		guard isRunning, !isReconfiguring else { return }
		isReconfiguring = true
		defer { isReconfiguring = false }

		if pendingSessionReactivation {
			pendingSessionReactivation = false
			setupAudioSession()
		}

		print("[AudioEngine] Rebuilding audio engine")
		teardownEngine()

		do {
			try buildAndStartEngine()
			print("[AudioEngine] Rebuild complete")
		}
		catch {
			print("[AudioEngine] Rebuild failed: \(error)")
		}
	}

	private func setupAudioSession() {
		let audioSession = AVAudioSession.sharedInstance()
		do {
			let desiredCategory = AVAudioSession.Category.playAndRecord
			let desiredMode = AVAudioSession.Mode.voiceChat
			// Deliberately not .allowBluetoothA2DP: on a playAndRecord session that routes output to
			// A2DP while input stays on the built-in mic, which is an echo source.
			let desiredOptions: AVAudioSession.CategoryOptions = [.allowBluetooth]

			// Keep category/mode updates idempotent to avoid unnecessary churn. The options have to be
			// part of that comparison: without it, the first call in a process wins and every later
			// change to the options is silently skipped because the category and mode already match.
			if audioSession.category != desiredCategory || audioSession.mode != desiredMode
				|| audioSession.categoryOptions != desiredOptions
			{
				// Don't use .defaultToSpeaker - let the app control speaker/earpiece explicitly
				// This allows the user to choose between speaker and earpiece
				try audioSession.setCategory(
					desiredCategory,
					mode: desiredMode,
					options: desiredOptions
				)
			}

			// Pin the rate so the built-in routes stop flipping between 44.1k and 48k, which is what
			// forced a full graph rebuild on an ordinary speaker toggle. This is only a preference:
			// Bluetooth HFP is locked to 8/16k, so rebuilds still happen and must still work.
			try? audioSession.setPreferredSampleRate(48000.0)
			try? audioSession.setPreferredIOBufferDuration(0.005)

			try audioSession.setActive(true)
			print("[AudioEngine] Audio session configured for voice chat")
		}
		catch {
			print("[AudioEngine] Failed to configure audio session: \(error)")
		}
	}

	// MARK: - Public Methods (called from ObjC++ TurboModule host)

	@objc public func start(_ resolve: @escaping TricordarrPromiseResolveBlock, rejecter reject: @escaping TricordarrPromiseRejectBlock) {
		DispatchQueue.main.async { [weak self] in
			guard let self = self else {
				reject("ERROR", "AudioEngine instance deallocated", nil)
				return
			}

			do {
				try self.startAudioEngine()
				resolve(true)
			}
			catch {
				reject("START_ERROR", "Failed to start audio engine: \(error.localizedDescription)", error)
			}
		}
	}

	@objc public func stop(_ resolve: @escaping TricordarrPromiseResolveBlock, rejecter reject: @escaping TricordarrPromiseRejectBlock) {
		DispatchQueue.main.async { [weak self] in
			self?.stopAudioEngine()
			resolve(true)
		}
	}

	@objc public func setMuted(
		_ muted: Bool,
		resolver resolve: @escaping TricordarrPromiseResolveBlock,
		rejecter reject: @escaping TricordarrPromiseRejectBlock
	) {
		isMuted = muted
		print("[AudioEngine] Microphone \(muted ? "muted" : "unmuted")")
		resolve(true)
	}

	@objc public func setSpeakerOn(
		_ speakerOn: Bool,
		resolver resolve: @escaping TricordarrPromiseResolveBlock,
		rejecter reject: @escaping TricordarrPromiseRejectBlock
	) {
		DispatchQueue.main.async { [weak self] in
			guard let self = self else {
				reject("ERROR", "AudioEngine instance deallocated", nil)
				return
			}

			self.speakerOn = speakerOn

			guard self.isRunning else {
				// Remembered above; applied by startAudioEngine() once the engine exists.
				print("[AudioEngine] Speaker mode recorded while engine stopped: \(speakerOn)")
				resolve(true)
				return
			}

			do {
				// Just move the port. Notably absent compared to the previous implementation:
				//   - setActive(true): overrideOutputAudioPort does not deactivate the session, so this
				//     was never needed, and re-activating mid-call emits another route-change
				//     notification that fed the restart cascade.
				//   - two asyncAfter restarts at +0.1s and +0.3s: any repair the route change actually
				//     requires now arrives through scheduleRebuild(), once, on the main queue.
				try AVAudioSession.sharedInstance().overrideOutputAudioPort(speakerOn ? .speaker : .none)
				print("[AudioEngine] Speaker mode: \(speakerOn)")
				resolve(true)
			}
			catch {
				reject("SPEAKER_ERROR", "Failed to set speaker mode: \(error.localizedDescription)", error)
			}
		}
	}

	@objc public func playAudio(_ audioData: [NSNumber]) {
		// Called on the JS thread every 20ms while rebuilds run on the main queue. Take a consistent
		// snapshot of the graph rather than reading the properties one at a time: pairing a player
		// node with the format from a different graph generation is a crash, not a glitch.
		graphLock.lock()
		let playerNode = self.playerNode
		let audioFormat = self.audioFormat
		let snapshotMixerFormat = self.mixerFormat
		graphLock.unlock()

		guard let playerNode = playerNode, let audioFormat = audioFormat else {
			print("[AudioEngine] Cannot play audio - engine not initialized")
			return
		}

		// Convert NSNumber array to Int16 samples
		let samples = audioData.map { Int16(truncating: $0) }
		let frameCount = samples.count

		// Use the mixer format if available, otherwise use our format
		// When connected with mixer format, we need to convert our Int16 samples
		let bufferFormat = snapshotMixerFormat ?? audioFormat

		// Calculate sample rate ratio for upsampling/downsampling
		let sampleRateRatio = bufferFormat.sampleRate / audioFormat.sampleRate
		let outputFrameCount = Int(Double(frameCount) * sampleRateRatio)

		// Create buffer with capacity for the upsampled frame count
		guard let buffer = AVAudioPCMBuffer(pcmFormat: bufferFormat, frameCapacity: AVAudioFrameCount(outputFrameCount))
		else {
			print(
				"[AudioEngine] Failed to create audio buffer. Format: \(bufferFormat), frameCount: \(outputFrameCount)"
			)
			return
		}

		// Set buffer length to upsampled frame count
		buffer.frameLength = AVAudioFrameCount(outputFrameCount)

		// Copy samples to buffer - convert format if needed
		// Check if formats match by comparing key properties
		let formatsMatch =
			bufferFormat.commonFormat == audioFormat.commonFormat
			&& abs(bufferFormat.sampleRate - audioFormat.sampleRate) < 0.001
			&& bufferFormat.channelCount == audioFormat.channelCount

		if formatsMatch {
			// Same format and sample rate - direct copy
			if let channelData = buffer.int16ChannelData {
				let channelDataPointer = channelData.pointee
				for i in 0..<frameCount {
					channelDataPointer[i] = samples[i]
				}
			}
			else {
				print("[AudioEngine] Warning: Formats match but no int16 channel data available")
				return
			}
		}
		else {
			// Different format - convert Int16 to Float32
			// The mixer format is typically Float32, so we need to convert
			guard let channelData = buffer.floatChannelData else {
				print(
					"[AudioEngine] Error: Cannot convert - no float channel data available. Buffer format: \(bufferFormat), Audio format: \(audioFormat)"
				)
				return
			}

			let channelDataPointer = channelData.pointee

			// Handle sample rate conversion
			if abs(sampleRateRatio - 1.0) < 0.001 {
				// Same sample rate - just convert format
				for i in 0..<frameCount {
					channelDataPointer[i] = Float(samples[i]) / 32768.0
				}
			}
			else {
				// Different sample rate - need to upsample/downsample
				// Simple linear interpolation for upsampling (repeat samples)
				// For downsampling, we skip samples
				for i in 0..<outputFrameCount {
					let sourceIndex = Int(Double(i) / sampleRateRatio)
					if sourceIndex < frameCount {
						channelDataPointer[i] = Float(samples[sourceIndex]) / 32768.0
					}
					else {
						// Pad with last sample if needed
						channelDataPointer[i] = Float(samples[frameCount - 1]) / 32768.0
					}
				}
			}
		}

		playerNode.scheduleBuffer(buffer, completionHandler: nil)
	}

	// MARK: - Audio Engine Management

	private func startAudioEngine() throws {
		guard !isRunning else {
			print("[AudioEngine] Already running")
			return
		}

		// Activate the audio session only when call audio starts so cold launch
		// does not interrupt music/podcasts from other apps.
		setupAudioSession()

		try buildAndStartEngine()
		isRunning = true

		// Apply whatever route the UI asked for before the engine existed.
		if speakerOn {
			try? AVAudioSession.sharedInstance().overrideOutputAudioPort(.speaker)
		}

		print("[AudioEngine] Started successfully at \(sampleRate)Hz, \(channelCount) channel(s)")
	}

	/// Build the node graph against the *current* hardware format and start it.
	///
	/// Split out of startAudioEngine() so that a rebuild can construct a brand new AVAudioEngine
	/// rather than patching the existing one's taps and connections in place. Reusing an engine
	/// across a hardware format change is the fragile path; the native reference client discards
	/// and recreates its engine for the same reason.
	private func buildAndStartEngine() throws {
		let engine = AVAudioEngine()

		let input = engine.inputNode

		// Create 16kHz mono format
		// Note: interleaved:false means non-interleaved (planar) format
		// Some audio nodes may not support non-interleaved Int16, so we use interleaved:true
		guard
			let targetFormat = AVAudioFormat(
				commonFormat: .pcmFormatInt16,
				sampleRate: sampleRate,
				channels: channelCount,
				interleaved: true
			)
		else {
			throw NSError(
				domain: "AudioEngine",
				code: 3,
				userInfo: [NSLocalizedDescriptionKey: "Failed to create audio format"]
			)
		}

		// Get input format (device native)
		let inputFormat = input.outputFormat(forBus: 0)

		// Install tap to capture microphone audio
		input.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] (buffer, time) in
			self?.processMicrophoneBuffer(buffer, format: inputFormat)
		}

		let player = AVAudioPlayerNode()
		engine.attach(player)

		// Connect player node to mixer.
		// IMPORTANT: AVAudioEngine primarily supports Float32 format, not Int16. Connecting with Int16
		// format can cause crashes. We must connect with the mixer's format (Float32) and convert our
		// Int16 samples to Float32 when creating buffers.
		let newMixerFormat = engine.mainMixerNode.inputFormat(forBus: 0)
		engine.connect(player, to: engine.mainMixerNode, format: newMixerFormat)

		engine.prepare()
		try engine.start()
		player.play()

		// Publish the new graph to playAudio() atomically. It reads these from the JS thread.
		graphLock.lock()
		audioEngine = engine
		inputNode = input
		playerNode = player
		audioFormat = targetFormat
		mixerFormat = newMixerFormat
		graphLock.unlock()
	}

	/// Stop and discard the current graph. Main queue only.
	private func teardownEngine() {
		graphLock.lock()
		let engine = audioEngine
		let input = inputNode
		let player = playerNode
		audioEngine = nil
		inputNode = nil
		playerNode = nil
		graphLock.unlock()

		input?.removeTap(onBus: 0)
		player?.stop()
		engine?.stop()
	}

	private func stopAudioEngine() {
		guard isRunning else {
			return
		}

		// Drop any coalesced rebuild so it cannot resurrect the graph after teardown.
		pendingRebuild?.cancel()
		pendingRebuild = nil
		pendingSessionReactivation = false

		teardownEngine()
		do {
			// Tell iOS we are done with call audio so interrupted apps can resume.
			try AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])
			print("[AudioEngine] Audio session deactivated")
		}
		catch {
			print("[AudioEngine] Failed to deactivate audio session: \(error)")
		}

		isRunning = false
		speakerOn = false
		print("[AudioEngine] Stopped")
	}

	// MARK: - Audio Processing

	private func processMicrophoneBuffer(_ buffer: AVAudioPCMBuffer, format inputFormat: AVAudioFormat) {
		guard !isMuted else {
			return  // Don't send audio when muted
		}

		guard let audioFormat = audioFormat else {
			return
		}

		// Convert to target format (16kHz mono Int16) if needed
		var targetBuffer = buffer
		if inputFormat != audioFormat {
			guard let converter = AVAudioConverter(from: inputFormat, to: audioFormat),
				let convertedBuffer = AVAudioPCMBuffer(
					pcmFormat: audioFormat,
					frameCapacity: AVAudioFrameCount(Double(buffer.frameLength) * (sampleRate / inputFormat.sampleRate))
				)
			else {
				print("[AudioEngine] Failed to create audio converter")
				return
			}

			var error: NSError?
			let inputBlock: AVAudioConverterInputBlock = { inNumPackets, outStatus in
				outStatus.pointee = .haveData
				return buffer
			}

			converter.convert(to: convertedBuffer, error: &error, withInputFrom: inputBlock)

			if let error = error {
				print("[AudioEngine] Conversion error: \(error)")
				return
			}

			targetBuffer = convertedBuffer
		}

		// Extract Int16 samples
		guard let channelData = targetBuffer.int16ChannelData else {
			print("[AudioEngine] No channel data available")
			return
		}

		let frameCount = Int(targetBuffer.frameLength)
		let channelDataPointer = channelData.pointee

		// Amplify and clamp samples
		var amplifiedSamples: [Int16] = []
		amplifiedSamples.reserveCapacity(frameCount)

		for i in 0..<frameCount {
			let sample = channelDataPointer[i]
			let amplified = Float(sample) * amplificationFactor
			let clamped = Int16(max(-32768, min(32767, amplified)))
			amplifiedSamples.append(clamped)
		}

		// Send to JavaScript as NSNumber array
		let numberArray = amplifiedSamples.map { NSNumber(value: $0) }
		delegate?.audioEngineDidCaptureAudioData(numberArray)
	}
}
