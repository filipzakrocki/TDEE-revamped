import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { config } from '../config';

interface MainFrameProps {
    children: ReactNode;
    bg?: string;
}

const MainFrame: React.FC<MainFrameProps> = ({ children, bg }) => {
    const height = config.mainFrameHeight;

    return (
        <Box bg={bg || 'gray.100'} height={height} sx={{ overflowY: 'auto' }} borderRadius={config.borderRadius}>
            {children}
        </Box>
    );
};

export default MainFrame;