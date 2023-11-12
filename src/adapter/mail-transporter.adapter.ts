import * as nodemailer from 'nodemailer';
import {appConfig} from "../config";

export const mailTransporter = nodemailer.createTransport({
    host: appConfig.mailHost,
    port: appConfig.mailPort,
    secure: appConfig.mailSecure,
    auth: {
        user: appConfig.mailUsername,
        pass: appConfig.mailPassword,
    }
})
