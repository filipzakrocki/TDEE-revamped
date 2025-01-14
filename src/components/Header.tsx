import React from 'react';
import logo from '../assets/logo512.png';
import { Box, Flex, Image } from '@chakra-ui/react';

import { config } from '../config';

const Header: React.FC = () => {
    const height = config.headerHeight + 'px';
    return (
        <Box position='fixed' top={0} left={0} right={0} height={height} zIndex={1}>
            <Flex flex={1} width='100%'  align="center" height={height}>
                <Box flex="8" padding={config.padding} bg={config.headerLeft} color='black' height={height}>
                    <Box flex='row' display='flex' alignItems='center'>
                        <Image src={logo} alt="TDEE Fit" height='25px'/>
                    </Box>
                </Box>
                <Box flex="2" padding={config.padding} bg={config.headerRight} minW={config.minRightPanelWidth} color='black' height={height}>
                </Box>
            </Flex>
        </Box>
    );
};

export default Header;