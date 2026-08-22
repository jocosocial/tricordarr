import {EncodingType, File} from 'expo-file-system';

import {LogLevel} from '#src/Libraries/Logger/types';

type WriteErrorLogger = (message: string, error: unknown) => void;

const defaultWriteErrorLogger: WriteErrorLogger = () => {};

export class LogBuffer {
  private buffer: string[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_DELAY_MS = 5000;
  private readonly MAX_BUFFER_SIZE = 100;
  private getCurrentLogFile: () => File;
  private readonly onWriteError: WriteErrorLogger;

  constructor(getCurrentLogFile: () => File, onWriteError: WriteErrorLogger = defaultWriteErrorLogger) {
    this.getCurrentLogFile = getCurrentLogFile;
    this.onWriteError = onWriteError;
  }

  addLog(message: string, severity: LogLevel) {
    this.buffer.push(message);

    // 1. Immediate flush for errors
    if (severity === LogLevel.ERROR) {
      this.flushNow();
      return;
    }

    // 2. Flush if buffer is full
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      this.flushNow();
      return;
    }

    // 3. Schedule delayed flush (debounced)
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      this.flushNow();
    }, this.FLUSH_DELAY_MS);
  }

  async flushNow() {
    if (this.buffer.length === 0) {
      return;
    }

    const logsToWrite = [...this.buffer];
    this.buffer = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      const logText = logsToWrite.join('\n') + '\n';
      const logFile = this.getCurrentLogFile();
      if (!logFile.exists) {
        logFile.create({intermediates: true});
      }
      logFile.write(logText, {encoding: EncodingType.UTF8, append: true});
    } catch (error) {
      // Logger/index injects a safe internal logger to avoid recursion here.
      this.onWriteError('[LogBuffer] Failed to write logs to file', error);
    }
  }
}
