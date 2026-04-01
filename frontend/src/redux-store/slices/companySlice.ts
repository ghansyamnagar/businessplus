import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    companyDetails: null
};

const companySlice = createSlice({
    name: "company",
    initialState,
    reducers: {
        setCompanyDetails: (state, action) => {
            state.companyDetails = action.payload;
        },
        clearCompanyDetails: (state) => {
            state.companyDetails = null;
        }
    }
});

export const { setCompanyDetails, clearCompanyDetails } = companySlice.actions;
export default companySlice.reducer;
