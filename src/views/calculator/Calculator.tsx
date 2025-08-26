import React, { useEffect, useCallback } from 'react';

import { Button, Container, Heading, Spinner, Flex, Box } from '@chakra-ui/react';

import NewWeekButton from '../../components/NewWeekButton';

import TDEECard from './components/TDEECard';
import WeekSummary from './components/WeekSummary';
import WeekSelector from './components/WeekSelector';

import { useAuth } from '../../stores/auth/authStore';
import { useCalc } from '../../stores/calc/calcStore';
import { useInterface } from '../../stores/interface/interfaceStore';
import { database } from '../../firebase/firebase';
import { ref, remove } from 'firebase/database';

const Calculator: React.FC = () => {
    const { user } = useAuth();
    const { fetchData, weekData, startDate, selectWeek, selectedWeek } = useCalc();
    const { loading, syncing } = useInterface();

    const handleFetchData = useCallback(async () => {
        if (!user?.uid) return;
        fetchData(user.uid);
    }, [user?.uid, fetchData]);

    useEffect(() => {
        handleFetchData();
    }, [handleFetchData]);

    console.log(syncing);

    useEffect(() => {
        const displayWeeks = weekData.filter(w => w.week >= 1);
        if (displayWeeks.length > 0) {
            const latestWeek = Math.max(...displayWeeks.map(w => w.week));
            if (selectedWeek < 1) {
                selectWeek(latestWeek);
            }
        }
    }, [weekData, selectedWeek, selectWeek]);


    const handleNukeData = useCallback(async () => {
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
            }
        } else {
            window.location.reload();
        }
    }, [user?.uid]);

    return (
        <>
        <Container minW='100%'>
            <Heading size={'md'} mt={1} mb={3} fontWeight="bold">Welcome Back!</Heading>
            <Heading size={'sm'} my={3} >This is week 4 of your diet! You have lost 12kg so far!</Heading>

            <Flex wrap="wrap" gap={4} mb={5} justify="space-between">
                <TDEECard date='yesterday' totalEnergyExpenditure={2300} flex="1" />
                <TDEECard date='today' totalEnergyExpenditure={2400} flex="1" />
                <TDEECard date='tomorrow' totalEnergyExpenditure={2350} flex="1" />
                <TDEECard date='last week' totalEnergyExpenditure={2280} flex="1" />
            </Flex>
            <WeekSummary />

            <NewWeekButton />
            <Flex gap={2} mt={2}>
                <Button 
                    onClick={handleFetchData} 
                    isDisabled={!user}
                >
                    Fetch Data
                </Button>
                <Button 
                    colorScheme='red'
                    variant='outline'
                    onClick={handleNukeData}
                >
                    Nuke Data
                </Button>
            </Flex>

            <WeekSelector startDate={startDate} />
        </Container>
        {(syncing || loading) && (
            <Box position="fixed" top={4} right={4} zIndex={1000}>
                <Spinner thickness='3px' speed='0.7s' emptyColor='gray.200' color='black.100' size='xl' />
            </Box>
        )}
        </>
    );
};

export default Calculator;