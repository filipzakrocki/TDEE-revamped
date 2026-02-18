import React, { useEffect, useCallback, useState } from 'react';
import {
    Container,
    Heading,
    Text,
    Spinner,
    Box,
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    HStack,
    VStack,
    Flex,
    Badge,
    Button,
    Tooltip,
} from '@chakra-ui/react';
import { Plus, Flame, Target, TrendingDown, TrendingUp, Scale, Calendar, Info } from 'lucide-react';

import WeekCalendar from './components/WeekCalendar';
import DayCard from './components/DayCard';

import { useAuth } from '../../stores/auth/authStore';
import { useCalc } from '../../stores/calc/calcStore';
import { useInterface } from '../../stores/interface/interfaceStore';
import { useTDEECalculations } from '../../hooks/useTDEECalculations';
import { config } from '../../config';

export type CopyFromState = {
    type: 'kcal' | 'kg';
    value: number | '';
    weekNumber: number;
    dayIndex: number;
} | null;

const Calculator: React.FC = () => {
    const { user, isGuest } = useAuth();
    const { 
        fetchData, 
        loadFromStorage,
        weekData, 
        startDate, 
        selectedWeek,
        selectWeek,
        addNewWeek,
        startWeight,
        goalWeight,
        isMetricSystem,
        dailyKcalChange,
        weeksForAvg,
        updateDay,
    } = useCalc();
    const [copyFrom, setCopyFrom] = useState<CopyFromState>(null);

    const onCopyCalories = useCallback((weekNumber: number, dayIndex: number, value: number | '') => {
        setCopyFrom({ type: 'kcal', value, weekNumber, dayIndex });
    }, []);
    const onPasteCalories = useCallback((weekNumber: number, dayIndex: number) => {
        if (copyFrom?.type === 'kcal') {
            updateDay({ type: 'kcal', weekNumber, dayIndex, value: copyFrom.value });
            setCopyFrom(null);
        }
    }, [copyFrom, updateDay]);
    const onCopyWeight = useCallback((weekNumber: number, dayIndex: number, value: number | '') => {
        setCopyFrom({ type: 'kg', value, weekNumber, dayIndex });
    }, []);
    const onPasteWeight = useCallback((weekNumber: number, dayIndex: number) => {
        if (copyFrom?.type === 'kg') {
            updateDay({ type: 'kg', weekNumber, dayIndex, value: copyFrom.value });
            setCopyFrom(null);
        }
    }, [copyFrom, updateDay]);
    const onCancelCopy = useCallback(() => setCopyFrom(null), []);
    const { loading, syncing } = useInterface();
    const {
        currentTdee,
        recommendedDailyIntake,
        currentAvgWeight,
        totalWeightChange,
        weeksToGoal,
        isWeightLoss,
        weekCalculations,
        tdeeOverTime,
    } = useTDEECalculations();

    const handleFetchData = useCallback(async () => {
        if (isGuest) {
            // Guest mode: load from localStorage only
            loadFromStorage();
            return;
        }
        if (!user?.uid) return;
        fetchData(user.uid);
    }, [user?.uid, isGuest, fetchData, loadFromStorage]);

    useEffect(() => {
        handleFetchData();
    }, [handleFetchData]);

    // Auto-select the latest week
    useEffect(() => {
        const displayWeeks = weekData.filter(w => w.week >= 1);
        if (displayWeeks.length > 0) {
            const latestWeek = Math.max(...displayWeeks.map(w => w.week));
            if (selectedWeek < 1) {
                selectWeek(latestWeek);
            }
        }
    }, [weekData, selectedWeek, selectWeek]);

    const displayWeeks = weekData.filter(w => w.week >= 1);
    const currentWeek = displayWeeks.find(w => w.week === selectedWeek);
    const currentWeekCalc = weekCalculations.find(w => w.weekNumber === selectedWeek);
    const weightUnit = isMetricSystem ? 'kg' : 'lbs';
    const weekNumber = displayWeeks.length;
    
    // Check if user needs to set up first
    const needsSetup = !startDate || startWeight === 0 || goalWeight === 0;

    if (needsSetup) {
        return (
            <Container maxW="100%" py={6}>
                <Card bg={config.backgroundNav} shadow="sm">
                    <CardBody textAlign="center" py={10}>
                        <VStack spacing={4}>
                            <Calendar size={48} color={config.test4} />
                            <Heading size="md" color={config.black}>
                                Welcome to TDEE Calculator
                            </Heading>
                            <Text color="gray.600" maxW="md">
                                Before you can start tracking, please complete the initial setup 
                                with your starting weight, goal, and preferences.
                            </Text>
                            <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                                Go to Setup in the menu to get started
                            </Badge>
                        </VStack>
                    </CardBody>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxW="100%" py={2}>
            {/* Page Title */}
            <Heading size="md" color={config.black} mb={4}>Calculator</Heading>
            
            {/* Header Stats */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
                {/* Daily Target - First and emphasized */}
                <Card bg={config.test5} color="white" shadow="sm">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1} justify="space-between">
                                <HStack spacing={2}>
                                    <Target size={16} />
                                    <StatLabel fontSize="xs" opacity={0.9}>Daily Target</StatLabel>
                                </HStack>
                                <Tooltip 
                                    label={`TDEE (${currentTdee.toLocaleString()}) ${isWeightLoss ? '−' : '+'} ${Math.abs(dailyKcalChange)} kcal ${isWeightLoss ? 'deficit' : 'surplus'} = ${recommendedDailyIntake.toLocaleString()} kcal`}
                                    fontSize="xs"
                                    bg="gray.800"
                                    placement="top"
                                    hasArrow
                                >
                                    <Box cursor="pointer" opacity={0.7} _hover={{ opacity: 1 }}>
                                        <Info size={14} />
                                    </Box>
                                </Tooltip>
                            </HStack>
                            <StatNumber fontSize="xl">
                                {recommendedDailyIntake > 0 ? recommendedDailyIntake.toLocaleString() : '—'}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0} opacity={0.9}>
                                {isWeightLoss ? 'deficit' : 'surplus'}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                {/* Current TDEE */}
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1} justify="space-between">
                                <HStack spacing={2}>
                                    <Flame size={16} color={config.test5} />
                                    <StatLabel fontSize="xs" color="gray.500">Your TDEE</StatLabel>
                                </HStack>
                                <Tooltip 
                                    label={(() => {
                                        const validTdees = tdeeOverTime.filter(t => t > 0);
                                        if (validTdees.length === 0) return 'No data yet';
                                        if (validTdees.length === 1) return `Initial estimate: ${validTdees[0].toLocaleString()} kcal`;
                                        
                                        const weeklyTdees = validTdees.slice(1); // Skip initial estimate
                                        
                                        // If enough weekly data, show only weekly TDEEs
                                        if (weeklyTdees.length >= weeksForAvg) {
                                            const startIdx = weeklyTdees.length - weeksForAvg;
                                            const usedTdees = weeklyTdees.slice(startIdx);
                                            const labels = usedTdees.map((t, i) => `W${startIdx + i + 1}: ${t.toLocaleString()}`);
                                            return `(${labels.join(' + ')}) ÷ ${usedTdees.length} = ${currentTdee.toLocaleString()} kcal`;
                                        }
                                        
                                        // Not enough weekly data, include initial estimate
                                        const startIdx = Math.max(0, validTdees.length - weeksForAvg);
                                        const usedTdees = validTdees.slice(startIdx);
                                        const labels = usedTdees.map((t, i) => {
                                            const actualIdx = startIdx + i;
                                            return actualIdx === 0 ? `Est: ${t.toLocaleString()}` : `W${actualIdx}: ${t.toLocaleString()}`;
                                        });
                                        return `(${labels.join(' + ')}) ÷ ${usedTdees.length} = ${currentTdee.toLocaleString()} kcal`;
                                    })()}
                                    fontSize="xs"
                                    bg="gray.800"
                                    placement="top"
                                    hasArrow
                                >
                                    <Box cursor="pointer" color="gray.400" _hover={{ color: 'gray.600' }}>
                                        <Info size={14} />
                                    </Box>
                                </Tooltip>
                            </HStack>
                            <StatNumber fontSize="xl" color={config.black}>
                                {currentTdee > 0 ? currentTdee.toLocaleString() : '—'}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0}>kcal/day</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                {/* Current Weight */}
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1}>
                                <Scale size={16} color={config.test5} />
                                <StatLabel fontSize="xs" color="gray.500">Current</StatLabel>
                            </HStack>
                            <StatNumber fontSize="xl" color={config.black}>
                                {currentAvgWeight > 0 ? currentAvgWeight.toFixed(1) : '—'}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0}>{weightUnit}</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                {/* Progress */}
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1}>
                                {isWeightLoss ? <TrendingDown size={16} color={config.test5} /> : <TrendingUp size={16} color={config.test5} />}
                                <StatLabel fontSize="xs" color="gray.500">Progress</StatLabel>
                            </HStack>
                            <StatNumber fontSize="xl" color={totalWeightChange !== 0 ? config.test5 : config.black}>
                                {totalWeightChange !== 0 ? `${totalWeightChange > 0 ? '-' : '+'}${Math.abs(totalWeightChange).toFixed(1)}` : '—'}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0}>
                                {weeksToGoal > 0 ? `${weeksToGoal} weeks left` : weightUnit}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Week Info Header */}
            <Card bg="white" mb={4} shadow="sm">
                <CardBody py={3} px={4}>
                    <Flex justify="space-between" align="center">
                        {/* Left side - Week info */}
                        <VStack align="start" spacing={0}>
                            <Heading size="sm" color={config.black}>
                                Week {selectedWeek} of {weekNumber}
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                {currentWeekCalc && currentWeekCalc.avgKcal > 0
                                    ? `Avg: ${Math.round(currentWeekCalc.avgKcal)} kcal • ${currentWeekCalc.avgWeight.toFixed(1)} ${weightUnit}`
                                    : '—'}
                            </Text>
                        </VStack>

                        {/* Right side - always show for uniform layout */}
                        <HStack spacing={4}>
                            <VStack align="end" spacing={0}>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                                    This Week
                                </Text>
                                <Text
                                    fontSize="lg"
                                    fontWeight="bold"
                                    color={
                                        currentWeekCalc && currentWeekCalc.avgKcal > 0 && currentWeekCalc.avgWeight > 0 && currentWeekCalc.weightChange !== 0
                                            ? isWeightLoss
                                                ? (currentWeekCalc.weightChange < 0 ? config.test5 : 'red.500')
                                                : (currentWeekCalc.weightChange > 0 ? config.test5 : 'red.500')
                                            : 'gray.500'
                                    }
                                >
                                    {currentWeekCalc && currentWeekCalc.avgKcal > 0 && currentWeekCalc.avgWeight > 0 && currentWeekCalc.weightChange !== 0
                                        ? `${currentWeekCalc.weightChange > 0 ? '+' : ''}${currentWeekCalc.weightChange.toFixed(2)} ${weightUnit}`
                                        : '—'}
                                </Text>
                            </VStack>
                            <VStack align="end" spacing={0}>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                                    Week TDEE
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color={config.test5}>
                                    {currentWeekCalc && currentWeekCalc.weeklyTdee > 0
                                        ? Math.round(currentWeekCalc.weeklyTdee).toLocaleString()
                                        : '—'}
                                </Text>
                            </VStack>
                        </HStack>
                    </Flex>
                </CardBody>
            </Card>

            {/* Day Cards: flex to fill width, horizontal scroll when narrow */}
            {currentWeek && (
                <Box
                    mb={6}
                    overflowX="auto"
                    overflowY="hidden"
                    css={{ WebkitOverflowScrolling: 'touch' }}
                    pb={2}
                    w="100%"
                >
                    <Flex gap={2} minW="min-content" w="100%">
                        {currentWeek.days.map((day, index) => (
                            <Box key={`day-${selectedWeek}-${index}`} flex={1} minW="140px" display="flex" justifyContent="center">
                                <DayCard
                                    dayIndex={index}
                                    weekNumber={selectedWeek}
                                    startDate={startDate}
                                    day={day}
                                    isEditable={!currentWeek.locked}
                                    weeklyTarget={currentWeekCalc?.weeklyTarget || 0}
                                    copyFrom={copyFrom}
                                    onCopyCalories={onCopyCalories}
                                    onPasteCalories={onPasteCalories}
                                    onCopyWeight={onCopyWeight}
                                    onPasteWeight={onPasteWeight}
                                    onCancelCopy={onCancelCopy}
                                />
                            </Box>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* Add New Week Button - Centered */}
            <Flex justify="center" mb={8}>
                <Button
                    leftIcon={<Plus size={18} />}
                    size="lg"
                    bg={config.test5}
                    color="white"
                    _hover={{ bg: config.test4 }}
                    _active={{ bg: config.test4 }}
                    onClick={addNewWeek}
                    shadow="md"
                    transition="all 0.2s"
                    px={8}
                >
                    Add New Week
                </Button>
            </Flex>

            {/* Monthly Calendar View */}
            <Box>
                <WeekCalendar startDate={startDate} />
            </Box>

            {/* Loading indicator */}
            {(syncing || loading) && (
                <Box position="fixed" bottom={4} right={4} zIndex={1000}>
                    <HStack 
                        bg="white" 
                        px={4} 
                        py={2} 
                        borderRadius="full" 
                        shadow="lg"
                        borderWidth="1px"
                        borderColor="gray.200"
                    >
                        <Spinner size="sm" color={config.test5} />
                        <Text fontSize="sm" color="gray.600">
                            {syncing ? 'Syncing...' : 'Loading...'}
                        </Text>
                    </HStack>
                </Box>
            )}
        </Container>
    );
};

export default Calculator;
