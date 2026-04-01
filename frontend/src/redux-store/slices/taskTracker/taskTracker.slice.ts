
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TaskTrackerPayload } from './taskTracker.types'

const taskTrackersSlice = createSlice({
    name: 'taskTrackers',
    initialState: {},
    reducers: {
        getEventsTaskListRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        addEventsTaskRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        updateEventsTaskRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        deleteEventsTaskRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        getTaskListRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        addTaskRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        updateTaskRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        deleteTaskRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        getTaskDashboardRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        getTaskRemarkRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        addTaskRemarkRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        updateTaskRemarkRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        deleteTaskRemarkRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        getTaskDetailsByIdRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
        exportPdfRequest: (state, action: PayloadAction<TaskTrackerPayload>) => state,
    }
})

export const {
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
    getTaskDetailsByIdRequest,
    exportPdfRequest
} = taskTrackersSlice.actions

export default taskTrackersSlice.reducer
