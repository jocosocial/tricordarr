import AVFoundation
import React

@objc(AudioEngine)
class AudioEngine: RCTEventEmitter {
	private var audioEngine: AVAudioEngine?
	private var inputNode: AVAudioInputNode?
	private var playerNode: AVAudioPlayerNode?
	private var sourceNode: AVAudioSourceNode?
	private var formatConverter: AVAudioConverter?
	private var audioFormat: AVAudioFormat?
	private var mixerFormat: AVAudioFormat?

	private var isRunning = false
	private var isMuted = false

	// Audio configuration matching server requirements
	private let sampleRate: Double = 16000.0
	private let channelCount: AVAudioChannelCount = 1
	private let amplificationFactor: Float = 4.0

	override init() {
		super.init()
		setupAudioSession()
		setupConfigurationChangeObserver()
	}

	deinit {
		NotificationCenter.default.removeObserver(self)
	}

	// MARK: - RCTEventEmitter

	override func supportedEvents() -> [String]! {
		return ["onAudioData"]
	}

	override static func requiresMainQueueSetup() -> Bool {
		return true
	}

	// MARK: - Audio Session Setup

	private func setupConfigurationChangeObserver() {
		// Listen for audio engine configuration changes (e.g., when output route changes)
		// This happens when speaker/earpiece is toggled
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(handleConfigurationChange),
			name: .AVAudioEngineConfigurationChange,
			object: nil
		)

