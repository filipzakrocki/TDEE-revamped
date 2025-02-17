import React, { useEffect } from 'react';

import { CalcState } from '../../stores/calc/calcSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { User } from 'firebase/auth';

import { Button, Container, Grid, Heading, Spinner } from '@chakra-ui/react';

import WeekRow from '../../components/WeekRow';
import NewWeekButton from '../../components/NewWeekButton';

import TDEECard from './components/TDEECard';
import WeekSummary from './components/WeekSummary';

import useFetchCalcData from '../../hooks/useFetchCalcData'

const Calculator: React.FC = () => {
    const user: User | null = useSelector((state: RootState) => state.auth.user);
    const calculator: CalcState | null  = useSelector((state: RootState) => state.calc);
    const { loading } = useSelector((state: RootState) => state.interface);

    const { handleFetchData } = useFetchCalcData(user?.uid)

    useEffect(() => {
        handleFetchData()
    }, [handleFetchData])

    const getWeekData = () => {
        const weekData = calculator.weekData;
        return weekData.filter(w => w.week);
    };

    return (
        <Container minW='100%'>
            <Heading size={'xl'} mt={1} mb={5} >Welcome Back!</Heading>
            <Heading size={'md'} my={5} >This is week 4 of your diet! You have lost 12kg so far!</Heading>

            <TDEECard date='yesterday' totalEnergyExpenditure={2300} />
            <WeekSummary />

            <NewWeekButton />
            <Button onClick={handleFetchData}>Fetch Data</Button>

            {loading ? (
                <Spinner size="xl" />
            ) : (
                <Grid templateColumns="repeat(8, 1fr)" gap={4} mt={4}>
                    {getWeekData().reverse().map((week, rowIndex) => (
                        <WeekRow key={rowIndex} week={week} rowIndex={rowIndex} startDate={calculator.startDate} />
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Calculator;