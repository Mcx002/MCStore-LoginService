import {CustomerAuthDto} from "../../../proto_gen/customer-auth_pb";
import {
    isCustomerEmailExists,
    registerCustomerAuth,
    sendEmailVerificationMail,
    validateCustomerAccount, validateCustomerEmailVerification
} from "../../../src/services/customer.service";
import {CustomerAuthAttributes} from "../../../src/models/customer-auth";
import {createHash} from 'crypto';
import {AttemptSessionAttributes, AttemptSessionPurpose} from "../../../src/models/attempt-session.model";

describe('Service registerCustomerAuth Test', () => {
    test('Should throw Password required', async () => {
        const payload = new CustomerAuthDto()

        expect(async () => registerCustomerAuth(payload)).rejects.toThrow('Password required')
    })

    test('Should return customer auth dto', async () => {
        const payload = new CustomerAuthDto()
        payload.setPassword('pass')

        // create customer auth attributes mock
        const customerAuthMock: CustomerAuthAttributes = {
            createdAt: new Date(),
            email: "email@test.com",
            id: 1,
            password: "test",
            updatedAt: new Date(),
            userId: 1,
            version: 1,
            verified: false,
        }

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'insertCustomerAuth').mockReturnValue(customerAuthMock)

        const customerAuthDto = await registerCustomerAuth(payload)
        expect(customerAuthDto.getEmail()).toBe(customerAuthMock.email)
    })

    test('Should return email is exists true', async () => {
        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({})

        const isEmailExists = await isCustomerEmailExists('test@email.com')
        expect(isEmailExists).toBe(true)
    })

    test('Should return email is exists false', async () => {
        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue(null)

        const isEmailExists = await isCustomerEmailExists('test@email.com')
        expect(isEmailExists).toBe(false)
    })

})

describe('Service validateCustomerAccount Test', () => {
    test('Should throw customer auth not found error', async () => {
        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue(null)

        expect(async () => validateCustomerAccount(new CustomerAuthDto())).rejects.toThrow("customer auth not found")
    })

    test('Should throw password required', async () => {
        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({})

        expect(async () => validateCustomerAccount(new CustomerAuthDto())).rejects.toThrow("password required")
    })

    test('Should throw auth invalid', async () => {
        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({})

        const customerAuthDto = new CustomerAuthDto()
        customerAuthDto.setPassword('test')

        expect(async () => validateCustomerAccount(customerAuthDto)).rejects.toThrow("auth invalid")
    })

    test('Should return true', async () => {
        const password = 'test'
        const hashedPassword = createHash('sha256').update(password).digest('hex')
        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({
            password: hashedPassword
        })

        const customerAuthDto = new CustomerAuthDto()
        customerAuthDto.setPassword(password)

        const result = await validateCustomerAccount(customerAuthDto)
        expect(result).toBe(true)
    })
})

describe('Service sendEmailVerificationMail Test', () => {
    test('Should throw no email found', async () => {
        const deviceId = 'deviceIdTest'
        const email = 'email@test.com'

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, "findCustomerByEmail").mockReturnValue(null)

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

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, "findCustomerByEmail").mockReturnValue({})

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

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, "findCustomerByEmail").mockReturnValue({})

        const sessionRep = require('../../../src/repositories/session.repository')
        jest.spyOn(sessionRep, "findAttemptSessionByDeviceIdAndPurpose").mockReturnValue(mockAttemptSession)
        jest.spyOn(sessionRep, "updateAttemptSessionByDeviceIdAndPurpose").mockReturnValue(1)

        const mailTransporter = require('../../../src/adapter/mail-transporter')
        jest.spyOn(mailTransporter.mailTransporter, "sendMail").mockReturnValue(true)

        const result = await sendEmailVerificationMail(deviceId, email)
        expect(result).toBe(true)
    })
})

describe('Service validateCustomerEmailVerification Test', () => {
    test('Should throw email not found', () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({})

        expect(() => validateCustomerEmailVerification('')).rejects.toThrow('email not found')
    })

    test('Should throw no email found', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com'})

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, "findCustomerByEmail").mockReturnValue(null)

        expect(() => validateCustomerEmailVerification('')).rejects.toThrow('no email found')
    })

    test('Should return true', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com'})

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, "findCustomerByEmail").mockReturnValue({})
        jest.spyOn(customerRep, "updateCustomerAuth").mockReturnValue(1)

        const result = await validateCustomerEmailVerification('')
        expect(result).toBe(true)
    })

    test('Should return true with logger no rows updated', async () => {
        const {jwtAdapter} = require('../../../src/adapter/jwt')
        jest.spyOn(jwtAdapter, "verify").mockReturnValue({email: 'test@email.com'})

        const customerRep = require('../../../src/repositories/customer.reposiitory')
        jest.spyOn(customerRep, "findCustomerByEmail").mockReturnValue({})
        jest.spyOn(customerRep, "updateCustomerAuth").mockReturnValue(0)

        const result = await validateCustomerEmailVerification('')
        expect(result).toBe(true)
    })
})
