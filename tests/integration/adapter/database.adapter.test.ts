import {SequelizeAdapter} from "../../../src/adapter/database.adapter";
import {appConfig} from "../../../src/config";

describe('Adapter Database Test', () => {
    test('Should throw unable to connect to the database', async () => {
        appConfig.dbHost = "testHost"
        const dbAdapter = new SequelizeAdapter()
        expect(async () => dbAdapter.connect()).rejects.toThrow("Unable to connect to the database")
    })

    test('Should connect to the database', async () => {
        appConfig.dbHost = 'localhost'
        const dbAdapter = new SequelizeAdapter()
        const connect = await dbAdapter.connect()
        expect(connect).toBe(true)
    })
})
