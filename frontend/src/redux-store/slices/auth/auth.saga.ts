import { call, takeLatest } from 'redux-saga/effects'
import api from '@/utils/api'
import {
    registerRequest,
    changePasswordRequest,
    resetPasswordRequest,
    resetPasswordUpdateRequest,
    viewProfileRequest,
    updateProfileRequest,
    viewUnitRequest,
    getDeptSignupRequest,
    getSectionSignupRequest,
    viewProfileJoinedGroupRequest,
    getUserDetailsRequest,
    createGroupRequest,
    getProfileGroupDetailsRequest,
    editProfileGroupUpdateRequest,
    profileDeleteGroupRequest,
    getProfileUserByGroupIdRequest,
    addParticipantToGroupRequest, verifyOtpRequest, updatePasswordRequest, resendOtpRequest
} from './auth.slice'
import { signIn, getSession } from 'next-auth/react'
import { loginRequest } from './auth.slice'
import {
    AuthActionPayload,
    LoginPayload,
    ChangePasswordPayload,
    ResetPasswordPayload,
    ResetPasswordUpdatePayload,
    ViewProfilePayload,
    UpdateProfilePayload,
    ViewUnitPayload,
    GetDeptSignupPayload,
    GetSectionSignupPayload,
    ViewProfileJoinedGroupPayload,
    GetUserDetailsPayload,
    CreateGroupPayload,
    GetProfileGroupDetailsPayload,
    EditProfileGroupUpdatePayload,
    ProfileDeleteGroupPayload,
    GetProfileUserByGroupIdPayload,
    AddParticipantToGroupPayload, VerifyOtpPayload, UpdatePasswordPayload, ResendOtpPayload
} from './auth.types'

function* loginWorker(
    action: { type: string; payload: AuthActionPayload<LoginPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const res = yield call(signIn, 'credentials', {
            email: payload.email,
            password: payload.password,
            redirect: false
        })

        if (res?.ok && !res?.error) {
            callback?.(res, null)
        } else {
            callback?.(null, { message: 'Invalid email or password' })
        }
    } catch (error: any) {
        callback?.(null, { message: 'Something went wrong' })
    }
}

