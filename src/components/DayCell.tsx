import React from 'react';
import { Box, Text, Input } from '@chakra-ui/react';
import { constants } from '../utils/constants';
import useCalcDate from '../utils/useCalcDate';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../app/store';
import { updateDay } from '../stores/calc/calcSlice';
import { format } from 'date-fns';

interface DayCellProps {
    day: any;
    dayIndex: number;
    rowIndex: number;
    startDate: string;
    weekNumber?: any;
}

const DayCell: React.FC<DayCellProps> = ({ day, dayIndex, rowIndex, weekNumber, startDate }) => {
    const dispatch = useDispatch<AppDispatch>();

    const dayDate = useCalcDate(startDate, weekNumber, dayIndex);

    const handleChange = (dayIndex: number, weekNumber: number, type: 'kg' | 'kcal', e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(updateDay({ type, dayIndex, weekNumber, value }));
    };


    return (
        <Box
            key={`row${rowIndex}-week${weekNumber}-day${dayIndex}`}
            p={4}
            bg="white"
            boxShadow="md"
            borderRadius="md"
            textAlign="center"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            transition="all 0.2s"
        >
            <Text mb={2}>{format(dayDate, constants.dayOfWeekFormat)}</Text>
            <Text mb={2}>{format(dayDate, constants.dateFormat)}</Text>
            <Input placeholder="Calories" mb={2} value={day.kcal ?? ''} onChange={(e) => handleChange(dayIndex, weekNumber, 'kcal', e)} />
            <Input placeholder="Weight" value={day.kg ?? ''}  onChange={(e) => handleChange(dayIndex, weekNumber, 'kg', e)} />
        </Box>
    );
};

export default DayCell;