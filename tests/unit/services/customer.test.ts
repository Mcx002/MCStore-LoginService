import {CustomerAuthDto} from "../../../proto_gen/customer-auth_pb";
import {isCustomerEmailExists, registerCustomerAuth, validateCustomerAccount} from "../../../src/services/customer";
import {CustomerAuthAttributes} from "../../../src/models/customer-auth";
import {createHash} from 'crypto';

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
            createdAt: new Date(), email: "email@test.com", id: 1, password: "test", updatedAt: new Date(), userId: 1, version: 1
        }

        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'insertCustomerAuth').mockReturnValue(customerAuthMock)

        const customerAuthDto = await registerCustomerAuth(payload)
        expect(customerAuthDto.getEmail()).toBe(customerAuthMock.email)
    })

    test('Should return email is exists true', async () => {
        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({})

        const isEmailExists = await isCustomerEmailExists('test@email.com')
        expect(isEmailExists).toBe(true)
    })

    test('Should return email is exists false', async () => {
        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue(null)

        const isEmailExists = await isCustomerEmailExists('test@email.com')
        expect(isEmailExists).toBe(false)
    })

})

describe('Service validateCustomerAccount Test', () => {
    test('Should throw customer auth not found error', async () => {
        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue(null)

        expect(async () => validateCustomerAccount(new CustomerAuthDto())).rejects.toThrow("customer auth not found")
    })

    test('Should throw password required', async () => {
        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({})

        expect(async () => validateCustomerAccount(new CustomerAuthDto())).rejects.toThrow("password required")
    })

    test('Should throw auth invalid', async () => {
        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({})

        const customerAuthDto = new CustomerAuthDto()
        customerAuthDto.setPassword('test')

        expect(async () => validateCustomerAccount(customerAuthDto)).rejects.toThrow("auth invalid")
    })

    test('Should return true', async () => {
        const password = 'test'
        const hashedPassword = createHash('sha256').update(password).digest('hex')
        const customerRep = require('../../../src/repositories/customer')
        jest.spyOn(customerRep, 'findCustomerByEmail').mockReturnValue({
            password: hashedPassword
        })

        const customerAuthDto = new CustomerAuthDto()
        customerAuthDto.setPassword(password)

        const result = await validateCustomerAccount(customerAuthDto)
        expect(result).toBe(true)
    })
})
