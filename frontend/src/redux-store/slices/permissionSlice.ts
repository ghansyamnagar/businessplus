import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    permissions: []
};

const permissionSlice = createSlice({
    name: "permissions",
    initialState,
    reducers: {
        setPermissions: (state, action) => {
            state.permissions = action.payload;
        },
        clearPermissions: (state) => {
            state.permissions = [];
        }
    }
});

export const { setPermissions, clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
