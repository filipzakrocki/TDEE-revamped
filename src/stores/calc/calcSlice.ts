import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { database } from '../../firebase/firebase';
import { ref, get } from 'firebase/database';

import { fetchDataStart, fetchDataFailure, fetchDataSuccess } from '../interface/interfaceSlice';

export interface CalcState {
    fetched: boolean;
    
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
    fetched: false,

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
    weekData: []
};

// Async actions
export const fetchDataWithStates = createAsyncThunk(
    'calc/fetchData',
    async (uid: string, {dispatch, rejectWithValue}) => {
        dispatch(fetchDataStart());
    try {
        const dataRef = ref(database, `states/${uid}`);
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
            dispatch(fetchDataSuccess());

          return snapshot.val();
        } else {
            dispatch(fetchDataFailure('No data available'));
          throw new Error('No data available');
        }
      } catch (error) {
        dispatch(fetchDataFailure('Error fetching data'));
        return rejectWithValue(error);
      }
});

// Calculator Slice of Redux store
const calcSlice = createSlice({
    name: 'calc',
    initialState,
    reducers: {
        // Example of a regular reducer for the intra-app state updates
        addNewWeek: (state) => {
            const newWeek = {
                week: state.weekData.length,
                days: Array(7).fill({ kg: null, kcal: null }),
                avgKcal: 0,
                avgWeight: 0,
                locked: false
            };
            state.weekData.push(newWeek);
        },
        updateDay: (state, action) => {
            const { dayIndex, weekNumber, type, value } = action.payload;
            const dayObject = state.weekData[weekNumber].days[dayIndex];
            dayObject[type as 'kg' | 'kcal'] = value;
        },
    },

    // For async Thunks - asynchronous updates to the state
    extraReducers: (builder) => {
        // FetchDataWithStates - fetching the automatic state data
        builder
            .addCase(fetchDataWithStates.pending, (state) => {
            })
            .addCase(fetchDataWithStates.fulfilled, (state, action) => {
                console.log('fulfilled', action.payload);
                return {...state, ...action.payload}
            })
            .addCase(fetchDataWithStates.rejected, (state, action) => {
                fetchDataFailure('Error fetching data');
            });
    },
});

// Export the actions
export const { addNewWeek, updateDay } = calcSlice.actions;

// Export the reducer
export default calcSlice.reducer;