function* registerUser(
    action: { type: string; payload: AuthActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-user-signup', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* changePasswordWorker(
    action: { type: string; payload: AuthActionPayload<ChangePasswordPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            user_id: Number((session.user as any).id),
            login_access_token: (session.user as any).accessToken
        }

        const response = yield call(api.post, '/api-change-password', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* resetPasswordWorker(
    action: { type: string; payload: AuthActionPayload<ResetPasswordPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-forget-password-request', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}
function* verifyOtpWorker(
    action: { type: string; payload: AuthActionPayload<VerifyOtpPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-forget-password-verify', payload)

        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'OTP verification failed' }
        )
    }
}

function* resetPasswordUpdateWorker(
    action: { type: string; payload: AuthActionPayload<ResetPasswordUpdatePayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-resetpassword-update', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* viewProfileWorker(
    action: { type: string; payload: AuthActionPayload<ViewProfilePayload> }
): any {
    const { callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const payload = {
            user_id: Number((session.user as any).id),
            login_access_token: (session.user as any).accessToken,
            role_id: Number((session.user as any).role)
        }

        const response = yield call(api.post, '/api-view-profile', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updateProfileWorker(
    action: { type: string; payload: AuthActionPayload<UpdateProfilePayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            user_id: Number((session.user as any).id),
            login_access_token: (session.user as any).accessToken,
            role_id: Number((session.user as any).role)
        }

        const response = yield call(api.post, '/api-update-profile', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* viewUnitWorker(
    action: { type: string; payload: AuthActionPayload<ViewUnitPayload> }
): any {
    const { callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const payload = {
            login_access_token: (session.user as any).accessToken,
            company_id: String((session.user as any).company_id || '101')
        }

        const response = yield call(api.post, '/api-view-unit', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getDeptSignupWorker(
    action: { type: string; payload: AuthActionPayload<GetDeptSignupPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-get-dept-signup', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getSectionSignupWorker(
    action: { type: string; payload: AuthActionPayload<GetSectionSignupPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-get-section-signup', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* viewProfileJoinedGroupWorker(
    action: { type: string; payload: AuthActionPayload<ViewProfileJoinedGroupPayload> }
): any {
    const { callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const payload = {
            login_access_token: (session.user as any).accessToken,
            company_id: Number((session.user as any).company_id) || 101
        }

        const response = yield call(api.post, '/api-view-profile-joined-group', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getUserDetailsWorker(
    action: { type: string; payload: AuthActionPayload<GetUserDetailsPayload> }
): any {
    const { callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const payload = {
            login_access_token: (session.user as any).accessToken,
            company_id: String((session.user as any).company_id || '101'),
            role_id: Number((session.user as any).role)
        }

        const response = yield call(api.post, '/api-get-user-details', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* createGroupWorker(
    action: { type: string; payload: AuthActionPayload<CreateGroupPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            admin_id: Number((session.user as any).id),
            company_id: Number((session.user as any).company_id) || 101
        }

        const response = yield call(api.post, '/api-create-group', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getProfileGroupDetailsWorker(
    action: { type: string; payload: AuthActionPayload<GetProfileGroupDetailsPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken
        }

        const response = yield call(api.post, '/api-get-profile-group-details', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editProfileGroupUpdateWorker(
    action: { type: string; payload: AuthActionPayload<EditProfileGroupUpdatePayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken
        }

        const response = yield call(api.post, '/api-edit-profile-group-update', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* profileDeleteGroupWorker(
    action: { type: string; payload: AuthActionPayload<ProfileDeleteGroupPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken
        }

        const response = yield call(api.post, '/api-profile-delete-group', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getProfileUserByGroupIdWorker(
    action: { type: string; payload: AuthActionPayload<GetProfileUserByGroupIdPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            role_id: Number((session.user as any).role)
        }

        const response = yield call(api.post, '/api-get-profile-user-by-group-id', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addParticipantToGroupWorker(
    action: { type: string; payload: AuthActionPayload<AddParticipantToGroupPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const session: any = yield call(getSession)

        const fullPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            admin_id: Number((session.user as any).id)
        }

        const response = yield call(api.post, '/api-add-participant-to-group', fullPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}




function* updatePassword(
    action: { type: string; payload: AuthActionPayload<UpdatePasswordPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-forget-password-update', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* resendOtpWorker(
    action: { type: string; payload: AuthActionPayload<ResendOtpPayload> }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-resend-otp', payload)

        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Failed to resend OTP' }
        )
    }
}


export function* authSaga() {
    yield takeLatest(loginRequest.type, loginWorker)
    yield takeLatest(registerRequest.type, registerUser)
    yield takeLatest(changePasswordRequest.type, changePasswordWorker)
    yield takeLatest(resetPasswordRequest.type, resetPasswordWorker)
    yield takeLatest(resetPasswordUpdateRequest.type, resetPasswordUpdateWorker)
    yield takeLatest(viewProfileRequest.type, viewProfileWorker)
    yield takeLatest(updateProfileRequest.type, updateProfileWorker)
    yield takeLatest(viewUnitRequest.type, viewUnitWorker)
    yield takeLatest(getDeptSignupRequest.type, getDeptSignupWorker)
    yield takeLatest(getSectionSignupRequest.type, getSectionSignupWorker)
    yield takeLatest(viewProfileJoinedGroupRequest.type, viewProfileJoinedGroupWorker)
    yield takeLatest(getUserDetailsRequest.type, getUserDetailsWorker)
    yield takeLatest(createGroupRequest.type, createGroupWorker)
    yield takeLatest(getProfileGroupDetailsRequest.type, getProfileGroupDetailsWorker)
    yield takeLatest(editProfileGroupUpdateRequest.type, editProfileGroupUpdateWorker)
    yield takeLatest(profileDeleteGroupRequest.type, profileDeleteGroupWorker)
    yield takeLatest(getProfileUserByGroupIdRequest.type, getProfileUserByGroupIdWorker)
    yield takeLatest(addParticipantToGroupRequest.type, addParticipantToGroupWorker)
    yield takeLatest(verifyOtpRequest.type, verifyOtpWorker)
    yield takeLatest(updatePasswordRequest.type, updatePassword)
    yield takeLatest(resendOtpRequest.type, resendOtpWorker)
}
