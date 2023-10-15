import {Server} from "@grpc/grpc-js";
import {AuthService} from "../../proto_gen/auth-svc_grpc_pb";
import {getHealthServer} from "./common";
import {
    createAnonymousAdminTokenServer,
    createAnonymousCustomerTokenServer,
    createAnonymousSellerTokenServer, validateAnonymousTokenServer
} from "./anonymous";
import {registerCustomerAuthServer} from "./customer";

export class AuthServer extends Server {
    initRoutes(): void {
        // Auth Service Route
        this.addService(AuthService, {
            getHealth: getHealthServer,

            // Anonymous
            createCustomerAnonymousToken: createAnonymousCustomerTokenServer,
            createSellerAnonymousToken: createAnonymousSellerTokenServer,
            createAdminAnonymousToken: createAnonymousAdminTokenServer,
            validateAnonymousToken: validateAnonymousTokenServer,

            // customer
            registerCustomerAuth: registerCustomerAuthServer,
        })
    }
}