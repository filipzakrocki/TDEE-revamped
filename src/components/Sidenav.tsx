import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import IconMenu from './IconMenu';
import Logo from './Logo'
import {  useNavigate } from "react-router-dom";

import { config } from '../config';

const Sidenav: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Box  height={'100%'} zIndex={1} bg={config.backgroundNav} cursor={'pointer'} onClick={() => navigate('/')}>
            <Flex direction={'column'} h='100%' >
                <Box mb={200} mt={5}>
                    <Logo />
                </Box>
                <Box>
                    <IconMenu/>
                </Box>
            </Flex>
        </Box>
    );
};

export default Sidenav;