import React, { useMemo } from 'react';
import {
    Box,
    Flex,
    Text,
    IconButton,
    Button,
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
    getDay,
} from 'date-fns';
import type { Day } from 'date-fns';
import { config } from '../../../config';
import { useCalc } from '../../../stores/calc/calcStore';
import { useTDEECalculations } from '../../../hooks/useTDEECalculations';

interface WeekCalendarProps {
    startDate: string;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ startDate }) => {
    const { weekData, selectedWeek, selectWeek, calendarWeekStartsOnMonday, toggleCalendarWeekStart, isMetricSystem } = useCalc();
    const weightUnit = isMetricSystem ? 'kg' : 'lbs';
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
    const [viewMonth, setViewMonth] = React.useState<Date>(() => getWeekStartDate(selectedWeek));

    const dietStartDate = startDate ? parseISO(startDate) : new Date();
    const weekStartsMonday = calendarWeekStartsOnMonday ?? true;
    const weekStartsOn: Day = weekStartsMonday ? 1 : (getDay(dietStartDate) as Day);
    const dayNames = weekStartsMonday
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : (() => {
            const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return [...names.slice(weekStartsOn), ...names.slice(0, weekStartsOn)];
        })();

    // Update view month only when user selects a different week (e.g. by clicking a day)
    React.useEffect(() => {
        setViewMonth(getWeekStartDate(selectedWeek));
    }, [selectedWeek, startDate]);
    
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
        const calendarStart = startOfWeek(monthStart, { weekStartsOn });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
        
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
    }, [viewMonth, weekStartsOn]);
    
    const dietStartMonth = startOfMonth(dietStartDate);
    const prevMonthStart = startOfMonth(subMonths(viewMonth, 1));

    // Can go to previous month if it's not before the diet start month
    const canGoPreviousMonth = prevMonthStart.getTime() >= dietStartMonth.getTime();
    
    const handlePreviousMonth = () => {
        if (canGoPreviousMonth) {
            setViewMonth(prev => subMonths(prev, 1));
        }
    };
    
    const handleNextMonth = () => {
        setViewMonth(prev => addMonths(prev, 1));
    };

    
    return (
        <Box bg="white" borderRadius="xl" p={4} shadow="sm" borderWidth="1px" borderColor="gray.100">
            {/* Header with month navigation */}
            <Flex justify="space-between" align="center" mb={4}>
                <Box flex={1} />
                <Flex flex={1} justify="center" align="center" gap={2}>
                    <IconButton
                        icon={<ChevronLeft size={20} />}
                        aria-label="Previous month"
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousMonth}
                        isDisabled={!canGoPreviousMonth}
                    />
                    <Text fontSize="lg" fontWeight="bold" color={config.black} minW="140px" textAlign="center">
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
                <Flex flex={1} justify="flex-end">
                    <Tooltip
                        label={weekStartsMonday ? `Switch to diet week start (${format(dietStartDate, 'EEEE')})` : 'Switch to Monday start'}
                        placement="left"
                    >
                        <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="gray"
                            onClick={toggleCalendarWeekStart}
                            fontSize="xs"
                        >
                            {weekStartsMonday ? 'Mon' : format(dietStartDate, 'EEE')}
                        </Button>
                    </Tooltip>
                </Flex>
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
                {calendarWeeks.map((week, weekIndex) => (
                        <Box
                            key={`week-${weekIndex}`}
                            w="100%"
                            transition="all 0.2s"
                        >
                            <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                                {week.map((date, dayIndex) => {
                                    const status = getDayStatus(date);
                                    const isCurrentMonth = isSameMonth(date, viewMonth);
                                    
                                    // Determine background color
                                    let bgColor = 'transparent';
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
                                            bgColor = 'gray.100';
                                            textColor = 'gray.400';
                                        } else if (!status.hasData) {
                                            bgColor = 'gray.50';
                                        }
                                    }
                                    
                                    if (status.isToday) {
                                        borderColor = config.test5;
                                    }
                                    
                                    const tooltipKcal = status.dayInfo && status.dayInfo.data.kcal !== '' && status.dayInfo.data.kcal !== 0 ? String(status.dayInfo.data.kcal) : '—';
                                    const tooltipKg = status.dayInfo && status.dayInfo.data.kg !== '' && status.dayInfo.data.kg !== 0 ? String(status.dayInfo.data.kg) : '—';
                                    const tooltipLabel = status.isInRange
                                        ? `${tooltipKcal} kcal • ${tooltipKg} ${weightUnit}${status.hasKcal ? (status.hitTarget ? ' ✓' : ' ✗') : ''}`
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
                                                    onClick={() => status.isInRange && isCurrentMonth && handleDayClick(date)}
                                                    _hover={status.isInRange && isCurrentMonth ? {
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
                                                    {status.isInRange && status.hasData && (
                                                        <Text fontSize="9px" color="gray.600" lineHeight="1">
                                                            {(status.dayInfo?.data.kcal !== '' && status.dayInfo?.data.kcal !== 0 ? status.dayInfo?.data.kcal : '—')} kcal • {(status.dayInfo?.data.kg !== '' && status.dayInfo?.data.kg !== 0 ? status.dayInfo?.data.kg : '—')} {weightUnit}
                                                        </Text>
                                                    )}
                                                </Box>
                                            </Tooltip>
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                        </Box>
                ))}
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
            </Flex>
        </Box>
    );
};

export default WeekCalendar;
