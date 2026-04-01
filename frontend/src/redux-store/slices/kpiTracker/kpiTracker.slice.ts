import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { KpiTrackerActionPayload } from './kpiTracker.types'

const kpiTrackerSlice = createSlice({
    name: 'kpiTracker',
    initialState: {},
    reducers: {
        getKpiDashboardRequest(state, action: PayloadAction<any>) { },
        getLeadKpiDashboardRequest(state, action: PayloadAction<any>) { },
        getKpiTrackerRequest(state, action: PayloadAction<any>) { },
        addKpiTrackerRequest(state, action: PayloadAction<any>) { },
        editKpiTrackerRequest(state, action: PayloadAction<any>) { },
        deleteKpiTrackerRequest(state, action: PayloadAction<any>) { },
        getKpiByDepartmentRequest(state, action: PayloadAction<any>) { },
        getKpiTrackersTrackRequest(state, action: PayloadAction<any>) { },
        getNewKpiTrackersTrackRequest(state, action: PayloadAction<any>) { },
        updateTargetActualRequest(state, action: PayloadAction<any>) { },
        reminderReviewKPIRequest(state, action: PayloadAction<any>) { }

    }
})

export const { getKpiDashboardRequest, getLeadKpiDashboardRequest, getKpiTrackerRequest, addKpiTrackerRequest, editKpiTrackerRequest, deleteKpiTrackerRequest, getKpiByDepartmentRequest, getKpiTrackersTrackRequest, getNewKpiTrackersTrackRequest, updateTargetActualRequest, reminderReviewKPIRequest } = kpiTrackerSlice.actions

export default kpiTrackerSlice.reducer
