import {getEnvNumber, getEnvString} from "./utils/env-parser";

export const appConfig = {
    // Server Configuration
    port: getEnvNumber("PORT", 40000),
    serviceName: getEnvString("SERVICE_NAME", "AuthService"),
    serviceVersion: getEnvString("SERVICE_VERSION", "v0.0.1"),

    // Jwt
    jwtSecretKey: getEnvString("JWT_PRIVATE_KEY"),
    jwtIssuer: getEnvString("JWT_ISSUER", "loginservice.mcstore.com"),

    // Expired Times
    anonymousTokenExpiredTime: getEnvNumber("ANONYMOUS_TOKEN_EXPIRED_TIME", 86400),

    // Database
    dbDialect: getEnvString("DB_DIALECT", "postgres"),
    dbUsername: getEnvString("DB_USERNAME", "postgres"),
    dbPassword: getEnvString("DB_PASSWORD"),
    dbName: getEnvString("DB_NAME", "mcstore-auth"),
    dbHost: getEnvString("DB_HOST", "localhost"),
    dbPort: getEnvNumber("DB_PORT", 5432),
}