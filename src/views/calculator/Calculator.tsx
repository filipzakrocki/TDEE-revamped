import React, { useEffect } from 'react';
import { useCustomToast } from '../../utils/useCustomToast';

import { fetchDataWithStates, CalcState } from '../../stores/calc/calcSlice';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { User } from 'firebase/auth';

import { Button, Container, Grid, Heading, Stat, Card,   StatLabel,
    StatNumber,
    StatHelpText, } from '@chakra-ui/react';

import WeekRow from '../../components/WeekRow';
import NewWeekButton from '../../components/NewWeekButton';

import { config } from '../../config';
import TDEECard from './components/TDEECard';

const Calculator: React.FC = () => {
    const user: User | null = useSelector((state: RootState) => state.auth.user);
    const calculator: CalcState | null  = useSelector((state: RootState) => state.calc);

    const dispatch = useDispatch<AppDispatch>();
    const showToast = useCustomToast();

    useEffect(() => {
        const uid = user?.uid;
        if (!uid) return;

        const fetchCalcData = async () => {
            try {
                const data = await dispatch(fetchDataWithStates(uid)).unwrap();
                if (data) {
                    showToast({ description: 'Data Fetched!', status: 'success' });
                }
            } catch (error) {
                console.error("Error fetching Calc Data: ", error);
                showToast({ description: 'Error fetching Calc Data', status: 'error' });
            }
        };

        fetchCalcData();

        // eslint-disable-next-line
    }, []);

    // Silencing strict mode warning

    const getWeekData = () => {
        const weekData = calculator.weekData;
        return weekData.filter(w => w.week);
    };

    console.log(getWeekData());

    const handleFetchData = () => {
        if (!user?.uid) return;
        dispatch(fetchDataWithStates(user.uid)).unwrap()
            .then(() => showToast({ description: 'Data Fetched!', status: 'success' }))
            .catch(() => showToast({ description: 'Error fetching Calc Data', status: 'error' }));
    };
    

    return (
        <Container minW='100%'>

            <Heading size={'xl'} mt={1} mb={5} >Welcome Back!</Heading>
            <Heading size={'md'} my={5} >This is week 4 of your diet! You have lost 12kg so far!</Heading>
            <Card bg={config.test2} my={5} p={config.padding} display={'block'} width={'300px'}>
                <Stat>
                    <StatLabel>Total Daily Energy Expenditure</StatLabel>
                    <StatNumber fontSize={'5xl'}>2352</StatNumber>
                    <StatHelpText>Week of 26 Aug 2025</StatHelpText>
                </Stat>
            </Card>
            <TDEECard bg={config.test2} padding={5} date='yesterday' totalEnergyExpenditure={2300} />
            <NewWeekButton />
            <Button onClick={handleFetchData}>Fetch Data</Button>


            <Grid templateColumns="repeat(8, 1fr)" gap={4} mt={4}>
                {getWeekData().reverse().map((week, rowIndex) => (
                    <WeekRow key={rowIndex} week={week} rowIndex={rowIndex} startDate={calculator.startDate} />
                ))}
            </Grid>
        </Container>
    );
};

export default Calculator;