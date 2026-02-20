/**
 * Logger Utility – Winston-based logging with console and file transports.
 */
const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        // Console output
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'HH:mm:ss' }),
                format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level}: ${message}`;
                })
            ),
        }),
        // File output
        new transports.File({
            filename: path.join(process.cwd(), 'logs', 'test-run.log'),
            maxsize: 5242880, // 5 MB
            maxFiles: 3,
        }),
    ],
});

module.exports = logger;
