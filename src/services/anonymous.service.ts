import {findAnonymousByUsername} from "../repositories/anonymous.repository";
import {AnonymousDto, SubjectType} from "../../proto_gen/auth_pb";
import {createHash} from 'crypto'
import {jwtAdapter} from "../adapter/jwt.adapter";
import {appConfig} from "../config";
import {AnonymousAttributes} from "../models/anonymous.model";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {ErrorHandler} from "../adapter/error.adapter";
import AnonymousLevel = AnonymousDto.AnonymousLevel;

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
            subjectType: SubjectType.ANON_CUSTOMER,
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
            subjectType: SubjectType.ANON_SELLER,
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
            subjectType: SubjectType.ANON_ADMIN,
        },
        audience: ['AA'],
        subject: username,
    }, appConfig.anonymousTokenExpiredTime)
}
