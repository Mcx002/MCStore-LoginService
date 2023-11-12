import {
    createUserAuthToken, editUserPassword,
    isUserAuthEmailExists,
    registerUserAuth,
    sendEmailVerificationMail,
    validateUserAccount, validateUserEmailVerification
} from "../../../src/services/user-auth.service";
import { UserAuthAttributes } from "../../../src/models/user-auth.model";
import { createHash } from 'crypto';
import { AttemptSessionAttributes, AttemptSessionPurpose } from "../../../src/models/attempt-session.model";
import { appConfig } from "../../../src/config";
import { EditPasswordDto, UserAuthDto } from "../../../proto_gen/user-auth_pb";
import { Subject, SubjectType } from "../../../proto_gen/auth_pb";
import { jwtAdapter } from "../../../src/adapter/jwt.adapter";

describe('Service registerUserAuth Test', () => {
    test('Should throw Password required', async () => {
        const payload = new UserAuthDto()
        const subject = new Subject()

        expect(async () => registerUserAuth(payload, subject)).rejects.toThrow('Password required')
    })

    test('Should return user auth dto', async () => {
        // create body request
        const payload = new UserAuthDto()
        payload.setPassword('pass')

        // create subject
        const subject = new Subject()

        // create user auth attributes mock
        const userAuthMock: UserAuthAttributes = {
            createdAt: new Date(),
            email: "email@test.com",
            id: 1,
            password: "test",
            updatedAt: new Date(),
            userId: 'uuid',
            version: 1,
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }

        // mock return insertUserAuth
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'insertUserAuth').mockReturnValue(userAuthMock)

        // execute service
        const userAuthDto = await registerUserAuth(payload, subject)

        // expect token not empty string
        expect(userAuthDto.getToken() !== '').toBe(true)
    })

    test('Should return email is exists true', async () => {
        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmailAndSubjectType').mockReturnValue({})

        // execute service function
        const isEmailExists = await isUserAuthEmailExists('test@email.com', SubjectType.CUSTOMER)

        // expect email exists
        expect(isEmailExists).toBe(true)
    })

    test('Should return email is exists false', async () => {
        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmailAndSubjectType').mockReturnValue(null)

        // execute service function
        const isEmailExists = await isUserAuthEmailExists('test@email.com', SubjectType.CUSTOMER)

        // expect email not exists
        expect(isEmailExists).toBe(false)
    })

})

describe('Service validateUserAccount Test', () => {
    test('Should throw user auth not found error', async () => {
        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmailAndSubjectType').mockReturnValue(null)

        // should throw error on validate user account
        expect(async () => validateUserAccount(new UserAuthDto(), new Subject())).rejects.toThrow("user auth not found")
    })

    test('Should throw password required', async () => {
        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmailAndSubjectType').mockReturnValue({})

        // should throw error on validate user account
        expect(async () => validateUserAccount(new UserAuthDto(), new Subject())).rejects.toThrow("password required")
    })

    test('Should throw auth invalid', async () => {
        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmailAndSubjectType').mockReturnValue({})

        // prepare userAuthDto Request
        const userAuthDto = new UserAuthDto()
        userAuthDto.setPassword('test')

        // should throw error on validate user account
        expect(async () => validateUserAccount(userAuthDto, new Subject())).rejects.toThrow("auth invalid")
    })

    test('Should return true', async () => {
        // mock return findUserAuthByEmailAndSubjectType
        const password = 'test'
        const hashedPassword = createHash('sha256').update(password).digest('hex')
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, 'findUserAuthByEmailAndSubjectType').mockReturnValue({
            password: hashedPassword
        })

        // prepare userAuthDto Request
        const userAuthDto = new UserAuthDto()
        userAuthDto.setPassword(password)

        // expect token not empty string
        const result = await validateUserAccount(userAuthDto, new Subject())
        expect(result.getToken() !== '').toBe(true)
    })
})

describe('Service sendUserEmailVerificationMail Test', () => {
    test('Should throw no email found', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue(null)

        // expect sendEmailVerificationMail throw error
        expect(async () => sendEmailVerificationMail(deviceId, email, SubjectType.CUSTOMER)).rejects.toThrow('no email found')
    })

    test('Should throw user has been verified', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({ verified: true })

        // expect sendEmailVerificationMail throw error
        expect(async () => sendEmailVerificationMail(deviceId, email, SubjectType.CUSTOMER)).rejects.toThrow('user has been verified')
    })

    test('Should aborted by throttling', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        // prepare mockAttemptSession
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

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({})

        // mock return findAttemptSessionByDeviceIdAndPurpose and insertAttemptSession
        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(null)
        jest.spyOn(sessionRep, "insertAttemptSession").mockReturnValue(mockAttemptSession)

        // expect sendEmailVerificationMail error
        expect(async () => sendEmailVerificationMail(deviceId, email, SubjectType.CUSTOMER)).rejects.toThrow("attempted 3 times, wait for a while")
    })

    test('Should return true', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        // prepare mockAttemptSession
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

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({})

        // mock return findAttemptSessionByDeviceIdAndPurpose and insertAttemptSession
        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(mockAttemptSession)
        jest.spyOn(sessionRep, "updateAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        // mock return sendMail
        const mailTransporter = require('../../../src/adapter/mail-transporter.adapter')
        jest.spyOn(mailTransporter.mailTransporter, "sendMail").mockReturnValue(true)

        // expect sendEmailVerificationMail success
        const result = await sendEmailVerificationMail(deviceId, email, SubjectType.CUSTOMER)
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

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({})

        // mock return findAttemptSessionByDeviceIdAndPurpose and insertAttemptSession
        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(mockAttemptSession)
        jest.spyOn(sessionRep, "updateAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        // mock return sendMail
        const mailTransporter = require('../../../src/adapter/mail-transporter.adapter')
        jest.spyOn(mailTransporter.mailTransporter, "sendMail").mockReturnValue(true)

        // expect sendEmailVerificationMail success
        const result = await sendEmailVerificationMail(deviceId, email, SubjectType.CUSTOMER)
        expect(result).toBe(true)
    })
})

