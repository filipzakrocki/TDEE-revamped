import React from 'react';
import { Box, GridItem, SimpleGrid, Text } from '@chakra-ui/react';
import useCalcDate from '../utils/useCalcDate'; // Import the useCalcDate hook
import { constants } from '../utils/constants';
import DayCell from './DayCell'; // Import the new DayCell component
import { format } from 'date-fns';

interface WeekRowProps {
    week: any;
    rowIndex: number;
    startDate: string;
}

const WeekRow: React.FC<WeekRowProps> = ({ week, rowIndex, startDate }) => {

    const weekStartDate = useCalcDate(startDate, week.week, 0);

    return (
        <>
            <GridItem colSpan={1}>
                <Box
                    p={4}
                    bg="white"
                    boxShadow="md"
                    borderRadius="md"
                    textAlign="center"
                    _hover={{ boxShadow: 'lg' }}
                    transition="all 0.2s"
                >
                    <Text mb={2}>Week {week.week}</Text>
                    <Text>{format(weekStartDate, constants.dateFormat)}</Text>
                </Box>
            </GridItem>
            <GridItem colSpan={7}>
                <SimpleGrid columns={7} spacing={4}>
                    {week.days.map((day: any, colIndex: number) => {
                           return <DayCell
                                key={colIndex}
                                day={day}
                                weekNumber={week.week}
                                dayIndex={colIndex}
                                rowIndex={rowIndex}
                                startDate={startDate}
                            />
                    } )}
                </SimpleGrid>
            </GridItem>
        </>
    );
};

export default WeekRow;