import {DatabaseModels} from "../../../src/models";
import {
    findAttemptSessionByDeviceIdAndPurpose,
    insertAttemptSession,
    updateAttemptSessionByDeviceIdAndPurpose
} from "../../../src/repositories/session.repository";
import {
    AttemptSession,
    AttemptSessionAttributes,
    AttemptSessionCreationAttributes,
    AttemptSessionPurpose
} from "../../../src/models/attempt-session.model";

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

    test("findAttemptSessionByDeviceIdAndPurpose should return null", async () => {
        const result = await findAttemptSessionByDeviceIdAndPurpose('test', AttemptSessionPurpose.EmailVerification)
        expect(result).toBeNull()
    })

    test("findAttemptSessionByDeviceIdAndPurpose should return not null", async () => {
        // prepare attemptSessionData
        const attemptSessionCreationAttributes: AttemptSessionCreationAttributes = {
            attempt: 1,
            createdAt: new Date(),
            deviceId: "test1",
            id: 1,
            lastAttempt: new Date(),
            purpose: AttemptSessionPurpose.EmailVerification,
            updatedAt: new Date(),
            version: 1
        }
        await AttemptSession.create(attemptSessionCreationAttributes)

        // execute repo function
        const result = await findAttemptSessionByDeviceIdAndPurpose('test1', AttemptSessionPurpose.EmailVerification)
        expect(result?.deviceId).toBe(attemptSessionCreationAttributes.deviceId)

        // clear up
        await AttemptSession.destroy({
            where: {
                id: attemptSessionCreationAttributes.id
            }
        })
    })

    test("Should insert attemptSession", async () => {
        const attemptSessionCreationAttributes: AttemptSessionCreationAttributes = {
            attempt: 1,
            createdAt: new Date(),
            deviceId: "test1",
            id: 1,
            lastAttempt: new Date(),
            purpose: AttemptSessionPurpose.EmailVerification,
            updatedAt: new Date(),
            version: 1
        }
        const result = await insertAttemptSession(attemptSessionCreationAttributes)

        expect(result.deviceId).toBe(attemptSessionCreationAttributes.deviceId)

        await AttemptSession.destroy({ where: { id: attemptSessionCreationAttributes.id }})
    })

    test("Should update attemptSession", async () => {
        // prepare attemptSession data
        const attemptSessionCreationAttributes: AttemptSessionCreationAttributes = {
            attempt: 1,
            createdAt: new Date(),
            deviceId: "test1",
            id: 1,
            lastAttempt: new Date(),
            purpose: AttemptSessionPurpose.EmailVerification,
            updatedAt: new Date(),
            version: 1
        }

        await AttemptSession.create(attemptSessionCreationAttributes)

        // prepare update data
        const currDate = new Date()
        const updatedData: Partial<AttemptSessionAttributes> = {
            attempt: attemptSessionCreationAttributes.attempt + 1,
            version: attemptSessionCreationAttributes.version + 1,
            lastAttempt: currDate,
            updatedAt: currDate,
        }
        const result = await updateAttemptSessionByDeviceIdAndPurpose(
            attemptSessionCreationAttributes.deviceId,
            AttemptSessionPurpose.EmailVerification,
            attemptSessionCreationAttributes.version,
            updatedData)

        expect(result).toBe(1)

        await AttemptSession.destroy({ where: { id: attemptSessionCreationAttributes.id }})
    })
})
