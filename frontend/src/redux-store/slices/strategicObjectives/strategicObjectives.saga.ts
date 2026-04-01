
import { call, takeLatest, select } from 'redux-saga/effects'
import api from '@/utils/api'
import {
    getStrategicObjectivesRequest,
    addStrategicObjectivesRequest,
    editStrategicObjectivesRequest,
    deleteStrategicObjectivesRequest,
    getStratObjListByUnitReq,
    getStratObjListByDeptReq,
    getStrategicObjectiveCommentsRequest,
    getStrObjStatusRequest,
    getStrategicObjectivesDashRequest,
    reminderActionPlanRequest,
    departmentWiseStrategicObjectivesRequest,

    // SWOT
    viewStrengthRequest, addStrengthRequest, updateStrengthRequest, deleteStrengthRequest,
    viewWeaknessesRequest, addWeaknessesRequest, updateWeaknessesRequest, deleteWeaknessesRequest,
    viewOpportunitiesRequest, addOpportunitiesRequest, updateOpportunitiesRequest, deleteOpportunitiesRequest,
    viewThreatsRequest, addThreatsRequest, updateThreatsRequest, deleteThreatsRequest,
    getFunctionReportListRequest, addFunctionReportRequest, editFunctionReportRequest, deleteFunctionReportRequest,
    getFunctionReportDetailsRequest,
} from './strategicObjectives.slice'
import { StrategicObjectivesActionPayload, SwotActionPayload } from './strategicObjectives.types'
import { getSession } from 'next-auth/react'

import { getCompanyDetailsHelper } from '../../sagaHelpers'

// const getCompanyDetails = (state: any) => state.companyReducer.companyDetails

