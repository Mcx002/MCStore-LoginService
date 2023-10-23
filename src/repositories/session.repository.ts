import {
    AttemptSession,
    AttemptSessionAttributes,
    AttemptSessionCreationAttributes,
    AttemptSessionPurpose
} from "../models/attempt-session.model";

export const findAttemptSessionByDeviceIdAndPurpose = (deviceId: string, purpose: AttemptSessionPurpose) => {
    return AttemptSession.findOne({
        where: {
            deviceId, purpose,
        }
    })
}

export const insertAttemptSession = (payload: AttemptSessionCreationAttributes) => {
    return AttemptSession.create(payload)
}

export const updateAttemptSessionByDeviceIdAndPurpose = async (
    deviceId: string,
    purpose: AttemptSessionPurpose,
    version: number,
    payload: Partial<AttemptSessionAttributes>) => {
    const [count] = await AttemptSession.update(payload, {
        where: {
            deviceId, purpose, version,
        }
    })
    return count
}

export const deleteAttemptSessionByDeviceIdAndPurpose = (deviceId: string, purpose: AttemptSessionPurpose) => {
    return AttemptSession.destroy({where: { deviceId, purpose }})
}