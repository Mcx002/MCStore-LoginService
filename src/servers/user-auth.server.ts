import {sendUnaryData, ServerErrorResponse, ServerUnaryCall} from "@grpc/grpc-js";
import {
    isUserAuthEmailExists,
    registerUserAuth,
    sendEmailVerificationMail,
    validateUserAccount, validateUserEmailVerification
} from "../services/user-auth.service";
import {BoolValue} from "google-protobuf/google/protobuf/wrappers_pb";
import {TokenDto} from "../../proto_gen/common_pb";
import {SendEmailVerificationDto, UserAuthDto} from "../../proto_gen/user-auth_pb";
import {Subject, SubjectType, ValidateTokenDto} from "../../proto_gen/auth_pb";
import {jwtAdapter} from "../adapter/jwt.adapter";

export const registerUserAuthServer = async (call: ServerUnaryCall<UserAuthDto, UserAuthDto>, callback: sendUnaryData<UserAuthDto>) => {
    try {
        const req = call.request

        const result = await registerUserAuth(req)

        callback(null, result)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const isUserEmailExistsServer = async (call: ServerUnaryCall<UserAuthDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
    try {
        const req = call.request

        const result = await isUserAuthEmailExists(req.getEmail())

        const boolVal = new BoolValue()
        boolVal.setValue(result)

        callback(null, boolVal)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const validateUserAccountServer = async (call: ServerUnaryCall<UserAuthDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
    try {
        const req = call.request

        const result = await validateUserAccount(req)

        const boolVal = new BoolValue()
        boolVal.setValue(result)

        callback(null, boolVal)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const sendUserEmailVerificationMailServer = async (call: ServerUnaryCall<SendEmailVerificationDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
    try {
        const req = call.request

        const result = await sendEmailVerificationMail(req.getDeviceid(), req.getEmail())

        const boolVal = new BoolValue()
        boolVal.setValue(result)

        callback(null, boolVal)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}


export const validateUserEmailVerificationServer = async (call: ServerUnaryCall<TokenDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
    try {
        const req = call.request

        const result = await validateUserEmailVerification(req.getToken())

        const boolVal = new BoolValue()
        boolVal.setValue(result)

        callback(null, boolVal)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const validateTokenServer = async (call: ServerUnaryCall<ValidateTokenDto, Subject>, callback: sendUnaryData<Subject>) => {
    try {
        const req = call.request
        const subject = jwtAdapter.verify(req.getToken(), req.getAudienceList())

        const subjectDto = new Subject()
        subjectDto.setXid(subject.xid)
        subjectDto.setName(subject.name)
        if (subject.photoProfile) {
            subjectDto.setPhotoProfile(subject.photoProfile)
        }
        subjectDto.setSubjectType(subject.subjectType)

        callback(null, subjectDto)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}
