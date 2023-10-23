import {
    createUserAuthToken,
    isUserAuthEmailExists,
    registerUserAuth,
    sendEmailVerificationMail,
    validateUserAccount, validateUserEmailVerification
} from "../../../src/services/user-auth.service";
import {UserAuthAttributes} from "../../../src/models/user-auth.model";
import {createHash} from 'crypto';
import {AttemptSessionAttributes, AttemptSessionPurpose} from "../../../src/models/attempt-session.model";
import {appConfig} from "../../../src/config";
import {UserAuthDto} from "../../../proto_gen/user-auth_pb";
import {Subject, SubjectType} from "../../../proto_gen/auth_pb";
import {jwtAdapter} from "../../../src/adapter/jwt.adapter";

describe('Service registerUserAuth Test', () => {
    test('Should throw Password required', async () => {
        const payload = new UserAuthDto()
        const subject = new Subject()

        expect(async () => registerUserAuth(payload, subject)).rejects.toThrow('Password required')
    })

    test('Should return user auth dto', async () => {
        const payload = new UserAuthDto()
        payload.setPassword('pass')

        const subject = new Subject()

        // create user auth attributes mock
        const userAuthMock: UserAuthAttributes = {
            createdAt: new Date(),
            email: "email@test.com",
            id: 1,
            password: "test",
            updatedAt: new Date(),
            userId: 1,
            version: 1,
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'insertUserAuth').mockReturnValue(userAuthMock)

        const userAuthDto = await registerUserAuth(payload, subject)

        expect(userAuthDto.getToken() !== '').toBe(true)
    })

    test('Should return email is exists true', async () => {
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmail').mockReturnValue({})

        const isEmailExists = await isUserAuthEmailExists('test@email.com')
        expect(isEmailExists).toBe(true)
    })

    test('Should return email is exists false', async () => {
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmail').mockReturnValue(null)

        const isEmailExists = await isUserAuthEmailExists('test@email.com')
        expect(isEmailExists).toBe(false)
    })

})

describe('Service validateUserAccount Test', () => {
    test('Should throw user auth not found error', async () => {
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmail').mockReturnValue(null)

        expect(async () => validateUserAccount(new UserAuthDto(), new Subject())).rejects.toThrow("user auth not found")
    })

    test('Should throw password required', async () => {
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmail').mockReturnValue({})

        expect(async () => validateUserAccount(new UserAuthDto(), new Subject())).rejects.toThrow("password required")
    })

    test('Should throw auth invalid', async () => {
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmail').mockReturnValue({})

        const userAuthDto = new UserAuthDto()
        userAuthDto.setPassword('test')

        expect(async () => validateUserAccount(userAuthDto, new Subject())).rejects.toThrow("auth invalid")
    })

    test('Should return true', async () => {
        const password = 'test'
        const hashedPassword = createHash('sha256').update(password).digest('hex')
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmail').mockReturnValue({
            password: hashedPassword
        })

        const userAuthDto = new UserAuthDto()
        userAuthDto.setPassword(password)

        const result = await validateUserAccount(userAuthDto, new Subject())
        expect(result.getToken() !== '').toBe(true)
    })
})

