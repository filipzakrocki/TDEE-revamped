import React from 'react';
import { Card, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { config } from '../../../config';

const TDEECard: React.FC<TDEECardProps> = ({ bg = config.test2, padding = 5, width = '300px', totalEnergyExpenditure, date, ...rest }) => {
    return (
        <Card bg={bg} my={5} p={padding} display={'block'} width={width} {...rest}>
            <Stat>
                <StatLabel>Total Daily Energy Expenditure</StatLabel>
                <StatNumber fontSize={'5xl'}>{totalEnergyExpenditure}</StatNumber>
                <StatHelpText>Week of {date}</StatHelpText>
            </Stat>
        </Card>
    );
};

interface TDEECardProps {
    bg?: string;
    padding?: number | string;
    width?: string;
    totalEnergyExpenditure: number;
    date: string;
}

export default TDEECard;