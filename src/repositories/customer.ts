import {CustomerAuth, CustomerAuthAttributes, CustomerAuthCreationAttributes} from "../models/customer-auth";

export const insertCustomerAuth = async (payload: CustomerAuthCreationAttributes): Promise<CustomerAuthAttributes> => {
    return CustomerAuth.create(payload)
}