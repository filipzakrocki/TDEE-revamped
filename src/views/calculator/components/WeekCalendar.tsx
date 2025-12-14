import React, { useMemo } from 'react';
import {
    Box,
    Flex,
    Text,
    IconButton,
    HStack,
    VStack,
    Grid,
    GridItem,
    Tooltip,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
    format, 
    addDays, 
    parseISO, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isBefore,
} from 'date-fns';
import { config } from '../../../config';
import { useCalc } from '../../../stores/calc/calcStore';
import { useTDEECalculations } from '../../../hooks/useTDEECalculations';

interface WeekCalendarProps {
    startDate: string;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ startDate }) => {
    const { weekData, selectedWeek, selectWeek } = useCalc();
    const { isWeightLoss, weekCalculations } = useTDEECalculations();
    
    const displayWeeks = weekData.filter(w => w.week >= 1);
    
    // Get the current week's start date to determine which month to show
    const getWeekStartDate = (weekNumber: number): Date => {
        if (!startDate) return new Date();
        try {
            const start = parseISO(startDate);
            return addDays(start, (weekNumber - 1) * 7);
        } catch {
            return new Date();
        }
    };
    
    const selectedWeekStart = getWeekStartDate(selectedWeek);
    const [viewMonth, setViewMonth] = React.useState<Date>(selectedWeekStart);
    
    // Update view month when selected week changes
    React.useEffect(() => {
        setViewMonth(selectedWeekStart);
    }, [selectedWeek, selectedWeekStart]);
    
    // Build a map of weekNumber -> weeklyTarget for quick lookup
    const weekTargetMap = useMemo(() => {
        const map = new Map<number, number>();
        weekCalculations.forEach(week => {
            map.set(week.weekNumber, week.weeklyTarget);
        });
        return map;
    }, [weekCalculations]);
    
    // Build a map of date -> day data for quick lookup
    const dateDataMap = useMemo(() => {
        const map = new Map<string, { weekNumber: number; dayIndex: number; data: { kg: number | ''; kcal: number | '' }; locked: boolean; weeklyTarget: number }>();
        
        if (!startDate) return map;
        
        displayWeeks.forEach(week => {
            const weeklyTarget = weekTargetMap.get(week.week) || 0;
            week.days.forEach((day, dayIndex) => {
                const dayDate = addDays(parseISO(startDate), (week.week - 1) * 7 + dayIndex);
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                map.set(dateKey, {
                    weekNumber: week.week,
                    dayIndex,
                    data: day,
                    locked: week.locked,
                    weeklyTarget,
                });
            });
        });
        
        return map;
    }, [displayWeeks, startDate, weekTargetMap]);
    
    // Get day status for calendar coloring
    const getDayStatus = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayInfo = dateDataMap.get(dateKey);
        
        const today = new Date();
        const isToday = isSameDay(date, today);
        const isPast = date < today && !isToday;
        const isFuture = date > today;
        const isInRange = dayInfo !== undefined;
        
        const hasData = dayInfo && ((dayInfo.data.kcal !== '' && dayInfo.data.kcal !== 0) || (dayInfo.data.kg !== '' && dayInfo.data.kg !== 0));
        const hasKcal = dayInfo && dayInfo.data.kcal !== '' && dayInfo.data.kcal !== 0;
        
        // Check if user hit their target (using THAT WEEK's target, not current)
        let hitTarget = false;
        if (hasKcal && dayInfo.weeklyTarget > 0) {
            const kcal = Number(dayInfo.data.kcal);
            if (isWeightLoss) {
                hitTarget = kcal <= dayInfo.weeklyTarget;
            } else {
                hitTarget = kcal >= dayInfo.weeklyTarget;
            }
        }
        
        return { isToday, isPast, isFuture, isInRange, hasData, hasKcal, hitTarget, dayInfo };
    };
    
    // Navigate to week when clicking a day
    const handleDayClick = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayInfo = dateDataMap.get(dateKey);
        if (dayInfo) {
            selectWeek(dayInfo.weekNumber);
        }
    };
    
    // Generate calendar weeks for the month view
    const calendarWeeks = useMemo(() => {
        const monthStart = startOfMonth(viewMonth);
        const monthEnd = endOfMonth(viewMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        
        const weeks: Date[][] = [];
        let day = calendarStart;
        
        while (day <= calendarEnd) {
            const week: Date[] = [];
            for (let i = 0; i < 7; i++) {
                week.push(day);
                day = addDays(day, 1);
            }
            weeks.push(week);
        }
        
        return weeks;
    }, [viewMonth]);
    
    // Check if a week contains any selected week days
    const isWeekSelected = (weekDays: Date[]): boolean => {
        return weekDays.some(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayInfo = dateDataMap.get(dateKey);
            return dayInfo?.weekNumber === selectedWeek;
        });
    };
    
    // Get the diet start date's month
    const dietStartDate = startDate ? parseISO(startDate) : new Date();
    const dietStartMonth = startOfMonth(dietStartDate);
    
    // Check if we can go to the previous month
    const canGoPreviousMonth = !isBefore(startOfMonth(subMonths(viewMonth, 1)), dietStartMonth) && 
                                !isSameMonth(viewMonth, dietStartMonth);
    
    const handlePreviousMonth = () => {
        if (canGoPreviousMonth) {
            setViewMonth(prev => subMonths(prev, 1));
        }
    };
    
    const handleNextMonth = () => {
        setViewMonth(prev => addMonths(prev, 1));
    };
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
        <Box bg="white" borderRadius="xl" p={4} shadow="sm" borderWidth="1px" borderColor="gray.100">
            {/* Header with month navigation */}
            <Flex justify="space-between" align="center" mb={4}>
                <IconButton
                    icon={<ChevronLeft size={20} />}
                    aria-label="Previous month"
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousMonth}
                    isDisabled={!canGoPreviousMonth}
                />
                
                <Text fontSize="lg" fontWeight="bold" color={config.black}>
                    {format(viewMonth, 'MMMM yyyy')}
                </Text>
                
                <IconButton
                    icon={<ChevronRight size={20} />}
                    aria-label="Next month"
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                />
            </Flex>
            
            {/* Calendar header */}
            <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
                {dayNames.map((day, i) => (
                    <GridItem key={`header-${i}`}>
                        <Text 
                            fontSize="xs" 
                            fontWeight="bold" 
                            color="gray.500" 
                            textAlign="center"
                            textTransform="uppercase"
                            py={2}
                        >
                            {day}
                        </Text>
                    </GridItem>
                ))}
            </Grid>
            
            {/* Calendar weeks */}
            <VStack spacing={1}>
                {calendarWeeks.map((week, weekIndex) => {
                    const weekSelected = isWeekSelected(week);
                    
                    return (
                        <Box
                            key={`week-${weekIndex}`}
                            w="100%"
                            bg={weekSelected ? config.backgroundNav : 'transparent'}
                            borderRadius="lg"
                            p={weekSelected ? 1 : 0}
                            transition="all 0.2s"
                        >
                            <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                                {week.map((date, dayIndex) => {
                                    const status = getDayStatus(date);
                                    const isCurrentMonth = isSameMonth(date, viewMonth);
                                    
                                    // Determine background color
                                    let bgColor = weekSelected ? 'white' : 'transparent';
                                    let borderColor = 'transparent';
                                    let textColor = isCurrentMonth ? config.black : 'gray.300';
                                    let cursor = 'default';
                                    
                                    if (status.isInRange && isCurrentMonth) {
                                        cursor = 'pointer';
                                        
                                        if (status.hasKcal) {
                                            if (status.hitTarget) {
                                                bgColor = config.green;
                                            } else {
                                                bgColor = config.red;
                                            }
                                        } else if (status.isPast && !status.hasData) {
                                            bgColor = config.orange;
                                        } else if (status.isFuture) {
                                            bgColor = weekSelected ? 'white' : 'gray.100';
                                            textColor = 'gray.400';
                                        } else if (!status.hasData) {
                                            bgColor = weekSelected ? 'white' : 'gray.50';
                                        }
                                    }
                                    
                                    if (status.isToday) {
                                        borderColor = config.test5;
                                    }
                                    
                                    const tooltipLabel = status.hasKcal 
                                        ? `${status.dayInfo?.data.kcal} kcal${status.hitTarget ? ' ✓' : ' ✗'}`
                                        : status.isPast && status.isInRange
                                            ? 'No data entered'
                                            : '';
                                    
                                    return (
                                        <GridItem key={`day-${weekIndex}-${dayIndex}`}>
                                            <Tooltip 
                                                label={tooltipLabel} 
                                                fontSize="xs" 
                                                isDisabled={!tooltipLabel}
                                                placement="top"
                                            >
                                                <Box
                                                    bg={bgColor}
                                                    border="2px solid"
                                                    borderColor={borderColor}
                                                    borderRadius="md"
                                                    p={1}
                                                    textAlign="center"
                                                    transition="all 0.2s"
                                                    cursor={cursor}
                                                    minH="40px"
                                                    display="flex"
                                                    flexDirection="column"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    onClick={() => status.isInRange && handleDayClick(date)}
                                                    _hover={status.isInRange && isCurrentMonth ? {
                                                        transform: 'scale(1.05)',
                                                        shadow: 'sm',
                                                    } : {}}
                                                    opacity={isCurrentMonth ? 1 : 0.4}
                                                >
                                                    <Text 
                                                        fontSize="sm" 
                                                        fontWeight={status.isToday ? 'bold' : 'medium'}
                                                        color={textColor}
                                                    >
                                                        {format(date, 'd')}
                                                    </Text>
                                                    {status.hasKcal && (
                                                        <Text fontSize="9px" color="gray.600" lineHeight="1">
                                                            {status.dayInfo?.data.kcal}
                                                        </Text>
                                                    )}
                                                </Box>
                                            </Tooltip>
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                        </Box>
                    );
                })}
            </VStack>
            
            {/* Legend */}
            <Flex justify="center" gap={4} mt={4} pt={3} borderTop="1px solid" borderColor="gray.100" flexWrap="wrap">
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg={config.green} />
                    <Text fontSize="xs" color="gray.500">On target</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg={config.red} />
                    <Text fontSize="xs" color="gray.500">Off target</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg={config.orange} />
                    <Text fontSize="xs" color="gray.500">Missing</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" border="2px solid" borderColor={config.test5} bg="white" />
                    <Text fontSize="xs" color="gray.500">Today</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg={config.backgroundNav} boxShadow="inset 0 0 0 1px rgba(0,0,0,0.1)" />
                    <Text fontSize="xs" color="gray.500">Selected week</Text>
                </HStack>
            </Flex>
        </Box>
    );
};

export default WeekCalendar;
