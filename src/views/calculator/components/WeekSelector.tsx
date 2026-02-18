import React from 'react';
import { Box, Flex, Text, IconButton, SimpleGrid } from '@chakra-ui/react';
import { Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import useCalcDate from '../../../utils/useCalcDate';
import { constants } from '../../../utils/constants';
import DayCell from '../../../components/DayCell';
import { useCalc } from '../../../stores/calc/calcStore';

interface WeekSelectorProps {
    startDate: string;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ startDate }) => {
    const { weekData, selectedWeek, selectWeek, toggleWeekLock } = useCalc();

    const displayWeeks = weekData.filter(w => w.week >= 1);
    const latestWeekNumber = displayWeeks.length > 0 ? Math.max(...displayWeeks.map(w => w.week)) : 1;

    const currentWeek = selectedWeek >= 1
        ? (displayWeeks.find(w => w.week === selectedWeek) || (displayWeeks.length > 0 ? displayWeeks[displayWeeks.length - 1] : null))
        : (displayWeeks.length > 0 ? displayWeeks[displayWeeks.length - 1] : null);

    const isLatestWeek = currentWeek ? currentWeek.week === latestWeekNumber : false;

    const normalizedStartDate = ((): string => {
        if (!startDate) return new Date().toISOString().slice(0, 10);
        const parsed = parseISO(startDate);
        return isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : startDate;
    })();

    const weekStartDate = useCalcDate(normalizedStartDate, currentWeek?.week || 0, 0);

    if (!displayWeeks.length || !currentWeek) return null;

    const sortedWeeks = displayWeeks.map(w => w.week).sort((a, b) => a - b);
    const currentIndex = sortedWeeks.indexOf(selectedWeek);
    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentIndex < sortedWeeks.length - 1;

    const handlePreviousWeek = () => {
        if (currentIndex > 0) {
            selectWeek(sortedWeeks[currentIndex - 1]);
        }
    };

    const handleNextWeek = () => {
        if (currentIndex < sortedWeeks.length - 1) {
            selectWeek(sortedWeeks[currentIndex + 1]);
        }
    };

    return (
        <Box>
            {/* Week Navigation */}
            <Flex justify="center" align="center" mb={6} gap={4}>
                {/* Previous weeks (smaller) */}
                <Flex gap={2}>
                    {displayWeeks
                        .filter(w => w.week < selectedWeek)
                        .slice(-2)
                        .map(week => (
                            <Box
                                key={week.week}
                                p={2}
                                bg="gray.100"
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => selectWeek(week.week)}
                                _hover={{ bg: 'gray.200' }}
                                transition="all 0.2s"
                                minW="60px"
                                textAlign="center"
                            >
                                <Text fontSize="xs" fontWeight="semibold">
                                    Week {week.week}
                                </Text>
                                {week.locked && (
                                    <Lock size={12} style={{ margin: '0 auto' }} />
                                )}
                            </Box>
                        ))
                    }
                </Flex>

                {/* Navigation arrows */}
                <IconButton
                    icon={<ChevronLeft size={20} />}
                    aria-label="Previous week"
                    size="sm"
                    variant="ghost"
                    onClick={handlePreviousWeek}
                    isDisabled={!canGoPrevious}
                />

                {/* Current selected week (large center) */}
                <Box
                    p={4}
                    bg={isLatestWeek ? "blue.50" : "gray.50"}
                    borderRadius="lg"
                    boxShadow="md"
                    border={isLatestWeek ? "2px solid" : "1px solid"}
                    borderColor={isLatestWeek ? "blue.300" : "gray.200"}
                    minW="200px"
                    textAlign="center"
                >
                    <Flex justify="center" align="center" gap={2} mb={2}>
                        <Text fontSize="xl" fontWeight="bold">
                            Week {currentWeek.week}
                        </Text>
                        {isLatestWeek && (
                            <Text fontSize="sm" color="blue.500" fontWeight="semibold">
                                (Latest)
                            </Text>
                        )}
                        <IconButton
                            icon={currentWeek.locked ? <Lock size={16} /> : <Unlock size={16} />}
                            aria-label={currentWeek.locked ? "Unlock week" : "Lock week"}
                            size="xs"
                            variant="ghost"
                            onClick={() => toggleWeekLock(currentWeek.week)}
                            colorScheme={currentWeek.locked ? "red" : "green"}
                        />
                    </Flex>
                    <Text fontSize="sm" color="gray.600">
                        {format(weekStartDate, constants.dateFormat)}
                    </Text>
                </Box>

                {/* Navigation arrow */}
                <IconButton
                    icon={<ChevronRight size={20} />}
                    aria-label="Next week"
                    size="sm"
                    variant="ghost"
                    onClick={handleNextWeek}
                    isDisabled={!canGoNext}
                />

                {/* Next weeks (smaller) */}
                <Flex gap={2}>
                    {displayWeeks
                        .filter(w => w.week > selectedWeek)
                        .slice(0, 2)
                        .map(week => (
                            <Box
                                key={week.week}
                                p={2}
                                bg="gray.100"
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => selectWeek(week.week)}
                                _hover={{ bg: 'gray.200' }}
                                transition="all 0.2s"
                                minW="60px"
                                textAlign="center"
                            >
                                <Text fontSize="xs" fontWeight="semibold">
                                    Week {week.week}
                                </Text>
                                {week.locked && (
                                    <Lock size={12} style={{ margin: '0 auto' }} />
                                )}
                            </Box>
                        ))
                    }
                </Flex>
            </Flex>

            {/* Current week days grid */}
            <SimpleGrid columns={7} spacing={4} mt={4}>
                {currentWeek.days.map((day: any, dayIndex: number) => (
                    <DayCell
                        key={dayIndex}
                        day={day}
                        weekNumber={currentWeek.week}
                        dayIndex={dayIndex}
                        rowIndex={0}
                        startDate={startDate}
                        isEditable={!currentWeek.locked}
                    />
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default WeekSelector;