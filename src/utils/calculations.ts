/**
 * TDEE Calculator - Core Calculation Utilities
 * Ported from TDEE-reactivated project
 */

// Conversion constants
export const KCAL_PER_KG = 1100; // kcal deficit/surplus per kg of weight change per week
export const KCAL_PER_LB = 500;  // kcal deficit/surplus per lb of weight change per week
export const TDEE_MULTIPLIER_KG = 33; // Rough estimate: TDEE ≈ weight(kg) * 33
export const TDEE_MULTIPLIER_LB = 15; // Rough estimate: TDEE ≈ weight(lb) * 15

export const KG_TO_LB = 2.20462262;
export const LB_TO_KG = 0.45359237;

interface DayData {
    kg: number | '';
    kcal: number | '';
}

interface WeekData {
    week: number;
    days: DayData[];
    avgKcal: number;
    avgWeight: number;
    locked: boolean;
}

// ============================================
// Unit Conversion
// ============================================

export const kgToLbs = (kg: number): number => {
    return Number((kg * KG_TO_LB).toFixed(2));
};

export const lbsToKg = (lbs: number): number => {
    return Number((lbs * LB_TO_KG).toFixed(2));
};

export const convertWeight = (weight: number, toMetric: boolean): number => {
    return toMetric ? lbsToKg(weight) : kgToLbs(weight);
};

// ============================================
// Average Calculations
// ============================================

/**
 * Calculate average of a specific property from day data
 * Filters out empty values before averaging
 */
export const getAverage = (days: DayData[], unit: 'kg' | 'kcal'): number => {
    const filteredDays = days.filter(day => day[unit] !== '' && day[unit] !== 0);
    
    if (filteredDays.length === 0) {
        return 0;
    }
    
    const sum = filteredDays.reduce((prev, day) => prev + Number(day[unit]), 0);
    return sum / filteredDays.length;
};

/**
 * Calculate weekly averages for weight and kcal
 */
export const calculateWeeklyStats = (days: DayData[]): { avgWeight: number; avgKcal: number } => {
    return {
        avgWeight: Number(getAverage(days, 'kg').toFixed(2)),
        avgKcal: Math.ceil(getAverage(days, 'kcal'))
    };
};

// ============================================
// TDEE Calculations
// ============================================

/**
 * Estimate initial TDEE based on body weight
 * This is a rough estimate used as a starting point
 */
export const estimateInitialTDEE = (weight: number, isMetric: boolean): number => {
    const modifier = isMetric ? TDEE_MULTIPLIER_KG : TDEE_MULTIPLIER_LB;
    return Math.ceil(weight * modifier);
};

/**
 * Find the last recorded average weight before a given week index
 * Used for calculating week-over-week weight change
 */
export const findLastWeight = (weekIndex: number, weekData: WeekData[]): number => {
    const previousWeeks = weekData.slice(0, weekIndex);
    
    for (let i = previousWeeks.length - 1; i >= 0; i--) {
        if (previousWeeks[i].avgWeight && previousWeeks[i].avgWeight > 0) {
            return previousWeeks[i].avgWeight;
        }
    }
    
    return 0;
};

/**
 * Calculate TDEE for a specific week based on:
 * - Average kcal consumed that week
 * - Weight change from previous week
 * 
 * Formula: TDEE = avgKcal - (weightChange * kcalPerUnit)
 * If you lost weight while eating X calories, your TDEE is higher than X
 * If you gained weight while eating X calories, your TDEE is lower than X
 */
export const calculateWeeklyTDEE = (
    avgKcal: number,
    currentWeight: number,
    previousWeight: number,
    isMetric: boolean
): number => {
    if (!avgKcal || !currentWeight || !previousWeight) {
        return 0;
    }
    
    const weightChange = currentWeight - previousWeight;
    const kcalModifier = isMetric ? KCAL_PER_KG : KCAL_PER_LB;
    
    // If you lost 1kg and ate 2000kcal, your TDEE = 2000 - (-1 * 1100) = 3100
    // If you gained 1kg and ate 3000kcal, your TDEE = 3000 - (1 * 1100) = 1900
    const weeklyTdee = avgKcal - (weightChange * kcalModifier);
    
    return Math.ceil(weeklyTdee);
};

/**
 * Calculate average TDEE over a configurable number of weeks
 * Like the old project:
 * - Takes the last N weekly TDEEs based on weeksForAvg setting
 * - Only includes initial estimate if there's not enough weekly data
 * 
 * tdeeOverTime format: [initialEstimate, week1Tdee, week2Tdee, ...]
 */
