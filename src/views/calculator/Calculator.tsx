import React, { useEffect, useCallback } from 'react';

import { Button, Container, Grid, Heading, Spinner } from '@chakra-ui/react';

import WeekRow from '../../components/WeekRow';
import NewWeekButton from '../../components/NewWeekButton';

import TDEECard from './components/TDEECard';
import WeekSummary from './components/WeekSummary';

import { useAuthStore } from '../../stores/auth/authStore';
import { useCalcStore } from '../../stores/calc/calcStore';
import { useInterfaceStore } from '../../stores/interface/interfaceStore';

const Calculator: React.FC = () => {
    const user = useAuthStore(state => state.user);
    const fetchData = useCalcStore(state => state.fetchData);
    const weekData = useCalcStore(state => state.weekData);
    const startDate = useCalcStore(state => state.startDate);

    const loading = useInterfaceStore(state => state.loading);

    const handleFetchData = useCallback(async () => {
        if (!user?.uid) return;
        fetchData(user.uid);
    }, [user?.uid, fetchData]);

    useEffect(() => {
        handleFetchData();
    }, [handleFetchData]);

    const getWeekData = () => {
        return weekData.filter(w => w.week);
    };

    return (
        <Container minW='100%'>
            <Heading size={'xl'} mt={1} mb={5} >Welcome Back!</Heading>
            <Heading size={'md'} my={5} >This is week 4 of your diet! You have lost 12kg so far!</Heading>

            <TDEECard date='yesterday' totalEnergyExpenditure={2300} />
            <WeekSummary />

            <NewWeekButton />
            <Button 
                onClick={handleFetchData} 
                isDisabled={!user}
            >
                Fetch Data
            </Button>

            {loading ? (
                <Spinner size="xl" />
            ) : (
                <Grid templateColumns="repeat(8, 1fr)" gap={4} mt={4}>
                    {getWeekData().reverse().map((week, rowIndex) => (
                        <WeekRow key={rowIndex} week={week} rowIndex={rowIndex} startDate={startDate} />
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Calculator;