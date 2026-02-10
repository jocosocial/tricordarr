import {AppState} from 'react-native';
import RNFS from 'react-native-fs';
import {consoleTransport, logger as rnLogger} from 'react-native-logs';

import {getAppConfig} from '#src/Libraries/AppConfig';
import {LogBuffer} from '#src/Libraries/Logger/LogBuffer';
import {Logger, LogLevel} from '#src/Libraries/Logger/types';

// let currentLogLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.WARN;
let currentLogLevel: LogLevel = LogLevel.DEBUG;
let logBuffer: LogBuffer | null = null;

// Log directory and file management
const LOG_DIR = `${RNFS.DocumentDirectoryPath}/logs`;
const LOG_RETENTION_DAYS = 7;

const getCurrentLogFilePath = (): string => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${LOG_DIR}/app-${dateStr}.log`;
};

const ensureLogDirectory = async (): Promise<void> => {
  try {
    const exists = await RNFS.exists(LOG_DIR);
    if (!exists) {
      await RNFS.mkdir(LOG_DIR);
    }
  } catch (error) {
    console.error('[Logger] Failed to create log directory:', error);
  }
};

const rotateLogFiles = async (): Promise<void> => {
  try {
    const files = await RNFS.readDir(LOG_DIR);
    const now = Date.now();
    const maxAge = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000; // milliseconds

    for (const file of files) {
      if (file.name.startsWith('app-') && file.name.endsWith('.log')) {
        if (!file.mtime) continue;
        const fileAge = now - new Date(file.mtime).getTime();
        if (fileAge > maxAge) {
          await RNFS.unlink(file.path);
        }
      }
    }
  } catch (error) {
    console.error('[Logger] Failed to rotate log files:', error);
  }
};

const formatLogMessage = (level: string, tag: string, message: string): string => {
  const timestamp =
    new Date().toISOString().replace('T', ' ').split('.')[0] +
    '.' +
    new Date().getMilliseconds().toString().padStart(3, '0');
  return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
};

// Initialize buffer
logBuffer = new LogBuffer(getCurrentLogFilePath);

// Create base logger with console transport
const config = {
  severity: currentLogLevel,
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'grey' as const,
      info: 'blueBright' as const,
      warn: 'yellowBright' as const,
      error: 'redBright' as const,
    },
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  async: true,
  dateFormat: 'iso',
  printLevel: true,
  printDate: true,
  enabled: true,
};

const rootLogger = rnLogger.createLogger(config);

// Initialize logging system
const initializeLogger = async () => {
  try {
    // Load config
    const appConfig = await getAppConfig();
    currentLogLevel = appConfig.logLevel;
    rootLogger.setSeverity(currentLogLevel);

    // Setup file system
    await ensureLogDirectory();
    await rotateLogFiles();

    // Setup AppState listener for background flushing
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'background' || state === 'inactive') {
        logBuffer?.flushNow();
      }
    });
    return () => subscription.remove();
  } catch (error) {
    console.error('[Logger] Failed to initialize logger:', error);
  }
};

// Auto-initialize
initializeLogger();

// Logger factory function
export const createLogger = (tag: string): Logger => {
  return {
    debug: (message: string, ...args: any[]) => {
      const formattedMessage = formatLogMessage('debug', tag, message);
      rootLogger.debug(message, ...args);
      if (currentLogLevel === LogLevel.DEBUG) {
        logBuffer?.addLog(formattedMessage, LogLevel.DEBUG);
      }
    },
    info: (message: string, ...args: any[]) => {
      const formattedMessage = formatLogMessage('info', tag, message);
      rootLogger.info(message, ...args);
      if (currentLogLevel === LogLevel.DEBUG || currentLogLevel === LogLevel.INFO) {
        logBuffer?.addLog(formattedMessage, LogLevel.INFO);
      }
    },
    warn: (message: string, ...args: any[]) => {
      const formattedMessage = formatLogMessage('warn', tag, message);
      rootLogger.warn(message, ...args);
      if (currentLogLevel !== LogLevel.ERROR) {
        logBuffer?.addLog(formattedMessage, LogLevel.WARN);
      }
    },
    error: (message: string, ...args: any[]) => {
      const formattedMessage = formatLogMessage('error', tag, message);
      rootLogger.error(message, ...args);
      logBuffer?.addLog(formattedMessage, LogLevel.ERROR);
    },
  };
};

// Update log level dynamically
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
  rootLogger.setSeverity(level);
};

// Export log management functions
export const getLogDirectory = (): string => LOG_DIR;

export const getCurrentLogFile = (): string => getCurrentLogFilePath();

export const getAllLogFiles = async (): Promise<string[]> => {
  try {
    const files = await RNFS.readDir(LOG_DIR);
    return files
      .filter(file => file.name.startsWith('app-') && file.name.endsWith('.log'))
      .map(file => file.path)
      .sort()
      .reverse(); // Most recent first
  } catch (error) {
    console.error('[Logger] Failed to list log files:', error);
    return [];
  }
};

export const clearAllLogs = async (): Promise<void> => {
  try {
    // Flush buffer first
    await logBuffer?.flushNow();

    const files = await getAllLogFiles();
    for (const filePath of files) {
      await RNFS.unlink(filePath);
    }
  } catch (error) {
    console.error('[Logger] Failed to clear logs:', error);
    throw error;
  }
};

export const getLogFileInfo = async (): Promise<{
  path: string;
  size: string;
  lastModified: string;
} | null> => {
  try {
    const logFilePath = getCurrentLogFilePath();
    const exists = await RNFS.exists(logFilePath);

    if (!exists) {
      return null;
    }

    const stat = await RNFS.stat(logFilePath);
    const sizeKB = (stat.size / 1024).toFixed(2);

    return {
      path: logFilePath,
      size: `${sizeKB} KB`,
      lastModified: new Date(stat.mtime).toLocaleString(),
    };
  } catch (error) {
    console.error('[Logger] Failed to get log file info:', error);
    return null;
  }
};

export const flushLogs = async (): Promise<void> => {
  await logBuffer?.flushNow();
};
