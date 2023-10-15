import {CustomerAuth, CustomerAuthAttributes, CustomerAuthCreationAttributes} from "../models/customer-auth";

export const insertCustomerAuth = async (payload: CustomerAuthCreationAttributes): Promise<CustomerAuthAttributes> => {
    return CustomerAuth.create(payload)
}

export const findCustomerByEmail = async (email: string): Promise<CustomerAuthAttributes | null> => {
    return CustomerAuth.findOne({
        where: { email }
    })
}