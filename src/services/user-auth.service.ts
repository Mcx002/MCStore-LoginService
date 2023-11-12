import { UserAuthAttributes, UserAuthCreationAttributes } from "../models/user-auth.model";
import { ErrorHandler } from "../adapter/error.adapter";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { createBaseAttributes } from "../models";
import { findUserAuthByEmailAndSubjectType, insertUserAuth, updateUserAuth } from "../repositories/user-auth.repository";
import { getUnixFromDate } from "../utils/time";
import { createHash } from "crypto";
import { mailTransporter } from "../adapter/mail-transporter.adapter";
import { emailVerificationTemplate } from "../templates/email-verification.template";
import { appConfig } from "../config";
import {
    deleteAttemptSessionByDeviceIdAndPurpose,
    findAttemptSessionByDeviceIdAndPurpose,
    insertAttemptSession,
    updateAttemptSessionByDeviceIdAndPurpose
} from "../repositories/session.repository";
import { AttemptSession, AttemptSessionCreationAttributes, AttemptSessionPurpose } from "../models/attempt-session.model";
import { jwtAdapter, JwtSignInterface } from "../adapter/jwt.adapter";
import { logger } from "../logger";
import { EditPasswordDto, UserAuthDto } from "../../proto_gen/user-auth_pb";
import { AuthResultDto, Subject, SubjectType } from "../../proto_gen/auth_pb";
import { BoolValue } from "google-protobuf/google/protobuf/wrappers_pb";

export const createUserAuthToken = (subjectType: SubjectType, subject: Subject) => {
    let audience = [appConfig.customerAudience]
    let tokenExpiredTime = appConfig.customerTokenExpiredTime
    switch (subjectType) {
        case SubjectType.SELLER:
            audience = [appConfig.sellerAudience]
            tokenExpiredTime = appConfig.sellerTokenExpiredTime
            break
        case SubjectType.ADMIN:
            audience = [appConfig.adminAudience]
            tokenExpiredTime = appConfig.adminTokenExpiredTime
            break
        default:
            break;
    }

    subject.setSubjectType(subjectType)
    const tokenPayload: JwtSignInterface = {
        payload: Subject.toObject(false, subject),
        audience,
        subject: subject.getXid(),
    }
    return jwtAdapter.sign(tokenPayload, tokenExpiredTime)
}

export const registerUserAuth = async (payload: UserAuthDto, subject: Subject): Promise<AuthResultDto> => {
    const password = payload.getPassword()
    if (!password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "Password required")
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex')

    // prepare customer auth creation attributes
    const subjectType = payload.getSubjectType()
    const newUserAuthData: UserAuthCreationAttributes = {
        email: payload.getEmail(),
        password: hashedPassword,
        userId: payload.getUserId(),
        verified: false,
        subjectType: subjectType,
        ...createBaseAttributes(),
    }

    await insertUserAuth(newUserAuthData)

    subject.setSubjectType(subjectType)
    const token = createUserAuthToken(subjectType, subject)

    const authResult = new AuthResultDto()
    authResult.setToken(token)

    return authResult
}

export const isUserAuthEmailExists = async (email: string, subjectType: SubjectType): Promise<boolean> => {
    const userAuth = await findUserAuthByEmailAndSubjectType(email, subjectType)

    return !!userAuth
}

export const validateUserAccount = async (payload: UserAuthDto, subject: Subject): Promise<AuthResultDto> => {
    const userAuth = await findUserAuthByEmailAndSubjectType(payload.getEmail(), payload.getSubjectType())
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

    const token = createUserAuthToken(userAuth.subjectType, subject)

    const authResult = new AuthResultDto()
    authResult.setToken(token)

    return authResult
}

export const sendEmailVerificationMail = async (deviceId: string, email: string, subjectType: SubjectType): Promise<boolean> => {
    // check is email exists
    const userAuth = await findUserAuthByEmailAndSubjectType(email, subjectType)
    if (!userAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "no email found")
    }

    // check has email been verified
    if (userAuth.verified) {
        throw new ErrorHandler(Status.ABORTED, "user has been verified")
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
            subjectType,
        },
        subject: email,
        audience: ['EmailVerification'],
    }, 60 * 15)

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
    const userAuth = await findUserAuthByEmailAndSubjectType(email, tokenDecoded['subjectType'])
    if (!userAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "no email found")
    }

    // check has email been verified
    if (userAuth.verified) {
        throw new ErrorHandler(Status.ABORTED, "user has been verified")
    }

    // update email verification
    const updatedValue: Partial<UserAuthAttributes> = {
        version: userAuth.version + 1,
        updatedAt: new Date(),
        verified: true,
    }
    const result = await updateUserAuth(userAuth.id, userAuth.version, updatedValue)
    if (result === 0) {
        logger.warn('no rows updated')
    }

    await deleteAttemptSessionByDeviceIdAndPurpose(deviceId, AttemptSessionPurpose.EmailVerification)

    return true
}

export const editUserPassword = async (req: EditPasswordDto): Promise<BoolValue> => {
    // Find user
    const userAuth = await findUserAuthByEmailAndSubjectType(req.getEmail(), req.getSubjectType())
    if (!userAuth) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "email is not found")
    }

    // Pair old user password
    const hashedOldPassword = createHash('sha256').update(req.getOldPassword()).digest('hex')
    if (hashedOldPassword !== userAuth.password) {
        throw new ErrorHandler(Status.INVALID_ARGUMENT, "invalid signature")
    }

    // Hash new user password
    const hashedNewPassword = createHash('sha256').update(req.getNewPassword()).digest('hex')

    // Prepare update data
    const updatedValue: Partial<UserAuthAttributes> = {
        password: hashedNewPassword,
        version: userAuth.version + 1,
        updatedAt: new Date(),
    }

    // Execute Update
    const updatedRows = await updateUserAuth(userAuth.id, userAuth.version, updatedValue)
    logger.info(`updated rows ${updatedRows}`)

    const result = new BoolValue()
    result.setValue(true)

    return result
}