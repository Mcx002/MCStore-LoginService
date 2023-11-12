import {
    createAdminAnonymousToken,
    createCustomerAnonymousToken,
    createSellerAnonymousToken,
    validateAnonymousUser
} from "../../../src/services/anonymous.service";
import { AnonymousAttributes } from "../../../src/models/anonymous.model";
import { createHash } from 'crypto'
import { AnonymousDto } from "../../../proto_gen/auth_pb";
import AnonymousLevel = AnonymousDto.AnonymousLevel;

describe('Service validateAnonymousUser Test', () => {
    test('Should throw anonymous is not found', async () => {
        // mock return findAnonymousByUsername
        const anonymousRep = require('../../../src/repositories/anonymous.repository')
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(null)

        // expect validate anonymous user throw error
        expect(async () => await validateAnonymousUser('test', 'test', AnonymousLevel.CUSTOMER)).rejects.toThrow('anonymous is not found')
    })

    test('Should throw invalid statement because of level', async () => {
        // mock return findAnonymousByUsername
        const anonymousRep = require('../../../src/repositories/anonymous.repository')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.UNKNOWN,
            password: "",
            updatedAt: new Date(),
            username: "",
            xid: ""

        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        // expect validate anonymous user throw error
        expect(async () => await validateAnonymousUser('test', 'test', AnonymousLevel.CUSTOMER)).rejects.toThrow('invalid statement')
    })

    test('Should throw invalid statement because of password', async () => {
        // mock return findAnonymousByUsername
        const anonymousRep = require('../../../src/repositories/anonymous.repository')

        const hashedPassword = createHash('sha256').update('test1').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.CUSTOMER,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "",
            xid: ""
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        // expect validate anonymous user throw error
        expect(async () => await validateAnonymousUser('test', 'test', AnonymousLevel.CUSTOMER)).rejects.toThrow('invalid statement')
    })

})

describe('Service createAnonymousToken test', () => {
    test('Should return anonymous customer token', async () => {
        // mock return findAnonymousByUsername
        const anonymousRep = require('../../../src/repositories/anonymous.repository')

        const hashedPassword = createHash('sha256').update('test').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.CUSTOMER,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "testusername",
            xid: "txid"
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        // expect token not empty
        const token = await createCustomerAnonymousToken('test', 'test')
        expect(token !== '').toBe(true)
    })

    test('Should return anonymous seller token', async () => {
        // mock return findAnonymousByUsername
        const anonymousRep = require('../../../src/repositories/anonymous.repository')

        const hashedPassword = createHash('sha256').update('test').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.SELLER,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "testusername",
            xid: "txid"
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        // expect token not empty
        const token = await createSellerAnonymousToken('test', 'test')
        expect(token !== '').toBe(true)
    })

    test('Should return anonymous admin token', async () => {
        // mock return findAnonymousByUsername
        const anonymousRep = require('../../../src/repositories/anonymous.repository')

        const hashedPassword = createHash('sha256').update('test').digest('hex')
        const mockAnonymous: AnonymousAttributes = {
            createdAt: new Date(),
            id: 1,
            level: AnonymousLevel.ADMIN,
            password: hashedPassword,
            updatedAt: new Date(),
            username: "testusername",
            xid: "txid"
        }
        jest.spyOn(anonymousRep, 'findAnonymousByUsername').mockReturnValue(mockAnonymous)

        // expect token not empty
        const token = await createAdminAnonymousToken('test', 'test')
        expect(token !== '').toBe(true)
    })
})