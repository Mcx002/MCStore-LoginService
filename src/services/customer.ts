import {CustomerAuthDto} from "../../proto_gen/customer-auth_pb";
import {CustomerAuthAttributes, CustomerAuthCreationAttributes} from "../models/customer-auth";
import {ErrorHandler} from "../adapter/error";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {createBaseAttributes} from "../models";
import {insertCustomerAuth} from "../repositories/customer";
import {getUnixFromDate} from "../utils/time";

export const registerCustomerAuth = async (payload: CustomerAuthDto) => {
    const password = payload.getPassword()
    if (!password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "Password required")
    }

    // prepare customer auth creation attributes
    const newCustomerAuthData: CustomerAuthCreationAttributes = {
        email: payload.getEmail(),
        password: password,
        userId: payload.getUserId(),
        ...createBaseAttributes(),
    }

    const customerAuth = await insertCustomerAuth(newCustomerAuthData)

    return composeCustomerAuthDto(customerAuth)
}

export const composeCustomerAuthDto = (payload: CustomerAuthAttributes): CustomerAuthDto => {
    const result = new CustomerAuthDto()
    result.setEmail(payload.email)
    result.setCreatedAt(getUnixFromDate(payload.createdAt))
    result.setUpdatedAt(getUnixFromDate(payload.updatedAt))
    result.setVersion(payload.version)
    result.setUserId(payload.userId)

    return result
}