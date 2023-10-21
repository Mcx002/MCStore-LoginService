import {CustomerAuth, CustomerAuthAttributes, CustomerAuthCreationAttributes} from "../models/customer-auth.model";

export const insertCustomerAuth = async (payload: CustomerAuthCreationAttributes): Promise<CustomerAuthAttributes> => {
    return CustomerAuth.create(payload)
}

export const findCustomerByEmail = async (email: string): Promise<CustomerAuthAttributes | null> => {
    return CustomerAuth.findOne({
        where: { email }
    })
}

export const updateCustomerAuth = async (id: number, version: number, updatedValue: Partial<CustomerAuthAttributes>) => {
    const [affectedRows] = await CustomerAuth.update(updatedValue, {
        where: {id, version}
    })

    return affectedRows
}
