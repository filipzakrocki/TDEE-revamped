import React from 'react';
import { Box, Flex, Spacer, IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Header: React.FC = () => {
    return (
        <Box bg="gray.200" p={4} position='fixed' top={0} left={0} right={0} height={'60px'}>
            <Flex align="center">
                <Box>
                    {/* Replace the src and alt attributes with your logo */}
                    <img src="/path/to/logo.png" alt="Logo" />
                </Box>
                <Spacer />
                <Box>
                    <Menu>
                        <MenuButton as={IconButton} icon={<HamburgerIcon />} variant="outline" />
                        <MenuList>
                            {/* Add your menu items here */}
                            <MenuItem>Menu Item 1</MenuItem>
                            <MenuItem>Menu Item 2</MenuItem>
                            <MenuItem>Menu Item 3</MenuItem>
                        </MenuList>
                    </Menu>
                    <IconButton ml={2} aria-label="Logout" icon={<Avatar size="sm" />} variant="outline" />
                </Box>
            </Flex>
        </Box>
    );
};

export default Header;