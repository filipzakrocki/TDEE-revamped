import React from 'react';
import { Box, Text, Input } from '@chakra-ui/react';
import moment from 'moment';

interface DayCellProps {
    day: any;
    colIndex: number;
    rowIndex: number;
    date: moment.Moment;
}

const DayCell: React.FC<DayCellProps> = ({ day,date, colIndex, rowIndex }) => {
    return (
        <Box
            key={`${rowIndex}-${colIndex}`}
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
            <Input placeholder="Calories" mb={2} value={day.kcal ?? ''} readOnly />
            <Input placeholder="Weight" value={day.kg ?? ''} readOnly />
        </Box>
    );
};

export default DayCell;