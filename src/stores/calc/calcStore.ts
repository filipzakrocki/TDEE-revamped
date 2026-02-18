import { create } from 'zustand';
import { database } from '../../firebase/firebase';
import { ref, get, set } from 'firebase/database';
import { useInterfaceStore } from '../interface/interfaceStore';
import { useAuthStore } from '../auth/authStore';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import {
    estimateInitialTDEE,
    dailyKcalToWeeklyChange,
    kgToLbs,
    lbsToKg,
    getTodayFormatted,
    KCAL_PER_KG,
    KCAL_PER_LB,
} from '../../utils/calculations';

// Sync utilities
const FALLBACK_STORAGE_KEY = 'tdee-calc-data';
let syncTimeout: NodeJS.Timeout | undefined;
let lastSyncToastAt = 0;

const getStorageKey = () => {
    try {
        const user = useAuthStore.getState().user;
        return user?.uid ? `tdee-calc-data-${user.uid}` : FALLBACK_STORAGE_KEY;
    } catch (error) {
        console.error('Failed to get user from auth store:', error);
        return FALLBACK_STORAGE_KEY;
    }
};

const syncToStorage = (state: CalcState) => {
    try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(state));
        console.log(`Data synced to localStorage with key: ${storageKey}`);
    } catch (error) {
        console.error('Failed to sync to localStorage:', error);
    }
};

function toPayload(state: CalcState): CalcPayload {
    return {
        calendarWeekStartsOnMonday: state.calendarWeekStartsOnMonday,
        startDate: state.startDate,
        startWeight: state.startWeight,
        goalWeight: state.goalWeight,
        isWeightLoss: state.isWeightLoss,
        dailyKcalChange: state.dailyKcalChange,
        weeklyChange: state.weeklyChange,
        weeksForAvg: state.weeksForAvg,
        avgTdeeOverTime: state.avgTdeeOverTime,
        avgWeightOverTime: state.avgWeightOverTime,
        weeksToGoal: state.weeksToGoal,
        avgWeight: state.avgWeight,
        weekNo: state.weekNo,
        isMetricSystem: state.isMetricSystem,
        initialInputsLocked: state.initialInputsLocked,
        tdee: state.tdee,
        isCompactView: state.isCompactView,
        weekData: state.weekData,
    };
}

