/**
 * Audio codec utilities for encoding/decoding phone call audio packets.
 * Packet format: [UInt32 frameCount][Int16 samples...]
 * Audio format: 16-bit PCM, 16kHz, mono
 */

/**
 * Encode audio samples into a binary packet for transmission
 * @param audioSamples Int16 array of audio samples
 * @param amplify Amplification factor (default 4x, per TheKraken reference)
 * @returns ArrayBuffer ready for WebSocket transmission
 */
export function encodeAudioPacket(audioSamples: Int16Array, amplify: number = 4): ArrayBuffer {
  const frameCount = audioSamples.length;
  const buffer = new ArrayBuffer(4 + frameCount * 2);
  const view = new DataView(buffer);

  // Write frame count as UInt32 (little-endian)
  view.setUint32(0, frameCount, true);

  // Write amplified audio samples as Int16 array
  for (let i = 0; i < frameCount; i++) {
    // Amplify and clamp to Int16 range to prevent overflow
    const amplified = audioSamples[i] * amplify;
    const clamped = Math.max(-32768, Math.min(32767, amplified));
    view.setInt16(4 + i * 2, clamped, true);
  }

  return buffer;
}

/**
 * Decode a binary packet into audio samples for playback
 * @param buffer ArrayBuffer received from WebSocket
 * @returns Int16Array of audio samples
 */
export function decodeAudioPacket(buffer: ArrayBuffer): Int16Array {
  const view = new DataView(buffer);

  // Read frame count (UInt32, little-endian)
  const frameCount = view.getUint32(0, true);

  // Validate packet size
  const expectedSize = 4 + frameCount * 2;
  if (buffer.byteLength !== expectedSize) {
    console.warn(
      `[AudioCodec] Invalid packet size. Expected ${expectedSize}, got ${buffer.byteLength}. Frame count: ${frameCount}`,
    );
    // Return empty array to avoid playback issues
    return new Int16Array(0);
  }

  // Read audio samples
  const samples = new Int16Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    samples[i] = view.getInt16(4 + i * 2, true);
  }

  return samples;
}

/**
 * Validate if a buffer is a valid audio packet
 * @param buffer ArrayBuffer to validate
 * @returns true if valid, false otherwise
 */
export function isValidAudioPacket(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) {
    return false;
  }

  const view = new DataView(buffer);
  const frameCount = view.getUint32(0, true);
  const expectedSize = 4 + frameCount * 2;

  return buffer.byteLength === expectedSize;
}

/**
 * Get packet statistics for debugging
 * @param buffer ArrayBuffer to analyze
 * @returns Packet statistics
 */
export function getPacketStats(buffer: ArrayBuffer): {
  frameCount: number;
  sizeBytes: number;
  durationMs: number;
  isValid: boolean;
} {
  const isValid = isValidAudioPacket(buffer);

  if (!isValid || buffer.byteLength < 4) {
    return {
      frameCount: 0,
      sizeBytes: buffer.byteLength,
      durationMs: 0,
      isValid: false,
    };
  }

  const view = new DataView(buffer);
  const frameCount = view.getUint32(0, true);

  // Calculate duration at 16kHz sample rate
  const durationMs = (frameCount / 16000) * 1000;

  return {
    frameCount,
    sizeBytes: buffer.byteLength,
    durationMs,
    isValid: true,
  };
}
