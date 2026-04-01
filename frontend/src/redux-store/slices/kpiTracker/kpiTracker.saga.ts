import { call, takeLatest, select } from 'redux-saga/effects'

import api from '@/utils/api'
import { getKpiDashboardRequest, getLeadKpiDashboardRequest, getKpiTrackerRequest, addKpiTrackerRequest, editKpiTrackerRequest, deleteKpiTrackerRequest, getKpiByDepartmentRequest, getKpiTrackersTrackRequest, getNewKpiTrackersTrackRequest, updateTargetActualRequest, reminderReviewKPIRequest } from './kpiTracker.slice'

import { KpiTrackerActionPayload } from './kpiTracker.types'
import { getSession } from 'next-auth/react'
import { getCompanyDetailsHelper } from '../../sagaHelpers'


function* getKpiTracker(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')
        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            role_id: (session.user as any).role,
            dept_id: (session.user as any).dept_id,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }
        const response = yield call(api.post, '/api-view-kpi-trackers', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getKpiDashboard(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')
        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            unit_id: (String(session.user.unit_selected.id) as any),
            role_id: (session.user.role as any),
            dept_id: (session.user.dept_id as any),
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec"
        }
        const response = yield call(api.post, '/view-kpi-dashboard', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getLeadKpiDashboard(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            unit_id: (String(session.user.unit_selected.id) as any),
            role_id: (session.user.role as any),
            dept_id: (session.user.dept_id as any),
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec"
        }

        const response = yield call(api.post, '/view-lead-kpi-dashboard', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getKpiByDepartment(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: String(session.user.unit_selected.id),
            ...payload,
        }

        const response = yield call(api.post, '/api-get-kpi', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addKpiTracker(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id), // Ensuring user_id is sent
        }
        const response = yield call(api.post, '/api-kpi-trackers', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editKpiTracker(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
        }

        const response = yield call(api.post, '/api-edit-kpi-trackers', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}
function* deleteKpiTracker(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            ...payload,
            login_access_token: (session.user as any).accessToken,
            user_id: (session.user as any).id,
        }

        const response = yield call(api.post, '/api-delete-kpi-trackers', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getKpiTrackersTrack(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: String(session.user.unit_selected.id),
            role_id: (session.user as any).role,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/api-view-kpi-trackers-track', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getNewKpiTrackersTrack(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: String((session.user as any).company_id),
            ...payload,
        }

        const response = yield call(api.post, '/api-new-kpi-trackers-track', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* updateTargetActual(
    action: { type: string; payload: KpiTrackerActionPayload }
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

        const response = yield call(api.post, '/api-target-actual-update', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}


function* reminderReviewKPI(
    action: { type: string; payload: KpiTrackerActionPayload }
): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            financial_year: companyDetails?.general_data[0].financial_year || "jan-dec",
            reminder_date: companyDetails?.general_data[0].reminder_date,
            reminder_frequency: companyDetails?.general_data[0].reminder_frequency,
            dept_id: (session.user as any).dept_id,
            unit_id: String(session.user.unit_selected.id),
            ...payload,
        }

        const response = yield call(api.post, '/api-dashboard-review-actual-data', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

export function* kpiTrackerSaga() {
    yield takeLatest(getKpiDashboardRequest.type, getKpiDashboard)
    yield takeLatest(getLeadKpiDashboardRequest.type, getLeadKpiDashboard)
    yield takeLatest(getKpiTrackerRequest.type, getKpiTracker)
    yield takeLatest(addKpiTrackerRequest.type, addKpiTracker)
    yield takeLatest(editKpiTrackerRequest.type, editKpiTracker)
    yield takeLatest(deleteKpiTrackerRequest.type, deleteKpiTracker)
    yield takeLatest(getKpiByDepartmentRequest.type, getKpiByDepartment)
    yield takeLatest(getKpiTrackersTrackRequest.type, getKpiTrackersTrack)
    yield takeLatest(getNewKpiTrackersTrackRequest.type, getNewKpiTrackersTrack)
    yield takeLatest(updateTargetActualRequest.type, updateTargetActual)
    yield takeLatest(reminderReviewKPIRequest.type, reminderReviewKPI)
}


