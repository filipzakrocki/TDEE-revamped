import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { config } from '../config';

interface MainFrameProps {
    children: ReactNode;
}

const MainFrame: React.FC<MainFrameProps> = ({ children }) => {
    const height = config.mainFrameHeight();
    const space = config.headerHeight;

    return (
        <Box bg='gray.100' height={height} mt={space + 'px'}>
            {children}
        </Box>
    );
};

export default MainFrame;