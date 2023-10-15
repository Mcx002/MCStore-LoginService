import {CustomerAuth, CustomerAuthCreationAttributes} from "../../../src/models/customer-auth";
import {insertCustomerAuth} from "../../../src/repositories/customer";
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
        }

       const customerAuth = await insertCustomerAuth(newCustomerAuthData)

        expect(customerAuth.email).toBe(newCustomerAuthData.email)

        await CustomerAuth.truncate()
    })
})
