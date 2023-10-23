import {UserAuthAttributes, UserAuthCreationAttributes} from "../models/user-auth.model";
import {ErrorHandler} from "../adapter/error.adapter";
import {Status} from "@grpc/grpc-js/build/src/constants";
import {createBaseAttributes} from "../models";
import {findUserAuthByEmail, insertUserAuth, updateUserAuth} from "../repositories/user-auth.repository";
import {getUnixFromDate} from "../utils/time";
import {createHash} from "crypto";
import {mailTransporter} from "../adapter/mail-transporter.adapter";
import {emailVerificationTemplate} from "../templates/email-verification.template";
import {appConfig} from "../config";
import {
    deleteAttemptSessionByDeviceIdAndPurpose,
    findAttemptSessionByDeviceIdAndPurpose,
    insertAttemptSession,
    updateAttemptSessionByDeviceIdAndPurpose
} from "../repositories/session.repository";
import {AttemptSession, AttemptSessionCreationAttributes, AttemptSessionPurpose} from "../models/attempt-session.model";
import {jwtAdapter} from "../adapter/jwt.adapter";
import {logger} from "../logger";
import {UserAuthDto} from "../../proto_gen/user-auth_pb";

export const registerUserAuth = async (payload: UserAuthDto) => {
    const password = payload.getPassword()
    if (!password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "Password required")
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex')

    // prepare customer auth creation attributes
    const newUserAuthData: UserAuthCreationAttributes = {
        email: payload.getEmail(),
        password: hashedPassword,
        userId: payload.getUserId(),
        verified: false,
        subjectType: payload.getSubjectType(),
        ...createBaseAttributes(),
    }

    const userAuth = await insertUserAuth(newUserAuthData)

    return composeUserAuthDto(userAuth)
}

export const isUserAuthEmailExists = async (email: string) => {
    const userAuth = await findUserAuthByEmail(email)

    return !!userAuth
}

export const composeUserAuthDto = (payload: UserAuthAttributes): UserAuthDto => {
    const result = new UserAuthDto()
    result.setEmail(payload.email)
    result.setCreatedAt(getUnixFromDate(payload.createdAt))
    result.setUpdatedAt(getUnixFromDate(payload.updatedAt))
    result.setVersion(payload.version)
    result.setUserId(payload.userId)

    return result
}

export const validateUserAccount = async (payload: UserAuthDto): Promise<boolean> => {
    const userAuth = await findUserAuthByEmail(payload.getEmail())
    if (!userAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "user auth not found")
    }

    const password = payload.getPassword()
    if (!password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "password required")
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex')

    if (userAuth.password !== hashedPassword) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "auth invalid")
    }

    return true
}

export const sendEmailVerificationMail = async (deviceId: string, email: string): Promise<boolean> => {
    // check is email exists
    const userAuth = await findUserAuthByEmail(email)
    if (!userAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "no email found")
    }

    // check attemptSession by deviceId and email
    let attemptSession = await findAttemptSessionByDeviceIdAndPurpose(deviceId, AttemptSessionPurpose.EmailVerification)
    if (!attemptSession) {
        const attemptSessionCreationAttributes: AttemptSessionCreationAttributes = {
            ...createBaseAttributes(),
            deviceId,
            purpose: AttemptSessionPurpose.EmailVerification,
            attempt: 1,
            lastAttempt: new Date()
        }
        attemptSession = await insertAttemptSession(attemptSessionCreationAttributes)
    }

    // throw error if attempt more than 3 and in throttling time
    if (attemptSession.attempt >= 3 &&
        getUnixFromDate(new Date()) < getUnixFromDate(attemptSession.lastAttempt) + appConfig.emailVerificationThrottlingTime) {
        throw new ErrorHandler(Status.ABORTED, "attempted 3 times, wait for a while")
    }

    if (attemptSession.attempt >= 3) {
        attemptSession.attempt = 0
    }

    // update attemptSession
    const attemptSessionUpdate: Partial<AttemptSession> = {
        attempt: attemptSession.attempt + 1,
        lastAttempt: new Date(),
        updatedAt: new Date(),
        version: attemptSession.version + 1,
    }
    await updateAttemptSessionByDeviceIdAndPurpose(deviceId, AttemptSessionPurpose.EmailVerification, attemptSession.version, attemptSessionUpdate)

    // create stateless email verification token pairing
    const token = jwtAdapter.sign({
        payload: {
            email,
            deviceId,
        },
        subject: email,
        audience: ['EmailVerification'],
    },  60*15)

    // send email
    await mailTransporter.sendMail({
        from: appConfig.mailUsername,
        subject: 'Email Verification',
        to: email,
        html: emailVerificationTemplate(token)
    })
    return true
}

export const validateUserEmailVerification = async (token: string) => {
    // retrieve token payload
    const tokenDecoded = jwtAdapter.verify(token, ['EmailVerification'])
    const email = tokenDecoded['email']
    const deviceId = tokenDecoded['deviceId']
    if (!email || email === '') {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "email not found")
    }
    if (!deviceId || email === '') {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "deviceId not found")
    }

    // check is email registered
    const userAuth = await findUserAuthByEmail(email)
    if (!userAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "no email found")
    }

    // update email verification
    const updatedValue: Partial<UserAuthAttributes> = {
        version: userAuth.version + 1,
        updatedAt: new Date(),
        verified: true,
    }
    const result = await updateUserAuth(userAuth.id, userAuth.version, updatedValue)
    if (result === 0) {
        logger.info('no rows updated')
    }

    await deleteAttemptSessionByDeviceIdAndPurpose(deviceId, AttemptSessionPurpose.EmailVerification)

    return true
}