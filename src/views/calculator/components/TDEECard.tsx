import React from 'react';
import { Card, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

const TDEECard: React.FC<TDEECardProps> = ({ bg, padding, width = '300px', totalEnergyExpenditure, date }) => {
    return (
        <Card bg={bg} my={5} p={padding} display={'block'} width={width}>
            <Stat>
                <StatLabel>Total Daily Energy Expenditure</StatLabel>
                <StatNumber fontSize={'5xl'}>{totalEnergyExpenditure}</StatNumber>
                <StatHelpText>Week of {date}</StatHelpText>
            </Stat>
        </Card>
    );
};

interface TDEECardProps {
    bg: string;
    padding: number | string;
    width?: string;
    totalEnergyExpenditure: number;
    date: string;
}

export default TDEECard;