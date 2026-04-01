
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ActionPlansActionPayload } from './actionplans.types'

const actionPlansSlice = createSlice({
    name: 'actionplans',
    initialState: {},
    reducers: {
        getActionPlansListByInitiativeReq(state, action: PayloadAction<any>) { },
        getActionPlansListReq(state, action: PayloadAction<any>) { },
        addActionPlanReq(state, action: PayloadAction<any>) { },
        editActionPlanReq(state, action: PayloadAction<any>) { },
        deleteActionPlanReq(state, action: PayloadAction<any>) { },
        getActionPlanCommentsRequest(state, action: PayloadAction<any>) { },
        getActionPlanScheduleDataReq(state, action: PayloadAction<any>) { },
        getActionPlanCommentReq(state, action: PayloadAction<any>) { },
        addActionPlanSchedulesReq(state, action: PayloadAction<any>) { },
    }
})

export const {
    getActionPlansListByInitiativeReq,
    getActionPlansListReq,
    addActionPlanReq,
    editActionPlanReq,
    deleteActionPlanReq,
    getActionPlanCommentsRequest,
    getActionPlanScheduleDataReq,
    getActionPlanCommentReq,
    addActionPlanSchedulesReq,
} = actionPlansSlice.actions

export default actionPlansSlice.reducer
