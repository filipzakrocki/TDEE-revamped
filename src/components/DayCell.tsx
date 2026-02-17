import React from 'react';
import { 
    Box, 
    Text, 
    Input, 
    VStack, 
    HStack, 
    Badge, 
    InputGroup, 
    InputLeftElement 
} from '@chakra-ui/react';
import { Calendar, Weight, Utensils } from 'lucide-react';
import { constants } from '../utils/constants';
import useCalcDate from '../utils/useCalcDate';
import { useCalc } from '../stores/calc/calcStore';
import { format, parseISO } from 'date-fns';
import { config } from '../config';

interface DayCellProps {
    day: any;
    dayIndex: number;
    rowIndex: number;
    startDate: string;
    weekNumber?: any;
    isEditable?: boolean;
}

const DayCell: React.FC<DayCellProps> = ({ day, dayIndex, rowIndex, weekNumber, startDate, isEditable = true }) => {
    const { updateDay } = useCalc();

    const normalizedStartDate = ((): string => {
        if (!startDate) return new Date().toISOString().slice(0, 10);
        const parsed = parseISO(startDate);
        return isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : startDate;
    })();

    const dayDate = useCalcDate(normalizedStartDate, weekNumber, dayIndex);

    const handleChange = (dayIndex: number, weekNumber: number, type: 'kg' | 'kcal', e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateDay({ type, dayIndex, weekNumber, value: value as number | '' });
    };


    const today = new Date();
    const isToday = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    const isPast = dayDate < today && !isToday;
    const isFuture = dayDate > today;
    const hasData = (day.kcal && day.kcal !== '') || (day.kg && day.kg !== '');

    return (
        <Box
            key={`row${rowIndex}-week${weekNumber}-day${dayIndex}`}
            p={4}
            bg={isEditable ? 'white' : config.backgroundNav}
            border="2px solid"
            borderColor={isToday ? config.test5 : 'transparent'}
            borderRadius="xl"
            boxShadow={isEditable ? 'lg' : 'sm'}
            _hover={{ 
                transform: isEditable ? 'translateY(-2px)' : 'none', 
                boxShadow: isEditable ? 'xl' : 'sm',
                borderColor: isEditable ? config.test3 : 'transparent'
            }}
            transition="all 0.3s ease"
            position="relative"
            overflow="hidden"
        >
            {/* Header with day info */}
            <VStack spacing={2} mb={3}>
                <HStack justify="center" spacing={1}>
                    <Calendar size={12} color={config.test4} />
                    <Text 
                        fontSize="xs" 
                        fontWeight="bold" 
                        color={config.test4}
                        textTransform="uppercase"
                        letterSpacing="wide"
                    >
                        {format(dayDate, constants.dayOfWeekFormat)}
                    </Text>
                </HStack>
                <Text 
                    fontSize="sm" 
                    fontWeight="semibold" 
                    color={config.black}
                >
                    {format(dayDate, 'MMM dd')}
                </Text>
                {isToday && (
                    <Badge colorScheme="blue" size="sm" borderRadius="full">
                        Today
                    </Badge>
                )}
                {isPast && !hasData && (
                    <Badge colorScheme="red" size="sm" borderRadius="full">
                        Missing!
                    </Badge>
                )}
                {hasData && !isToday && (
                    <Badge colorScheme="green" size="sm" variant="subtle" borderRadius="full">
                        Complete
                    </Badge>
                )}
                {isFuture && (
                    <Badge colorScheme="gray" size="sm" variant="outline" borderRadius="full">
                        Future
                    </Badge>
                )}
            </VStack>

            {/* Input fields */}
            <VStack spacing={3}>
                <InputGroup size="sm">
                    <InputLeftElement>
                        <Utensils size={14} color={config.test4} />
                    </InputLeftElement>
                    <Input 
                        placeholder="Calories"
                        value={day.kcal ?? ''} 
                        onChange={(e) => handleChange(dayIndex, weekNumber, 'kcal', e)}
                        isReadOnly={!isEditable}
                        bg={!isEditable ? config.backgroundNav : 'white'}
                        border="2px solid"
                        borderColor={!isEditable ? config.test1 : 'gray.200'}
                        _hover={{
                            borderColor: isEditable ? config.test3 : config.test1
                        }}
                        _focus={{
                            borderColor: config.test5,
                            boxShadow: `0 0 0 1px ${config.test5}`
                        }}
                        cursor={!isEditable ? 'not-allowed' : 'text'}
                        borderRadius="lg"
                        fontSize="sm"
                        textAlign="center"
                        fontWeight="medium"
                    />
                </InputGroup>
                
                <InputGroup size="sm">
                    <InputLeftElement>
                        <Weight size={14} color={config.test4} />
                    </InputLeftElement>
                    <Input 
                        placeholder="Weight (kg)"
                        value={day.kg ?? ''}  
                        onChange={(e) => handleChange(dayIndex, weekNumber, 'kg', e)}
                        isReadOnly={!isEditable}
                        bg={!isEditable ? config.backgroundNav : 'white'}
                        border="2px solid"
                        borderColor={!isEditable ? config.test1 : 'gray.200'}
                        _hover={{
                            borderColor: isEditable ? config.test3 : config.test1
                        }}
                        _focus={{
                            borderColor: config.test5,
                            boxShadow: `0 0 0 1px ${config.test5}`
                        }}
                        cursor={!isEditable ? 'not-allowed' : 'text'}
                        borderRadius="lg"
                        fontSize="sm"
                        textAlign="center"
                        fontWeight="medium"
                    />
                </InputGroup>
            </VStack>

            {/* Decorative accent for locked cells */}
            {!isEditable && (
                <Box
                    position="absolute"
                    top={0}
                    right={0}
                    w={4}
                    h={4}
                    bg={config.test1}
                    clipPath="polygon(100% 0%, 0% 0%, 100% 100%)"
                />
            )}
        </Box>
    );
};

export default DayCell;