import {DataTypes, Model, Sequelize} from "sequelize";
import {AnonymousDto} from "../../proto_gen/auth_pb";
import AnonymousLevel = AnonymousDto.AnonymousLevel;

export interface AnonymousAttributes {
    id: number
    xid: string
    username: string
    password: string
    level: AnonymousLevel
    createdAt: Date
    updatedAt: Date
}

export class Anonymous extends Model implements AnonymousAttributes {
    id!: number
    xid!: string
    username!: string
    password!: string
    level!: AnonymousLevel
    createdAt!: Date
    updatedAt!: Date

    static initModel(sequelize: Sequelize): void {
        Anonymous.init({
            id: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                primaryKey: true,
            },
            xid: {
                type: DataTypes.STRING(4),
                allowNull: false,
                unique: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            level: {
                type: DataTypes.SMALLINT,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            }
        }, {
            sequelize,
            tableName: 'Anonymous'
        })
    }
}