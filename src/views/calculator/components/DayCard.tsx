import React from 'react';
import {
    Box,
    Text,
    Input,
    VStack,
    Badge,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    Flex,
    Tooltip,
    IconButton,
} from '@chakra-ui/react';
import { Utensils, Scale, ClipboardPaste, ChevronUp, ChevronDown } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { config } from '../../../config';
import { useCalc } from '../../../stores/calc/calcStore';
import { useTDEECalculations } from '../../../hooks/useTDEECalculations';

type CopyFromState = {
    type: 'kcal' | 'kg';
    value: number | '';
    weekNumber: number;
    dayIndex: number;
} | null;

interface DayCardProps {
    dayIndex: number;
    weekNumber: number;
    startDate: string;
    day: {
        kg: number | '';
        kcal: number | '';
    };
    isEditable: boolean;
    weeklyTarget: number; // The target for THIS specific week
    copyFrom: CopyFromState;
    onCopyCalories: (weekNumber: number, dayIndex: number, value: number | '') => void;
    onPasteCalories: (weekNumber: number, dayIndex: number) => void;
    onCopyWeight: (weekNumber: number, dayIndex: number, value: number | '') => void;
    onPasteWeight: (weekNumber: number, dayIndex: number) => void;
    onCancelCopy: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ 
    dayIndex, 
    weekNumber, 
    startDate, 
    day, 
    isEditable,
    weeklyTarget,
    copyFrom,
    onCopyCalories,
    onPasteCalories,
    onCopyWeight,
    onPasteWeight,
    onCancelCopy,
}) => {
    const { updateDay } = useCalc();
    const { isWeightLoss } = useTDEECalculations();
    
    // Calculate the date for this day
    const getDayDate = (): Date => {
        if (!startDate) return new Date();
        try {
            const start = parseISO(startDate);
            return addDays(start, (weekNumber - 1) * 7 + dayIndex);
        } catch {
            return new Date();
        }
    };
    
    const dayDate = getDayDate();
    const today = new Date();
    const isToday = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    const isPast = dayDate < today && !isToday;
    const isFuture = dayDate > today;
    
    const hasKcal = day.kcal !== '' && day.kcal !== 0;
    const hasWeight = day.kg !== '' && day.kg !== 0;
    const hasData = hasKcal || hasWeight;
    
    // Check if user hit their target (based on THIS week's target, not current)
    let hitTarget = false;
    let kcalDiff = 0;
    if (hasKcal && weeklyTarget > 0) {
        const kcal = Number(day.kcal);
        kcalDiff = kcal - weeklyTarget;
        if (isWeightLoss) {
            hitTarget = kcal <= weeklyTarget;
        } else {
            hitTarget = kcal >= weeklyTarget;
        }
    }
    
    // Determine card styling based on status
    const getCardStyle = () => {
        if (isToday) {
            return {
                borderColor: config.test5,
                borderWidth: '3px',
                bg: 'white',
            };
        }
        
        if (hasKcal) {
            return {
                borderColor: hitTarget ? config.test3 : '#d64545',
                borderWidth: '2px',
                bg: hitTarget ? config.green : config.red,
            };
        }
        
        if (isPast && !hasData) {
            return {
                borderColor: config.orange,
                borderWidth: '2px',
                bg: config.orange,
            };
        }
        
        if (isFuture) {
            return {
                borderColor: 'gray.200',
                borderWidth: '1px',
                bg: 'gray.50',
            };
        }
        
        return {
            borderColor: 'gray.200',
            borderWidth: '1px',
            bg: 'white',
        };
    };
    
    const cardStyle = getCardStyle();
    
    const handleChange = (type: 'kg' | 'kcal', e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateDay({ type, dayIndex, weekNumber, value: value === '' ? '' : Number(value) });
    };

    const handleKcalStep = (delta: number) => {
        if (!isEditable) return;
        const current = day.kcal === '' ? 0 : Number(day.kcal);
        const next = Math.max(0, current + delta);
        updateDay({ type: 'kcal', dayIndex, weekNumber, value: next });
    };
    const handleWeightStep = (delta: number) => {
        if (!isEditable) return;
        const current = day.kg === '' ? 0 : Number(day.kg);
        const next = Math.max(0, Math.round((current + delta) * 10) / 10);
        updateDay({ type: 'kg', dayIndex, weekNumber, value: next });
    };

    const isCalorieSource = copyFrom?.type === 'kcal' && copyFrom.weekNumber === weekNumber && copyFrom.dayIndex === dayIndex;
    const isWeightSource = copyFrom?.type === 'kg' && copyFrom.weekNumber === weekNumber && copyFrom.dayIndex === dayIndex;
    const showPasteCalories = copyFrom?.type === 'kcal' && !isCalorieSource;
    const showPasteWeight = copyFrom?.type === 'kg' && !isWeightSource;

    const handleCalorieIconClick = () => {
        if (!isEditable) return;
        if (showPasteCalories) {
            onPasteCalories(weekNumber, dayIndex);
        } else if (isCalorieSource) {
            onCancelCopy();
        } else if (day.kcal !== '') {
            onCopyCalories(weekNumber, dayIndex, day.kcal);
        }
    };
    const handleWeightIconClick = () => {
        if (!isEditable) return;
        if (showPasteWeight) {
            onPasteWeight(weekNumber, dayIndex);
        } else if (isWeightSource) {
            onCancelCopy();
        } else if (day.kg !== '') {
            onCopyWeight(weekNumber, dayIndex, day.kg);
        }
    };
    
    // Get status badge
    const getStatusBadge = () => {
        if (isToday) {
            return <Badge colorScheme="blue" size="sm" borderRadius="full">Today</Badge>;
        }
        if (hasKcal) {
            const diffText = kcalDiff >= 0 ? `+${kcalDiff}` : `${kcalDiff}`;
            return (
                <Badge 
                    colorScheme={hitTarget ? 'green' : 'red'} 
                    size="sm" 
                    borderRadius="full"
                >
                    {diffText} kcal
                </Badge>
            );
        }
        if (isPast && !hasData) {
            return <Badge colorScheme="orange" size="sm" borderRadius="full">Missing</Badge>;
        }
        if (isFuture) {
            return <Badge colorScheme="gray" size="sm" variant="outline" borderRadius="full">Upcoming</Badge>;
        }
        return null;
    };
    
    return (
        <Box
            w="140px"
            maxW="140px"
            mx="auto"
            h="285px"
            minH="285px"
            maxH="285px"
            p={2}
            bg={cardStyle.bg}
            border={`${cardStyle.borderWidth} solid`}
            borderColor={cardStyle.borderColor}
            borderRadius="xl"
            shadow="sm"
            _hover={isEditable ? { shadow: 'md' } : {}}
            transition="all 0.2s"
            opacity={isFuture ? 0.7 : 1}
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {/* Day header - fixed height */}
            <VStack spacing={2} mb={2} flexShrink={0} minH="60px" align="center">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                    {format(dayDate, 'EEE')}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color={config.black}>
                    {format(dayDate, 'MMM d')}
                </Text>
                <Box minH="18px" mt={1} display="flex" alignItems="center" justifyContent="center">
                    {getStatusBadge()}
                </Box>
            </VStack>

            {/* Input fields - centered in middle */}
            <VStack spacing={4} flex={1} minH={0} justify="center">
                <Box w="100%">
                    <Text fontSize="xs" color="gray.500" mb={0} lineHeight="1">Calories</Text>
                    <InputGroup size="sm">
                        <InputLeftAddon bg="white" borderColor="gray.200" minW="28px" h="30px" alignItems="center" justifyContent="center">
                            <Tooltip
                                label={
                                    showPasteCalories ? 'Paste calories here' :
                                    isCalorieSource ? 'Cancel copy' :
                                    day.kcal !== '' ? 'Copy calories to other days' : 'Enter a value to copy'
                                }
                                fontSize="xs"
                                placement="top"
                            >
                                <Box
                                    as="button"
                                    type="button"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor={isEditable ? 'pointer' : 'default'}
                                    _hover={isEditable ? { opacity: 0.8 } : undefined}
                                    onClick={handleCalorieIconClick}
                                    aria-label={showPasteCalories ? 'Paste calories' : isCalorieSource ? 'Cancel copy' : day.kcal !== '' ? 'Copy calories' : 'Enter a value to copy'}
                                >
                                    {showPasteCalories ? (
                                        <ClipboardPaste size={14} color={config.test4} />
                                    ) : (
                                        <Utensils size={14} color={config.test4} />
                                    )}
                                </Box>
                            </Tooltip>
                        </InputLeftAddon>
                        <Input
                            type="number"
                            placeholder="—"
                            value={day.kcal === '' ? '' : day.kcal}
                            onChange={(e) => handleChange('kcal', e)}
                            isReadOnly={!isEditable}
                            bg={isEditable ? 'white' : config.backgroundNav}
                            borderColor="gray.200"
                            _hover={{ borderColor: isEditable ? config.test3 : 'gray.200' }}
                            _focus={{ borderColor: config.test5, boxShadow: `0 0 0 1px ${config.test5}` }}
                            textAlign="center"
                            fontWeight="semibold"
                            cursor={!isEditable ? 'not-allowed' : 'text'}
                            fontSize="xs"
                            h="30px"
                        />
                        <InputRightAddon p={0} h="30px" w="20px" bg="white" borderColor="gray.200" display="flex" flexDirection="column">
                            <IconButton
                                aria-label="Increase calories"
                                icon={<ChevronUp size={12} />}
                                size="xs"
                                variant="ghost"
                                minW="20px"
                                h="15px"
                                isDisabled={!isEditable}
                                onClick={() => handleKcalStep(10)}
                            />
                            <IconButton
                                aria-label="Decrease calories"
                                icon={<ChevronDown size={12} />}
                                size="xs"
                                variant="ghost"
                                minW="20px"
                                h="15px"
                                isDisabled={!isEditable}
                                onClick={() => handleKcalStep(-10)}
                            />
                        </InputRightAddon>
                    </InputGroup>
                </Box>
                <Box w="100%">
                    <Text fontSize="xs" color="gray.500" mb={0} lineHeight="1">Weight</Text>
                    <InputGroup size="sm">
                        <InputLeftAddon bg="white" borderColor="gray.200" minW="28px" h="30px" alignItems="center" justifyContent="center">
                            <Tooltip
                                label={
                                    showPasteWeight ? 'Paste weight here' :
                                    isWeightSource ? 'Cancel copy' :
                                    day.kg !== '' ? 'Copy weight to other days' : 'Enter a value to copy'
                                }
                                fontSize="xs"
                                placement="top"
                            >
                                <Box
                                    as="button"
                                    type="button"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor={isEditable ? 'pointer' : 'default'}
                                    _hover={isEditable ? { opacity: 0.8 } : undefined}
                                    onClick={handleWeightIconClick}
                                    aria-label={showPasteWeight ? 'Paste weight' : isWeightSource ? 'Cancel copy' : day.kg !== '' ? 'Copy weight' : 'Enter a value to copy'}
                                >
                                    {showPasteWeight ? (
                                        <ClipboardPaste size={14} color={config.test4} />
                                    ) : (
                                        <Scale size={14} color={config.test4} />
                                    )}
                                </Box>
                            </Tooltip>
                        </InputLeftAddon>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="—"
                            value={day.kg === '' ? '' : day.kg}
                            onChange={(e) => handleChange('kg', e)}
                            isReadOnly={!isEditable}
                            bg={isEditable ? 'white' : config.backgroundNav}
                            borderColor="gray.200"
                            _hover={{ borderColor: isEditable ? config.test3 : 'gray.200' }}
                            _focus={{ borderColor: config.test5, boxShadow: `0 0 0 1px ${config.test5}` }}
                            textAlign="center"
                            fontWeight="semibold"
                            cursor={!isEditable ? 'not-allowed' : 'text'}
                            fontSize="xs"
                            h="30px"
                        />
                        <InputRightAddon p={0} h="30px" w="20px" bg="white" borderColor="gray.200" display="flex" flexDirection="column">
                            <IconButton
                                aria-label="Increase weight"
                                icon={<ChevronUp size={12} />}
                                size="xs"
                                variant="ghost"
                                minW="20px"
                                h="15px"
                                isDisabled={!isEditable}
                                onClick={() => handleWeightStep(0.1)}
                            />
                            <IconButton
                                aria-label="Decrease weight"
                                icon={<ChevronDown size={12} />}
                                size="xs"
                                variant="ghost"
                                minW="20px"
                                h="15px"
                                isDisabled={!isEditable}
                                onClick={() => handleWeightStep(-0.1)}
                            />
                        </InputRightAddon>
                    </InputGroup>
                </Box>
            </VStack>

            {/* Target - always same row for alignment */}
            <Flex justify="center" pt={2} mt="auto" flexShrink={0} minH="28px" align="center">
                <Text fontSize="xs" color="gray.700">
                    Target: {weeklyTarget > 0 ? weeklyTarget.toLocaleString() : '—'}
                </Text>
            </Flex>
        </Box>
    );
};

export default DayCard;

