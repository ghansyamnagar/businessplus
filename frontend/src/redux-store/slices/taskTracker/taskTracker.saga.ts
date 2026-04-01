
import { call, takeLatest, select } from 'redux-saga/effects'

import api from '@/utils/api'
import {
    getEventsTaskListRequest,
    addEventsTaskRequest,
    updateEventsTaskRequest,
    deleteEventsTaskRequest,
    getTaskListRequest,
    addTaskRequest,
    updateTaskRequest,
    deleteTaskRequest,
    getTaskDashboardRequest,
    getTaskRemarkRequest,
    addTaskRemarkRequest,
    updateTaskRemarkRequest,
    deleteTaskRemarkRequest,
    getTaskDetailsByIdRequest, exportPdfRequest
} from './taskTracker.slice'
import { TaskTrackerPayload } from './taskTracker.types'
import { getSession } from 'next-auth/react'
import { getCompanyDetailsHelper } from '../../sagaHelpers'


function* getEventsTaskListSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: String((session.user as any).company_id),
            ...payload
        }

        const response = yield call(api.post, '/api-view-events-task', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* addEventsTaskSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: String((session.user as any).company_id),
            user_id: Number((session.user as any).id),
            ...payload
        }

        const response = yield call(api.post, '/api-add-events-task', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* updateEventsTaskSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-update-events-task', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteEventsTaskSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-delete-events-task', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getTaskListSaga(action: { type: string; payload: TaskTrackerPayload }): any {
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
            ...payload
        }

        const response = yield call(api.post, '/api-view-tasks', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* addTaskSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            unit_id: (session.user as any).unit_selected?.id,
            ...payload
        }

        const response = yield call(api.post, '/api-add-tasks', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* updateTaskSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            unit_id: (session.user as any).unit_selected?.id,
            ...payload
        }

        const response = yield call(api.post, '/api-edit-tasks', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteTaskSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            ...payload
        }

        const response = yield call(api.post, '/api-delete-tasks', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getTaskDashboardSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            role_id: (session.user as any).role,
            year: (session.user.userSelectedYear as any),
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload
        }

        const response = yield call(api.post, '/api-view-task-dashboard', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getTaskRemarkSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-view-tasks-remark', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* addTaskRemarkSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = new FormData()
        Object.keys(payload).forEach(key => {
            formData.append(key, payload[key])
        })
        formData.append('login_access_token', (session.user as any).accessToken)

        const response = yield call(api.post, '/api-remark-tasks', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* updateTaskRemarkSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-edit-tasks-remark', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteTaskRemarkSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-delete-tasks-remark', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* tasksDetailsById(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-view-tasks-details', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* exportPdfSaga(action: { type: string; payload: TaskTrackerPayload }): any {
    const { payload, callback } = action.payload

    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')
        const companyDetails = yield call(getCompanyDetailsHelper)

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            year: (session.user as any).userSelectedYear,
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",

            ...payload
        }

        const response = yield call(api.post, '/api-export', apiPayload, {
            responseType: 'blob'
        })

        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(
            null,
            error.response?.data || { message: 'Something went wrong' }
        )
    }
}

export function* taskTrackersSaga() {
    yield takeLatest(getEventsTaskListRequest.type, getEventsTaskListSaga)
    yield takeLatest(addEventsTaskRequest.type, addEventsTaskSaga)
    yield takeLatest(updateEventsTaskRequest.type, updateEventsTaskSaga)
    yield takeLatest(deleteEventsTaskRequest.type, deleteEventsTaskSaga)
    yield takeLatest(getTaskListRequest.type, getTaskListSaga)
    yield takeLatest(addTaskRequest.type, addTaskSaga)
    yield takeLatest(updateTaskRequest.type, updateTaskSaga)
    yield takeLatest(deleteTaskRequest.type, deleteTaskSaga)
    yield takeLatest(getTaskDashboardRequest.type, getTaskDashboardSaga)
    yield takeLatest(getTaskRemarkRequest.type, getTaskRemarkSaga)
    yield takeLatest(addTaskRemarkRequest.type, addTaskRemarkSaga)
    yield takeLatest(updateTaskRemarkRequest.type, updateTaskRemarkSaga)
    yield takeLatest(deleteTaskRemarkRequest.type, deleteTaskRemarkSaga)
    yield takeLatest(getTaskDetailsByIdRequest.type, tasksDetailsById)
    yield takeLatest(exportPdfRequest.type, exportPdfSaga)
}
