import React from 'react';
import logo from '../assets/logo512.png';
import { Box, Flex, Spacer, IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar, Image, Text } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Header: React.FC = () => {
    return (
        <Box bg="gray.200" p={2} position='fixed' top={0} left={0} right={0} height={'60px'}>
            <Flex align="center">
                <Box flex='row' display='flex' alignItems='center'>
                    <Image src={logo} alt="TDEE Fit" height='40px'/>
                    <Text fontSize={'30px'} fontWeight={'bold'} color={'#99aab5'} ml={4}>TDEE Fit</Text>
                </Box>
                <Spacer />
                <Box>
                    <Menu>
                        <MenuButton as={IconButton} icon={<HamburgerIcon />} variant="outline" />
                        <MenuList>
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