import {CustomerAuthDto} from "../../proto_gen/customer-auth_pb";
import {CustomerAuthAttributes, CustomerAuthCreationAttributes} from "../models/customer-auth";
import {ErrorHandler} from "../adapter/error";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {createBaseAttributes} from "../models";
import {findCustomerByEmail, insertCustomerAuth} from "../repositories/customer";
import {getUnixFromDate} from "../utils/time";
import { createHash } from "crypto";

export const registerCustomerAuth = async (payload: CustomerAuthDto) => {
    const password = payload.getPassword()
    if (!password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "Password required")
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex')

    // prepare customer auth creation attributes
    const newCustomerAuthData: CustomerAuthCreationAttributes = {
        email: payload.getEmail(),
        password: hashedPassword,
        userId: payload.getUserId(),
        ...createBaseAttributes(),
    }

    const customerAuth = await insertCustomerAuth(newCustomerAuthData)

    return composeCustomerAuthDto(customerAuth)
}

export const isCustomerEmailExists = async (email: string) => {
    const customerAuth = await findCustomerByEmail(email)

    return !!customerAuth
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

export const validateCustomerAccount = async (payload: CustomerAuthDto): Promise<boolean> => {
    const customerAuth = await findCustomerByEmail(payload.getEmail())
    if (!customerAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "customer auth not found")
    }

    const password = payload.getPassword()
    if (!password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "password required")
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex')

    if (customerAuth.password !== hashedPassword) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "auth invalid")
    }

    return true
}
