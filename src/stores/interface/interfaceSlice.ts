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
        fetchDataStart: (state) => {
            console.log('fetchDataStart');

            state.loading = true;
            state.error = null;
            state.status = 'pending';
        },
        fetchDataSuccess(state: InterfaceState) { // Replace 'any' with your specific data type
            console.log('fetchDataSuccess');
            
            state.loading = false;
            state.error = null;
            state.status = 'fulfilled';
        },
        fetchDataFailure(state, action: PayloadAction<string>) {
            console.log('fetchDataFailure');

            state.loading = false;
            state.error = action.payload;
            state.status = 'rejected';
        },
        resetState(state: InterfaceState) {
            console.log('resetState');

            state.loading = false;
            state.error = null;
            state.status = 'idle';
        },
    },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure, resetState } = interfaceSlice.actions;

export default interfaceSlice.reducer;