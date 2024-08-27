import { createSlice } from '@reduxjs/toolkit';
import { database } from '../../firebase/firebase';
import { ref, get } from 'firebase/database';

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

export async function fetchData(path: string): Promise<any> {
    const dbRef = ref(database, path);

    try {
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            console.log(snapshot.val());
            return snapshot.val();
        } else {
            console.log("No data found");
            return null;
        }
    } catch (error) {
        console.error("Error getting data", error);
        throw error;
    }
}

// Create the slice
const calcSlice = createSlice({
    name: 'calc',
    initialState,
    reducers: {
        // Example of a regular reducer
        toggleIsWeightLoss: (state) => {
            state.isWeightLoss = !state.isWeightLoss;
        },
    },
    // For async Thunks
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(fetchData.pending, (state) => {
    //             state.status = 'loading';
    //         })
    //         .addCase(fetchData.fulfilled, (state, action) => {
    //             state.status = 'succeeded';
    //             state.data = action.payload;
    //         })
    //         .addCase(fetchData.rejected, (state, action) => {
    //             state.status = 'failed';
    //             state.error = action.payload;
    //         });
    // },
});

// Export the reducer
export default calcSlice.reducer;