describe('Service sendUserEmailVerificationMail Test', () => {
    test('Should throw no email found', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue(null)

        expect(async () => sendEmailVerificationMail(deviceId, email)).rejects.toThrow('no email found')
    })
    test('Should aborted by throttling', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        const mockAttemptSession: AttemptSessionAttributes = {
            id: 1,
            attempt: 3,
            createdAt: new Date(),
            deviceId: deviceId,
            lastAttempt: new Date(),
            purpose: AttemptSessionPurpose.EmailVerification,
            updatedAt: new Date(),
            version: 1

        }

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue({})

        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(null)
        jest.spyOn(sessionRep, "insertAttemptSession").mockReturnValue(mockAttemptSession)

        expect(async () => sendEmailVerificationMail(deviceId, email)).rejects.toThrow("attempted 3 times, wait for a while")
    })

    test('Should return true', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        const mockAttemptSession: AttemptSessionAttributes = {
            id: 1,
            attempt: 1,
            createdAt: new Date(),
            deviceId: deviceId,
            lastAttempt: new Date(),
            purpose: AttemptSessionPurpose.EmailVerification,
            updatedAt: new Date(),
            version: 1
        }

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue({})

        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(mockAttemptSession)
        jest.spyOn(sessionRep, "updateAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        const mailTransporter = require('../../../src/adapter/mail-transporter.adapter')
        jest.spyOn(mailTransporter.mailTransporter, "sendMail").mockReturnValue(true)

        const result = await sendEmailVerificationMail(deviceId, email)
        expect(result).toBe(true)
    })


    test('Should return true with attempt reset', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        const currDate = new Date()
        const mockAttemptSession: AttemptSessionAttributes = {
            id: 1,
            attempt: 3,
            createdAt: new Date(currDate.getTime() - ((appConfig.emailVerificationThrottlingTime + 10) * 1000)),
            deviceId: deviceId,
            lastAttempt: new Date(currDate.getTime() - ((appConfig.emailVerificationThrottlingTime + 10) * 1000)),
            purpose: AttemptSessionPurpose.EmailVerification,
            updatedAt: new Date(currDate.getTime() - ((appConfig.emailVerificationThrottlingTime + 10) * 1000)),
            version: 1
        }

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue({})

        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(mockAttemptSession)
        jest.spyOn(sessionRep, "updateAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        const mailTransporter = require('../../../src/adapter/mail-transporter.adapter')
        jest.spyOn(mailTransporter.mailTransporter, "sendMail").mockReturnValue(true)

        const result = await sendEmailVerificationMail(deviceId, email)
        expect(result).toBe(true)
    })
})

describe('Service validateUserEmailVerification Test', () => {
    test('Should throw email not found', () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({})

        expect(() => validateUserEmailVerification('')).rejects.toThrow('email not found')
    })

    test('Should throw deviceId not found', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com'})

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue(null)

        expect(() => validateUserEmailVerification('')).rejects.toThrow('deviceId not found')
    })

    test('Should throw no email found', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com', deviceId: 'test'})

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue(null)

        expect(() => validateUserEmailVerification('')).rejects.toThrow('no email found')
    })

    test('Should return true', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com', deviceId: 'test'})

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue({})
        jest.spyOn(userRep, "updateUserAuth").mockReturnValue(1)
        const attemptSessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(attemptSessionRep, "deleteAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        const result = await validateUserEmailVerification('')
        expect(result).toBe(true)
    })

    test('Should return true with logger no rows updated', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com', deviceId: 'test'})

        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmail").mockReturnValue({})
        jest.spyOn(userRep, "updateUserAuth").mockReturnValue(0)
        const attemptSessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(attemptSessionRep, "deleteAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        const result = await validateUserEmailVerification('')
        expect(result).toBe(true)
    })
})

describe("Serivce createUserAuthToken Test", () => {
    test("Should return token customer", () => {
        const subjectType = SubjectType.CUSTOMER
        const subject = new Subject()

        const token = createUserAuthToken(subjectType, subject)
        const aud = [appConfig.customerAudience]
        const tokenDecoded = jwtAdapter.verify(token, aud)

        expect(tokenDecoded.aud).toEqual(aud)
        expect(tokenDecoded.aud).not.toEqual([appConfig.sellerAudience])
    })

    test("Should return token seller", () => {
        const subjectType = SubjectType.SELLER
        const subject = new Subject()

        const token = createUserAuthToken(subjectType, subject)
        const aud = [appConfig.sellerAudience]
        const tokenDecoded = jwtAdapter.verify(token, aud)

        expect(tokenDecoded.aud).toEqual(aud)
        expect(tokenDecoded.aud).not.toEqual([appConfig.customerAudience])
    })


    test("Should return token admin", () => {
        const subjectType = SubjectType.ADMIN
        const subject = new Subject()

        const token = createUserAuthToken(subjectType, subject)
        const aud = [appConfig.adminAudience]
        const tokenDecoded = jwtAdapter.verify(token, aud)

        expect(tokenDecoded.aud).toEqual(aud)
        expect(tokenDecoded.aud).not.toEqual([appConfig.customerAudience])
    })
})