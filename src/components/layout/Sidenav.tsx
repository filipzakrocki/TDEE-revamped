import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import IconMenu from './IconMenu';
import Logo from './Logo'
import {  useNavigate } from "react-router-dom";

import { config } from '../../config';

const Sidenav: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Box height="100%" zIndex={1} bg={config.backgroundNav}>
            <Flex direction="column" h="100%">
                <Box pt={config.padding} pb={config.padding} onClick={() => navigate(config.startingPoint)} cursor="pointer" flexShrink={0}>
                    <Logo />
                </Box>
                <Flex flex={1} align="center" justify="center" minH={0}>
                    <IconMenu />
                </Flex>
            </Flex>
        </Box>
    );
};

export default Sidenav;