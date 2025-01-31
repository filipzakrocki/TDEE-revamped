import { useMemo } from 'react';
import moment from 'moment';

const useExtrapolatedDate = (startDate: string, weekNumber: number, dayIndex: number) => {
    const extrapolatedDate = useMemo(() => {
        return moment(startDate).add(weekNumber - 1, 'weeks').add(dayIndex, 'days');
    }, [startDate, weekNumber, dayIndex]);

    return extrapolatedDate;
};

export default useExtrapolatedDate;