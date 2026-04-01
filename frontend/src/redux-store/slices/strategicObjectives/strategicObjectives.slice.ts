
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SwotActionPayload } from './strategicObjectives.types';

const strategicObjectivesSlice = createSlice({
    name: 'strategicObjectives',
    initialState: {},
    reducers: {
        getStrategicObjectivesRequest: (state, action: PayloadAction<any>) => { },
        addStrategicObjectivesRequest: (state, action: PayloadAction<any>) => { },
        editStrategicObjectivesRequest: (state, action: PayloadAction<any>) => { },
        deleteStrategicObjectivesRequest: (state, action: PayloadAction<any>) => { },
        getStratObjListByUnitReq: (state, action: PayloadAction<any>) => { },
        getStratObjListByDeptReq: (state, action: PayloadAction<any>) => { },
        getStrategicObjectiveCommentsRequest: (state, action: PayloadAction<any>) => { },
        getStrObjStatusRequest: (state, action: PayloadAction<any>) => { },
        getStrategicObjectivesDashRequest: (state, action: PayloadAction<any>) => { },
        reminderActionPlanRequest: (state, action: PayloadAction<any>) => { },
        departmentWiseStrategicObjectivesRequest: (state, action: PayloadAction<any>) => { },

        // SWOT - Strength
        viewStrengthRequest(state, action: PayloadAction<SwotActionPayload>) { },
        addStrengthRequest(state, action: PayloadAction<SwotActionPayload>) { },
        updateStrengthRequest(state, action: PayloadAction<SwotActionPayload>) { },
        deleteStrengthRequest(state, action: PayloadAction<SwotActionPayload>) { },

        // SWOT - Weaknesses
        viewWeaknessesRequest(state, action: PayloadAction<SwotActionPayload>) { },
        addWeaknessesRequest(state, action: PayloadAction<SwotActionPayload>) { },
        updateWeaknessesRequest(state, action: PayloadAction<SwotActionPayload>) { },
        deleteWeaknessesRequest(state, action: PayloadAction<SwotActionPayload>) { },

        // SWOT - Opportunities
        viewOpportunitiesRequest(state, action: PayloadAction<SwotActionPayload>) { },
        addOpportunitiesRequest(state, action: PayloadAction<SwotActionPayload>) { },
        updateOpportunitiesRequest(state, action: PayloadAction<SwotActionPayload>) { },
        deleteOpportunitiesRequest(state, action: PayloadAction<SwotActionPayload>) { },

        // SWOT - Threats
        viewThreatsRequest(state, action: PayloadAction<SwotActionPayload>) { },
        addThreatsRequest(state, action: PayloadAction<SwotActionPayload>) { },
        updateThreatsRequest(state, action: PayloadAction<SwotActionPayload>) { },
        deleteThreatsRequest(state, action: PayloadAction<SwotActionPayload>) { },
        // Function Report - Manufacturing Quarterly Update
        getFunctionReportListRequest: (state, action: PayloadAction<any>) => { },
        addFunctionReportRequest: (state, action: PayloadAction<any>) => { },
        editFunctionReportRequest: (state, action: PayloadAction<any>) => { },
        deleteFunctionReportRequest: (state, action: PayloadAction<any>) => { },
        getFunctionReportDetailsRequest: (state, action: PayloadAction<any>) => { },
    }
});

export const {
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
    viewStrengthRequest,
    addStrengthRequest,
    updateStrengthRequest,
    deleteStrengthRequest,
    viewWeaknessesRequest,
    addWeaknessesRequest,
    updateWeaknessesRequest,
    deleteWeaknessesRequest,
    viewOpportunitiesRequest,
    addOpportunitiesRequest,
    updateOpportunitiesRequest,
    deleteOpportunitiesRequest,
    viewThreatsRequest,
    addThreatsRequest,
    updateThreatsRequest,
    deleteThreatsRequest,
    getFunctionReportListRequest,
    addFunctionReportRequest,
    editFunctionReportRequest,
    deleteFunctionReportRequest,
    getFunctionReportDetailsRequest
} = strategicObjectivesSlice.actions;

export default strategicObjectivesSlice.reducer;
