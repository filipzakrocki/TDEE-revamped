import React, { useMemo, useState } from 'react';
import {
    Container,
    SimpleGrid,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    HStack,
    VStack,
    Badge,
    Tooltip,
    Flex,
    Grid,
    GridItem,
    Button,
    ButtonGroup,
} from '@chakra-ui/react';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    ComposedChart,
    Brush,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, addDays, getDay } from 'date-fns';
import { TrendingUp, TrendingDown, Target, Flame, Calendar, Award, AlertTriangle, Settings } from 'lucide-react';

import { useCalc } from '../../stores/calc/calcStore';
import { useTDEECalculations } from '../../hooks/useTDEECalculations';
import { config } from '../../config';

const Analysis: React.FC = () => {
    const navigate = useNavigate();
    const {
        weekData,
        startDate,
        startWeight,
        goalWeight,
        isMetricSystem,
        weeklyChange,
    } = useCalc();

    const needsSetup = !startDate || startWeight === 0 || goalWeight === 0;

    const {
        currentTdee,
        recommendedDailyIntake,
        currentAvgWeight,
        totalWeightChange,
        isWeightLoss,
        weekCalculations,
    } = useTDEECalculations();

    const weightUnit = isMetricSystem ? 'kg' : 'lbs';
    const displayWeeks = weekData.filter(w => w.week >= 1);

    // Chart series visibility state
    const [showTarget, setShowTarget] = useState(true);
    const [showCalories, setShowCalories] = useState(true);
    const [showTdee, setShowTdee] = useState(true);
    const [showWeight, setShowWeight] = useState(true);
    const [showProjectedWeight, setShowProjectedWeight] = useState(true);
    
    // Heatmap view mode
    const [heatmapView, setHeatmapView] = useState<'monthly' | 'yearly'>('monthly');

    // Calculate how many weeks until goal from start weight
    const weeksToGoalFromStart = useMemo(() => {
        if (!startWeight || !goalWeight || !weeklyChange || weeklyChange === 0) return 0;
        const weightDiff = Math.abs(startWeight - goalWeight);
        return Math.ceil(weightDiff / weeklyChange);
    }, [startWeight, goalWeight, weeklyChange]);

    // Build daily data for charts
    const dailyData = useMemo(() => {
        if (!startDate) return [];

        const data: Array<{
            date: string;
            dateLabel: string;
            week: number;
            kcal: number | null;
            weight: number | null;
            projectedWeight: number | null;
            target: number | null;
            tdee: number | null;
        }> = [];

        const existingWeeks = displayWeeks.length;
        const existingDays = existingWeeks * 7;
        // Extend chart to show full projected weight journey if enabled
        const totalDays = showProjectedWeight 
            ? Math.max(existingDays, weeksToGoalFromStart * 7)
            : existingDays;

        for (let dayNum = 0; dayNum < totalDays; dayNum++) {
            const weekNumber = Math.floor(dayNum / 7) + 1;
            const dayIndex = dayNum % 7;
            const dayDate = addDays(parseISO(startDate), dayNum);
            
            const isInExistingRange = dayNum < existingDays;
            const week = displayWeeks.find(w => w.week === weekNumber);
            const weekCalc = weekCalculations.find(w => w.weekNumber === weekNumber);
            const weekTarget = weekCalc?.weeklyTarget || recommendedDailyIntake;
            const weekTdee = weekCalc?.weeklyTdee || currentTdee;
            
            const day = week?.days[dayIndex];
            
            // Calculate projected weight - based on start weight and weekly change rate
            let projectedWeight: number | null = null;
            if (startWeight > 0 && weeklyChange > 0 && goalWeight > 0) {
                // Week 0 = start weight, then decrease/increase by weeklyChange each week
                const weeksCompleted = Math.floor(dayNum / 7);
                if (isWeightLoss) {
                    projectedWeight = Math.max(goalWeight, startWeight - (weeksCompleted * weeklyChange));
                } else {
                    projectedWeight = Math.min(goalWeight, startWeight + (weeksCompleted * weeklyChange));
                }
            }
            
            data.push({
                date: format(dayDate, 'yyyy-MM-dd'),
                dateLabel: format(dayDate, 'MMM d'),
                week: weekNumber,
                // Only include actual data for existing weeks
                kcal: isInExistingRange && day && day.kcal !== '' && day.kcal !== 0 ? Number(day.kcal) : null,
                weight: isInExistingRange && day && day.kg !== '' && day.kg !== 0 ? Number(day.kg) : null,
                target: isInExistingRange ? weekTarget : null,
                tdee: isInExistingRange ? (weekTdee > 0 ? weekTdee : currentTdee) : null,
                // Projected weight from start date based on plan
                projectedWeight,
            });
        }

        return data;
    }, [displayWeeks, startDate, weekCalculations, recommendedDailyIntake, currentTdee, startWeight, goalWeight, weeklyChange, weeksToGoalFromStart, isWeightLoss, showProjectedWeight]);

    // Weekly summary data for bar chart
    const weeklyData = useMemo(() => {
        if (!startDate) return [];
        
        return weekCalculations
            .filter(w => w.weekNumber >= 1 && w.avgKcal > 0)
            .map(week => {
                const weekStartDate = addDays(parseISO(startDate), (week.weekNumber - 1) * 7);
                const weekEndDate = addDays(weekStartDate, 6);
                const dateRange = `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d')}`;
                
                return {
                    week: `W${week.weekNumber}`,
                    weekLabel: `W${week.weekNumber} (${dateRange})`,
                    weekNumber: week.weekNumber,
                    dateRange,
                    avgKcal: Math.round(week.avgKcal),
                    avgWeight: week.avgWeight,
                    weeklyTdee: Math.round(week.weeklyTdee),
                    target: week.weeklyTarget,
                    delta: week.weightChange,
                    hitTarget: isWeightLoss 
                        ? week.avgKcal <= week.weeklyTarget
                        : week.avgKcal >= week.weeklyTarget,
                };
            });
    }, [weekCalculations, isWeightLoss, startDate]);

    // Calculate compliance stats
    const complianceStats = useMemo(() => {
        let totalDays = 0;
        let daysOnTarget = 0;
        let totalKcalDiff = 0;

        dailyData.forEach(day => {
            if (day.kcal !== null && day.target !== null) {
                totalDays++;
                const diff = day.kcal - day.target;
                totalKcalDiff += diff;
                
                if (isWeightLoss) {
                    if (day.kcal <= day.target) daysOnTarget++;
                } else {
                    if (day.kcal >= day.target) daysOnTarget++;
                }
            }
        });

        const complianceRate = totalDays > 0 ? (daysOnTarget / totalDays) * 100 : 0;
        const avgDailyDiff = totalDays > 0 ? totalKcalDiff / totalDays : 0;

        return {
            totalDays,
            daysOnTarget,
            complianceRate,
            avgDailyDiff,
        };
    }, [dailyData, isWeightLoss]);

    // Heatmap data by month
    const heatmapData = useMemo(() => {
        if (!startDate || dailyData.length === 0) return [];

        // Group by month
        const months: Map<string, Array<{
            date: string;
            dayOfMonth: number;
            dayOfWeek: number;
            status: 'hit' | 'miss' | 'empty' | 'future';
        }>> = new Map();

        dailyData.forEach(day => {
            const date = parseISO(day.date);
            const monthKey = format(date, 'yyyy-MM');
            
            if (!months.has(monthKey)) {
                months.set(monthKey, []);
            }

            let status: 'hit' | 'miss' | 'empty' | 'future' = 'empty';
            const today = new Date();
            
            if (date > today) {
                status = 'future';
            } else if (day.kcal !== null && day.target !== null) {
                if (isWeightLoss) {
                    status = day.kcal <= day.target ? 'hit' : 'miss';
                } else {
                    status = day.kcal >= day.target ? 'hit' : 'miss';
                }
            }

            months.get(monthKey)!.push({
                date: day.date,
                dayOfMonth: date.getDate(),
                dayOfWeek: getDay(date),
                status,
            });
        });

        return Array.from(months.entries()).map(([monthKey, days]) => ({
            month: monthKey,
            monthLabel: format(parseISO(monthKey + '-01'), 'MMMM yyyy'),
            days,
            stats: {
                hit: days.filter(d => d.status === 'hit').length,
                miss: days.filter(d => d.status === 'miss').length,
                total: days.filter(d => d.status !== 'future' && d.status !== 'empty').length,
            },
        }));
    }, [dailyData, startDate, isWeightLoss]);

    // Yearly heatmap data (GitHub-style: weeks as columns, days as rows)
    const yearlyHeatmapData = useMemo(() => {
        if (!startDate || dailyData.length === 0) return { weeks: [], stats: { hit: 0, miss: 0, total: 0 } };

        // Group by week (each week is a column)
        const weeks: Array<Array<{
            date: string;
            dayOfWeek: number;
            month: number;
            status: 'hit' | 'miss' | 'empty' | 'future' | 'outside';
        }>> = [];

        let currentWeek: typeof weeks[0] = [];
        const today = new Date();
        
        // Find the first day and pad to start of week (Sunday = 0)
        const firstDay = parseISO(dailyData[0].date);
        const firstDayOfWeek = getDay(firstDay);
        
        // Add padding for days before the start
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push({
                date: '',
                dayOfWeek: i,
                month: 0,
                status: 'outside',
            });
        }

        dailyData.forEach(day => {
            const date = parseISO(day.date);
            const dayOfWeek = getDay(date);
            
            // Start new week on Sunday
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            let status: 'hit' | 'miss' | 'empty' | 'future' = 'empty';
            
            if (date > today) {
                status = 'future';
            } else if (day.kcal !== null && day.target !== null) {
                if (isWeightLoss) {
                    status = day.kcal <= day.target ? 'hit' : 'miss';
                } else {
                    status = day.kcal >= day.target ? 'hit' : 'miss';
                }
            }

            currentWeek.push({
                date: day.date,
                dayOfWeek,
                month: date.getMonth(),
                status,
            });
        });

        // Push the last week
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        // Calculate stats
        let hit = 0, miss = 0, total = 0;
        weeks.forEach(week => {
            week.forEach(day => {
                if (day.status === 'hit') { hit++; total++; }
                if (day.status === 'miss') { miss++; total++; }
            });
        });

        return { weeks, stats: { hit, miss, total } };
    }, [dailyData, startDate, isWeightLoss]);

    // Best and worst weeks
    const weekAnalysis = useMemo(() => {
        if (weeklyData.length === 0) return { best: null, worst: null };

        const sorted = [...weeklyData].sort((a, b) => {
            if (isWeightLoss) {
                return a.delta - b.delta; // Best = most negative (lost most)
            }
            return b.delta - a.delta; // Best = most positive (gained most)
        });

        return {
            best: sorted[0],
            worst: sorted[sorted.length - 1],
        };
    }, [weeklyData, isWeightLoss]);

    // No data state
    if (displayWeeks.length === 0 || dailyData.length === 0) {
        return (
            <Container maxW="100%" py={6}>
                <Card bg="white">
                    <CardBody textAlign="center" py={10}>
                        <VStack spacing={4}>
                            <Calendar size={48} color={config.test4} />
                            <Heading size="md" color={config.black}>
                                {needsSetup ? 'Complete Setup First' : 'No Data Yet'}
                            </Heading>
                            <Text color="gray.600">
                                {needsSetup
                                    ? 'Enter your starting weight, goal, and preferences in Setup to start tracking.'
                                    : 'Start tracking your calories and weight in the Calculator to see analytics.'}
                            </Text>
                            <Button
                                leftIcon={needsSetup ? <Settings size={18} /> : <Calendar size={18} />}
                                size="lg"
                                bg={config.test5}
                                color="white"
                                _hover={{ bg: config.test4 }}
                                _active={{ bg: config.test4 }}
                                shadow="md"
                                transition="all 0.2s"
                                px={8}
                                onClick={() => navigate(needsSetup ? '/setup' : '/calculator')}
                            >
                                {needsSetup ? 'Go to Setup' : 'Go to Calculator'}
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxW="100%" py={2}>
            {/* Page Title */}
            <Heading size="md" color={config.black} mb={4}>Analytics</Heading>
            
            {/* Summary Stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg={config.test5} color="white" shadow="sm">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1}>
                                <Target size={16} />
                                <StatLabel fontSize="xs" opacity={0.9}>Compliance</StatLabel>
                            </HStack>
                            <StatNumber fontSize="xl">
                                {complianceStats.complianceRate.toFixed(0)}%
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0} opacity={0.9}>
                                {complianceStats.daysOnTarget}/{complianceStats.totalDays} days
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="white" shadow="sm">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1}>
                                <Calendar size={16} color={config.test5} />
                                <StatLabel fontSize="xs" color="gray.500">Days Tracked</StatLabel>
                            </HStack>
                            <StatNumber fontSize="xl" color={config.black}>
                                {complianceStats.totalDays}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0}>
                                {displayWeeks.length} week{displayWeeks.length > 1 ? 's' : ''}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="white" shadow="sm">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1}>
                                {isWeightLoss ? <TrendingDown size={16} color={config.test5} /> : <TrendingUp size={16} color={config.test5} />}
                                <StatLabel fontSize="xs" color="gray.500">Total Change</StatLabel>
                            </HStack>
                            <StatNumber fontSize="xl" color={totalWeightChange !== 0 ? config.test5 : config.black}>
                                {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} {weightUnit}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0}>
                                {startWeight} → {currentAvgWeight.toFixed(1)}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="white" shadow="sm">
                    <CardBody py={3} px={4}>
                        <Stat size="sm">
                            <HStack spacing={2} mb={1}>
                                <Flame size={16} color={config.test5} />
                                <StatLabel fontSize="xs" color="gray.500">Avg Daily Diff</StatLabel>
                            </HStack>
                            <StatNumber fontSize="xl" color={
                                isWeightLoss 
                                    ? (complianceStats.avgDailyDiff <= 0 ? config.test5 : 'red.500')
                                    : (complianceStats.avgDailyDiff >= 0 ? config.test5 : 'red.500')
                            }>
                                {complianceStats.avgDailyDiff >= 0 ? '+' : ''}{Math.round(complianceStats.avgDailyDiff)}
                            </StatNumber>
                            <StatHelpText fontSize="xs" mb={0}>kcal vs target</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* TDEE, Target, and Weight Chart */}
            <Card bg="white" shadow="sm" mb={6}>
                <CardHeader pb={2}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <Heading size="sm" color={config.black}>Progress Over Time</Heading>
                        <ButtonGroup size="xs" isAttached variant="outline">
                            <Button
                                onClick={() => setShowCalories(!showCalories)}
                                bg={showCalories ? '#EEF2FF' : 'transparent'}
                                borderColor="#6366F1"
                                color={showCalories ? '#6366F1' : 'gray.400'}
                                _hover={{ bg: '#EEF2FF' }}
                            >
                                Kcal
                            </Button>
                            <Button
                                onClick={() => setShowTarget(!showTarget)}
                                bg={showTarget ? '#FFF1F2' : 'transparent'}
                                borderColor="#FB7185"
                                color={showTarget ? '#E11D48' : 'gray.400'}
                                _hover={{ bg: '#FFF1F2' }}
                            >
                                Kcal Target
                            </Button>
                            <Button
                                onClick={() => setShowTdee(!showTdee)}
                                bg={showTdee ? '#FEF3C7' : 'transparent'}
                                borderColor="#F59E0B"
                                color={showTdee ? '#D97706' : 'gray.400'}
                                _hover={{ bg: '#FEF3C7' }}
                            >
                                TDEE
                            </Button>
                            <Button
                                onClick={() => setShowWeight(!showWeight)}
                                bg={showWeight ? '#D1FAE5' : 'transparent'}
                                borderColor="#10B981"
                                color={showWeight ? '#059669' : 'gray.400'}
                                _hover={{ bg: '#D1FAE5' }}
                            >
                                Weight
                            </Button>
                            <Button
                                onClick={() => setShowProjectedWeight(!showProjectedWeight)}
                                bg={showProjectedWeight ? '#D1FAE5' : 'transparent'}
                                borderColor="#10B981"
                                color={showProjectedWeight ? '#059669' : 'gray.400'}
                                _hover={{ bg: '#D1FAE5' }}
                            >
                                Goal
                            </Button>
                        </ButtonGroup>
                    </Flex>
                </CardHeader>
                <CardBody>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis 
                                dataKey="dateLabel" 
                                tick={{ fontSize: 11, fill: '#666' }}
                                tickLine={{ stroke: '#e0e0e0' }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis 
                                yAxisId="left"
                                tick={{ fontSize: 11, fill: '#666' }}
                                tickLine={{ stroke: '#e0e0e0' }}
                                axisLine={{ stroke: '#e0e0e0' }}
                                domain={['dataMin - 200', 'dataMax + 200']}
                                label={{ value: 'kcal', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#999' }}
                            />
                            {(showWeight || showProjectedWeight) && (
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: '#666' }}
                                    tickLine={{ stroke: '#e0e0e0' }}
                                    axisLine={{ stroke: '#e0e0e0' }}
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    label={{ value: weightUnit, angle: 90, position: 'insideRight', fontSize: 11, fill: '#999' }}
                                />
                            )}
                            <RechartsTooltip 
                                contentStyle={{ 
                                    fontSize: 14, 
                                    backgroundColor: 'rgba(255,255,255,0.96)',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 6,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                labelStyle={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                    marginBottom: 4
                                }}
                                formatter={(value: any, name: string) => {
                                    if ((name === 'Weight' || name === 'Goal') && value) return [<span style={{ fontWeight: 600, fontSize: 14 }}>{Number(value).toFixed(1)} {weightUnit}</span>, name];
                                    if (value) return [<span style={{ fontWeight: 600, fontSize: 14 }}>{Math.round(value)} kcal</span>, name];
                                    return [<span style={{ fontWeight: 600, fontSize: 14 }}>-</span>, name];
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Brush 
                                dataKey="dateLabel"
                                height={30}
                                stroke="#6366F1"
                                fill="#f8f9fa"
                                tickFormatter={(value) => value}
                            />
                            {showCalories && (
                                <Bar
                                    yAxisId="left"
                                    dataKey="kcal"
                                    name="Kcal"
                                    fill="#6366F1"
                                    radius={[3, 3, 0, 0]}
                                />
                            )}
                            {showTarget && (
                                <Line
                                    yAxisId="left"
                                    type="stepAfter"
                                    dataKey="target"
                                    name="Kcal Target"
                                    stroke="#FB7185"
                                    strokeWidth={4}
                                    dot={false}
                                />
                            )}
                            {showTdee && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="tdee"
                                    name="TDEE"
                                    stroke="#F59E0B"
                                    strokeWidth={4}
                                    dot={false}
                                />
                            )}
                            {showWeight && (
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="weight"
                                    name="Weight"
                                    stroke="#10B981"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                                    connectNulls
                                />
                            )}
                            {showProjectedWeight && (
                                <Line
                                    yAxisId="right"
                                    type="stepAfter"
                                    dataKey="projectedWeight"
                                    name="Goal"
                                    stroke="#10B981"
                                    strokeWidth={4}
                                    strokeDasharray="8 4"
                                    dot={false}
                                    opacity={0.6}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>

            {/* Weekly Performance Bar Chart */}
            <Card bg="white" shadow="sm" mb={6}>
                <CardHeader pb={0}>
                    <Heading size="sm" color={config.black}>Weekly Calorie Averages</Heading>
                </CardHeader>
                <CardBody>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis 
                                dataKey="weekLabel" 
                                tick={{ fontSize: 10 }} 
                                interval={0}
                                angle={-15}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <RechartsTooltip 
                                contentStyle={{ fontSize: 12 }}
                                labelFormatter={(label: string) => label}
                                formatter={(value: any, name: string) => [`${value} kcal`, name]}
                            />
                            <Bar dataKey="avgKcal" name="Avg Calories">
                                {weeklyData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.hitTarget ? config.test5 : '#e57373'}
                                    />
                                ))}
                            </Bar>
                            <Bar dataKey="target" name="Calories Target" fill={config.test2} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>

            {/* Heatmap */}
            <Card bg="white" shadow="sm" mb={6}>
                <CardHeader pb={2}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={3}>
                            <Heading size="sm" color={config.black}>Goal Compliance Heatmap</Heading>
                            {yearlyHeatmapData.stats.total > 0 && (
                                <HStack spacing={2}>
                                    <Badge colorScheme="green">{yearlyHeatmapData.stats.hit} hit</Badge>
                                    <Badge colorScheme="red">{yearlyHeatmapData.stats.miss} miss</Badge>
                                    <Badge colorScheme="blue">
                                        {Math.round((yearlyHeatmapData.stats.hit / yearlyHeatmapData.stats.total) * 100)}%
                                    </Badge>
                                </HStack>
                            )}
                        </HStack>
                        <ButtonGroup size="xs" isAttached variant="outline">
                            <Button
                                onClick={() => setHeatmapView('monthly')}
                                bg={heatmapView === 'monthly' ? config.test2 : 'transparent'}
                                borderColor={config.test5}
                                color={heatmapView === 'monthly' ? config.test5 : 'gray.400'}
                            >
                                Monthly
                            </Button>
                            <Button
                                onClick={() => setHeatmapView('yearly')}
                                bg={heatmapView === 'yearly' ? config.test2 : 'transparent'}
                                borderColor={config.test5}
                                color={heatmapView === 'yearly' ? config.test5 : 'gray.400'}
                            >
                                Yearly
                            </Button>
                        </ButtonGroup>
                    </Flex>
                </CardHeader>
                <CardBody>
                    {heatmapView === 'monthly' ? (
                        /* Monthly View */
                        <VStack spacing={6} align="stretch">
                            {heatmapData.map(month => (
                                <Box key={month.month}>
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="bold" color={config.black}>{month.monthLabel}</Text>
                                        <HStack spacing={2}>
                                            <Badge colorScheme="green" size="sm">{month.stats.hit}</Badge>
                                            <Badge colorScheme="red" size="sm">{month.stats.miss}</Badge>
                                            {month.stats.total > 0 && (
                                                <Badge colorScheme="blue" size="sm">
                                                    {Math.round((month.stats.hit / month.stats.total) * 100)}%
                                                </Badge>
                                            )}
                                        </HStack>
                                    </Flex>
                                    <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <GridItem key={`header-${i}`}>
                                                <Text fontSize="xs" color="gray.400" textAlign="center">{day}</Text>
                                            </GridItem>
                                        ))}
                                        {/* Add empty cells for offset */}
                                        {month.days.length > 0 && Array.from({ length: month.days[0].dayOfWeek }).map((_, i) => (
                                            <GridItem key={`empty-${i}`}>
                                                <Box h="24px" />
                                            </GridItem>
                                        ))}
                                        {month.days.map((day) => (
                                            <GridItem key={day.date}>
                                                <Tooltip 
                                                    label={`${format(parseISO(day.date), 'MMM d')}: ${day.status}`}
                                                    fontSize="xs"
                                                >
                                                    <Box
                                                        h="24px"
                                                        bg={
                                                            day.status === 'hit' ? config.test5 :
                                                            day.status === 'miss' ? '#e57373' :
                                                            day.status === 'future' ? 'gray.100' :
                                                            config.orange
                                                        }
                                                        borderRadius="sm"
                                                        opacity={day.status === 'future' ? 0.3 : 1}
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                    >
                                                        <Text fontSize="9px" color={day.status === 'future' ? 'gray.400' : 'white'}>
                                                            {day.dayOfMonth}
                                                        </Text>
                </Box>
                                                </Tooltip>
            </GridItem>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </VStack>
                    ) : (
                        /* Yearly View (GitHub-style) */
                        <Box>
                            {/* Day labels */}
                            <Flex>
                                <VStack spacing={0} mr={2} justify="space-around" h="98px">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                        <Text key={day} fontSize="9px" color="gray.400" h="14px" lineHeight="14px">
                                            {i % 2 === 1 ? day : ''}
                                        </Text>
                                    ))}
                                </VStack>
                                
                                {/* Weeks grid */}
                                <Box overflowX="auto" flex={1}>
                                    <HStack spacing={0.5} align="flex-start">
                                        {yearlyHeatmapData.weeks.map((week, weekIdx) => (
                                            <VStack key={weekIdx} spacing={0.5}>
                                                {/* Pad incomplete weeks */}
                                                {week.length < 7 && weekIdx === yearlyHeatmapData.weeks.length - 1 && 
                                                    Array.from({ length: 7 - week.length }).map((_, i) => (
                                                        <Box key={`pad-end-${i}`} w="14px" h="14px" />
                                                    ))
                                                }
                                                {week.map((day, dayIdx) => (
                                                    <Tooltip
                                                        key={`${weekIdx}-${dayIdx}`}
                                                        label={day.status === 'outside' ? '' : day.date ? `${format(parseISO(day.date), 'MMM d, yyyy')}: ${day.status}` : ''}
                                                        fontSize="xs"
                                                        isDisabled={day.status === 'outside' || !day.date}
                                                    >
                                                        <Box
                                                            w="14px"
                                                            h="14px"
                                                            bg={
                                                                day.status === 'outside' ? 'transparent' :
                                                                day.status === 'hit' ? config.test5 :
                                                                day.status === 'miss' ? '#e57373' :
                                                                day.status === 'future' ? 'gray.100' :
                                                                config.orange
                                                            }
                                                            borderRadius="sm"
                                                            opacity={day.status === 'future' ? 0.3 : 1}
                                                            border={day.status === 'outside' ? 'none' : '1px solid'}
                                                            borderColor={
                                                                day.status === 'outside' ? 'transparent' :
                                                                day.status === 'hit' ? config.test4 :
                                                                day.status === 'miss' ? '#c62828' :
                                                                day.status === 'future' ? 'gray.200' :
                                                                '#e65100'
                                                            }
                                                        />
                                                    </Tooltip>
                                                ))}
                                            </VStack>
                                        ))}
                                    </HStack>
                                </Box>
                            </Flex>
                        </Box>
                    )}
                    
                    {/* Legend */}
                    <Flex justify="center" gap={4} mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
                        <HStack spacing={1}>
                            <Box w={3} h={3} borderRadius="sm" bg={config.test5} />
                            <Text fontSize="xs" color="gray.500">On target</Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Box w={3} h={3} borderRadius="sm" bg="#e57373" />
                            <Text fontSize="xs" color="gray.500">Off target</Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Box w={3} h={3} borderRadius="sm" bg={config.orange} />
                            <Text fontSize="xs" color="gray.500">Missing</Text>
                        </HStack>
                    </Flex>
                </CardBody>
            </Card>

            {/* Best & Worst Weeks */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {weekAnalysis.best && (
                    <Card bg="white" shadow="sm" borderLeft="4px solid" borderColor={config.test5}>
                        <CardBody py={4}>
                            <HStack spacing={3}>
                                <Box p={2} bg={config.test2} borderRadius="md">
                                    <Award size={24} color={config.test5} />
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">Best Week</Text>
                                    <Text fontWeight="bold" color={config.black}>
                                        Week {weekAnalysis.best.weekNumber}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        {weekAnalysis.best.delta > 0 ? '+' : ''}{weekAnalysis.best.delta.toFixed(2)} {weightUnit} • {weekAnalysis.best.avgKcal} kcal avg
                                    </Text>
                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                )}

                {weekAnalysis.worst && weeklyData.length > 1 && (
                    <Card bg="white" shadow="sm" borderLeft="4px solid" borderColor="red.400">
                        <CardBody py={4}>
                            <HStack spacing={3}>
                                <Box p={2} bg="red.50" borderRadius="md">
                                    <AlertTriangle size={24} color="#e57373" />
                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">Worst Week</Text>
                                    <Text fontWeight="bold" color={config.black}>
                                        Week {weekAnalysis.worst.weekNumber}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        {weekAnalysis.worst.delta > 0 ? '+' : ''}{weekAnalysis.worst.delta.toFixed(2)} {weightUnit} • {weekAnalysis.worst.avgKcal} kcal avg
                                    </Text>
                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                )}
            </SimpleGrid>
        </Container>
    );
};

export default Analysis;
