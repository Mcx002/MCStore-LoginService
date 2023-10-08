import {getEnvNumber, getEnvString} from "./utils/env-parser";

export const config = {
    // Server Configuration
    port: getEnvNumber("PORT", 40000),
    serviceName: getEnvString("SERVICE_NAME", "AuthService"),
    serviceVersion: getEnvString("SERVICE_VERSION", "v0.0.1"),

    // Jwt
    jwtSecretKey: getEnvString("JWT_PRIVATE_KEY", 'secretKey'),
    jwtIssuer: getEnvString("JWT_ISSUER", 'loginservice.mcstore.com'),

    // Expired Times
    anonymousTokenExpiredTime: getEnvNumber("ANONYMOUS_TOKEN_EXPIRED_TIME", 86400),
}