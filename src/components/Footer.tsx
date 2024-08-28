import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

const Footer: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString());

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
                <Text fontSize="sm">{currentDateTime}</Text>
            </Flex>
        </Box>
    );
};

export default Footer;