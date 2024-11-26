import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InterfaceState {
    loading: boolean;
    error: string | null;
    status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
}

const initialState: InterfaceState = {
    loading: false,
    error: null,
    status: 'idle',
};

const interfaceSlice = createSlice({
    name: 'interface',
    initialState,
    reducers: {
        fetchDataStart(state) {
            state.loading = true;
            state.error = null;
            state.status = 'pending';
        },
        fetchDataSuccess(state) { // Replace 'any' with your specific data type
            state.loading = false;
            state.error = null;
            state.status = 'fulfilled';
        },
        fetchDataFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
            state.status = 'rejected';
        },
        resetState(state) {
            state.loading = false;
            state.error = null;
            state.status = 'idle';
        },
    },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure, resetState } = interfaceSlice.actions;

export default interfaceSlice.reducer;