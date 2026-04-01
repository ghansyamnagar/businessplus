
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InitiativesActionPayload } from './initiatives.types'

const initiativesSlice = createSlice({
    name: 'initiatives',
    initialState: {},
    reducers: {
        getInitiativesListByStratObjReq(state, action: PayloadAction<any>) { },
        getInitiativesListReq(state, action: PayloadAction<any>) { },
        addInitiativeReq(state, action: PayloadAction<any>) { },
        editInitiativeReq(state, action: PayloadAction<any>) { },
        deleteInitiativeReq(state, action: PayloadAction<any>) { },
        getinitiativesCommentsRequest(state, action: PayloadAction<any>) { },
    }
})

export const {
    getInitiativesListByStratObjReq,
    getInitiativesListReq,
    addInitiativeReq,
    editInitiativeReq,
    deleteInitiativeReq,
    getinitiativesCommentsRequest,
} = initiativesSlice.actions

export default initiativesSlice.reducer
