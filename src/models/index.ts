import {Sequelize} from "sequelize";
import {DatabaseAdapter, SequelizeAdapter} from "../adapter/database.adapter";
import {Anonymous} from "./anonymous.model";
import {UserAuth} from "./user-auth.model";
import {AttemptSession} from "./attempt-session.model";

export class DatabaseModels {
    dbAdapter: DatabaseAdapter<Sequelize>

    constructor() {
        this.dbAdapter = new SequelizeAdapter()
    }

    async init() {
        await this.dbAdapter.connect()
        const db = this.dbAdapter.getInstance()

        Anonymous.initModel(db)
        UserAuth.initModel(db)
        AttemptSession.initModel(db)
    }
}

export interface BaseAttributes {
    createdAt: Date
    updatedAt: Date
    version: number
}

export const createBaseAttributes = (): BaseAttributes => {
    return {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
    }
}