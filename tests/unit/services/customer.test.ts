import {CustomerAuthDto} from "../../../proto_gen/customer-auth_pb";
import {isCustomerEmailExists, registerCustomerAuth} from "../../../src/services/customer";
import {CustomerAuthAttributes} from "../../../src/models/customer-auth";

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
