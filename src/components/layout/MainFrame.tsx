import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { config } from '../../config';

interface MainFrameProps {
    children: ReactNode;
    bg?: string;
}

const MainFrame: React.FC<MainFrameProps> = ({ children, bg }) => {
    const height = config.mainFrameHeight;

    return (
        <Box bg={bg || config.backgroundNav} height={height} sx={{ overflowY: 'auto' }} borderRadius={config.borderRadius} p={config.padding}>
            {children}
        </Box>
    );
};

export default MainFrame;