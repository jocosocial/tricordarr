/**
 * expo-file-system 58 made `File.write` asynchronous. These tests pin the callers that must
 * await it: the query cache must not move its temp file until the write lands, and a failed
 * write must reach the caller's error handling instead of escaping as an unhandled rejection.
 */
const mockEvents: string[] = [];
const mockPendingWrites: Array<{resolve: () => void; reject: (error: Error) => void}> = [];

jest.mock('expo-file-system', () => {
  class MockFile {
    name: string;
    size = 0;
    exists = true;
    constructor(_parent: unknown, name: string) {
      this.name = name;
    }
    create() {
      mockEvents.push(`create ${this.name}`);
    }
    delete() {
      mockEvents.push(`delete ${this.name}`);
    }
    write(_content: string, options?: {append?: boolean}) {
      mockEvents.push(`write start ${this.name}${options?.append ? ' append' : ''}`);
      return new Promise<void>((resolve, reject) => {
        mockPendingWrites.push({
          resolve: () => {
            mockEvents.push(`write done ${this.name}`);
            resolve();
          },
          reject,
        });
      });
    }
    async move(destination: MockFile) {
      mockEvents.push(`move ${this.name} -> ${destination.name}`);
    }
  }
  return {File: MockFile, Paths: {document: 'document'}, EncodingType: {UTF8: 'utf8'}};
});

const mockLoggerError = jest.fn();
jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: (...args: unknown[]) => mockLoggerError(...args),
  }),
}));

import {File} from 'expo-file-system';

import {LogBuffer} from '#src/Libraries/Logger/LogBuffer';
import {LogLevel} from '#src/Libraries/Logger/types';
import {queryCacheStorage} from '#src/Libraries/Storage/QueryCacheStorage';

/**
 * Let queued promise callbacks run.
 */
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));

beforeEach(() => {
  mockEvents.length = 0;
  mockPendingWrites.length = 0;
  mockLoggerError.mockClear();
});

describe('queryCacheStorage.setItem', () => {
  it('moves the temp file only after the write has completed', async () => {
    const result = queryCacheStorage.setItem('query-cache-abc', '{}');
    await flushMicrotasks();
    expect(mockEvents).toEqual(['write start query-cache-abc.json.tmp']);

    mockPendingWrites[0].resolve();
    await result;
    expect(mockEvents).toEqual([
      'write start query-cache-abc.json.tmp',
      'write done query-cache-abc.json.tmp',
      'move query-cache-abc.json.tmp -> query-cache-abc.json',
    ]);
  });

  it('rejects to the caller and skips the move when the write fails', async () => {
    const result = queryCacheStorage.setItem('query-cache-abc', '{}');
    await flushMicrotasks();
    const error = new Error('Unable to create file or directory: it already exists');
    mockPendingWrites[0].reject(error);

    await expect(result).rejects.toBe(error);
    expect(mockEvents).not.toContain('move query-cache-abc.json.tmp -> query-cache-abc.json');
    expect(mockLoggerError).toHaveBeenCalled();
  });
});

describe('LogBuffer.flushNow', () => {
  const makeBuffer = (onWriteError = jest.fn()) => ({
    onWriteError,
    buffer: new LogBuffer(() => new File('logs', 'app.log'), onWriteError),
  });

  it('appends the buffered lines and resolves once the write completes', async () => {
    const {buffer, onWriteError} = makeBuffer();
    buffer.addLog('hello', LogLevel.INFO);
    const result = buffer.flushNow();
    await flushMicrotasks();
    expect(mockEvents).toEqual(['write start app.log append']);

    mockPendingWrites[0].resolve();
    await result;
    expect(mockEvents).toContain('write done app.log');
    expect(onWriteError).not.toHaveBeenCalled();
  });

  it('reports a rejected write through onWriteError instead of rejecting', async () => {
    const {buffer, onWriteError} = makeBuffer();
    buffer.addLog('hello', LogLevel.INFO);
    const result = buffer.flushNow();
    await flushMicrotasks();
    const error = new Error('write failed');
    mockPendingWrites[0].reject(error);

    await expect(result).resolves.toBeUndefined();
    expect(onWriteError).toHaveBeenCalledWith('[LogBuffer] Failed to write logs to file', error);
  });
});