const syncToFirebase = async (state: CalcState, retryCount = 0) => {
    const maxRetries = 3;
    try {
        // Get current user from auth store
        const user = useAuthStore.getState().user;
        const { syncStart, syncEnd } = useInterfaceStore.getState();
        if (!user?.uid) {
            console.log('No authenticated user, skipping Firebase sync');
            return;
        }

        syncStart();
        const dataRef = ref(database, `states/${user.uid}`);
        await set(dataRef, toPayload(state));
        console.log('Data synced to Firebase successfully');
        const now = Date.now();
        if (now - lastSyncToastAt > 5000) {
            showSuccessToast('Data synced');
            lastSyncToastAt = now;
        }
        syncEnd();
    } catch (error) {
        console.error(`Failed to sync data to Firebase (attempt ${retryCount + 1}):`, error);
        const { syncEnd } = useInterfaceStore.getState();
        syncEnd();

        if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Retrying Firebase sync in ${delay}ms...`);

            setTimeout(() => {
                syncToFirebase(state, retryCount + 1);
            }, delay);
        } else {
            showErrorToast('Failed to sync data after multiple attempts');
        }
    }
};

const debouncedSync = (state: CalcState) => {
    // Always sync to localStorage immediately
    syncToStorage(state);

    // Debounce Firebase sync
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(() => {
        syncToFirebase(state);
    }, 1000);
};

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

interface CalcPayload {
    avgTdeeOverTime: number[];
    avgWeight: number;
    avgWeightOverTime: number[];
    calendarWeekStartsOnMonday: boolean;
    dailyKcalChange: number;
    goalWeight: number;
    initialInputsLocked: boolean;
    isCompactView: boolean;
    isMetricSystem: boolean;
    isWeightLoss: boolean | null;
    startDate: string;
    startWeight: number;
    tdee: number;
    weekData: WeekData[];
    weekNo: number;
    weeklyChange: number;
    weeksForAvg: number;
    weeksToGoal: number;
}

interface CalcState extends CalcPayload {
    fetched: boolean;
    selectedWeek: number;
    
    // Data operations
    fetchData: (uid: string) => Promise<void>;
    loadFromStorage: () => void;
    
    // Week operations
    addNewWeek: () => void;
    updateDay: (payload: { dayIndex: number; weekNumber: number; type: 'kg' | 'kcal'; value: number | '' }) => void;
    selectWeek: (weekNumber: number) => void;
    toggleWeekLock: (weekNumber: number) => void;
    
    // Setup operations (from old project)
    setStartDate: (date: string) => void;
    setStartWeight: (weight: number) => void;
    setGoalWeight: (weight: number) => void;
    setWeeklyChange: (change: number) => void;
    setDailyKcalChange: (kcal: number) => void;
    setWeeksForAvg: (weeks: number) => void;
    toggleMeasurementSystem: () => void;
    toggleCompactView: () => void;
    toggleCalendarWeekStart: () => void;
    lockInitialInputs: () => void;
}

export const useCalcStore = create<CalcState>((set) => ({
    fetched: false,
    calendarWeekStartsOnMonday: true,
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
                { kg: "", kcal: "" },
                { kg: "", kcal: "" },
                { kg: "", kcal: "" },
                { kg: "", kcal: "" },
                { kg: "", kcal: "" },
                { kg: "", kcal: "" },
                { kg: "", kcal: "" }
            ],
            avgKcal: 0,
            avgWeight: 0,
            locked: false
        }
    ],
    selectedWeek: 0,

    fetchData: async (uid: string) => {
        const { fetchDataStart, fetchDataSuccess, fetchDataFailure } = useInterfaceStore.getState();

        fetchDataStart();
        try {
            const dataRef = ref(database, `states/${uid}`);
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                set((state) => ({ ...state, ...data }));
                fetchDataSuccess();
                showSuccessToast('Data loaded successfully');
            } else {
                // No remote data: keep current local/default state and finish loading
                console.log('No remote data available; using local/default state');
                fetchDataSuccess();
            }
        } catch (error) {
            fetchDataFailure('Error fetching data');
            showErrorToast('Failed to fetch data');
        }
    },

    loadFromStorage: () => {
        try {
            const storageKey = getStorageKey();
            let stored = localStorage.getItem(storageKey);

            // If user-specific data doesn't exist, try fallback key (for migration)
            if (!stored && storageKey !== FALLBACK_STORAGE_KEY) {
                stored = localStorage.getItem(FALLBACK_STORAGE_KEY);
                if (stored) {
                    console.log('Migrating data from fallback storage key to user-specific key');
                    // Save to user-specific key
                    localStorage.setItem(storageKey, stored);
                    // Optionally remove old data
                    localStorage.removeItem(FALLBACK_STORAGE_KEY);
                }
            }

            if (stored) {
                const parsedData = JSON.parse(stored);
                set((state) => ({ ...state, ...parsedData }));
                console.log(`Data loaded from localStorage with key: ${storageKey}`);
            } else {
                console.log('No stored data found');
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    },

    addNewWeek: () => set((state) => {
        const newState = {
            ...state,
            weekData: [...state.weekData, {
                week: state.weekData.length,
                days: Array(7).fill(null).map(() => ({ kg: '', kcal: '' }) as { kg: number | ''; kcal: number | '' }),
                avgKcal: 0,
                avgWeight: 0,
                locked: false
            }]
        };
        debouncedSync(newState);
        showSuccessToast('New week added');
        return newState;
    }),

    updateDay: ({ dayIndex, weekNumber, type, value }) => set((state) => {
        const newWeekData = [...state.weekData];
        const newWeek = { ...newWeekData[weekNumber] };
        const newDays = [...newWeek.days];
        newDays[dayIndex] = { ...newDays[dayIndex], [type]: value };
        newWeek.days = newDays;
        newWeekData[weekNumber] = newWeek;

        const newState = { ...state, weekData: newWeekData };
        debouncedSync(newState);
        return newState;
    }),

    selectWeek: (weekNumber: number) => set((state) => ({
        ...state,
        selectedWeek: weekNumber,
    })),

    toggleWeekLock: (weekNumber: number) => set((state) => {
        const newWeekData = [...state.weekData];
        if (newWeekData[weekNumber]) {
            newWeekData[weekNumber].locked = !newWeekData[weekNumber].locked;
        }
        const newState = { ...state, weekData: newWeekData };
        debouncedSync(newState);
        showSuccessToast('Week lock status updated');
        return newState;
    }),

    // ========================================
    // Setup Operations (ported from old project)
    // ========================================

    setStartDate: (date: string) => set((state) => {
        const startDate = date || getTodayFormatted();
        const newState = { ...state, startDate };
        debouncedSync(newState);
        return newState;
    }),

    setStartWeight: (weight: number) => set((state) => {
        const startWeight = Number(weight);
        const startingTdee = estimateInitialTDEE(startWeight, state.isMetricSystem);
        const isWeightLoss = state.goalWeight > 0 ? startWeight > state.goalWeight : null;
        
        // Update week 0 with initial values
        const newWeekData = [...state.weekData];
        newWeekData[0] = {
            ...newWeekData[0],
            avgKcal: startingTdee,
            avgWeight: startWeight,
        };

        const newState = {
            ...state,
            startWeight,
            isWeightLoss,
            avgWeightOverTime: [startWeight],
            avgTdeeOverTime: [startingTdee],
            tdee: startingTdee,
            weekData: newWeekData,
        };
        debouncedSync(newState);
        return newState;
    }),

    setGoalWeight: (weight: number) => set((state) => {
        const goalWeight = Number(weight);
        const isWeightLoss = state.startWeight > 0 ? state.startWeight > goalWeight : null;
        
        const newState = { ...state, goalWeight, isWeightLoss };
        debouncedSync(newState);
        return newState;
    }),

    setWeeklyChange: (change: number) => set((state) => {
        const weeklyChange = Number(change);
        const kcalModifier = state.isMetricSystem ? KCAL_PER_KG : KCAL_PER_LB;
        const dailyKcalChange = Math.ceil(weeklyChange * kcalModifier);
        
        const newState = { ...state, weeklyChange, dailyKcalChange };
        debouncedSync(newState);
        return newState;
    }),

    setDailyKcalChange: (kcal: number) => set((state) => {
        const dailyKcalChange = parseInt(String(kcal), 10);
        const weeklyChange = dailyKcalToWeeklyChange(dailyKcalChange, state.isMetricSystem);
        
        const newState = { ...state, dailyKcalChange, weeklyChange };
        debouncedSync(newState);
        return newState;
    }),

    setWeeksForAvg: (weeks: number) => set((state) => {
        // Clamp between 1 and reasonable max
        const weeksForAvg = Math.max(1, Math.floor(weeks));
        
        const newState = { ...state, weeksForAvg };
        debouncedSync(newState);
        return newState;
    }),

    toggleMeasurementSystem: () => set((state) => {
        const isMetricSystem = !state.isMetricSystem;
        
        // Convert all weight values
        const convertWeight = (w: number) => isMetricSystem ? lbsToKg(w) : kgToLbs(w);
        
        const startWeight = Number(convertWeight(state.startWeight).toFixed(2));
        const goalWeight = Number(convertWeight(state.goalWeight).toFixed(2));
        const weeklyChange = Number(convertWeight(state.weeklyChange).toFixed(2));
        
        // Recalculate daily kcal change based on new unit
        const kcalModifier = isMetricSystem ? KCAL_PER_KG : KCAL_PER_LB;
        const dailyKcalChange = Math.ceil(weeklyChange * kcalModifier);
        
        const newState = {
            ...state,
            isMetricSystem,
            startWeight,
            goalWeight,
            weeklyChange,
            dailyKcalChange,
        };
        debouncedSync(newState);
        showSuccessToast(`Switched to ${isMetricSystem ? 'metric (kg)' : 'imperial (lbs)'}`);
        return newState;
    }),

    toggleCompactView: () => set((state) => {
        const newState = { ...state, isCompactView: !state.isCompactView };
        debouncedSync(newState);
        return newState;
    }),

    toggleCalendarWeekStart: () => set((state) => {
        const newState = { ...state, calendarWeekStartsOnMonday: !state.calendarWeekStartsOnMonday };
        debouncedSync(newState);
        return newState;
    }),

    lockInitialInputs: () => set((state) => {
        const newState = { ...state, initialInputsLocked: true };
        debouncedSync(newState);
        return newState;
    }),
}));

export const useCalc = () => ({
    // State values
    fetched: useCalcStore(state => state.fetched),
    calendarWeekStartsOnMonday: useCalcStore(state => state.calendarWeekStartsOnMonday),
    startDate: useCalcStore(state => state.startDate),
    startWeight: useCalcStore(state => state.startWeight),
    goalWeight: useCalcStore(state => state.goalWeight),
    isWeightLoss: useCalcStore(state => state.isWeightLoss),
    dailyKcalChange: useCalcStore(state => state.dailyKcalChange),
    weeklyChange: useCalcStore(state => state.weeklyChange),
    weeksForAvg: useCalcStore(state => state.weeksForAvg),
    avgTdeeOverTime: useCalcStore(state => state.avgTdeeOverTime),
    avgWeightOverTime: useCalcStore(state => state.avgWeightOverTime),
    weeksToGoal: useCalcStore(state => state.weeksToGoal),
    avgWeight: useCalcStore(state => state.avgWeight),
    weekNo: useCalcStore(state => state.weekNo),
    isMetricSystem: useCalcStore(state => state.isMetricSystem),
    initialInputsLocked: useCalcStore(state => state.initialInputsLocked),
    tdee: useCalcStore(state => state.tdee),
    isCompactView: useCalcStore(state => state.isCompactView),
    weekData: useCalcStore(state => state.weekData),
    selectedWeek: useCalcStore(state => state.selectedWeek),

    // Data operations
    fetchData: useCalcStore(state => state.fetchData),
    loadFromStorage: useCalcStore(state => state.loadFromStorage),
    
    // Week operations
    addNewWeek: useCalcStore(state => state.addNewWeek),
    updateDay: useCalcStore(state => state.updateDay),
    selectWeek: useCalcStore(state => state.selectWeek),
    toggleWeekLock: useCalcStore(state => state.toggleWeekLock),
    
    // Setup operations
    setStartDate: useCalcStore(state => state.setStartDate),
    setStartWeight: useCalcStore(state => state.setStartWeight),
    setGoalWeight: useCalcStore(state => state.setGoalWeight),
    setWeeklyChange: useCalcStore(state => state.setWeeklyChange),
    setDailyKcalChange: useCalcStore(state => state.setDailyKcalChange),
    setWeeksForAvg: useCalcStore(state => state.setWeeksForAvg),
    toggleMeasurementSystem: useCalcStore(state => state.toggleMeasurementSystem),
    toggleCompactView: useCalcStore(state => state.toggleCompactView),
    toggleCalendarWeekStart: useCalcStore(state => state.toggleCalendarWeekStart),
    lockInitialInputs: useCalcStore(state => state.lockInitialInputs),
})