import {DataTypes, Model, Optional, Sequelize} from "sequelize";
import {BaseAttributes} from "./index";
import {SubjectType} from "../../proto_gen/auth_pb";

export interface UserAuthAttributes extends BaseAttributes {
    id: number
    userId: number
    email: string
    password: string
    verified: boolean
    subjectType: SubjectType
}

export type UserAuthCreationAttributes = Optional<UserAuthAttributes, "id">

export class UserAuth extends Model implements UserAuthAttributes {
    createdAt!: Date
    email!: string
    password!: string
    id!: number
    updatedAt!: Date
    userId!: number
    version!: number
    verified!: boolean
    subjectType!: SubjectType

    static initModel(sequelize: Sequelize): void {
        UserAuth.init({
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
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
            },
            subjectType: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: SubjectType.CUSTOMER,
            }
        }, {
            sequelize,
            tableName: 'UserAuth'
        })
    }
}