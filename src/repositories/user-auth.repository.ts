import {UserAuth, UserAuthAttributes, UserAuthCreationAttributes} from "../models/user-auth.model";

export const insertUserAuth = async (payload: UserAuthCreationAttributes): Promise<UserAuthAttributes> => {
    return UserAuth.create(payload)
}

export const findUserAuthByEmail = async (email: string): Promise<UserAuthAttributes | null> => {
    return UserAuth.findOne({
        where: { email }
    })
}

export const updateUserAuth = async (id: number, version: number, updatedValue: Partial<UserAuthAttributes>) => {
    const [affectedRows] = await UserAuth.update(updatedValue, {
        where: {id, version}
    })

    return affectedRows
}
