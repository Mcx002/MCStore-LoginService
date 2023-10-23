import {Server} from "@grpc/grpc-js";
import {AuthService} from "../../proto_gen/auth-svc_grpc_pb";
import {getHealthServer} from "./common.server";
import {
    createAnonymousAdminTokenServer,
    createAnonymousCustomerTokenServer,
    createAnonymousSellerTokenServer
} from "./anonymous.server";
import {
    isUserEmailExistsServer,
    registerUserAuthServer,
    sendUserEmailVerificationMailServer,
    validateUserAccountServer, validateUserEmailVerificationServer, validateTokenServer
} from "./user-auth.server";

export class AuthServer extends Server {
    initRoutes(): void {
        // Auth Service Route
        this.addService(AuthService, {
            getHealth: getHealthServer,

            // AnonymousModel
            createCustomerAnonymousToken: createAnonymousCustomerTokenServer,
            createSellerAnonymousToken: createAnonymousSellerTokenServer,
            createAdminAnonymousToken: createAnonymousAdminTokenServer,

            // user
            registerUserAuth: registerUserAuthServer,
            isUserEmailExists: isUserEmailExistsServer,
            validateUserAccount: validateUserAccountServer,
            sendUserEmailVerificationMail: sendUserEmailVerificationMailServer,
            validateUserEmailVerification: validateUserEmailVerificationServer,
            validateToken: validateTokenServer,
        })
    }
}