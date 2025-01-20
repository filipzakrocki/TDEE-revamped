import React from 'react';
import { Box, GridItem, SimpleGrid, Text } from '@chakra-ui/react';
import moment from 'moment';
import DayCell from './DayCell'; // Import the new DayCell component

interface WeekRowProps {
    week: any;
    rowIndex: number;
    startDate: string;
}

const WeekRow: React.FC<WeekRowProps> = ({ week, rowIndex, startDate }) => {
    console.log(week)
    return (
        <>
            <GridItem colSpan={1}>
                <Box
                    p={4}
                    bg="white"
                    boxShadow="md"
                    borderRadius="md"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                >
                    <Text mb={2}>Week {week.week}</Text>
                    <Text>{moment(startDate).add('weeks', week.week - 1).format('DD-MMM-YYYY')}</Text>
                </Box>
            </GridItem>
            <GridItem colSpan={7}>
                <SimpleGrid columns={7} spacing={4}>
                    {week.days.map((day: any, colIndex: number) => (
                        <DayCell
                            key={colIndex}
                            day={day}
                            colIndex={colIndex}
                            rowIndex={rowIndex}
                            date={moment(startDate).add(week.week - 1, 'weeks').add(colIndex, 'days')}
                        />
                    ))}
                </SimpleGrid>
            </GridItem>
        </>
    );
};

export default WeekRow;