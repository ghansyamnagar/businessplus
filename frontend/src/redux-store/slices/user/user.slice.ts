import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserActionPayload, } from './user.types'

const authSlice = createSlice({
    name: 'user',
    initialState: {},
    reducers: {
        getViewCompanySetupRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        addNewCompanySetupRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getUserUnitsRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getDepartmentSignupRequest(state, action: PayloadAction<UserActionPayload>) {
        },
        deleteUnitRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        deleteDepartmentRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        deleteSectionRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getUnitListRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getUnitListForSelectUnitPageRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        addUnitRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        editUnitRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getDepartmentListRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        addDepartmentRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        editDepartmentRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getUserListRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getSectionListRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        addSectionRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        editSectionRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        deleteUserRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        addUserRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        editUserRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getUserListDeptWiseRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getSingleUserDetailsRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        getCompanySettingViewRequest(state, action: PayloadAction<UserActionPayload>) {

        },
        initializeUserSessionRequest(state, action: PayloadAction<UserActionPayload>) {

        }
    }
})

export const {
    getUserUnitsRequest,
    getViewCompanySetupRequest,
    addNewCompanySetupRequest,
    getDepartmentSignupRequest,
    deleteUnitRequest,
    deleteDepartmentRequest,
    deleteSectionRequest,
    getUnitListRequest,
    getUnitListForSelectUnitPageRequest,
    addUnitRequest,
    editUnitRequest,
    getDepartmentListRequest,
    addDepartmentRequest,
    editDepartmentRequest,
    getUserListRequest,
    getSectionListRequest,
    addSectionRequest,
    editSectionRequest,
    deleteUserRequest,
    addUserRequest,
    editUserRequest,
    getUserListDeptWiseRequest,
    getSingleUserDetailsRequest,
    getCompanySettingViewRequest,
    initializeUserSessionRequest
} = authSlice.actions
export default authSlice.reducer
