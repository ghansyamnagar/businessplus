
import { call, takeLatest, select } from 'redux-saga/effects'

import type { PayloadAction } from '@reduxjs/toolkit'
import api from '@/utils/api'
import {
    getProjectListRequest,
    deleteProjectRequest,
    addProjectRequest,
    getProjectDashboardRequest,
    remarkProjectRequest,
    viewSingleProjectRequest,
    getProjectRemarkListRequest,
    editProjectRemarkRequest,
    deleteProjectRemarkRequest,
    getProjectViewGraphRequest,
    deleteSingleProjectRequest,
    updateProjectRequest,
    remarkIssueTrackerRequest,
    getSingleRowDataRequest,
    addGovernanceRequest,
    updateGovernanceRequest,
    addProjectDeviationRequest,
    updateProjectDeviationRequest,
} from './project.slice'
import { ProjectPayload } from './project.types'
import { getSession } from 'next-auth/react'
import { getCompanyDetailsHelper } from '../../sagaHelpers'


function* getProjectList(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: (session.user as any).unit_selected?.id,
            year: (session.user as any).userSelectedYear,
            fyear: companyDetails?.general_data[0].financial_year || "jan-dec",
            ...payload
        }

        const response = yield call(api.post, '/api-view-projects', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteProject(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            user_id: Number((session.user as any).id),
            project_user_id: 1,
            ...payload
        }

        const response = yield call(api.post, '/api-delete-projects', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* addProject(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            unit_id: (session.user as any).unit_selected?.id,
            ...payload
        }

        const response = yield call(api.post, '/api-projects', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getProjectDashboard(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const companyDetails = yield call(getCompanyDetailsHelper)
        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            unit_id: String((session.user as any).unit_selected?.id),
            company_id: String((session.user as any).company_id),
            year: (session.user as any).userSelectedYear || new Date().getFullYear(),
            fyear: companyDetails?.general_data[0].financial_year || 'jan-dec',
            ...payload
        }

        const response = yield call(api.post, '/api-view-project-dashboard', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* remarkProject(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        // payload is already a FormData built in the component
        const formData = payload as any
        formData.append('login_access_token', (session.user as any).accessToken)

        const response = yield call(api.post, '/api-remark-projects', formData)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* viewSingleProject(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-view-single-project', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* getProjectRemarkList(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-view-projects-remark', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}
function* getProjectViewGraph(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-poject-view-graph', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* editProjectRemark(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-edit-projects-remark', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteProjectRemark(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-delete-projects-remark', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* deleteSingleProject(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-delete-single-project', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* updateProject(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            unit_id: (session.user as any).unit_selected?.id,
            ...payload
        }

        const response = yield call(api.post, '/api-update-single-project', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}
function* remarkIssueTracker(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        // payload is already a FormData built in the component
        const formData = payload as any
        formData.append('login_access_token', (session.user as any).accessToken)
        formData.append('user_id', (session.user as any).id)
        const response = yield call(api.post, '/api-issue-tracker-remark', formData)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}
function* getSingleRowData(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-view-single-row-data', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}
function* addGovernance(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            ...payload
        }

        const response = yield call(api.post, '/api-projects', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}
function* updateGovernance(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const apiPayload = {
            login_access_token: (session.user as any).accessToken,
            company_id: (session.user as any).company_id,
            unit_id: (session.user as any).unit_selected?.id,
            ...payload
        }

        const response = yield call(api.post, '/api-update-single-project', apiPayload)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* addProjectDeviation(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any
        formData.append('login_access_token', (session.user as any).accessToken)

        const response = yield call(api.post, '/api-projects', formData)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}

function* updateProjectDeviation(action: PayloadAction<ProjectPayload>): any {
    const { payload, callback } = action.payload
    try {
        const session = yield call(getSession)
        if (!session?.user) throw new Error('Session invalid')

        const formData = payload as any
        formData.append('login_access_token', (session.user as any).accessToken)

        const response = yield call(api.post, '/api-update-single-project', formData)
        callback?.(response.data, null)
    } catch (error: any) {
        callback?.(null, error.response?.data || { message: 'Something went wrong' })
    }
}


export function* projectSaga() {
    yield takeLatest(getProjectListRequest.type, getProjectList)
    yield takeLatest(deleteProjectRequest.type, deleteProject)
    yield takeLatest(addProjectRequest.type, addProject)
    yield takeLatest(getProjectDashboardRequest.type, getProjectDashboard)
    yield takeLatest(remarkProjectRequest.type, remarkProject)
    yield takeLatest(viewSingleProjectRequest.type, viewSingleProject)
    yield takeLatest(getProjectRemarkListRequest.type, getProjectRemarkList)
    yield takeLatest(editProjectRemarkRequest.type, editProjectRemark)
    yield takeLatest(deleteProjectRemarkRequest.type, deleteProjectRemark)
    yield takeLatest(getProjectViewGraphRequest.type, getProjectViewGraph)
    yield takeLatest(deleteSingleProjectRequest.type, deleteSingleProject)
    yield takeLatest(updateProjectRequest.type, updateProject)
    yield takeLatest(remarkIssueTrackerRequest.type, remarkIssueTracker)
    yield takeLatest(getSingleRowDataRequest.type, getSingleRowData)
    yield takeLatest(addGovernanceRequest.type, addGovernance)
    yield takeLatest(updateGovernanceRequest.type, updateGovernance)
    yield takeLatest(addProjectDeviationRequest.type, addProjectDeviation)
    yield takeLatest(updateProjectDeviationRequest.type, updateProjectDeviation)
}
