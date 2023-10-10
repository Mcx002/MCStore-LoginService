import {Sequelize} from "sequelize";
import {DatabaseAdapter, SequelizeAdapter} from "../adapter/database";
import {Anonymous} from "./anonymous";

export class DatabaseModels {
    dbAdapter: DatabaseAdapter<Sequelize>

    constructor() {
        this.dbAdapter = new SequelizeAdapter()
    }

    async init() {
        await this.dbAdapter.connect()
        const db = this.dbAdapter.getInstance()

        Anonymous.initModel(db)
    }
}