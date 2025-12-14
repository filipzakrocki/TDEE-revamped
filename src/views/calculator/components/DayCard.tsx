import React from 'react';
import {
    Box,
    Text,
    Input,
    VStack,
    Badge,
    InputGroup,
    InputLeftAddon,
    Flex,
} from '@chakra-ui/react';
import { Utensils, Scale } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { config } from '../../../config';
import { useCalc } from '../../../stores/calc/calcStore';
import { useTDEECalculations } from '../../../hooks/useTDEECalculations';

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
}

const DayCard: React.FC<DayCardProps> = ({ 
    dayIndex, 
    weekNumber, 
    startDate, 
    day, 
    isEditable,
    weeklyTarget,
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
            p={4}
            bg={cardStyle.bg}
            border={`${cardStyle.borderWidth} solid`}
            borderColor={cardStyle.borderColor}
            borderRadius="xl"
            shadow="sm"
            _hover={isEditable ? { 
                shadow: 'md',
                transform: 'translateY(-2px)',
            } : {}}
            transition="all 0.2s"
            opacity={isFuture ? 0.7 : 1}
        >
            {/* Day header */}
            <VStack spacing={1} mb={4}>
                <Text 
                    fontSize="xs" 
                    fontWeight="bold" 
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wide"
                >
                    {format(dayDate, 'EEE')}
                </Text>
                <Text 
                    fontSize="lg" 
                    fontWeight="bold" 
                    color={config.black}
                >
                    {format(dayDate, 'MMM d')}
                </Text>
                {getStatusBadge()}
            </VStack>
            
            {/* Input fields */}
            <VStack spacing={3}>
                {/* Calories input */}
                <Box w="100%">
                    <Text fontSize="xs" color="gray.500" mb={1}>Calories</Text>
                    <InputGroup size="sm">
                        <InputLeftAddon bg={config.test2} borderColor="gray.200">
                            <Utensils size={14} color={config.test4} />
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
                        />
                    </InputGroup>
                </Box>
                
                {/* Weight input */}
                <Box w="100%">
                    <Text fontSize="xs" color="gray.500" mb={1}>Weight</Text>
                    <InputGroup size="sm">
                        <InputLeftAddon bg={config.test2} borderColor="gray.200">
                            <Scale size={14} color={config.test4} />
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
                        />
                    </InputGroup>
                </Box>
            </VStack>
            
            {/* Target indicator */}
            {weeklyTarget > 0 && !isFuture && (
                <Flex justify="center" mt={3} pt={2} borderTop="1px dashed" borderColor="gray.200">
                    <Text fontSize="xs" color="gray.400">
                        Target: {weeklyTarget.toLocaleString()}
                    </Text>
                </Flex>
            )}
        </Box>
    );
};

export default DayCard;

