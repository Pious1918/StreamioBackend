import { createLogger, format, transports } from "winston";


const { combine, timestamp, json, colorize } = format;
import DailyRotateFile from "winston-daily-rotate-file";


const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
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
            filename: 'logs/app-%DATE%.log', 
            datePattern: 'YYYY-MM-DD',        
            maxFiles: '7d',                   
            zippedArchive: true,             
        }),
    ],
});

export default logger;