		// Also listen for audio session route changes
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(handleRouteChange),
			name: AVAudioSession.routeChangeNotification,
			object: nil
		)
	}

	@objc private func handleConfigurationChange(notification: Notification) {
		guard let audioEngine = audioEngine, isRunning else {
			print("[AudioEngine] Configuration change ignored - engine not running")
			return
		}

		// Audio engine configuration changed (e.g., output route changed)
		// We need to restart the engine to continue playback
		print("[AudioEngine] Configuration changed, restarting audio engine")
		restartAudioEngineIfNeeded()
	}

	@objc private func handleRouteChange(notification: Notification) {
		guard let audioEngine = audioEngine, isRunning else {
			return
		}

		// Audio route changed (e.g., speaker/earpiece toggle)
		// Restart the engine to ensure playback continues
		if let userInfo = notification.userInfo,
			let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
			let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue)
		{
			print("[AudioEngine] Route changed, reason: \(reason.rawValue)")

			// Restart for route changes that might affect playback
			// overrideOutputAudioPort has rawValue 8, but may not be available as enum case
			// So we check both the enum cases and the raw value
			let shouldRestart =
				reason == .newDeviceAvailable || reason == .oldDeviceUnavailable || reason == .categoryChange
				|| reasonValue == 8  // overrideOutputAudioPort

			if shouldRestart {
				print("[AudioEngine] Route change requires engine restart")
				restartAudioEngineIfNeeded()
			}
		}
		else {
			// If we can't determine the reason, restart anyway to be safe
			print("[AudioEngine] Route changed (unknown reason), restarting engine")
			restartAudioEngineIfNeeded()
		}
	}

	private func restartAudioEngineIfNeeded() {
		guard let audioEngine = audioEngine, isRunning else {
			print("[AudioEngine] Cannot restart - engine not initialized or not running")
			return
		}

		print(
			"[AudioEngine] Checking if restart needed - engine running: \(audioEngine.isRunning), player playing: \(playerNode?.isPlaying ?? false)"
		)

		// Check if engine actually stopped
		if !audioEngine.isRunning {
			print("[AudioEngine] Engine stopped, restarting...")
			do {
				// Restart the engine
				try audioEngine.start()
				print("[AudioEngine] Audio engine restarted successfully")
			}
			catch {
				print("[AudioEngine] Failed to restart audio engine: \(error)")
				return
			}
		}

		// Always ensure player node is playing after route change
		// Even if the engine was still running, the player node might have stopped
		// We'll always call play() to ensure it's playing, even if isPlaying returns true
		// This is safe because calling play() on an already-playing node is a no-op
		if let playerNode = playerNode {
			// Always call play() - it's safe to call even if already playing
			playerNode.play()
			print("[AudioEngine] Ensured player node is playing (was playing: \(playerNode.isPlaying))")
		}
		else {
			print("[AudioEngine] Warning: No player node available to restart")
		}
	}

	private func setupAudioSession() {
		let audioSession = AVAudioSession.sharedInstance()
		do {
			// Don't use .defaultToSpeaker - let the app control speaker/earpiece explicitly
			// This allows the user to choose between speaker and earpiece
			try audioSession.setCategory(
				.playAndRecord,
				mode: .voiceChat,
				options: [.allowBluetooth]
			)
			try audioSession.setActive(true)
			print("[AudioEngine] Audio session configured for voice chat")
		}
		catch {
			print("[AudioEngine] Failed to configure audio session: \(error)")
		}
	}

	// MARK: - Public Methods (Exposed to React Native)

	@objc func start(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
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

	@objc func stop(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
		DispatchQueue.main.async { [weak self] in
			self?.stopAudioEngine()
			resolve(true)
		}
	}

	@objc func setMuted(
		_ muted: Bool,
		resolver resolve: @escaping RCTPromiseResolveBlock,
		rejecter reject: @escaping RCTPromiseRejectBlock
	) {
		isMuted = muted
		print("[AudioEngine] Microphone \(muted ? "muted" : "unmuted")")
		resolve(true)
	}

	@objc func setSpeakerOn(
		_ speakerOn: Bool,
		resolver resolve: @escaping RCTPromiseResolveBlock,
		rejecter reject: @escaping RCTPromiseRejectBlock
	) {
		DispatchQueue.main.async { [weak self] in
			guard let self = self else {
				reject("ERROR", "AudioEngine instance deallocated", nil)
				return
			}

			let audioSession = AVAudioSession.sharedInstance()
			do {
				// Change the output port
				if speakerOn {
					try audioSession.overrideOutputAudioPort(.speaker)
				}
				else {
					try audioSession.overrideOutputAudioPort(.none)
				}

				// Reactivate the audio session to ensure it's active after the route change
				// This is important - overrideOutputAudioPort can deactivate the session
				try audioSession.setActive(true, options: [])

				print("[AudioEngine] Speaker mode: \(speakerOn), audio session reactivated")

				// overrideOutputAudioPort may cause the audio engine to stop
				// We need to ensure the engine and player node continue running
				// Do this immediately and also after a delay to catch any delayed changes

				// First, ensure player node is playing before the route change
				// This helps maintain continuity
				if let playerNode = self.playerNode, self.isRunning {
					playerNode.play()
				}

				// Then check and restart after a brief delay to allow route change to complete
				DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
					self?.restartAudioEngineIfNeeded()
				}

				// Also check again after a longer delay to catch any delayed configuration changes
				DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
					self?.restartAudioEngineIfNeeded()
				}

				resolve(true)
			}
			catch {
				reject("SPEAKER_ERROR", "Failed to set speaker mode: \(error.localizedDescription)", error)
			}
		}
	}

	@objc func playAudio(_ audioData: [NSNumber]) {
		guard let playerNode = self.playerNode,
			let audioFormat = self.audioFormat
		else {
			print("[AudioEngine] Cannot play audio - engine not initialized")
			return
		}

		// Convert NSNumber array to Int16 samples
		let samples = audioData.map { Int16(truncating: $0) }
		let frameCount = samples.count

		// Use the mixer format if available, otherwise use our format
		// When connected with mixer format, we need to convert our Int16 samples
		// mixerFormat is optional, audioFormat is already unwrapped, so result is optional
		let bufferFormat = mixerFormat ?? audioFormat

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

		// Schedule buffer for playback
		playerNode.scheduleBuffer(buffer, completionHandler: nil)
	}

	// MARK: - Audio Engine Management

	private func startAudioEngine() throws {
		guard !isRunning else {
			print("[AudioEngine] Already running")
			return
		}

		// Create audio engine
		audioEngine = AVAudioEngine()
		guard let audioEngine = audioEngine else {
			throw NSError(
				domain: "AudioEngine",
				code: 1,
				userInfo: [NSLocalizedDescriptionKey: "Failed to create AVAudioEngine"]
			)
		}

		// Configure input node for microphone capture
		inputNode = audioEngine.inputNode
		guard let inputNode = inputNode else {
			throw NSError(
				domain: "AudioEngine",
				code: 2,
				userInfo: [NSLocalizedDescriptionKey: "No input node available"]
			)
		}

		// Create 16kHz mono format
		// Note: interleaved:false means non-interleaved (planar) format
		// Some audio nodes may not support non-interleaved Int16, so we use interleaved:true
		audioFormat = AVAudioFormat(
			commonFormat: .pcmFormatInt16,
			sampleRate: sampleRate,
			channels: channelCount,
			interleaved: true
		)
		guard let audioFormat = audioFormat else {
			throw NSError(
				domain: "AudioEngine",
				code: 3,
				userInfo: [NSLocalizedDescriptionKey: "Failed to create audio format"]
			)
		}

		// Get input format (device native)
		let inputFormat = inputNode.outputFormat(forBus: 0)

		// Install tap to capture microphone audio
		inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] (buffer, time) in
			self?.processMicrophoneBuffer(buffer, format: inputFormat)
		}

		// Create player node for audio playback
		playerNode = AVAudioPlayerNode()
		guard let playerNode = playerNode else {
			throw NSError(
				domain: "AudioEngine",
				code: 4,
				userInfo: [NSLocalizedDescriptionKey: "Failed to create player node"]
			)
		}

		audioEngine.attach(playerNode)

		// Get mixer format for connection (typically Float32 at 48kHz)
		mixerFormat = audioEngine.mainMixerNode.inputFormat(forBus: 0)

		// Connect player node to mixer
		// IMPORTANT: AVAudioEngine primarily supports Float32 format, not Int16.
		// Connecting with Int16 format can cause crashes. We must connect with
		// the mixer's format (Float32) and convert our Int16 samples to Float32
		// when creating buffers.
		audioEngine.connect(playerNode, to: audioEngine.mainMixerNode, format: mixerFormat)

		// Prepare the engine before starting
		audioEngine.prepare()

		// Start engine - this may throw if the connection format is incompatible
		try audioEngine.start()

		// Start playing on the player node
		playerNode.play()

		isRunning = true
		print("[AudioEngine] Started successfully at \(sampleRate)Hz, \(channelCount) channel(s)")
	}

	private func stopAudioEngine() {
		guard isRunning, let audioEngine = audioEngine else {
			return
		}

		if let inputNode = inputNode {
			inputNode.removeTap(onBus: 0)
		}

		playerNode?.stop()
		audioEngine.stop()

		isRunning = false
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
		sendEvent(withName: "onAudioData", body: ["samples": numberArray])
	}
}
