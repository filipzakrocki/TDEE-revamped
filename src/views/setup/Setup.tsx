import React, { useState, useCallback } from 'react';
import {
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    Button,
    Switch,
    Divider,
    Badge,
    Flex,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Alert,
    AlertIcon,
    Tooltip,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import { 
    Calendar, 
    Target, 
    TrendingDown, 
    TrendingUp, 
    Scale, 
    Flame,
    Clock,
    Info,
    CheckCircle,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, remove } from 'firebase/database';
import { addWeeks, format } from 'date-fns';

import { useCalc } from '../../stores/calc/calcStore';
import { useAuth } from '../../stores/auth/authStore';
import { useTDEECalculations } from '../../hooks/useTDEECalculations';
import { database } from '../../firebase/firebase';
import { config } from '../../config';

const Setup: React.FC = () => {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const [isNuking, setIsNuking] = useState(false);
    
    const { user } = useAuth();
    const {
        startDate,
        startWeight,
        goalWeight,
        weeklyChange,
        dailyKcalChange,
        weeksForAvg,
        isMetricSystem,
        initialInputsLocked,
        setStartDate,
        setStartWeight,
        setGoalWeight,
        setWeeklyChange,
        setDailyKcalChange,
        setWeeksForAvg,
        toggleMeasurementSystem,
        lockInitialInputs,
        addNewWeek,
    } = useCalc();

    const {
        currentTdee,
        recommendedDailyIntake,
        weeksToGoal,
        isWeightLoss,
    } = useTDEECalculations();

    const handleNukeData = useCallback(async () => {
        setIsNuking(true);
        
        // Clear legacy/local keys
        try {
            localStorage.removeItem('localState');
            localStorage.removeItem('localStateTimestamp');
            localStorage.removeItem('state');
            localStorage.removeItem('serverStateTimestamp');
            // Also clear our current per-user key if present
            const uidKey = user?.uid ? `tdee-calc-data-${user.uid}` : 'tdee-calc-data';
            localStorage.removeItem(uidKey);
        } catch {}

        if (user?.uid) {
            try {
                await Promise.all([
                    remove(ref(database, `states/${user.uid}`)),
                    remove(ref(database, `manualStates/${user.uid}`))
                ]);
                window.location.reload();
            } catch (err) {
                console.error('Failed to nuke remote data', err);
                setIsNuking(false);
            }
        } else {
            window.location.reload();
        }
    }, [user?.uid]);

    const weightUnit = isMetricSystem ? 'kg' : 'lbs';
    const isSetupComplete = startDate && startWeight > 0 && goalWeight > 0 && weeklyChange > 0;

    const handleStartJourney = () => {
        if (isSetupComplete) {
            lockInitialInputs();
            addNewWeek(); // Add week 1 to start tracking
            navigate('/calculator');
        }
    };

    const handleWeeklyChangeInput = (value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setWeeklyChange(numValue);
        } else if (value === '') {
            setWeeklyChange(0);
        }
    };

    const handleDailyKcalInput = (value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setDailyKcalChange(numValue);
        } else if (value === '') {
            setDailyKcalChange(0);
        }
    };

    return (
        <Container maxW="container.lg" py={6}>
            {/* Header */}
            <VStack spacing={2} mb={8} align="start">
                <Heading size="md" color={config.black}>
                    Setup Your Journey
                </Heading>
                <Text color="gray.600" fontSize="sm">
                    Configure your starting point and goals. This information helps calculate your personalized TDEE.
                </Text>
            </VStack>

            {initialInputsLocked && (
                <Alert status="info" mb={6} borderRadius="lg">
                    <AlertIcon />
                    <Text fontSize="sm">
                        Initial settings are locked after starting your first week. 
                        Some values can still be adjusted.
                    </Text>
                </Alert>
            )}

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Left Column - Input Cards */}
                <VStack spacing={5} align="stretch">
                    
                    {/* Measurement System Toggle */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <CardBody>
                            <HStack justify="space-between" align="center">
                                <HStack spacing={3}>
                                    <Box 
                                        p={2} 
                                        bg={config.backgroundNav} 
                                        borderRadius="lg"
                                    >
                                        <Scale size={20} color={config.test4} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium" fontSize="sm">
                                            Measurement System
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            Choose your preferred units
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack spacing={3}>
                                    <Text 
                                        fontSize="sm" 
                                        fontWeight={!isMetricSystem ? 'bold' : 'normal'}
                                        color={!isMetricSystem ? config.test5 : 'gray.500'}
                                    >
                                        lbs
                                    </Text>
                                    <Switch 
                                        isChecked={isMetricSystem}
                                        onChange={toggleMeasurementSystem}
                                        colorScheme="green"
                                        size="lg"
                                        isDisabled={initialInputsLocked}
                                    />
                                    <Text 
                                        fontSize="sm" 
                                        fontWeight={isMetricSystem ? 'bold' : 'normal'}
                                        color={isMetricSystem ? config.test5 : 'gray.500'}
                                    >
                                        kg
                                    </Text>
                                </HStack>
                            </HStack>
                        </CardBody>
                    </Card>

                    {/* Start Date */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <CardBody>
                            <HStack spacing={3} mb={4}>
                                <Box p={2} bg={config.backgroundNav} borderRadius="lg">
                                    <Calendar size={20} color={config.test4} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm">Start Date</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        When does your journey begin?
                                    </Text>
                                </VStack>
                            </HStack>
                            <FormControl>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    size="lg"
                                    bg={config.backgroundNav}
                                    border="2px solid"
                                    borderColor="transparent"
                                    _hover={{ borderColor: config.test3 }}
                                    _focus={{ borderColor: config.test5, boxShadow: 'none' }}
                                    isDisabled={initialInputsLocked}
                                />
                            </FormControl>
                        </CardBody>
                    </Card>

                    {/* Weight Settings */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <CardBody>
                            <HStack spacing={3} mb={4}>
                                <Box p={2} bg={config.backgroundNav} borderRadius="lg">
                                    <Target size={20} color={config.test4} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm">Weight Goals</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        Your starting point and target
                                    </Text>
                                </VStack>
                            </HStack>
                            
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs" color="gray.600" mb={1}>
                                        Starting Weight
                                    </FormLabel>
                                    <InputGroup size="lg">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={startWeight || ''}
                                            onChange={(e) => setStartWeight(parseFloat(e.target.value) || 0)}
                                            placeholder="e.g. 80"
                                            bg={config.backgroundNav}
                                            border="2px solid"
                                            borderColor="transparent"
                                            _hover={{ borderColor: config.test3 }}
                                            _focus={{ borderColor: config.test5, boxShadow: 'none' }}
                                            isDisabled={initialInputsLocked}
                                        />
                                        <InputRightAddon bg={config.test2} color={config.black}>
                                            {weightUnit}
                                        </InputRightAddon>
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs" color="gray.600" mb={1}>
                                        Goal Weight
                                    </FormLabel>
                                    <InputGroup size="lg">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={goalWeight || ''}
                                            onChange={(e) => setGoalWeight(parseFloat(e.target.value) || 0)}
                                            placeholder="e.g. 70"
                                            bg={config.backgroundNav}
                                            border="2px solid"
                                            borderColor="transparent"
                                            _hover={{ borderColor: config.test3 }}
                                            _focus={{ borderColor: config.test5, boxShadow: 'none' }}
                                        />
                                        <InputRightAddon bg={config.test2} color={config.black}>
                                            {weightUnit}
                                        </InputRightAddon>
                                    </InputGroup>
                                </FormControl>

                                {startWeight > 0 && goalWeight > 0 && (
                                    <Flex w="100%" justify="center">
                                        <Badge 
                                            colorScheme={isWeightLoss ? 'green' : 'blue'} 
                                            fontSize="xs"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            <HStack spacing={1}>
                                                {isWeightLoss ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                                <Text>
                                                    {isWeightLoss ? 'Weight Loss' : 'Weight Gain'} Goal: {Math.abs(startWeight - goalWeight).toFixed(1)} {weightUnit}
                                                </Text>
                                            </HStack>
                                        </Badge>
                                    </Flex>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Rate of Change */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <CardBody>
                            <HStack spacing={3} mb={4}>
                                <Box p={2} bg={config.backgroundNav} borderRadius="lg">
                                    <Flame size={20} color={config.test4} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm">Rate of Change</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        How fast do you want to progress?
                                    </Text>
                                </VStack>
                                <Tooltip 
                                    label="0.5 kg/week is recommended for sustainable results. Adjust based on your goals."
                                    fontSize="xs"
                                    placement="top"
                                >
                                    <Box cursor="help">
                                        <Info size={16} color={config.test3} />
                                    </Box>
                                </Tooltip>
                            </HStack>
                            
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs" color="gray.600" mb={1}>
                                        Weekly Weight Change
                                    </FormLabel>
                                    <InputGroup size="lg">
                                        {startWeight > 0 && goalWeight > 0 && (
                                            <InputLeftAddon 
                                                bg={config.test2} 
                                                color={config.black}
                                                fontWeight="bold"
                                                minW="50px"
                                                justifyContent="center"
                                            >
                                                {isWeightLoss ? '−' : '+'}
                                            </InputLeftAddon>
                                        )}
                                        <Input
                                            type="number"
                                            step="0.05"
                                            value={weeklyChange || ''}
                                            onChange={(e) => handleWeeklyChangeInput(e.target.value)}
                                            placeholder="e.g. 0.5"
                                            bg={config.backgroundNav}
                                            border="2px solid"
                                            borderColor="transparent"
                                            _hover={{ borderColor: config.test3 }}
                                            _focus={{ borderColor: config.test5, boxShadow: 'none' }}
                                        />
                                        <InputRightAddon bg={config.test2} color={config.black}>
                                            {weightUnit}/week
                                        </InputRightAddon>
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs" color="gray.600" mb={1}>
                                        Daily Calorie {isWeightLoss ? 'Deficit' : 'Surplus'}
                                    </FormLabel>
                                    <InputGroup size="lg">
                                        {startWeight > 0 && goalWeight > 0 && (
                                            <InputLeftAddon 
                                                bg={config.test2} 
                                                color={config.black}
                                                fontWeight="bold"
                                                minW="50px"
                                                justifyContent="center"
                                            >
                                                {isWeightLoss ? '−' : '+'}
                                            </InputLeftAddon>
                                        )}
                                        <Input
                                            type="number"
                                            step="50"
                                            value={Math.abs(dailyKcalChange) || ''}
                                            onChange={(e) => handleDailyKcalInput(e.target.value)}
                                            placeholder="e.g. 500"
                                            bg={config.backgroundNav}
                                            border="2px solid"
                                            borderColor="transparent"
                                            _hover={{ borderColor: config.test3 }}
                                            _focus={{ borderColor: config.test5, boxShadow: 'none' }}
                                        />
                                        <InputRightAddon bg={config.test2} color={config.black}>
                                            kcal/day
                                        </InputRightAddon>
                                    </InputGroup>
                                </FormControl>

                                <Text fontSize="xs" color="gray.500" textAlign="center">
                                    These values are linked: changing one updates the other
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Advanced Settings */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <CardBody>
                            <HStack spacing={3} mb={4}>
                                <Box p={2} bg={config.backgroundNav} borderRadius="lg">
                                    <Clock size={20} color={config.test4} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm">TDEE Calculation</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        How many weeks to average
                                    </Text>
                                </VStack>
                            </HStack>
                            
                            <FormControl>
                                <FormLabel fontSize="xs" color="gray.600" mb={1}>
                                    Weeks for Average (recommended: 2-3)
                                </FormLabel>
                                <InputGroup size="lg">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={8}
                                        value={weeksForAvg}
                                        onChange={(e) => setWeeksForAvg(parseInt(e.target.value, 10) || 2)}
                                        bg={config.backgroundNav}
                                        border="2px solid"
                                        borderColor="transparent"
                                        _hover={{ borderColor: config.test3 }}
                                        _focus={{ borderColor: config.test5, boxShadow: 'none' }}
                                    />
                                    <InputRightAddon bg={config.test2} color={config.black}>
                                        weeks
                                    </InputRightAddon>
                                </InputGroup>
                            </FormControl>
                        </CardBody>
                    </Card>

                    {/* Danger Zone */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="red.200">
                        <CardBody>
                            <HStack spacing={3} mb={4}>
                                <Box p={2} bg="red.50" borderRadius="lg">
                                    <AlertTriangle size={20} color="#E53E3E" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium" fontSize="sm" color="red.600">
                                        Danger Zone
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        Irreversible actions
                                    </Text>
                                </VStack>
                            </HStack>
                            
                            <VStack spacing={3} align="stretch">
                                <Text fontSize="xs" color="gray.600">
                                    This will permanently delete all your data including weight entries, 
                                    calorie logs, and settings. This action cannot be undone.
                                </Text>
                                <Button
                                    leftIcon={<Trash2 size={16} />}
                                    colorScheme="red"
                                    variant="outline"
                                    size="sm"
                                    onClick={onOpen}
                                >
                                    Delete All Data
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>

                {/* Right Column - Summary & Preview */}
                <VStack spacing={5} align="stretch">
                    {/* Summary Card */}
                    <Card 
                        bg={config.test5} 
                        color="white" 
                        shadow="lg"
                    >
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <Heading size="sm" fontWeight="semibold">
                                    Your Plan Summary
                                </Heading>
                                
                                <Divider borderColor="whiteAlpha.300" />

                                <SimpleGrid columns={2} spacing={4}>
                                    <Stat>
                                        <StatLabel fontSize="xs" opacity={0.8}>Estimated TDEE</StatLabel>
                                        <StatNumber fontSize="2xl">
                                            {currentTdee > 0 ? currentTdee.toLocaleString() : '—'}
                                        </StatNumber>
                                        <StatHelpText fontSize="xs" opacity={0.8}>kcal/day</StatHelpText>
                                    </Stat>

                                    <Stat>
                                        <StatLabel fontSize="xs" opacity={0.8}>Daily Target</StatLabel>
                                        <StatNumber fontSize="2xl">
                                            {recommendedDailyIntake > 0 ? recommendedDailyIntake.toLocaleString() : '—'}
                                        </StatNumber>
                                        <StatHelpText fontSize="xs" opacity={0.8}>
                                            {dailyKcalChange > 0 && currentTdee > 0
                                                ? `${isWeightLoss ? 'deficit' : 'surplus'}`
                                                : 'kcal/day'
                                            }
                                        </StatHelpText>
                                    </Stat>

                                    <Stat>
                                        <StatLabel fontSize="xs" opacity={0.8}>Weekly Goal</StatLabel>
                                        <StatNumber fontSize="2xl">
                                            {weeklyChange > 0 ? `${isWeightLoss ? '-' : '+'}${weeklyChange}` : '—'}
                                        </StatNumber>
                                        <StatHelpText fontSize="xs" opacity={0.8}>{weightUnit}/week</StatHelpText>
                                    </Stat>

                                    <Stat>
                                        <StatLabel fontSize="xs" opacity={0.8}>Goal Date</StatLabel>
                                        <StatNumber fontSize="xl">
                                            {weeksToGoal > 0 ? format(addWeeks(new Date(), weeksToGoal), 'MMM d, yyyy') : '—'}
                                        </StatNumber>
                                        <StatHelpText fontSize="xs" opacity={0.8}>
                                            {weeksToGoal > 0 ? `${weeksToGoal} weeks` : ''}
                                        </StatHelpText>
                                    </Stat>
                                </SimpleGrid>

                                <Divider borderColor="whiteAlpha.300" />

                                {/* Progress indicator */}
                                <VStack spacing={2}>
                                    <HStack w="100%" justify="space-between" fontSize="xs">
                                        <Text opacity={0.8}>Setup Progress</Text>
                                        <Text fontWeight="bold">
                                            {[startDate, startWeight > 0, goalWeight > 0, weeklyChange > 0].filter(Boolean).length}/4
                                        </Text>
                                    </HStack>
                                    <HStack spacing={2} w="100%">
                                        {[
                                            { done: !!startDate, label: 'Date' },
                                            { done: startWeight > 0, label: 'Start' },
                                            { done: goalWeight > 0, label: 'Goal' },
                                            { done: weeklyChange > 0, label: 'Rate' },
                                        ].map((step, i) => (
                                            <Box
                                                key={i}
                                                flex={1}
                                                h={2}
                                                borderRadius="full"
                                                bg={step.done ? 'whiteAlpha.900' : 'whiteAlpha.300'}
                                                transition="all 0.3s"
                                            />
                                        ))}
                                    </HStack>
                                </VStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Tips Card */}
                    <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <CardBody>
                            <VStack align="start" spacing={3}>
                                <Heading size="xs" color={config.test4}>
                                    Tips for Success
                                </Heading>
                                <VStack align="start" spacing={2} fontSize="xs" color="gray.600">
                                    <HStack align="start">
                                        <CheckCircle size={14} color={config.test5} style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Text>Weigh yourself at the same time each day for consistency</Text>
                                    </HStack>
                                    <HStack align="start">
                                        <CheckCircle size={14} color={config.test5} style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Text>Track your food intake accurately - every calorie counts</Text>
                                    </HStack>
                                    <HStack align="start">
                                        <CheckCircle size={14} color={config.test5} style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Text>A 0.5 {weightUnit}/week rate is sustainable for most people</Text>
                                    </HStack>
                                    <HStack align="start">
                                        <CheckCircle size={14} color={config.test5} style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Text>Your TDEE will become more accurate after 2-3 weeks of data</Text>
                                    </HStack>
                                </VStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Start Button */}
                    <Button
                        size="lg"
                        bg={isSetupComplete ? config.test5 : 'gray.300'}
                        color="white"
                        _hover={{ 
                            bg: isSetupComplete ? config.test4 : 'gray.300',
                            transform: isSetupComplete ? 'translateY(-2px)' : 'none',
                        }}
                        _active={{ bg: config.test4 }}
                        shadow={isSetupComplete ? 'lg' : 'none'}
                        transition="all 0.2s"
                        onClick={handleStartJourney}
                        isDisabled={!isSetupComplete || initialInputsLocked}
                        leftIcon={<CheckCircle size={20} />}
                    >
                        {initialInputsLocked ? 'Journey Already Started' : 'Start Your Journey'}
                    </Button>

                    {!isSetupComplete && (
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                            Complete all fields above to begin tracking
                        </Text>
                    )}
                </VStack>
            </SimpleGrid>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            <HStack spacing={2}>
                                <AlertTriangle size={20} color="#E53E3E" />
                                <Text>Delete All Data</Text>
                            </HStack>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack align="start" spacing={3}>
                                <Text>
                                    Are you absolutely sure? This will permanently delete:
                                </Text>
                                <VStack align="start" spacing={1} pl={4} fontSize="sm" color="gray.600">
                                    <Text>• All weight entries</Text>
                                    <Text>• All calorie logs</Text>
                                    <Text>• Your setup and preferences</Text>
                                    <Text>• All calculated TDEE data</Text>
                                </VStack>
                                <Alert status="error" borderRadius="md" fontSize="sm">
                                    <AlertIcon />
                                    This action cannot be undone.
                                </Alert>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="red" 
                                onClick={handleNukeData} 
                                ml={3}
                                isLoading={isNuking}
                                loadingText="Deleting..."
                            >
                                Delete Everything
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
};

export default Setup;
