import React, { useState } from 'react';
import { Flex, IconButton, Tooltip, Box, Text } from '@chakra-ui/react';
import { Coffee, Save } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { useAuth } from '../../stores/auth/authStore';
import LogoutConfirmModal from './LogoutConfirmModal';
import SignUpSaveModal from './SignUpSaveModal';
import BuyMeACoffeeModal from './BuyMeACoffeeModal';

const HorizontalNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const menuItems = config.menuItems;

  const white = config.backgroundColor;
  const black = config.black;

  const handleNavClick = (route: string) => {
    if (route === '/logout') {
      if (isGuest) {
        setSignUpModalOpen(true);
      } else {
        setLogoutModalOpen(true);
      }
    } else {
      navigate(route);
    }
  };

  const handleLogoutConfirm = () => {
    navigate('/logout');
  };

  return (
    <Box
      w="100%"
      h="65px"
      minH="65px"
      px={config.layoutGutter}
      bg={config.backgroundNav}
      borderTopWidth="1px"
      borderTopColor="gray.200"
      overflow="hidden"
      minW={0}
      display="flex"
      alignItems="center"
    >
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
      <SignUpSaveModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
      />
      <BuyMeACoffeeModal
        isOpen={coffeeModalOpen}
        onClose={() => setCoffeeModalOpen(false)}
      />
      <Flex w="100%" align="center" justify="space-evenly">
        {menuItems.map((item, index) => {
          const isLogoutItem = item.route === '/logout';
          const isSelected = location.pathname === item.route;
          
          // For guests, show Save icon instead of Logout
          const DisplayIcon = isLogoutItem && isGuest ? Save : item.icon;
          const displayLabel = isLogoutItem && isGuest ? 'Save' : item.label;
          
          return (
            <Tooltip key={index} label={displayLabel} placement="top" fontSize="xs">
              <Box as="span" flexShrink={0}>
                <IconButton
                  icon={<DisplayIcon size={22} />}
                  aria-label={displayLabel}
                  onClick={() => handleNavClick(item.route)}
                  bg={isSelected ? black : white}
                  color={isSelected ? white : black}
                  variant="solid"
                  isRound
                  size="md"
                  transition="all 0.2s"
                  _hover={{ bg: black, color: white }}
                />
              </Box>
            </Tooltip>
          );
        })}

        <Text color="gray.400" px={1} userSelect="none" flexShrink={0}>|</Text>

        <Tooltip label="Buy me a coffee" placement="top" fontSize="xs">
          <Box as="span" flexShrink={0}>
            <IconButton
              icon={<Coffee size={22} />}
              aria-label="Support (Buy me a coffee)"
              bg={config.orange}
              color={black}
              variant="solid"
              isRound
              size="md"
              transition="all 0.2s"
              _hover={{ bg: config.test1, color: white }}
              onClick={() => setCoffeeModalOpen(true)}
            />
          </Box>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default HorizontalNav;
