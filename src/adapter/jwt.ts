import * as jwt from 'jsonwebtoken'
import {SignOptions} from 'jsonwebtoken'
import {config} from "../config";
import {Subject} from "../../proto_gen/auth_pb";
import {isAnyStringInArrayB} from "../utils/array";

export interface JwtSignInterface extends SignOptions {
    payload: Subject.AsObject
}

class JwtAdapter {
    /**
     * Sign Guide
     * @param payload - any
     * @param expiresIn - in seconds
     */
    sign(data: JwtSignInterface, expiresIn: number) {
        return jwt.sign(
            data.payload,
            config.jwtSecretKey,
            {
                algorithm: 'HS256',
                expiresIn: `${expiresIn}s`,
                audience: data.audience,
                issuer: config.jwtIssuer,
                subject: data.subject,
                keyid: data.keyid,
                jwtid: data.jwtid,
            }
        )
    }

    validateAudience(payloadAudience: string | string[] | undefined, requiredAudiences: string[]) {
        let aud = payloadAudience ?? []
        if (!Array.isArray(aud)) {
            aud = [aud]
        }

        if (!isAnyStringInArrayB(requiredAudiences, aud)) {
            throw new Error("Invalid audience")
        }
    }

    verify(token: string, audience: string[]): Subject.AsObject {
        const data = jwt.verify(token, config.jwtSecretKey) as jwt.JwtPayload

        if (data.iss !== config.jwtIssuer) {
            throw new Error("Invalid token")
        }

        this.validateAudience(data.aud, audience)

        return {
            xid: data['xid'],
            name: data['name'],
            photoProfile: data['photoProfile'],
        }
    }
}

export const jwtAdapter = new JwtAdapter()