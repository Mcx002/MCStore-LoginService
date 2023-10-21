import {jwtAdapter, JwtSignInterface} from "../../../src/adapter/jwt.adapter";
import {appConfig} from "../../../src/config";
import * as jwt from "jsonwebtoken"

describe('Adapter JWT Test', () => {
    test('Should Sign a token', () => {
        // Prepare Token
        const payload: JwtSignInterface = {
            payload: {
                xid: 'userId1',
                name: 'userTest1',
                photoProfile: 'uidimage',
            },
            audience: [],
            subject: 'userId1',
            keyid: 'keyid1',
            jwtid: 'jwtid1',
        }
        const token = jwtAdapter.sign(payload, appConfig.anonymousTokenExpiredTime)

        // verify token
        const decoded = jwt.verify(token, appConfig.jwtSecretKey) as jwt.JwtPayload
        expect(decoded.aud).toEqual(payload.audience)
        expect(decoded.sub).toBe(payload.subject)
        expect(decoded.jti).toBe(payload.jwtid)
        expect(decoded['xid']).toBe(payload.payload.xid)
    })

    test('Should throw invalid token', () => {
        // Prepare Token
        const payload: JwtSignInterface = {
            payload: {
                xid: 'userId1',
                name: 'userTest1',
                photoProfile: 'uidimage',
            },
            audience: ['test'],
            subject: 'userId1',
            keyid: 'keyid1',
            jwtid: 'jwtid1',
        }
        appConfig.jwtIssuer = 'testIssuer1'
        const token = jwtAdapter.sign(payload, appConfig.anonymousTokenExpiredTime)

        // verify token
        appConfig.jwtIssuer = 'testIssuer2'
        expect(() => jwtAdapter.verify(token, ['test'])).toThrow('Invalid token')
    })

    test('Should throw invalid audience', () => {
        // verify token
        expect(() => jwtAdapter.validateAudience(undefined, ['test2'])).toThrow('Invalid audience')
    })

    test('Token should valid and return the subject', () => {
        // Prepare Token
        const payload: JwtSignInterface = {
            payload: {
                xid: 'userId1',
                name: 'userTest1',
                photoProfile: 'uidimage',
            },
            audience: 'test',
            subject: 'userId1',
            keyid: 'keyid1',
            jwtid: 'jwtid1',
        }
        const token = jwtAdapter.sign(payload, appConfig.anonymousTokenExpiredTime)

        // verify token
        const subject = jwtAdapter.verify(token, ['test'])
        expect(subject.xid).toBe(payload.payload.xid)
        expect(subject.name).toBe(payload.payload.name)
        expect(subject.photoProfile).toBe(payload.payload.photoProfile)
    })
})
