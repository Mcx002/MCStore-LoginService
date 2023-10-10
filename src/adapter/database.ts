import {Dialect, Sequelize} from "sequelize";
import {appConfig} from "../config";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {ErrorHandler} from "./error";

export interface DatabaseAdapter<Instance> {
    connect(): Promise<void>;
    getInstance(): Instance
}

export class SequelizeAdapter implements DatabaseAdapter<Sequelize> {
    sequelize: Sequelize

    constructor() {
        this.sequelize = new Sequelize(appConfig.dbName, appConfig.dbUsername, appConfig.dbPassword, {
            dialect: appConfig.dbDialect as Dialect,
            port: appConfig.dbPort,
            host: appConfig.dbHost,
        })
    }

    async connect() {
        try {
            await this.sequelize.authenticate()
            console.log('Connection has been established successfully')
        } catch (e) {
            console.error(e)
            throw new ErrorHandler(Status.INTERNAL, 'Unable to connect to the database')
        }
    }
    getInstance(): Sequelize {
        return this.sequelize
    }
}