import { createLogger, format, transports } from "winston";

const { combine, timestamp, json, colorize } = format;
import DailyRotateFile from "winston-daily-rotate-file";

const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message,  }) => {
        return `${level}: ${message}`;
    })
);

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