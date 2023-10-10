import {findAnonymousByUsername} from "../repositories/anonymous";
import {AnonymousLevel} from "../../proto_gen/auth_pb";
import {createHash} from 'crypto'
import {jwtAdapter} from "../adapter/jwt";
import {appConfig} from "../config";
import {AnonymousAttributes} from "../models/anonymous";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {ErrorHandler} from "../adapter/error";

export const validateAnonymousUser = async (username: string, password: string, level: AnonymousLevel): Promise<AnonymousAttributes> => {
    // find anonymous by username
    const anonymous = await findAnonymousByUsername(username)
    if (!anonymous) {
        throw new ErrorHandler(Status.INTERNAL, 'anonymous is not found')
    }

    // validate level
    if (anonymous.level !== level) {
        throw new ErrorHandler(Status.INTERNAL, 'invalid statement')
    }

    // pair the password
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    if (anonymous.password !== hashedPassword) {
        throw new ErrorHandler(Status.INTERNAL, 'invalid statement')
    }

    return anonymous
}

export const createCustomerAnonymousToken = async (username: string, password: string): Promise<string> => {
    const anonymous = await validateAnonymousUser(username, password, AnonymousLevel.CUSTOMER)

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

export const createSellerAnonymousToken = async (username: string, password: string): Promise<string> => {
    const anonymous = await validateAnonymousUser(username, password, AnonymousLevel.SELLER)

    // generate the token
    return jwtAdapter.sign({
        payload: {
            xid: anonymous.xid,
            name: anonymous.username,
        },
        audience: ['AS'],
        subject: username,
    }, appConfig.anonymousTokenExpiredTime)
}

export const createAdminAnonymousToken = async (username: string, password: string): Promise<string> => {
    const anonymous = await validateAnonymousUser(username, password, AnonymousLevel.ADMIN)

    // generate the token
    return jwtAdapter.sign({
        payload: {
            xid: anonymous.xid,
            name: anonymous.username,
        },
        audience: ['AA'],
        subject: username,
    }, appConfig.anonymousTokenExpiredTime)
}
