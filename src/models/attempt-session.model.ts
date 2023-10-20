import {BaseAttributes} from "./index";
import {DataTypes, Model, Optional, Sequelize} from "sequelize";

export enum AttemptSessionPurpose {
    EmailVerification = 1
}

export interface AttemptSessionAttributes extends BaseAttributes {
    id: number
    purpose: AttemptSessionPurpose
    deviceId: string
    attempt: number
    lastAttempt: Date
}

export type AttemptSessionCreationAttributes = Optional<AttemptSessionAttributes, "id">

export class AttemptSession extends Model implements AttemptSessionAttributes {
    id!: number
    purpose!: AttemptSessionPurpose
    deviceId!: string
    attempt!: number
    lastAttempt!: Date
    createdAt!: Date
    updatedAt!: Date
    version!: number

    static initModel(sequelize: Sequelize): void {
        AttemptSession.init({
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            purpose: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                references: {
                    model: "AttemptSessionPurpose",
                    key: 'id',
                }
            },
            deviceId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            attempt: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            lastAttempt: {
                type: DataTypes.DATE,
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
            }
        }, {
            sequelize,
            tableName: 'AttemptSession'
        })
    }
}
