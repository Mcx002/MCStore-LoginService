import {
    createAdminAnonymousToken,
    createCustomerAnonymousToken,
    createSellerAnonymousToken,
    validateAnonymousUser
} from "../../src/services/anonymous";
import {AnonymousAttributes} from "../../src/models/anonymous";
import {AnonymousLevel} from "../../proto_gen/auth_pb";
import {createHash} from 'crypto'

describe('Service validateAnonymousUser Test', () => {
    test('Should throw anonymous is not found', async () => {
        const anonymousRep = require('../../src/repositories/anonymous')
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(null)

        expect(async () => await validateAnonymousUser('test', 'test', AnonymousLevel.CUSTOMER)).rejects.toThrow('anonymous is not found')
    })

    test('Should throw invalid statement because of level', async () => {
        const anonymousRep = require('../../src/repositories/anonymous')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.UNKNOWN,
            password: "",
            updatedAt: new Date(),
            username: "",
            version: 1,
            xid: ""

        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        expect(async () => await validateAnonymousUser('test', 'test', AnonymousLevel.CUSTOMER)).rejects.toThrow('invalid statement')
    })

    test('Should throw invalid statement because of password', async () => {
        const anonymousRep = require('../../src/repositories/anonymous')

        const hashedPassword = createHash('sha256').update('test1').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.CUSTOMER,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "",
            version: 1,
            xid: ""
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        expect(async () => await validateAnonymousUser('test', 'test', AnonymousLevel.CUSTOMER)).rejects.toThrow('invalid statement')
    })

})

describe('Service createAnonymousToken test', () => {
    test('Should return anonymous customer token', async () => {
        const anonymousRep = require('../../src/repositories/anonymous')

        const hashedPassword = createHash('sha256').update('test').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.CUSTOMER,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "testusername",
            version: 1,
            xid: "txid"
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        const token = await createCustomerAnonymousToken('test', 'test')
        expect(token !== '').toBe(true)
    })

    test('Should return anonymous seller token', async () => {
        const anonymousRep = require('../../src/repositories/anonymous')

        const hashedPassword = createHash('sha256').update('test').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.SELLER,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "testusername",
            version: 1,
            xid: "txid"
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        const token = await createSellerAnonymousToken('test', 'test')
        expect(token !== '').toBe(true)
    })

    test('Should return anonymous admin token', async () => {
        const anonymousRep = require('../../src/repositories/anonymous')

        const hashedPassword = createHash('sha256').update('test').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.ADMIN,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "testusername",
            version: 1,
            xid: "txid"
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        const token = await createAdminAnonymousToken('test', 'test')
        expect(token !== '').toBe(true)
    })
})