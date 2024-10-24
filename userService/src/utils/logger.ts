import { createLogger, format, transports } from "winston";
// createLogger - to create customized logger
// format - how I want to see the data
// transports - 

const { combine, timestamp, json, colorize } = format;
import DailyRotateFile from "winston-daily-rotate-file";

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${level}: ${message}`;
    })
);

// Create a Winston logger
const logger = createLogger({
    level: "info",
    format: combine(colorize(), timestamp(), json()),
    transports: [
        new transports.Console({
            format: consoleLogFormat,
           
        }),
    

        new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',  // %DATE% will append date to the file
            datePattern: 'YYYY-MM-DD',        // Rotate files daily based on date
            maxFiles: '7d',                   // Retain log files for 7 days
            zippedArchive: true,              // Compress old log files to save space
        }),
    ],
});

export default logger;