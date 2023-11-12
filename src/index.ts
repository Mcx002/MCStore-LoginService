import {
    ServerCredentials,
} from "@grpc/grpc-js";
import { serverLifetime } from "./utils/server";
import { appConfig } from "./config";
import { AuthServer } from "./servers";
import { DatabaseModels } from "./models";
import { loadEnvFile } from "./utils/env-parser";
import { ErrorHandler } from "./adapter/error.adapter";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { logger } from "./logger";

async function boot() {
    try {
        loadEnvFile()

        const port = appConfig.port
        const uri = `${appConfig.host}:${port}`

        const dbModel = new DatabaseModels()

        const authServer = new AuthServer()

        await dbModel.init()

        authServer.initRoutes()

        authServer.bindAsync(uri, ServerCredentials.createInsecure(), (error, _) => {
            authServer.start()

            serverLifetime.setStartTime(new Date().getTime())
            console.log(`Listening on ${uri}`)

            if (error) {
                logger.error(JSON.stringify(error))
            }
        })
    } catch (error) {
        logger.error(JSON.stringify(error))
        throw new ErrorHandler(Status.UNKNOWN, "internal error")
    }
}

boot().catch((error) => {
    logger.error(JSON.stringify(error))
})