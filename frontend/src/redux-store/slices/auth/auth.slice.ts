import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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

const authSlice = createSlice({
    name: 'auth',
    initialState: {},
    reducers: {
        loginRequest(state, action: PayloadAction<AuthActionPayload<LoginPayload>>) {
            // saga trigger only
        },
        registerRequest(state, action: PayloadAction<AuthActionPayload>) {
            // only trigger saga
        },
        changePasswordRequest(state, action: PayloadAction<AuthActionPayload<ChangePasswordPayload>>) {
            // saga trigger only
        },
        resetPasswordRequest(state, action: PayloadAction<AuthActionPayload<ResetPasswordPayload>>) {
            // saga trigger only
        },
        resetPasswordUpdateRequest(state, action: PayloadAction<AuthActionPayload<ResetPasswordUpdatePayload>>) {
            // saga trigger only
        },
        viewProfileRequest(state, action: PayloadAction<AuthActionPayload<ViewProfilePayload>>) {
            // saga trigger only
        },
        updateProfileRequest(state, action: PayloadAction<AuthActionPayload<UpdateProfilePayload>>) {
            // saga trigger only
        },
        viewUnitRequest(state, action: PayloadAction<AuthActionPayload<ViewUnitPayload>>) {
            // saga trigger only
        },
        getDeptSignupRequest(state, action: PayloadAction<AuthActionPayload<GetDeptSignupPayload>>) {
            // saga trigger only
        },
        getSectionSignupRequest(state, action: PayloadAction<AuthActionPayload<GetSectionSignupPayload>>) {
            // saga trigger only
        },
        viewProfileJoinedGroupRequest(state, action: PayloadAction<AuthActionPayload<ViewProfileJoinedGroupPayload>>) {
            // saga trigger only
        },
        getUserDetailsRequest(state, action: PayloadAction<AuthActionPayload<GetUserDetailsPayload>>) {
            // saga trigger only
        },
        createGroupRequest(state, action: PayloadAction<AuthActionPayload<CreateGroupPayload>>) {
            // saga trigger only
        },
        getProfileGroupDetailsRequest(state, action: PayloadAction<AuthActionPayload<GetProfileGroupDetailsPayload>>) {
            // saga trigger only
        },
        editProfileGroupUpdateRequest(state, action: PayloadAction<AuthActionPayload<EditProfileGroupUpdatePayload>>) {
            // saga trigger only
        },
        profileDeleteGroupRequest(state, action: PayloadAction<AuthActionPayload<ProfileDeleteGroupPayload>>) {
            // saga trigger only
        },
        getProfileUserByGroupIdRequest(state, action: PayloadAction<AuthActionPayload<GetProfileUserByGroupIdPayload>>) {
            // saga trigger only
        },
        addParticipantToGroupRequest(state, action: PayloadAction<AuthActionPayload<AddParticipantToGroupPayload>>) {
            // saga trigger only
        },
        verifyOtpRequest(state, action: PayloadAction<AuthActionPayload<VerifyOtpPayload>>) {
            // saga trigger only
        },
        updatePasswordRequest(state, action: PayloadAction<AuthActionPayload<UpdatePasswordPayload>>) {
            // saga trigger only
        },
        resendOtpRequest(state, action: PayloadAction<AuthActionPayload<ResendOtpPayload>>) {
            // saga trigger only
        }
    }
})

export const {
    loginRequest,
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
    addParticipantToGroupRequest,
    verifyOtpRequest,
    updatePasswordRequest,
    resendOtpRequest
} = authSlice.actions
export default authSlice.reducer
