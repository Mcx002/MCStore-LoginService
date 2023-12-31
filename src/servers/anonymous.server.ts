import { sendUnaryData, ServerErrorResponse, ServerUnaryCall } from "@grpc/grpc-js";
import {
    createAdminAnonymousToken,
    createCustomerAnonymousToken,
    createSellerAnonymousToken,
} from "../services/anonymous.service";
import { AnonymousDto, AuthResultDto } from "../../proto_gen/auth_pb";
import { logger } from "../logger";

export const createAnonymousCustomerTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    try {
        const req = call.request
        const token = await createCustomerAnonymousToken(req.getUsername(), req.getPassword())

        const authResultDto = new AuthResultDto()
        authResultDto.setToken(token)

        callback(null, authResultDto)
    } catch (e) {
        const err = e as ServerErrorResponse
        logger.error(JSON.stringify(err))
        callback(err, null)
    }
}

export const createAnonymousSellerTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    try {
        const req = call.request
        const token = await createSellerAnonymousToken(req.getUsername(), req.getPassword())

        const authResultDto = new AuthResultDto()
        authResultDto.setToken(token)

        callback(null, authResultDto)
    } catch (e) {
        const err = e as ServerErrorResponse
        logger.error(JSON.stringify(err))
        callback(err, null)
    }
}

export const createAnonymousAdminTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    try {
        const req = call.request
        const token = await createAdminAnonymousToken(req.getUsername(), req.getPassword())

        const authResultDto = new AuthResultDto()
        authResultDto.setToken(token)

        callback(null, authResultDto)
    } catch (e) {
        const err = e as ServerErrorResponse
        logger.error(JSON.stringify(err))
        callback(err, null)
    }
}

