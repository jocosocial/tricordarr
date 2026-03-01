/**
 * Jitter buffer for audio packet playback smoothing.
 * Handles network latency variations by buffering incoming audio packets
 * before playing them back.
 */
export class AudioJitterBuffer {
  private buffer: Int16Array[] = [];
  private readonly minBufferSize: number;
  private readonly maxBufferSize: number;

  /**
   * @param minBufferSize Minimum packets to buffer before starting playback (~60ms at 20ms packets)
   * @param maxBufferSize Maximum buffer size to prevent excessive latency (~200ms)
   */
  constructor(minBufferSize: number = 3, maxBufferSize: number = 10) {
    this.minBufferSize = minBufferSize;
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Add an audio packet to the buffer
   * @param samples Audio samples to enqueue
   */
  enqueue(samples: Int16Array): void {
    this.buffer.push(samples);

    // Drop oldest packet if buffer is full (overflow protection)
    if (this.buffer.length > this.maxBufferSize) {
      const dropped = this.buffer.shift();
      console.warn(
        `[AudioJitterBuffer] Buffer overflow, dropped ${dropped?.length || 0} samples. Buffer size: ${this.buffer.length}`,
      );
    }
  }

  /**
   * Get the next audio packet from the buffer
   * @returns Audio samples or null if not enough buffered
   */
  dequeue(): Int16Array | null {
    // Wait until we have enough packets buffered
    if (this.buffer.length >= this.minBufferSize) {
      return this.buffer.shift() || null;
    }

    // Not enough packets buffered yet
    return null;
  }

  /**
   * Check if buffer is ready for playback
   */
  isReady(): boolean {
    return this.buffer.length >= this.minBufferSize;
  }

  /**
   * Get current buffer size
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * Clear all buffered packets
   */
  clear(): void {
    this.buffer = [];
    console.log('[AudioJitterBuffer] Buffer cleared');
  }

  /**
   * Get buffer statistics for monitoring
   */
  getStats(): {size: number; minSize: number; maxSize: number; isReady: boolean} {
    return {
      size: this.buffer.length,
      minSize: this.minBufferSize,
      maxSize: this.maxBufferSize,
      isReady: this.isReady(),
    };
  }
}
