import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { RootState } from '../app/store';

import { useSelector } from 'react-redux';
import { InterfaceState } from "../features/interface/interfaceSlice";

const Footer: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString());

    const {status, error, loading}: InterfaceState = useSelector((state: RootState) => state.interface);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box bg="gray.200" py={4} position='fixed' bottom={0} left={0} right={0} height={'60px'} >
            <Flex justifyContent="space-between" alignItems="center" px={8}>
                <Text fontSize="sm">Welcome!</Text>
                <Text fontSize="sm">{loading}</Text>
                <Text fontSize="sm">{error}</Text>
                <Text fontSize="sm">{status}</Text>
                <Text fontSize="sm">{currentDateTime}</Text>
            </Flex>
        </Box>
    );
};

export default Footer;