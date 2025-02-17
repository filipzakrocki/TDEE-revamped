import React from 'react';
import { Card } from '@chakra-ui/react';
import { config } from '../../../config';

const WeekSummary: React.FC<WeekSummaryProps> = () => {
    return (
        <Card bg={config.test2} my={5} p={5} display={'block'} width={'100%'}>
            Week Summary should have date, TDEE for this week, averages for weight and kcal consumption and delta (change)
        </Card>
    );
};

interface WeekSummaryProps {

}

export default WeekSummary;