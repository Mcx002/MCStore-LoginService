import {Anonymous, AnonymousAttributes} from "../models/anonymous";

export const findAnonymousByUsername = (username: string): Promise<AnonymousAttributes | null> => {
    return Anonymous.findOne({
        where: {username},
    })
}