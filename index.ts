import {
    ServerCredentials,
} from "@grpc/grpc-js";
import {serverLifetime} from "./src/utils/server";
import {config} from "./src/config";
import {server} from "./src/routes";

const port = config.port || 3000
const uri = `localhost:${port}`
server.bindAsync(uri, ServerCredentials.createInsecure(), () => {
    server.start()

    serverLifetime.setStartTime(new Date().getTime())
    console.log(`Listening on ${uri}`)
})