function* getFunctionReportList(
    action: { type: string; payload: any }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            role_id: (session.user as any).role,
            ...payload,
        }

        const response = yield call(api.post, '/quarterly-view-manufacturing', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addFunctionReport(
    action: { type: string; payload: any }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        // Assuming payload is a FormData object from the component
        const response = yield call(api.post, '/quarterly-add-manufacturing', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editFunctionReport(
    action: { type: string; payload: any }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        // Assuming payload is a FormData object from the component
        const response = yield call(api.post, '/quarterly-edit-manufacturing', payload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteFunctionReport(
    action: { type: string; payload: any }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/quarterly-delete-manufacturing', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getFunctionReportDetails(
    action: { type: string; payload: any }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/quarterly-details-manufacturing', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* getStrategicObjectives(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)


        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            role_id: (session.user as any).role,
            dept_id: (session.user as any).dept_id,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/api-view-strategic-objectives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addStrategicObjectives(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            ...payload,
        }

        const response = yield call(api.post, '/api-strategic-objectives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editStrategicObjectives(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            ...payload,
        }

        const response = yield call(api.post, '/api-edit-strategic-objectives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteStrategicObjectives(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            ...payload,
        }

        const response = yield call(api.post, '/api-delete-strategic-objectives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getStratObjListByUnit(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')
        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            dept_id: (session.user as any).dept_id,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/get-strategic-objectives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}
function* getStratObjListByDept(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            ...payload,
        }

        const response = yield call(api.post, '/get-strategic-objectives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getStrategicObjectiveComments(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/api-strobj-update-comment', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getStrObjStatus(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/get-str-obj-status', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getStrategicObjectivesDash(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            role_id: (session.user as any).role,
            dept_id: (session.user as any).dept_id,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/view-strategic-objectives-dash', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* reminderActionPlan(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            dept_alot: (session.user as any).dept_id ? [(session.user as any).dept_id] : [],
            user_id: (session.user as any).id,
            unit_id: String(session.user.unit_selected.id),
            ...payload,
        }

        const response = yield call(api.post, '/api-strobj-review', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deparmentWisestrategicObjectives(
    action: { type: string; payload: StrategicObjectivesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            role_id: (session.user as any).role,
            dept_id: (session.user as any).dept_id,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/strategic-objectives-data', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

// ─── SWOT Generic Worker Factories ──────────────────────────────────────────

function createSwotViewWorker(apiEndpoint: string) {
    return function* (action: { type: string; payload: SwotActionPayload }): any {
        const { payload, callback } = action.payload
        try {
            const session = yield call(getSession)
            if (!session?.user) throw new Error('Session invalid')
            const companyDetails = yield call(getCompanyDetailsHelper)

            const apiPayload = {
                login_access_token: (session.user as any).accessToken,
                company_id: (session.user as any).company_id,
                unit_id: String((session.user as any).unit_selected?.id || ''),
                year: (session.user as any).userSelectedYear,
                fyear: companyDetails?.general_data?.[0]?.financial_year || 'jan-dec',
                ...payload
            }

            const response = yield call(api.post, apiEndpoint, apiPayload)
            callback?.(response.data, null)
        } catch (error: any) {
            callback?.(null, error.response?.data || { message: 'Something went wrong' })
        }
    }
}

function createSwotAddWorker(apiEndpoint: string) {
    return function* (action: { type: string; payload: SwotActionPayload }): any {
        const { payload, callback } = action.payload
        try {
            const session = yield call(getSession)
            if (!session?.user) throw new Error('Session invalid')

            const apiPayload = {
                login_access_token: (session.user as any).accessToken,
                company_id: (session.user as any).company_id,
                unit_id: String((session.user as any).unit_selected?.id || ''),
                ...payload
            }

            const response = yield call(api.post, apiEndpoint, apiPayload)
            callback?.(response.data, null)
        } catch (error: any) {
            callback?.(null, error.response?.data || { message: 'Something went wrong' })
        }
    }
}

function createSwotUpdateWorker(apiEndpoint: string) {
    return function* (action: { type: string; payload: SwotActionPayload }): any {
        const { payload, callback } = action.payload
        try {
            const session = yield call(getSession)
            if (!session?.user) throw new Error('Session invalid')

            const apiPayload = {
                login_access_token: (session.user as any).accessToken,
                company_id: (session.user as any).company_id,
                ...payload
            }

            const response = yield call(api.post, apiEndpoint, apiPayload)
            callback?.(response.data, null)
        } catch (error: any) {
            callback?.(null, error.response?.data || { message: 'Something went wrong' })
        }
    }
}

function createSwotDeleteWorker(apiEndpoint: string) {
    return function* (action: { type: string; payload: SwotActionPayload }): any {
        const { payload, callback } = action.payload
        try {
            const session = yield call(getSession)
            if (!session?.user) throw new Error('Session invalid')

            const apiPayload = {
                login_access_token: (session.user as any).accessToken,
                ...payload
            }

            const response = yield call(api.post, apiEndpoint, apiPayload)
            callback?.(response.data, null)
        } catch (error: any) {
            callback?.(null, error.response?.data || { message: 'Something went wrong' })
        }
    }
}

// ─── SWOT Saga Workers ─────────────────────────────────────────────────────

// Strength
const viewStrength = createSwotViewWorker('/api-view-strength')
const addStrength = createSwotAddWorker('/api-add-strength')
const updateStrength = createSwotUpdateWorker('/api-update-strength')
const deleteStrength = createSwotDeleteWorker('/api-delete-strength')

// Weaknesses
const viewWeaknesses = createSwotViewWorker('/api-view-weaknesses')
const addWeaknesses = createSwotAddWorker('/api-add-weaknesses')
const updateWeaknesses = createSwotUpdateWorker('/api-update-weaknesses')
const deleteWeaknesses = createSwotDeleteWorker('/api-delete-weaknesses')

// Opportunities
const viewOpportunities = createSwotViewWorker('/api-view-opportunities')
const addOpportunities = createSwotAddWorker('/api-add-opportunities')
const updateOpportunities = createSwotUpdateWorker('/api-update-opportunities')
const deleteOpportunities = createSwotDeleteWorker('/api-delete-opportunities')

// Threats
const viewThreats = createSwotViewWorker('/api-view-threats')
const addThreats = createSwotAddWorker('/api-add-threats')
const updateThreats = createSwotUpdateWorker('/api-update-threats')
const deleteThreats = createSwotDeleteWorker('/api-delete-threats')

// ─── Root Saga ──────────────────────────────────────────────────────────────

export function* strategicObjectivesSaga() {
    yield takeLatest(getStrategicObjectivesRequest.type, getStrategicObjectives)
    yield takeLatest(addStrategicObjectivesRequest.type, addStrategicObjectives)
    yield takeLatest(editStrategicObjectivesRequest.type, editStrategicObjectives)
    yield takeLatest(deleteStrategicObjectivesRequest.type, deleteStrategicObjectives)
    yield takeLatest(getStratObjListByUnitReq.type, getStratObjListByUnit)
    yield takeLatest(getStratObjListByDeptReq.type, getStratObjListByDept)
    yield takeLatest(getStrategicObjectiveCommentsRequest.type, getStrategicObjectiveComments)
    yield takeLatest(getStrObjStatusRequest.type, getStrObjStatus)
    yield takeLatest(getStrategicObjectivesDashRequest.type, getStrategicObjectivesDash)
    yield takeLatest(reminderActionPlanRequest.type, reminderActionPlan)
    yield takeLatest(departmentWiseStrategicObjectivesRequest.type, deparmentWisestrategicObjectives)

    // SWOT - Strength
    yield takeLatest(viewStrengthRequest.type, viewStrength)
    yield takeLatest(addStrengthRequest.type, addStrength)
    yield takeLatest(updateStrengthRequest.type, updateStrength)
    yield takeLatest(deleteStrengthRequest.type, deleteStrength)

    // SWOT - Weaknesses
    yield takeLatest(viewWeaknessesRequest.type, viewWeaknesses)
    yield takeLatest(addWeaknessesRequest.type, addWeaknesses)
    yield takeLatest(updateWeaknessesRequest.type, updateWeaknesses)
    yield takeLatest(deleteWeaknessesRequest.type, deleteWeaknesses)

    // SWOT - Opportunities
    yield takeLatest(viewOpportunitiesRequest.type, viewOpportunities)
    yield takeLatest(addOpportunitiesRequest.type, addOpportunities)
    yield takeLatest(updateOpportunitiesRequest.type, updateOpportunities)
    yield takeLatest(deleteOpportunitiesRequest.type, deleteOpportunities)

    // SWOT - Threats
    yield takeLatest(viewThreatsRequest.type, viewThreats)
    yield takeLatest(addThreatsRequest.type, addThreats)
    yield takeLatest(updateThreatsRequest.type, updateThreats)
    yield takeLatest(deleteThreatsRequest.type, deleteThreats)
    yield takeLatest(getFunctionReportListRequest.type, getFunctionReportList)
    yield takeLatest(addFunctionReportRequest.type, addFunctionReport)
    yield takeLatest(editFunctionReportRequest.type, editFunctionReport)
    yield takeLatest(deleteFunctionReportRequest.type, deleteFunctionReport)
    yield takeLatest(getFunctionReportDetailsRequest.type, getFunctionReportDetails)
}

