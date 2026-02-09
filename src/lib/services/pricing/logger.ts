/**
 * Pricing service logger for monitoring and debugging
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

class PricingLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(level: LogLevel, message: string, source?: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      source,
      metadata,
      timestamp: new Date()
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = source ? `[${source}]` : '[pricing]';
      const metaStr = metadata ? JSON.stringify(metadata) : '';

      switch (level) {
        case 'error':
          console.error(`${prefix} ${message}`, metaStr);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, metaStr);
          break;
        default:
          console.log(`${prefix} ${message}`, metaStr);
      }
    }

    // TODO: Add Sentry or other monitoring service integration here
  }

  info(message: string, source?: string, metadata?: Record<string, unknown>) {
    this.log('info', message, source, metadata);
  }

  warn(message: string, source?: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, source, metadata);
  }

  error(message: string, source?: string, metadata?: Record<string, unknown>) {
    this.log('error', message, source, metadata);
  }

  // Get recent logs for debugging
  getRecentLogs(count = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by source
  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter(log => log.source === source);
  }

  // Get error logs
  getErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }

  // Clear logs
  clear() {
    this.logs = [];
  }
}

export const pricingLogger = new PricingLogger();
