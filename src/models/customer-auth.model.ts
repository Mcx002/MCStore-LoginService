import {DataTypes, Model, Optional, Sequelize} from "sequelize";
import {BaseAttributes} from "./index";

export interface CustomerAuthAttributes extends BaseAttributes {
    id: number
    userId: number
    email: string
    password: string
    verified: boolean
}

export type CustomerAuthCreationAttributes = Optional<CustomerAuthAttributes, "id">

export class CustomerAuth extends Model implements CustomerAuthAttributes {
    createdAt!: Date
    email!: string
    password!: string
    id!: number
    updatedAt!: Date
    userId!: number
    version!: number
    verified!: boolean

    static initModel(sequelize: Sequelize): void {
        CustomerAuth.init({
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            version: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            }
        }, {
            sequelize,
            tableName: 'CustomerAuth'
        })
    }
}