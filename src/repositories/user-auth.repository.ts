import {UserAuth, UserAuthAttributes, UserAuthCreationAttributes} from "../models/user-auth.model";
import {SubjectType} from "../../proto_gen/auth_pb";

export const insertUserAuth = async (payload: UserAuthCreationAttributes): Promise<UserAuthAttributes> => {
    return UserAuth.create(payload)
}

export const findUserAuthByEmailAndSubjectType = async (email: string, subjectType: SubjectType): Promise<UserAuthAttributes | null> => {
    return UserAuth.findOne({
        where: { email, subjectType }
    })
}

export const updateUserAuth = async (id: number, version: number, updatedValue: Partial<UserAuthAttributes>) => {
    const [affectedRows] = await UserAuth.update(updatedValue, {
        where: {id, version}
    })

    return affectedRows
}
