import {Server} from "@grpc/grpc-js";
import {AuthService} from "../../proto_gen/auth-svc_grpc_pb";
import {getHealthServer} from "./common.server";
import {
    createAnonymousAdminTokenServer,
    createAnonymousCustomerTokenServer,
    createAnonymousSellerTokenServer, validateAnonymousTokenServer
} from "./anonymous.server";
import {
    isCustomerEmailExistsServer,
    registerCustomerAuthServer,
    sendCustomerEmailVerificationMailServer,
    validateCustomerAccountServer, validateCustomerEmailVerificationServer
} from "./customer.server";

export class AuthServer extends Server {
    initRoutes(): void {
        // Auth Service Route
        this.addService(AuthService, {
            getHealth: getHealthServer,

            // AnonymousModel
            createCustomerAnonymousToken: createAnonymousCustomerTokenServer,
            createSellerAnonymousToken: createAnonymousSellerTokenServer,
            createAdminAnonymousToken: createAnonymousAdminTokenServer,
            validateAnonymousToken: validateAnonymousTokenServer,

            // customer
            registerCustomerAuth: registerCustomerAuthServer,
            isCustomerEmailExists: isCustomerEmailExistsServer,
            validateCustomerAccount: validateCustomerAccountServer,
            sendCustomerEmailVerificationMail: sendCustomerEmailVerificationMailServer,
            validateCustomerEmailVerification: validateCustomerEmailVerificationServer,
        })
    }
}