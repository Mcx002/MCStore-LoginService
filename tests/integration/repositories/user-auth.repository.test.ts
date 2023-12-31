import { UserAuth, UserAuthCreationAttributes } from "../../../src/models/user-auth.model";
import { findUserAuthByEmailAndSubjectType, insertUserAuth, updateUserAuth } from "../../../src/repositories/user-auth.repository";
import { DatabaseModels } from "../../../src/models";
import { SubjectType } from "../../../proto_gen/auth_pb";

describe('Repository UserAuthModel Test', () => {
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

    test('Should return new UserAuthModel', async () => {
        // prepare customer auth creation attributes
        const newUserAuthData: UserAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 'uuid',
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }

        const userAuth = await insertUserAuth(newUserAuthData)

        expect(userAuth.email).toBe(newUserAuthData.email)

        await UserAuth.truncate()
    })

    test('Should return new UserAuthModel with the same email diff subjectType', async () => {
        // prepare customer auth creation attributes
        const newUserAuthData: UserAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 'uuid',
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }

        const userAuth = await insertUserAuth(newUserAuthData)

        newUserAuthData.subjectType = SubjectType.SELLER
        const userAuth2 = await insertUserAuth(newUserAuthData)

        expect(userAuth.email).toBe(newUserAuthData.email)
        expect(userAuth2.email).toBe(newUserAuthData.email)

        await UserAuth.truncate()
    })

    test('Should throw validation error', async () => {
        // prepare customer auth creation attributes
        const newUserAuthData: UserAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 'uuid',
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }

        await insertUserAuth(newUserAuthData)

        await expect(async () => insertUserAuth(newUserAuthData)).rejects.toThrow('Validation error')

        await UserAuth.destroy({ truncate: true })
    })

    test('Should return UserAuthModel by Email', async () => {
        // prepare customer auth creation attributes
        const newUserAuthData: UserAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 'uuid',
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }
        await UserAuth.create(newUserAuthData)

        const userAuth = await findUserAuthByEmailAndSubjectType(newUserAuthData.email, newUserAuthData.subjectType)
        expect(userAuth?.email).toBe(newUserAuthData.email)

        await UserAuth.truncate()
    })

    test('updateUserAuth should return 1', async () => {
        // prepare customer auth creation attributes
        const newUserAuthData: UserAuthCreationAttributes = {
            email: 'newEmail@test.com',
            password: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            userId: 'uuid',
            verified: false,
            subjectType: SubjectType.CUSTOMER,
        }
        const userAuth = await UserAuth.create(newUserAuthData)

        const updatedValue = {
            updatedAt: new Date(),
            version: userAuth.version + 1,
            verified: true
        }
        const result = await updateUserAuth(userAuth.id, userAuth.version, updatedValue)

        expect(result).toBe(1)

        await UserAuth.destroy({
            where: {
                id: userAuth.id,
            }
        })
    })
})

