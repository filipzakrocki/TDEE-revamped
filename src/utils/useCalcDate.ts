import { useMemo } from "react";
import { addWeeks, addDays, parseISO } from "date-fns";

const useExtrapolatedDate = (startDate: string, weekNumber: number, dayIndex: number) => {
    const extrapolatedDate = useMemo(() => {
        return addDays(addWeeks(parseISO(startDate), weekNumber - 1), dayIndex);
    }, [startDate, weekNumber, dayIndex]);

    return extrapolatedDate;
};

export default useExtrapolatedDate;
