import {findAnonymousByUsername} from "../repositories/anonymous";
import {AnonymousLevel} from "../../proto_gen/auth_pb";
import {createHash} from 'crypto'
import {jwtAdapter} from "../adapter/jwt";
import {appConfig} from "../config";

export const createCustomerAnonymousToken = async (username: string, password: string): Promise<string> => {
    // find anonymous by username
    const anonymous = await findAnonymousByUsername(username)
    if (!anonymous) {
        throw new Error('anonymous is not found')
    }

    // validate level
    if (anonymous.level !== AnonymousLevel.CUSTOMER) {
        throw new Error('invalid statement')
    }

    // pair the password
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    if (anonymous.password !== hashedPassword) {
        throw new Error('invalid statement')
    }

    // generate the token
    return jwtAdapter.sign({
        payload: {
            xid: anonymous.xid,
            name: anonymous.username,
        },
        audience: ['AC'],
        subject: username,
    }, appConfig.anonymousTokenExpiredTime)
}