describe('Service validateUserEmailVerification Test', () => {
    test('Should throw email not found', () => {
        // mock return verify jwt adapter
        const { jwtAdapter } = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({})

        // expect email not found
        expect(() => validateUserEmailVerification('')).rejects.toThrow('email not found')
    })

    test('Should throw deviceId not found', async () => {
        // mock return verify jwt adapter
        const { jwtAdapter } = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({ email: 'test@email.com' })

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue(null)

        // expect deviceId not found
        expect(() => validateUserEmailVerification('')).rejects.toThrow('deviceId not found')
    })

    test('Should throw no email found', async () => {
        // mock return verify jwt adapter
        const { jwtAdapter } = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({ email: 'test@email.com', deviceId: 'test' })

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue(null)

        // expect email not found
        expect(() => validateUserEmailVerification('')).rejects.toThrow('no email found')
    })

    test('Should throw user has been verified', async () => {
        // mock return verify jwt adapter
        const { jwtAdapter } = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({ email: 'test@email.com', deviceId: 'test' })

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({ verified: true })

        // expect email not found
        expect(() => validateUserEmailVerification('')).rejects.toThrow('user has been verified')
    })

    test('Should return true', async () => {
        // mock return verify jwt adapter
        const { jwtAdapter } = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({ email: 'test@email.com', deviceId: 'test' })

        // mock return findUserAuthByEmailAndSubjectType and updateUserAuth
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({})
        jest.spyOn(userRep, "updateUserAuth").mockReturnValue(1)

        // mock deleteAttemptSessionByDeviceIdAndPurpose
        const attemptSessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(attemptSessionRep, "deleteAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        // expect validate user email verification
        const result = await validateUserEmailVerification('')
        expect(result).toBe(true)
    })

    test('Should return true with logger no rows updated', async () => {
        // mock return verify
        const { jwtAdapter } = require('../../../src/adapter/jwt.adapter')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({ email: 'test@email.com', deviceId: 'test' })

        // mock return find findUserAuthByEmailAndSubjectType, updateUserAuth and deleteAttemptSessionByDeviceIdAndPurpose
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({})
        jest.spyOn(userRep, "updateUserAuth").mockReturnValue(0)
        const attemptSessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(attemptSessionRep, "deleteAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        // expect email validation success
        const result = await validateUserEmailVerification('')
        expect(result).toBe(true)
    })
})

describe("Serivce createUserAuthToken Test", () => {
    test("Should return token customer", () => {
        const subjectType = SubjectType.CUSTOMER
        const subject = new Subject()

        // create token
        const token = createUserAuthToken(subjectType, subject)
        const aud = [appConfig.customerAudience]
        const tokenDecoded = jwtAdapter.verify(token, aud)

        // expect token and decoded token data are match
        expect(tokenDecoded.aud).toEqual(aud)
        expect(tokenDecoded.aud).not.toEqual([appConfig.sellerAudience])
    })

    test("Should return token seller", () => {
        const subjectType = SubjectType.SELLER
        const subject = new Subject()

        // create token
        const token = createUserAuthToken(subjectType, subject)
        const aud = [appConfig.sellerAudience]
        const tokenDecoded = jwtAdapter.verify(token, aud)

        // expect token and decoded token data are match
        expect(tokenDecoded.aud).toEqual(aud)
        expect(tokenDecoded.aud).not.toEqual([appConfig.customerAudience])
    })


    test("Should return token admin", () => {
        const subjectType = SubjectType.ADMIN
        const subject = new Subject()

        // create token
        const token = createUserAuthToken(subjectType, subject)
        const aud = [appConfig.adminAudience]
        const tokenDecoded = jwtAdapter.verify(token, aud)

        // expect token and decoded token data are match
        expect(tokenDecoded.aud).toEqual(aud)
        expect(tokenDecoded.aud).not.toEqual([appConfig.customerAudience])
    })
})

describe("Service editUserPassword Test", () => {
    test("Should throw email not found", () => {
        const payload = new EditPasswordDto()

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue(null)

        // expect edit user password throw error
        expect(() => editUserPassword(payload)).rejects.toThrow("email is not found")
    })
    test("Should throw invalid signature", () => {
        const payload = new EditPasswordDto()
        payload.setOldPassword('t')

        // create password
        const pass = 'test'
        const hashedPass = createHash('sha256').update(pass).digest('hex')

        // mock return findUserAuthByEmailAndSubjectType
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({
            password: hashedPass
        })

        // expect edit user password throw error
        expect(() => editUserPassword(payload)).rejects.toThrow("invalid signature")
    })
    test("Should return true", async () => {
        const payload = new EditPasswordDto()
        payload.setOldPassword('test')
        payload.setNewPassword('test2')

        // create pass
        const pass = 'test'
        const hashedPass = createHash('sha256').update(pass).digest('hex')

        // mock return findUserAuthByEmailAndSubjectType and updateUserAuth
        const userRep = require('../../../src/repositories/user-auth.repository')
        jest.spyOn(userRep, "findUserAuthByEmailAndSubjectType").mockReturnValue({
            password: hashedPass
        })
        jest.spyOn(userRep, "updateUserAuth").mockReturnValue(1)

        // expect edit user password success
        const result = await editUserPassword(payload)
        expect(result.getValue()).toBe(true)
    })
})