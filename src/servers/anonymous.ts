import {Metadata, sendUnaryData, ServerErrorResponse, ServerUnaryCall} from "@grpc/grpc-js";
import {
    createAdminAnonymousToken,
    createCustomerAnonymousToken,
    createSellerAnonymousToken,
} from "../services/anonymous";
import {AnonymousDto, AuthResultDto, Subject, ValidateTokenDto} from "../../proto_gen/auth_pb";
import {jwtAdapter} from "../adapter/jwt";
import {Status} from "@grpc/grpc-js/build/src/constants";

export const createAnonymousCustomerTokenServer = async (call: ServerUnaryCall<AnonymousDto, AuthResultDto>, callback: sendUnaryData<AuthResultDto>) => {
    try {
        const req = call.request
        const token = await createCustomerAnonymousToken(req.getUsername(), req.getPassword())

        const authResultDto = new AuthResultDto()
        authResultDto.setToken(token)

        callback(null, authResultDto)
    } catch (e) {
        const err = e as ServerErrorResponse
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
        callback(err, null)
    }
}

export const validateAnonymousTokenServer = async (call: ServerUnaryCall<ValidateTokenDto, Subject>, callback: sendUnaryData<Subject>) => {
    try {
        const req = call.request
        const subject = jwtAdapter.verify(req.getToken(), req.getAudienceList())

        const subjectDto = new Subject()
        subjectDto.setXid(subject.xid)
        subjectDto.setName(subject.name)
        if (subject.photoProfile) {
            subjectDto.setPhotoProfile(subject.photoProfile)
        }

        callback(null, subjectDto)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}
