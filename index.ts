import {
    ServerCredentials,
} from "@grpc/grpc-js";
import {serverLifetime} from "./src/utils/server";
import {appConfig} from "./src/config";
import {AuthServer} from "./src/servers";
import {DatabaseModels} from "./src/models";

async function boot() {
    const port = appConfig.port || 3000
    const uri = `localhost:${port}`

    const dbModel = new DatabaseModels()
    const authServer = new AuthServer()

    await dbModel.init()
    authServer.initRoutes()

    authServer.bindAsync(uri, ServerCredentials.createInsecure(), () => {
        authServer.start()

        serverLifetime.setStartTime(new Date().getTime())
        console.log(`Listening on ${uri}`)
    })
}

boot().catch((error) => {
    console.error(error)
})