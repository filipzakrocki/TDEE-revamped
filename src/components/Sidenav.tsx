import React from 'react';
import logo from '../assets/logo512.png';
import { Box, Flex, Image } from '@chakra-ui/react';
import IconMenu from './IconMenu';
import { Utensils } from "lucide-react";

import { config } from '../config';

const Sidenav: React.FC = () => {
    return (
        <Box  height={'100%'} zIndex={1} bg={config.backgroundNav} >
            <Flex direction={'column'} justifyContent='space-between' h='100%' >
                <Utensils size={40} color={config.black} />
                <IconMenu/>
            </Flex>
        </Box>
    );
};

export default Sidenav;