
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ProjectPayload } from './project.types'

const projectSlice = createSlice({
    name: 'project',
    initialState: {},
    reducers: {
        getProjectListRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        deleteProjectRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        addProjectRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        getProjectDashboardRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        remarkProjectRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        viewSingleProjectRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        getProjectRemarkListRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        editProjectRemarkRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        deleteProjectRemarkRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        getProjectViewGraphRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        deleteSingleProjectRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        updateProjectRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        remarkIssueTrackerRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        getSingleRowDataRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        addGovernanceRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        updateGovernanceRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        addProjectDeviationRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
        updateProjectDeviationRequest: (state, action: PayloadAction<ProjectPayload>) => {
            return state
        },
    }
})

export const {
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
} = projectSlice.actions

export default projectSlice.reducer
