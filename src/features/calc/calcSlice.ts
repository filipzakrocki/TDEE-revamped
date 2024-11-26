import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { database } from '../../firebase/firebase';
// import { ref, get } from 'firebase/database';

import { fetchDataStart, fetchDataFailure, fetchDataSuccess } from '../interface/interfaceSlice';

interface CalcState {
    startDate: string;
    startWeight: number;
    goalWeight: number;
    isWeightLoss: boolean | null;
    dailyKcalChange: number;
    weeklyChange: number;
    weeksForAvg: number;
    avgTdeeOverTime: number[];
    avgWeightOverTime: number[];
    weeksToGoal: number;
    avgWeight: number;
    weekNo: number;
    isMetricSystem: boolean;
    initialInputsLocked: boolean;
    tdee: number;
    isCompactView: boolean;
    weekData: {
        week: number;
        days: {
            kg: number | null;
            kcal: number | null;
        }[];
        avgKcal: number;
        avgWeight: number;
        locked: boolean;
    }[];
}

const initialState: CalcState = {
    startDate: "",
    startWeight: 0,
    goalWeight: 0,
    isWeightLoss: null,
    dailyKcalChange: 0,
    weeklyChange: 0,
    weeksForAvg: 2,
    avgTdeeOverTime: [0],
    avgWeightOverTime: [0],
    weeksToGoal: 0,
    avgWeight: 0,
    weekNo: 1,
    isMetricSystem: true,
    initialInputsLocked: false,
    tdee: 0,
    isCompactView: false,
    weekData: [
        {
            week: 0,
            days: [
                { kg: null, kcal: null },
                { kg: null, kcal: null },
                { kg: null, kcal: null },
                { kg: null, kcal: null },
                { kg: null, kcal: null },
                { kg: null, kcal: null },
                { kg: null, kcal: null },
            ],
            avgKcal: 0,
            avgWeight: 0,
            locked: false
        }
    ]
};

export const fetchData = createAsyncThunk('calc/fetchData', async (path: string) => {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
});

// Create the slice
const calcSlice = createSlice({
    name: 'calc',
    initialState,
    reducers: {
        // Example of a regular reducer for the intra-app state updates
        toggleIsWeightLoss: (state) => {
            state.isWeightLoss = !state.isWeightLoss;
        },
    },
    // For async Thunks - asynchronous updates to the state

    extraReducers: (builder) => {
        builder
            .addCase(fetchData.pending, (state) => {
                console.log(state)
                fetchDataStart();
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                state = action.payload;
                fetchDataSuccess();
            })
            .addCase(fetchData.rejected, (state, action) => {
                fetchDataFailure('yo');
            });
    },
});

// Export the reducer
export default calcSlice.reducer;




