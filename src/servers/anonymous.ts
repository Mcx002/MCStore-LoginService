import {sendUnaryData, ServerUnaryCall} from "@grpc/grpc-js";
import {
    createAdminAnonymousToken,
    createCustomerAnonymousToken,
    createSellerAnonymousToken
} from "../services/anonymous";
import {AnonymousDto, AuthResultDto} from "../../proto_gen/auth_pb";

export const createAnonymousCustomerTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    const req = call.request
    const token = await createCustomerAnonymousToken(req.getUsername(), req.getPassword())

    const authResultDto = new AuthResultDto()
    authResultDto.setToken(token)

    callback(null, authResultDto)
}

export const createAnonymousSellerTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    const req = call.request
    const token = await createSellerAnonymousToken(req.getUsername(), req.getPassword())

    const authResultDto = new AuthResultDto()
    authResultDto.setToken(token)

    callback(null, authResultDto)
}

export const createAnonymousAdminTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    const req = call.request
    const token = await createAdminAnonymousToken(req.getUsername(), req.getPassword())

    const authResultDto = new AuthResultDto()
    authResultDto.setToken(token)

    callback(null, authResultDto)
}
