import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MasterActionPayload, } from './master.types'

const masterSlice = createSlice({
    name: 'master',
    initialState: {},
    reducers: {

        getUomListRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        addUomRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        updateUomRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        deleteUomRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        getPriorityListRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        addPriorityRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        updatePriorityRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        deletePriorityRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        getCompanyFaqListRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        addCompanyFaqRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        updateCompanyFaqRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        deleteCompanyFaqRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        getVisionMissionRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        updateVisionMissionRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getMenuRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getSelectModulesRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getPermissionListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getPermissionDataRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateRoleModuleRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getPerformanceKpiDashboardRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getBusinessPlansListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getBusinessPriorityRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getLocationListRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        createLocationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateLocationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteLocationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getLayoutListRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        createLayouRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        updateLayouRequest(state, action: PayloadAction<MasterActionPayload>) {

        },
        deleteLayoutRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getMachineListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createMachineRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateMachineRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteMachineRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getInfrastructureRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createInfrastructureRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateInfrastructureRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteInfrastructureRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getEventListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createEventRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateEventRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteEventRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getCelebrationListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createCelebrationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateCelebrationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteCelebrationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getMediaListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createMediaRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateMediaRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteMediaRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getSoftwareListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createSoftwareRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateSoftwareRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteSoftwareRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getProductDevListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createProductDevRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateProductDevRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteProductDevRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getBigDataListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createBigDataRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateBigDataRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteBigDataRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getProcedureHrListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createProcedureHrRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateProcedureHrRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteProcedureHrRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getProcedureOperationsListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateProcedureOperationsRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createProcedureOperationsRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteProcedureOperationsRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getProcedureRDListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createProcedureRDRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateProcedureRDRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteProcedureRDRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getGovernanceListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createGovernanceRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updateGovernanceRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deleteGovernanceRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        getPresentationListRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        createPresentationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        updatePresentationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
        deletePresentationRequest(state, action: PayloadAction<MasterActionPayload>) {
        },
    }
})

export const {
    getUomListRequest,
    getPermissionListRequest,
    addUomRequest,
    updateUomRequest,
    deleteUomRequest,
    getPriorityListRequest,
    addPriorityRequest,
    updatePriorityRequest,
    deletePriorityRequest,
    getCompanyFaqListRequest,
    addCompanyFaqRequest,
    updateCompanyFaqRequest,
    deleteCompanyFaqRequest,
    getVisionMissionRequest,
    updateVisionMissionRequest,
    getMenuRequest,
    getSelectModulesRequest,
    getPermissionDataRequest,
    updateRoleModuleRequest,
    getPerformanceKpiDashboardRequest,
    getBusinessPlansListRequest,
    getBusinessPriorityRequest,
    getLocationListRequest,
    createLocationRequest,
    updateLocationRequest,
    deleteLocationRequest,
    getLayoutListRequest,
    createLayouRequest,
    updateLayouRequest,
    deleteLayoutRequest,
    getMachineListRequest,
    createMachineRequest,
    updateMachineRequest,
    deleteMachineRequest,
    getInfrastructureRequest,
    createInfrastructureRequest,
    updateInfrastructureRequest,
    deleteInfrastructureRequest,
    getEventListRequest,
    createEventRequest,
    updateEventRequest,
    deleteEventRequest,
    getCelebrationListRequest,
    createCelebrationRequest,
    updateCelebrationRequest,
    deleteCelebrationRequest,
    getMediaListRequest,
    createMediaRequest,
    updateMediaRequest,
    deleteMediaRequest,
    getSoftwareListRequest,
    createSoftwareRequest,
    updateSoftwareRequest,
    deleteSoftwareRequest,
    getProductDevListRequest,
    createProductDevRequest,
    updateProductDevRequest,
    deleteProductDevRequest,
    getBigDataListRequest,
    createBigDataRequest,
    updateBigDataRequest,
    deleteBigDataRequest,
    getProcedureHrListRequest,
    createProcedureHrRequest,
    updateProcedureHrRequest,
    deleteProcedureHrRequest,
    getProcedureOperationsListRequest,
    updateProcedureOperationsRequest,
    createProcedureOperationsRequest,
    deleteProcedureOperationsRequest,
    getProcedureRDListRequest,
    createProcedureRDRequest,
    updateProcedureRDRequest,
    deleteProcedureRDRequest,
    getGovernanceListRequest,
    createGovernanceRequest,
    updateGovernanceRequest,
    deleteGovernanceRequest,
    getPresentationListRequest,
    createPresentationRequest,
    updatePresentationRequest,
    deletePresentationRequest


} = masterSlice.actions
export default masterSlice.reducer
