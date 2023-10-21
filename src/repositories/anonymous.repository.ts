import {Anonymous, AnonymousAttributes} from "../models/anonymous.model";

export const findAnonymousByUsername = (username: string): Promise<AnonymousAttributes | null> => {
    return Anonymous.findOne({
        where: {username},
    })
}