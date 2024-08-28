import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface MainFrameProps {
    children: ReactNode;
}

const MainFrame: React.FC<MainFrameProps> = ({ children }) => {
    return (
        <Box bg='tomato' height={'calc(100vh - 120px)'} my={'60px'}>
            {children}
        </Box>
    );
};

export default MainFrame;