import { create } from 'zustand';
import { database } from '../../firebase/firebase';
import { ref, get } from 'firebase/database';
import { useInterfaceStore } from '../interface/interfaceStore';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

interface WeekData {
    week: number;
    days: {
        kg: number | '';
        kcal: number | '';
    }[];
    avgKcal: number;
    avgWeight: number;
    locked: boolean;
}

interface CalcState {
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
    weekData: WeekData[];
    fetchData: (uid: string) => Promise<void>;
    addNewWeek: () => void;
    updateDay: (payload: { dayIndex: number; weekNumber: number; type: 'kg' | 'kcal'; value: number | '' }) => void;
}

export const useCalcStore = create<CalcState>((set) => ({
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
    weekData: [],

    fetchData: async (uid: string) => {
        const { fetchDataStart, fetchDataSuccess, fetchDataFailure } = useInterfaceStore.getState();

        fetchDataStart();
        try {
            const dataRef = ref(database, `states/${uid}`);
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                set(snapshot.val());
                fetchDataSuccess();
                showSuccessToast('Data loaded successfully');
            } else {
                fetchDataFailure('No data available');
                showErrorToast('No data available');
                throw new Error('No data available');
            }
        } catch (error) {
            fetchDataFailure('Error fetching data');
            showErrorToast('Failed to fetch data');
            throw error;
        }
    },

    addNewWeek: () => set((state) => ({
        weekData: [...state.weekData, {
            week: state.weekData.length,
            days: Array(7).fill({ kg: null, kcal: null }),
            avgKcal: 0,
            avgWeight: 0,
            locked: false
        }]
    })),

    updateDay: ({ dayIndex, weekNumber, type, value }) => set((state) => {
        const newWeekData = [...state.weekData];
        newWeekData[weekNumber].days[dayIndex][type] = value;
        return { weekData: newWeekData };
    })
})); 