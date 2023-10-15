import {Dialect, Sequelize} from "sequelize";
import {appConfig} from "../config";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {ErrorHandler} from "./error";
import {logger} from "../logger";

export interface DatabaseAdapter<Instance> {
    connect(): Promise<boolean>;
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

    async connect(): Promise<boolean> {
        try {
            await this.sequelize.authenticate()
            logger.info('Connection has been established successfully')

            return true
        } catch (e) {
            logger.error(e)
            throw new ErrorHandler(Status.INTERNAL, 'Unable to connect to the database')
        }
    }
    getInstance(): Sequelize {
        return this.sequelize
    }
}