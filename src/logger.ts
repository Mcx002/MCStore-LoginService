import winston from "winston";
import {appConfig} from "./config";

export const logger = winston.createLogger({
    level: appConfig.loggerLevel,
    format: winston.format.json(),
    defaultMeta: { service: 'auth-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
