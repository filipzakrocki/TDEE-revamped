import { useMemo } from "react";
import { addWeeks, addDays, parseISO } from "date-fns";

/**
 * Custom React hook to calculate an extrapolated date based on a start date,
 * a week number, and a day index within that week.
 *
 * @param {string} startDate - The starting date in ISO format (YYYY-MM-DD).
 * @param {number} weekNumber - The number of weeks to add (1-based index).
 * @param {number} dayIndex - The day index within the target week (0 for Sunday, 6 for Saturday).
 * @returns {Date} The computed extrapolated date.
 *
 * @example
 * const extrapolatedDate = useExtrapolatedDate("2024-01-01", 3, 2);
 * console.log(extrapolatedDate); // Corresponding date 3 weeks from startDate on a Tuesday
 */
const useExtrapolatedDate = (startDate: string, weekNumber: number, dayIndex: number) => {
    const extrapolatedDate = useMemo(() => {
        return addDays(addWeeks(parseISO(startDate), weekNumber - 1), dayIndex);
    }, [startDate, weekNumber, dayIndex]);

    return extrapolatedDate;
};

export default useExtrapolatedDate;