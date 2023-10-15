import {sendUnaryData, ServerErrorResponse, ServerUnaryCall} from "@grpc/grpc-js";
import {CustomerAuthDto} from "../../proto_gen/customer-auth_pb";
import {registerCustomerAuth} from "../services/customer";

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