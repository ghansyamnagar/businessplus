
import { call, takeLatest, select } from 'redux-saga/effects'

import api from '@/utils/api'
import {
    getInitiativesListByStratObjReq,
    getInitiativesListReq,
    addInitiativeReq,
    editInitiativeReq,
    deleteInitiativeReq,
    getinitiativesCommentsRequest
} from './initiatives.slice'
import { InitiativesActionPayload } from './initiatives.types'
import { getSession } from 'next-auth/react'

import { getCompanyDetailsHelper } from '../../sagaHelpers'

function* getInitiativesListByStratObj(

    action: { type: string; payload: InitiativesActionPayload }
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

        const response = yield call(api.post, '/get-initiatives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getInitiativesList(
    action: { type: string; payload: InitiativesActionPayload }
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


        const response = yield call(api.post, '/api-view-initiative', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* addInitiative(
    action: { type: string; payload: InitiativesActionPayload }
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

        const response = yield call(api.post, '/api-add-initiatives', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* editInitiative(
    action: { type: string; payload: InitiativesActionPayload }
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

        const response = yield call(api.post, '/edit-initiative', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* deleteInitiative(
    action: { type: string; payload: InitiativesActionPayload }
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

        const response = yield call(api.post, '/delete-initiative', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

function* getinitiativesComments(
    action: { type: string; payload: InitiativesActionPayload }
): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload,
        }

        const response = yield call(api.post, '/api-initiatives-update-comment', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

export function* initiativesSaga() {
    yield takeLatest(getInitiativesListByStratObjReq.type, getInitiativesListByStratObj)
    yield takeLatest(getInitiativesListReq.type, getInitiativesList)
    yield takeLatest(addInitiativeReq.type, addInitiative)
    yield takeLatest(editInitiativeReq.type, editInitiative)
    yield takeLatest(deleteInitiativeReq.type, deleteInitiative)
    yield takeLatest(getinitiativesCommentsRequest.type, getinitiativesComments)
}
