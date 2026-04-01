
import { call, takeLatest, select } from 'redux-saga/effects'

import api from '@/utils/api'
import {
    getActionPlansListByInitiativeReq,
    getActionPlansListReq,
    addActionPlanReq,
    editActionPlanReq,
    deleteActionPlanReq,
    getActionPlanCommentsRequest,
    getActionPlanScheduleDataReq,
    getActionPlanCommentReq,
    addActionPlanSchedulesReq,
} from './actionplans.slice'
import { ActionPlansActionPayload } from './actionplans.types'
import { getSession } from 'next-auth/react'

import { getCompanyDetailsHelper } from '../../sagaHelpers'

function* getActionPlansListByInitiative(

    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')
        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/api-get-actionplans', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getActionPlansList(
    action: { type: string; payload: ActionPlansActionPayload }
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


        const response = yield call(api.post, '/initiative-and-actionplan', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addActionPlan(
    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            user_id: Number((session.user as any).id),
            unit_id: (session.user as any).unit_selected?.id,
            ...payload,
        }

        const response = yield call(api.post, '/api-add-action-plans', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editActionPlan(
    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            unit_id: (session.user as any).unit_selected?.id,
            ...payload,
        }

        const response = yield call(api.post, '/edit-action-plan', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteActionPlan(
    action: { type: string; payload: ActionPlansActionPayload }
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

        const response = yield call(api.post, '/delete-action-plan', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getActionPlanComments(
    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/api-actionplan-update-comment', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getActionPlanScheduleData(
    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload,
        }

        const response = yield call(api.post, '/api-action-plan-schedule-data', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getActionPlanComment(
    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/api-action-plan-comment', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addActionPlanSchedules(
    action: { type: string; payload: ActionPlansActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/add-action-plan-schedules', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

export function* actionPlansSaga() {
    yield takeLatest(getActionPlansListByInitiativeReq.type, getActionPlansListByInitiative)
    yield takeLatest(getActionPlansListReq.type, getActionPlansList)
    yield takeLatest(addActionPlanReq.type, addActionPlan)
    yield takeLatest(editActionPlanReq.type, editActionPlan)
    yield takeLatest(deleteActionPlanReq.type, deleteActionPlan)
    yield takeLatest(getActionPlanCommentsRequest.type, getActionPlanComments)
    yield takeLatest(getActionPlanScheduleDataReq.type, getActionPlanScheduleData)
    yield takeLatest(getActionPlanCommentReq.type, getActionPlanComment)
    yield takeLatest(addActionPlanSchedulesReq.type, addActionPlanSchedules)
}
