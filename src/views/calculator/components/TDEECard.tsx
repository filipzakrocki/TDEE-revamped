import React from 'react';
import { Card, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { config } from '../../../config';

const TDEECard: React.FC<TDEECardProps> = ({ bg = config.test2, padding = 3, width = '100%', totalEnergyExpenditure, date, ...rest }) => {
    return (
        <Card bg={bg} my={2} p={padding} display={'block'} width={width} {...rest}>
            <Stat>
                <StatLabel fontSize={'sm'}>Total Daily Energy Expenditure</StatLabel>
                <StatNumber fontSize={'2xl'}>{totalEnergyExpenditure}</StatNumber>
                <StatHelpText fontSize={'xs'}>Week of {date}</StatHelpText>
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
    flex?: string | number;
}

export default TDEECard;