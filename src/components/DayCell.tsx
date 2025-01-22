import React from 'react';
import { Box, Text, Input } from '@chakra-ui/react';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../app/store';
import { updateDay } from '../stores/calc/calcSlice';

interface DayCellProps {
    day: any;
    dayIndex: number;
    rowIndex: number;
    date: moment.Moment;
    weekNumber?: any;
}

const DayCell: React.FC<DayCellProps> = ({ day,date, dayIndex, rowIndex, weekNumber }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleChange = (dayIndex: number, weekNumber: number, type: 'kg' | 'kcal', e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(updateDay({ type, dayIndex, weekNumber, value }));
    };


    return (
        <Box
            key={`${weekNumber}-${dayIndex}`}
            p={4}
            bg="white"
            boxShadow="md"
            borderRadius="md"
            textAlign="center"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            transition="all 0.2s"
        >
            <Text mb={2}>{date.format('ddd')}</Text>
            <Text mb={2}>{date.format('YYYY-MMM-DD')}</Text>
            <Input placeholder="Calories" mb={2} value={day.kcal ?? ''} onChange={(e) => handleChange(dayIndex, weekNumber, 'kcal', e)} />
            <Input placeholder="Weight" value={day.kg ?? ''}  onChange={(e) => handleChange(dayIndex, weekNumber, 'kg', e)} />
        </Box>
    );
};

export default DayCell;