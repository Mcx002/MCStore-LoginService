import {appConfig} from "../config";

export const emailVerificationTemplate = (codeLink: string) => {
    return `
<div>
    <p>this is email verification. click button below to verify your email</p>
    <a href="${appConfig.emailVerificationCallbackUrl}?code=${codeLink}">button</a>
</div>
    `
}