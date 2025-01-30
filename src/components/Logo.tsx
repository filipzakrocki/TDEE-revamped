import React from 'react';
import { Utensils } from "lucide-react";
import { config } from '../config'
import { Box, Text } from '@chakra-ui/react';

const Logo: React.FC = () => {
    return (
        <Box  display='flex' flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
            <Utensils size={35} color={config.black}/>
            <Text mt={2} fontFamily={'mono'} fontSize={15} fontWeight={600} color={config.black}>tdee</Text>
            <Text fontFamily={'mono'} fontSize={15} fontWeight={600} color={config.black}>fit</Text>
        </Box>
    );
};

export default Logo;