export const calculateAverageTDEE = (
    tdeeOverTime: number[],
    weeksForAvg: number = 2
): number => {
    if (!tdeeOverTime || tdeeOverTime.length === 0) {
        return 0;
    }
    
    // Filter out zeros and invalid values
    const validTdees = tdeeOverTime.filter(tdee => tdee && tdee > 0);
    
    if (validTdees.length === 0) {
        return 0;
    }
    
    // If only one value (initial estimate), return it
    if (validTdees.length === 1) {
        return validTdees[0];
    }
    
    // Separate weekly TDEEs (index 1+) from initial estimate (index 0)
    const weeklyTdees = validTdees.slice(1);
    
    // If we have enough weekly TDEEs, use only those (don't include initial estimate)
    if (weeklyTdees.length >= weeksForAvg) {
        const startIndex = weeklyTdees.length - weeksForAvg;
        const recentTdees = weeklyTdees.slice(startIndex);
        const avgTdee = recentTdees.reduce((sum, tdee) => sum + tdee, 0) / recentTdees.length;
        return Math.ceil(avgTdee);
    }
    
    // Not enough weekly data - include initial estimate to fill the gap
    // Take last N from the full array (initial + weekly)
    const startIndex = Math.max(0, validTdees.length - weeksForAvg);
    const recentTdees = validTdees.slice(startIndex);
    const avgTdee = recentTdees.reduce((sum, tdee) => sum + tdee, 0) / recentTdees.length;
    
    return Math.ceil(avgTdee);
};

// ============================================
// Goal & Progress Calculations
// ============================================

/**
 * Calculate how many weeks until goal weight is reached
 * Based on current weight and weekly change rate
 */
export const calculateWeeksToGoal = (
    currentWeight: number,
    goalWeight: number,
    weeklyChange: number
): number => {
    if (!currentWeight || !goalWeight || !weeklyChange || weeklyChange === 0) {
        return 0;
    }
    
    const weightToLose = Math.abs(currentWeight - goalWeight);
    const weeksNeeded = Math.round(weightToLose / Math.abs(weeklyChange));
    
    return Math.abs(weeksNeeded);
};

/**
 * Calculate total weight change since start
 */
export const calculateTotalChange = (startWeight: number, currentWeight: number): number => {
    if (!startWeight || !currentWeight) {
        return 0;
    }
    
    return Number((startWeight - currentWeight).toFixed(2));
};

/**
 * Determine if user is in a weight loss phase
 */
export const isWeightLossPhase = (startWeight: number, goalWeight: number): boolean => {
    return startWeight > goalWeight;
};

// ============================================
// Daily Kcal Target Calculations
// ============================================

/**
 * Convert weekly weight change goal to daily kcal adjustment
 * Positive for surplus (weight gain), negative for deficit (weight loss)
 */
export const weeklyChangeToDailyKcal = (
    weeklyChange: number,
    isMetric: boolean,
    isWeightLoss: boolean
): number => {
    const kcalModifier = isMetric ? KCAL_PER_KG : KCAL_PER_LB;
    const dailyChange = Math.ceil(Math.abs(weeklyChange) * kcalModifier);
    
    return isWeightLoss ? -dailyChange : dailyChange;
};

/**
 * Convert daily kcal adjustment to weekly weight change
 */
export const dailyKcalToWeeklyChange = (
    dailyKcal: number,
    isMetric: boolean
): number => {
    const kcalModifier = isMetric ? KCAL_PER_KG : KCAL_PER_LB;
    const weeklyChange = Math.abs(dailyKcal) / kcalModifier;
    
    return Number(weeklyChange.toFixed(2));
};

/**
 * Calculate recommended daily calorie intake
 * TDEE + adjustment for weight goal
 */
export const calculateDailyTarget = (
    tdee: number,
    dailyKcalChange: number
): number => {
    if (!tdee) return 0;
    return Math.ceil(tdee + dailyKcalChange);
};

// ============================================
// Date Utilities
// ============================================

/**
 * Generate the start date of a specific week
 */
export const getWeekStartDate = (startDate: string, weekNumber: number): Date => {
    const start = new Date(startDate);
    const daysToAdd = (weekNumber - 1) * 7;
    
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + daysToAdd);
};

/**
 * Format date for display
 */
export const formatWeekDate = (date: Date): string => {
    return date.toDateString().slice(4); // Remove day name, show "Dec 13 2025"
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayFormatted = (): string => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    
    return `${yyyy}-${mm}-${dd}`;
};

