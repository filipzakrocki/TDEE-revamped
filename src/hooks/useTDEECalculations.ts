import { useMemo } from 'react';
import { useCalc } from '../stores/calc/calcStore';
import {
    calculateWeeklyStats,
    calculateWeeklyTDEE,
    calculateAverageTDEE,
    calculateWeeksToGoal,
    calculateTotalChange,
    isWeightLossPhase,
    estimateInitialTDEE,
} from '../utils/calculations';

interface WeekCalculation {
    weekNumber: number;
    avgWeight: number;
    avgKcal: number;
    weightChange: number;
    weeklyTdee: number;
    // The recommended daily intake for THIS week (based on TDEE at that time)
    weeklyTarget: number;
}

interface TDEECalculations {
    // Current stats
    currentTdee: number;
    recommendedDailyIntake: number;
    currentAvgWeight: number;
    totalWeightChange: number;
    weeksToGoal: number;
    isWeightLoss: boolean;
    
    // Per-week calculations
    weekCalculations: WeekCalculation[];
    
    // Historical data
    tdeeOverTime: number[];
    weightOverTime: number[];
}

/**
 * Custom hook that computes all TDEE-related calculations from the store state.
 * This centralizes all the calculation logic and provides derived values.
 */
export const useTDEECalculations = (): TDEECalculations => {
    const {
        weekData,
        startWeight,
        goalWeight,
        weeklyChange,
        weeksForAvg,
        dailyKcalChange,
        isMetricSystem,
    } = useCalc();

    // Determine if this is weight loss or gain phase
    const isWeightLoss = useMemo(() => {
        return isWeightLossPhase(startWeight, goalWeight);
    }, [startWeight, goalWeight]);

    // Initial TDEE estimate based on starting weight
    const initialTdee = useMemo(() => {
        return estimateInitialTDEE(startWeight, isMetricSystem);
    }, [startWeight, isMetricSystem]);

    // Calculate stats for each week (with per-week target based on TDEE at that time)
    const weekCalculations = useMemo((): WeekCalculation[] => {
        // First pass: calculate basic stats for each week
        const weekStats = weekData.map((week) => ({
            weekNumber: week.week,
            ...calculateWeeklyStats(week.days),
        }));
        
        // Build running TDEE array as we go (to calculate each week's target)
        const runningTdees: number[] = [initialTdee];
        
        // Second pass: calculate deltas, TDEE, and per-week target
        return weekStats.map((stats, index) => {
            // Find previous weight from calculated stats (not stored values)
            let previousWeight = startWeight;
            if (index > 0) {
                // Look backwards through calculated stats to find last week with weight
                for (let i = index - 1; i >= 0; i--) {
                    if (weekStats[i].avgWeight > 0) {
                        previousWeight = weekStats[i].avgWeight;
                        break;
                    }
                }
            }
            
            const weightChange = stats.avgWeight > 0 
                ? Number((stats.avgWeight - previousWeight).toFixed(2))
                : 0;
            
            const weeklyTdee = calculateWeeklyTDEE(
                stats.avgKcal,
                stats.avgWeight,
                previousWeight,
                isMetricSystem
            );

            // Calculate the target for THIS week based on TDEE known at that time
            // (all completed weeks BEFORE this one)
            const tdeeForThisWeek = calculateAverageTDEE(runningTdees, weeksForAvg);
            const adjustment = isWeightLoss ? -Math.abs(dailyKcalChange) : Math.abs(dailyKcalChange);
            const weeklyTarget = tdeeForThisWeek > 0 ? Math.ceil(tdeeForThisWeek + adjustment) : 0;
            
            // Add this week's TDEE to running array for next week's calculation
            if (weeklyTdee > 0 && stats.weekNumber >= 1) {
                runningTdees.push(weeklyTdee);
            }

            return {
                weekNumber: stats.weekNumber,
                avgWeight: stats.avgWeight,
                avgKcal: stats.avgKcal,
                weightChange,
                weeklyTdee,
                weeklyTarget,
            };
        });
    }, [weekData, startWeight, isMetricSystem, initialTdee, weeksForAvg, dailyKcalChange, isWeightLoss]);

    // Find the latest week number (for excluding from TDEE calculation)
    const latestWeekNumber = useMemo(() => {
        const weekNumbers = weekCalculations
            .filter(w => w.weekNumber >= 1)
            .map(w => w.weekNumber);
        return weekNumbers.length > 0 ? Math.max(...weekNumbers) : 0;
    }, [weekCalculations]);

    // Build TDEE over time array (excluding LATEST week, not selected week)
    // This ensures top cards don't change when navigating to previous weeks
    const tdeeOverTime = useMemo((): number[] => {
        const tdees = [initialTdee];
        
        // Add weekly TDEEs (skip week 0 and exclude the LATEST week being edited)
        weekCalculations.forEach(week => {
            if (week.weekNumber >= 1 && week.weekNumber !== latestWeekNumber && week.weeklyTdee > 0) {
                tdees.push(week.weeklyTdee);
            }
        });
        
        return tdees;
    }, [weekCalculations, initialTdee, latestWeekNumber]);

    // Build weight over time array
    const weightOverTime = useMemo((): number[] => {
        const weights = [startWeight];
        
        weekCalculations.forEach(week => {
            if (week.avgWeight > 0) {
                weights.push(week.avgWeight);
            }
        });
        
        return weights;
    }, [weekCalculations, startWeight]);

    // Current average TDEE (based on last N weeks)
    const currentTdee = useMemo(() => {
        return calculateAverageTDEE(tdeeOverTime, weeksForAvg);
    }, [tdeeOverTime, weeksForAvg]);

    // Current average weight (latest recorded)
    const currentAvgWeight = useMemo(() => {
        // Find the last week with weight data
        for (let i = weekCalculations.length - 1; i >= 0; i--) {
            if (weekCalculations[i].avgWeight > 0) {
                return weekCalculations[i].avgWeight;
            }
        }
        return startWeight;
    }, [weekCalculations, startWeight]);

    // Calculate derived values
    const totalWeightChange = useMemo(() => {
        return calculateTotalChange(startWeight, currentAvgWeight);
    }, [startWeight, currentAvgWeight]);

    const weeksToGoal = useMemo(() => {
        return calculateWeeksToGoal(currentAvgWeight, goalWeight, weeklyChange);
    }, [currentAvgWeight, goalWeight, weeklyChange]);

    // For weight loss: subtract kcal (deficit)
    // For weight gain: add kcal (surplus)
    const recommendedDailyIntake = useMemo(() => {
        if (!currentTdee) return 0;
        const adjustment = isWeightLoss ? -Math.abs(dailyKcalChange) : Math.abs(dailyKcalChange);
        return Math.ceil(currentTdee + adjustment);
    }, [currentTdee, dailyKcalChange, isWeightLoss]);

    return {
        currentTdee,
        recommendedDailyIntake,
        currentAvgWeight,
        totalWeightChange,
        weeksToGoal,
        isWeightLoss,
        weekCalculations,
        tdeeOverTime,
        weightOverTime,
    };
};

export default useTDEECalculations;

