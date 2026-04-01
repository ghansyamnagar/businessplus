import { call, takeLatest } from 'redux-saga/effects'
import api from '@/utils/api'
import {
    getUomListRequest, addUomRequest, updateUomRequest,
    deleteUomRequest, getPriorityListRequest, addPriorityRequest, updatePriorityRequest, deletePriorityRequest, getCompanyFaqListRequest, addCompanyFaqRequest, updateCompanyFaqRequest, deleteCompanyFaqRequest, getVisionMissionRequest, updateVisionMissionRequest, getMenuRequest, getSelectModulesRequest, getPermissionListRequest, getPermissionDataRequest, updateRoleModuleRequest,
    getPerformanceKpiDashboardRequest, getBusinessPlansListRequest, getBusinessPriorityRequest, getLocationListRequest,
    createLocationRequest, updateLocationRequest, deleteLocationRequest,
    getLayoutListRequest, createLayouRequest, updateLayouRequest, deleteLayoutRequest,
    getMachineListRequest, createMachineRequest, updateMachineRequest,
    deleteMachineRequest, getInfrastructureRequest, createInfrastructureRequest,
    updateInfrastructureRequest, deleteInfrastructureRequest, getEventListRequest,
    createEventRequest, updateEventRequest, deleteEventRequest, getCelebrationListRequest,
    createCelebrationRequest, updateCelebrationRequest, deleteCelebrationRequest,
    getSoftwareListRequest, createSoftwareRequest, updateSoftwareRequest, deleteSoftwareRequest,
    getMediaListRequest, createMediaRequest, updateMediaRequest, deleteMediaRequest,
    getProductDevListRequest, createProductDevRequest, updateProductDevRequest, deleteProductDevRequest,
    getBigDataListRequest, createBigDataRequest, updateBigDataRequest, deleteBigDataRequest,
    getProcedureHrListRequest, createProcedureHrRequest, updateProcedureHrRequest, deleteProcedureHrRequest,
    getProcedureOperationsListRequest, updateProcedureOperationsRequest,
    createProcedureOperationsRequest, deleteProcedureOperationsRequest,
    getProcedureRDListRequest, createProcedureRDRequest, updateProcedureRDRequest, deleteProcedureRDRequest,
    getGovernanceListRequest, createGovernanceRequest, updateGovernanceRequest, deleteGovernanceRequest,
    getPresentationListRequest, createPresentationRequest, updatePresentationRequest, deletePresentationRequest
} from './master.slice'
import { MasterActionPayload } from './master.types'
import { getSession } from 'next-auth/react'
import { getCompanyDetailsHelper } from '../../sagaHelpers'

