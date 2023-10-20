import {sendUnaryData, ServerErrorResponse, ServerUnaryCall} from "@grpc/grpc-js";
import {CustomerAuthDto, SendEmailVerificationDto} from "../../proto_gen/customer-auth_pb";
import {
    isCustomerEmailExists,
    registerCustomerAuth,
    sendEmailVerificationMail,
    validateCustomerAccount
} from "../services/customer.service";
import {BoolValue} from "google-protobuf/google/protobuf/wrappers_pb";

export const registerCustomerAuthServer = async (call: ServerUnaryCall<CustomerAuthDto, CustomerAuthDto>, callback: sendUnaryData<CustomerAuthDto>) => {
    try {
        const req = call.request

        const result = await registerCustomerAuth(req)

        callback(null, result)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const isCustomerEmailExistsServer = async (call: ServerUnaryCall<CustomerAuthDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
    try {
        const req = call.request

        const result = await isCustomerEmailExists(req.getEmail())

        const boolVal = new BoolValue()
        boolVal.setValue(result)

        callback(null, boolVal)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const validateCustomerAccountServer = async (call: ServerUnaryCall<CustomerAuthDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
    try {
        const req = call.request

        const result = await validateCustomerAccount(req)

        const boolVal = new BoolValue()
        boolVal.setValue(result)

        callback(null, boolVal)
    } catch (e) {
        const err = e as ServerErrorResponse
        callback(err, null)
    }
}

export const sendEmailVerificationMailServer = async (call: ServerUnaryCall<SendEmailVerificationDto, BoolValue>, callback: sendUnaryData<BoolValue>) => {
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
