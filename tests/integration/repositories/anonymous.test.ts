import {DatabaseModels} from "../../../src/models";
import {findAnonymousByUsername} from "../../../src/repositories/anonymous";
import {Anonymous} from "../../../src/models/anonymous";
import {AnonymousLevel} from "../../../proto_gen/auth_pb";

describe('Repository Anonymous Test', () => {
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

    test('should return null', async () => {
        const anonymousData = await findAnonymousByUsername('test')
        expect(anonymousData).toBe(null)
    })

    test('should return a anonymous user', async () => {
        // preparing data on db
        const anonymous1Data = {
            username: "test",
            password: "tset",
            createdAt: new Date(),
            updatedAt: new Date(),
            xid: "ve23",
            level: AnonymousLevel.CUSTOMER,
            id: 1,
        }

        const anonymous1 = await Anonymous.create(anonymous1Data)

        const anonymousData = await findAnonymousByUsername('test')

        expect(anonymousData!.xid).toBe(anonymous1Data.xid)

        await anonymous1.destroy()
    })
})
