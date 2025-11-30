/**
 * Logger utility for consistent debug logging across the application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private isDebugMode: boolean;

  private constructor() {
    this.isDebugMode = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, context: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    };
  }

  private log(level: LogLevel, context: string, message: string, data?: any): void {
    const logEntry = this.formatLog(level, context, message, data);
    
    const prefix = `[${logEntry.timestamp}] [${level.toUpperCase()}] [${context}]`;
    const fullMessage = `${prefix} ${message}`;

    switch (level) {
      case 'error':
        console.error(fullMessage, data ? data : '');
        break;
      case 'warn':
        console.warn(fullMessage, data ? data : '');
        break;
      case 'debug':
        if (this.isDebugMode) {
          console.log(fullMessage, data ? data : '');
        }
        break;
      case 'info':
      default:
        console.log(fullMessage, data ? data : '');
        break;
    }
  }

  public info(context: string, message: string, data?: any): void {
    this.log('info', context, message, data);
  }

  public warn(context: string, message: string, data?: any): void {
    this.log('warn', context, message, data);
  }

  public error(context: string, message: string, data?: any): void {
    this.log('error', context, message, data);
  }

  public debug(context: string, message: string, data?: any): void {
    this.log('debug', context, message, data);
  }
}

export const logger = Logger.getInstance();
