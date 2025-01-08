import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { RootState } from '../app/store';

import { useSelector } from 'react-redux';
import { InterfaceState } from "../stores/interface/interfaceSlice";

const Footer: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString());

    const { loading}: InterfaceState = useSelector((state: RootState) => state.interface);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box bg="gray.200" py={4} position='fixed' bottom={0} left={0} right={0} height={'60px'} >
            <Flex justifyContent="space-between" alignItems="center" px={8}>
                {!loading ? <Spinner size="lg" color="teal" /> : <Text fontSize="sm">Not Loading</Text>}
                <Text fontSize="sm">{currentDateTime}</Text>
            </Flex>
        </Box>
    );
};

export default Footer;