import { call, takeLatest } from 'redux-saga/effects'
import api from '@/utils/api'
import { getUserUnitsRequest, getViewCompanySetupRequest, addNewCompanySetupRequest, getDepartmentSignupRequest, deleteUnitRequest, deleteDepartmentRequest, deleteSectionRequest, getUnitListRequest, addUnitRequest, editUnitRequest, getDepartmentListRequest, addDepartmentRequest, editDepartmentRequest, getUserListRequest, getSectionListRequest, addSectionRequest, editSectionRequest, deleteUserRequest, addUserRequest, editUserRequest, getUserListDeptWiseRequest, getSingleUserDetailsRequest, getCompanySettingViewRequest, getUnitListForSelectUnitPageRequest } from './user.slice'
import { UserActionPayload } from './user.types'
import { getSession } from 'next-auth/react'

function* addUnit(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: (session.user as any).id,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-unit', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editUnit(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-edit-unit', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getUserUnits(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-view-unit', apiPayload)
        //  success → (response, null)
        callback?.(response.data, null)
    } catch (error: any) {
        //  error → (null, error)
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteUnit(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: (session.user as any).id,
            // Unit ID is likely passed in payload, company_id might not be needed for delete but harmless
        }

        const response = yield call(api.post, '/api-delete-unit', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getViewCompanySetup(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const response = yield call(api.post, '/api-view-new-company-setup', payload)
        //  success → (response, null)
        callback?.(response.data, null)
    } catch (error: any) {
        //  error → (null, error)
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}
function* addNewCompanySetup(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        console.log('payload addNewCompanySetup', payload)
        const formData = new FormData()
        if (payload.login_access_token) formData.append('login_access_token', payload.login_access_token)
        if (payload.user_id) formData.append('user_id', payload.user_id)
        if (payload.company_id) formData.append('company_id', payload.company_id)
        if (payload.company_step_id) formData.append('company_step_id', payload.company_step_id)
        if (payload.step_no) formData.append('step_no', payload.step_no)
        if (payload.step_name) formData.append('step_name', payload.step_name)
        if (payload.companyDetails) formData.append('companyDetails', payload.companyDetails)

        // Step 1: Company Profile
        if (payload.company_name) formData.append('company_name', payload.company_name)
        if (payload.company_address) formData.append('company_address', payload.company_address)
        if (payload.company_logo) formData.append('company_logo', payload.company_logo)
        if (payload.image_id) formData.append('image_id', payload.image_id)

        // Step 2: Units
        if (payload.itemunits && Array.isArray(payload.itemunits)) {
            payload.itemunits.forEach((item: any, index: number) => {
                Object.keys(item).forEach(key => {
                    formData.append(`itemunits[${index}][${key}]`, item[key])
                })
            })
        }
        // Step 3: Departments
        if (payload.itemdepartments && Array.isArray(payload.itemdepartments)) {
            payload.itemdepartments.forEach((item: any, index: number) => {
                Object.keys(item).forEach(key => {
                    formData.append(`itemDept[${index}][${key}]`, item[key])
                })
            })
        }

        // Step 4: Sections
        if (payload.itemsection && Array.isArray(payload.itemsection)) {
            payload.itemsection.forEach((item: any, index: number) => {
                Object.keys(item).forEach(key => {
                    formData.append(`itemSections[${index}][${key}]`, item[key])
                })
            })
        }
        // Step 5: Controls
        if (payload.financial_year) formData.append('financial_year', payload.financial_year)
        if (payload.reminder_date) formData.append('reminder_date', payload.reminder_date)
        if (payload.reminder_frequency) formData.append('reminder_frequency', payload.reminder_frequency)
        if (payload.priority) formData.append('priority', payload.priority)
        const response = yield call(api.post, '/api-new-company-setup', formData)
        //  success → (response, null)
        callback?.(response.data, null)
    } catch (error: any) {
        //  error → (null, error)
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getDepartmentSignup(
    action: { type: string; payload: UserActionPayload }
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




function* deleteDepartment(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: (session.user as any).id
        }

        const response = yield call(api.post, '/api-delete-department', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteSection(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: (session.user as any).id,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-delete-section', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getUnitList(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload



    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-view-unit', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }

}

function* getUnitListForSelectUnitPage(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload



    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-get-unit', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }

}

function* getDepartmentList(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-view-department', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addDepartment(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            SprUsr: (session.user as any).id,
            role_id: (session.user as any).role_id || '4',
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-department', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editDepartment(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            role_id: (session.user as any).role_id || '4'
        }

        const response = yield call(api.post, '/api-edit-department', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getUserList(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101',
            role_id: 2
        }

        const response = yield call(api.post, '/api-get-user-details', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}
function* getSectionList(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-view-section', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addSection(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-section', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editSection(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
        }

        const response = yield call(api.post, '/api-section-update', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteUser(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
        }

        const response = yield call(api.post, '/api-delete-user', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* addUser(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-user-signup', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editUser(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
        }

        const response = yield call(api.post, '/api-update-profile', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getUserListDeptWise(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: String(session.user.unit_selected.id),
            company_id: (session.user as any).company_id || '101',
            ...payload,
        }

        const response = yield call(api.post, '/api-get-user-list-dept-wise', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getSingleUserDetails(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-get-single-user-details', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getCompanySettingView(
    action: { type: string; payload: UserActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-company-setting-view', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

export function* userSaga() {
    yield takeLatest(getViewCompanySetupRequest.type, getViewCompanySetup)
    yield takeLatest(addNewCompanySetupRequest.type, addNewCompanySetup)
    yield takeLatest(getUserUnitsRequest.type, getUserUnits)
    yield takeLatest(getDepartmentSignupRequest.type, getDepartmentSignup)
    yield takeLatest(deleteUnitRequest.type, deleteUnit)
    yield takeLatest(deleteDepartmentRequest.type, deleteDepartment)
    yield takeLatest(deleteSectionRequest.type, deleteSection)
    yield takeLatest(getUnitListRequest.type, getUnitList)
    yield takeLatest(getUnitListForSelectUnitPageRequest.type, getUnitListForSelectUnitPage)
    yield takeLatest(addUnitRequest.type, addUnit)
    yield takeLatest(editUnitRequest.type, editUnit)
    yield takeLatest(getDepartmentListRequest.type, getDepartmentList)
    yield takeLatest(addDepartmentRequest.type, addDepartment)
    yield takeLatest(editDepartmentRequest.type, editDepartment)
    yield takeLatest(getUserListRequest.type, getUserList)
    yield takeLatest(getSectionListRequest.type, getSectionList)
    yield takeLatest(addSectionRequest.type, addSection)
    yield takeLatest(editSectionRequest.type, editSection)
    yield takeLatest(deleteUserRequest.type, deleteUser)
    yield takeLatest(addUserRequest.type, addUser)
    yield takeLatest(editUserRequest.type, editUser)
    yield takeLatest(getUserListDeptWiseRequest.type, getUserListDeptWise)
    yield takeLatest(getSingleUserDetailsRequest.type, getSingleUserDetails)
    yield takeLatest(getCompanySettingViewRequest.type, getCompanySettingView)
}