function* getUomList(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-view-uom', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addUom(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-add-uom', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updateUom(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-update-uom', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteUom(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-delete-uom', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getPriorityList(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-view-priorities', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addPriority(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-add-priorities', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updatePriority(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-update-priorities', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deletePriority(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
        }

        const response = yield call(api.post, '/api-delete-priorities', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getCompanyFaqList(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-view-faq', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addCompanyFaq(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-add-faq', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updateCompanyFaq(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-update-faq', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteCompanyFaq(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            // company_id: (session.user as any).company_id || '101'
        }

        const response = yield call(api.post, '/api-delete-faq', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getVisionMission(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-view-business-plans', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updateVisionMission(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-edit-business-plans', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getUserModulePermissionMenu(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            role_id: (session.user as any).role,
        }

        const response = yield call(api.post, '/api-get-menu', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getSelectModules(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { callback } = action.payload

    try {
        const response = yield call(api.get, '/api-get-select-modules')
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getPermissionList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            role_id: (session.user as any).role
        }

        const response = yield call(api.post, '/api-get-module', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getPermissionData(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken
        }

        const response = yield call(api.post, '/api-get-module-data', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updateRoleModule(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            role_id: (session.user as any).role
        }

        const response = yield call(api.post, '/api-update-role-module', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getPerformanceKpiDashboard(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            dept_id: (session.user as any).dept_id,
            unit_id: String(session.user.unit_selected.id),
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
        }

        const response = yield call(api.post, '/api-view-performance-kpi-dashboard', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getBusinessPlansList(
    action: { type: string; payload: MasterActionPayload }
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

        const response = yield call(api.post, '/api-view-business-plans', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getBusinessPriority(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id || '101',
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
        }

        const response = yield call(api.post, '/api-view-business-priority', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getLocationList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/location/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* createLocation(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/location/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateLocation(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/location/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}

function* deleteLocation(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/location/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getLayoutList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/layout/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* createLayout(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/layout/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateLayout(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any
        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)


        const response = yield call(api.post, '/layout/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}

function* deleteLayout(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/layout/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getMachineList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/machine-equipment/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* createMachine(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/machine-equipment/create/	', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateMachine(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/machine-equipment/update/	', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}



function* deleteMachine(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/machine-equipment/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getInfrastructureList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/infrastructure/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* createInfrastructure(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/infrastructure/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateInfrastructure(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/infrastructure/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteInfrastructure(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/infrastructure/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getEventList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/event-photo/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* createEvent(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/event-photo/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateEvent(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/event-photo/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}

function* deleteEvent(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/event-photo/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getCelebrationList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/celebration-photo/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* createCelebration(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/celebration-photo/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateCelebration(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/celebration-photo/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}

function* deleteCelebration(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/celebration-photo/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getMediaList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/media-photo/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* createMedia(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/media-photo/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateMedia(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/media-photo/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}

function* deleteMedia(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/media-photo/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getSoftwareList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/software/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* createSoftware(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/software/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateSoftware(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/software/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteSoftware(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/software/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* getProductDevList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/product-dev/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* createProductDev(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/product-dev/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateProductDev(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/product-dev/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteProductDev(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/product-dev/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* getBigDataList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/bigdata/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* createBigData(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/bigdata/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* updateBigData(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/bigdata/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteBigData(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/bigdata/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getProcedureHrList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/procedure-hr/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* createProcedureHr(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/procedure-hr/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateProcedureHr(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/procedure-hr/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteProcedureHr(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/procedure-hr/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getProcedureOperationsList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/procedure-operations/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateProcedureOperations(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/procedure-operations/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* createProcedureOperations(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/procedure-operations/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* deleteProcedureOperations(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/procedure-operations/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getProcedureRDList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/procedure-rd/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* createProcedureRD(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/procedure-rd/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateProcedureRD(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/procedure-rd/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteProcedureRD(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/procedure-rd/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* getGovernanceList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/governances/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* createGovernance(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/governances/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updateGovernance(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/governances/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deleteGovernance(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/governances/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getPresentationList(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }


        const response = yield call(api.post, '/presentation/list/', apiPayload)
        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}



function* createPresentation(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)
        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/presentation/create/', formData)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* updatePresentation(
    action: { type: string; payload: MasterActionPayload }
): any {

    const { payload, callback } = action.payload

    try {

        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any

        formData.append("login_access_token", (session.user as any).accessToken)

        formData.append("company_id", (session.user as any).company_id)

        const response = yield call(api.post, '/presentation/update/', formData)

        callback?.(response.data, null)

    } catch (error: any) {

        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )

    }

}


function* deletePresentation(
    action: { type: string; payload: MasterActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            id: payload.id,
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id
        }

        const response = yield call(api.post, '/presentation/delete/', apiPayload)

        callback?.(response.data, null)

    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}






export function* masterSaga() {
    yield takeLatest(getUomListRequest.type, getUomList)
    yield takeLatest(getPermissionListRequest.type, getPermissionList)
    yield takeLatest(getPermissionDataRequest.type, getPermissionData)
    yield takeLatest(updateRoleModuleRequest.type, updateRoleModule)
    yield takeLatest(addUomRequest.type, addUom)
    yield takeLatest(updateUomRequest.type, updateUom)
    yield takeLatest(deleteUomRequest.type, deleteUom)
    yield takeLatest(getPriorityListRequest.type, getPriorityList)
    yield takeLatest(addPriorityRequest.type, addPriority)
    yield takeLatest(updatePriorityRequest.type, updatePriority)
    yield takeLatest(deletePriorityRequest.type, deletePriority)
    yield takeLatest(getCompanyFaqListRequest.type, getCompanyFaqList)
    yield takeLatest(addCompanyFaqRequest.type, addCompanyFaq)
    yield takeLatest(updateCompanyFaqRequest.type, updateCompanyFaq)
    yield takeLatest(deleteCompanyFaqRequest.type, deleteCompanyFaq)
    yield takeLatest(getVisionMissionRequest.type, getVisionMission)
    yield takeLatest(updateVisionMissionRequest.type, updateVisionMission)
    yield takeLatest(getMenuRequest.type, getUserModulePermissionMenu)
    yield takeLatest(getSelectModulesRequest.type, getSelectModules)
    yield takeLatest(getPerformanceKpiDashboardRequest.type, getPerformanceKpiDashboard)
    yield takeLatest(getBusinessPlansListRequest.type, getBusinessPlansList)
    yield takeLatest(getBusinessPriorityRequest.type, getBusinessPriority)
    yield takeLatest(getLocationListRequest.type, getLocationList)
    yield takeLatest(createLocationRequest.type, createLocation)
    yield takeLatest(updateLocationRequest.type, updateLocation)
    yield takeLatest(deleteLocationRequest.type, deleteLocation)
    yield takeLatest(getLayoutListRequest.type, getLayoutList)
    yield takeLatest(createLayouRequest.type, createLayout)
    yield takeLatest(updateLayouRequest.type, updateLayout)
    yield takeLatest(deleteLayoutRequest.type, deleteLayout)
    yield takeLatest(getMachineListRequest.type, getMachineList)
    yield takeLatest(createMachineRequest.type, createMachine)
    yield takeLatest(updateMachineRequest.type, updateMachine)
    yield takeLatest(deleteMachineRequest.type, deleteMachine)
    yield takeLatest(getInfrastructureRequest.type, getInfrastructureList)
    yield takeLatest(createInfrastructureRequest.type, createInfrastructure)
    yield takeLatest(updateInfrastructureRequest.type, updateInfrastructure)
    yield takeLatest(deleteInfrastructureRequest.type, deleteInfrastructure)
    yield takeLatest(getEventListRequest.type, getEventList)
    yield takeLatest(createEventRequest.type, createEvent)
    yield takeLatest(updateEventRequest.type, updateEvent)
    yield takeLatest(deleteEventRequest.type, deleteEvent)
    yield takeLatest(getCelebrationListRequest.type, getCelebrationList)
    yield takeLatest(createCelebrationRequest.type, createCelebration)
    yield takeLatest(updateCelebrationRequest.type, updateCelebration)
    yield takeLatest(deleteCelebrationRequest.type, deleteCelebration)
    yield takeLatest(getMediaListRequest.type, getMediaList)
    yield takeLatest(createMediaRequest.type, createMedia)
    yield takeLatest(updateMediaRequest.type, updateMedia)
    yield takeLatest(deleteMediaRequest.type, deleteMedia)
    yield takeLatest(getSoftwareListRequest.type, getSoftwareList)
    yield takeLatest(createSoftwareRequest.type, createSoftware)
    yield takeLatest(updateSoftwareRequest.type, updateSoftware)
    yield takeLatest(deleteSoftwareRequest.type, deleteSoftware)
    yield takeLatest(getProductDevListRequest.type, getProductDevList)
    yield takeLatest(createProductDevRequest.type, createProductDev)
    yield takeLatest(updateProductDevRequest.type, updateProductDev)
    yield takeLatest(deleteProductDevRequest.type, deleteProductDev)
    yield takeLatest(getBigDataListRequest.type, getBigDataList)
    yield takeLatest(createBigDataRequest.type, createBigData)
    yield takeLatest(updateBigDataRequest.type, updateBigData)
    yield takeLatest(deleteBigDataRequest.type, deleteBigData)
    yield takeLatest(getProcedureHrListRequest.type, getProcedureHrList)
    yield takeLatest(createProcedureHrRequest.type, createProcedureHr)
    yield takeLatest(updateProcedureHrRequest.type, updateProcedureHr)
    yield takeLatest(deleteProcedureHrRequest.type, deleteProcedureHr)
    yield takeLatest(getProcedureOperationsListRequest.type, getProcedureOperationsList)
    yield takeLatest(updateProcedureOperationsRequest.type, updateProcedureOperations)
    yield takeLatest(createProcedureOperationsRequest.type, createProcedureOperations)
    yield takeLatest(deleteProcedureOperationsRequest.type, deleteProcedureOperations)
    yield takeLatest(getProcedureRDListRequest.type, getProcedureRDList)
    yield takeLatest(createProcedureRDRequest.type, createProcedureRD)
    yield takeLatest(updateProcedureRDRequest.type, updateProcedureRD)
    yield takeLatest(deleteProcedureRDRequest.type, deleteProcedureRD)
    yield takeLatest(getGovernanceListRequest.type, getGovernanceList)
    yield takeLatest(createGovernanceRequest.type, createGovernance)
    yield takeLatest(updateGovernanceRequest.type, updateGovernance)
    yield takeLatest(deleteGovernanceRequest.type, deleteGovernance)
    yield takeLatest(getPresentationListRequest.type, getPresentationList)
    yield takeLatest(createPresentationRequest.type, createPresentation)
    yield takeLatest(updatePresentationRequest.type, updatePresentation)
    yield takeLatest(deletePresentationRequest.type, deletePresentation)
}
