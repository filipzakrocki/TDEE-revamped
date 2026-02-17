import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { config } from '../../config';

interface TileProps {
    children: ReactNode;
    bg?: string;
    height?: string | number;
}

const Tile: React.FC<TileProps> = ({ children, bg, height: heightProp }) => {
    const height = heightProp ?? config.mainFrameHeight;

    return (
        <Box bg={bg || config.backgroundNav} height={height} sx={{ overflowY: 'auto' }} p={config.padding}>
            {children}
        </Box>
    );
};

export default Tile;
