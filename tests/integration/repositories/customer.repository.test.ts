import {CustomerAuth, CustomerAuthCreationAttributes} from "../../../src/models/customer-auth";
import {
    findCustomerByEmail,
    insertCustomerAuth,
    updateCustomerAuth
} from "../../../src/repositories/customer.reposiitory";
import {DatabaseModels} from "../../../src/models";

describe('Repository CustomerAuth Test', () => {
    let dbModel: DatabaseModels | null = null
    beforeAll(async () => {
        dbModel = new DatabaseModels()
        await dbModel.init()
    })
    afterAll(() => {
        if (dbModel) {
            dbModel.dbAdapter.getInstance().close()
        }
    })

    test('Should return new CustomerAuth', async () => {
        // prepare customer auth creation attributes
        const newCustomerAuthData: CustomerAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 1,
            verified: false,
        }

       const customerAuth = await insertCustomerAuth(newCustomerAuthData)

        expect(customerAuth.email).toBe(newCustomerAuthData.email)

        await CustomerAuth.truncate()
    })

    test('Should return CustomerAuth by Email', async () => {
        // prepare customer auth creation attributes
        const newCustomerAuthData: CustomerAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 1,
            verified: false,
        }
        await CustomerAuth.create(newCustomerAuthData)

        const customerAuth = await findCustomerByEmail('newEmail@test.com')
        expect(customerAuth?.email).toBe(newCustomerAuthData.email)

        await CustomerAuth.truncate()
    })

    test('updateCustomerAuth should return 1', async () => {
        // prepare customer auth creation attributes
        const newCustomerAuthData: CustomerAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 1,
            verified: false,
        }
        const customerAuth = await CustomerAuth.create(newCustomerAuthData)

        const updatedValue = {
            updatedAt: new Date(),
            version: customerAuth.version + 1,
            verified: true
        }
        const result = await updateCustomerAuth(customerAuth.id, customerAuth.version, updatedValue)

        expect(result).toBe(1)

        await CustomerAuth.destroy({
            where: {
                id: customerAuth.id,
            }
        })
    })
})

