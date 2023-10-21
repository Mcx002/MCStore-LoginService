import {Status} from "@grpc/grpc-js/build/src/constants";
import {ServerStatusResponse} from "@grpc/grpc-js/build/src/server-call";
import {ServerErrorResponse} from "@grpc/grpc-js";

export type ErrorHandlerOptions = Partial<Exclude<ServerStatusResponse, "code"> & Exclude<Error, "message">>

export const checkOptionsName = (options?: ErrorHandlerOptions) => {
    // Check error name on options
    let name = "System Error"
    if (options && options.name) {
        name = options.name
    }

    return name
}

export class ErrorHandler extends Error implements ServerErrorResponse {
    message: string;
    code: Status
    name: string;

    constructor(code: Status, message: string, options?: ErrorHandlerOptions) {
        super(message)

        this.code = code
        this.message = message
        this.name = checkOptionsName(options)
    }
}