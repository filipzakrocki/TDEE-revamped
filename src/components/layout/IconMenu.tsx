import { useState } from 'react';
import { VStack, IconButton, Divider, Tooltip } from "@chakra-ui/react";
import { Coffee, Save } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { config } from '../../config';
import { useAuth } from '../../stores/auth/authStore';
import LogoutConfirmModal from './LogoutConfirmModal';
import SignUpSaveModal from './SignUpSaveModal';
import BuyMeACoffeeModal from './BuyMeACoffeeModal';

const IconMenu = () => {
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
    <VStack spacing={5} mb={5}>
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
      {menuItems.map((item, index) => {
        const isLogoutItem = item.route === '/logout';
        const isSelected = location.pathname === item.route;
        
        // For guests, show Save icon instead of Logout
        const DisplayIcon = isLogoutItem && isGuest ? Save : item.icon;
        const displayLabel = isLogoutItem && isGuest ? 'Save' : item.label;
        
        return (
          <Tooltip key={index} label={displayLabel} placement="right" fontSize="xs">
            <IconButton
              icon={<DisplayIcon size={20} />}
              aria-label={displayLabel}
              onClick={() => handleNavClick(item.route)}
              bg={isSelected ? black : white}
              color={isSelected ? white : black}
              variant="solid"
              isRound
              transition="all 0.2s"
              _hover={{ bg: black, color: white }}
            />
          </Tooltip>
        );
      })}

      <Divider borderColor={config.test1} w="60%" />

      <Tooltip label="Buy me a coffee" placement="right" fontSize="xs">
        <IconButton
          icon={<Coffee size={20} />}
          aria-label="Support (Buy me a coffee)"
          bg={config.orange}
          color={black}
          variant="solid"
          isRound
          transition="all 0.2s"
          _hover={{ bg: config.test1, color: white }}
          onClick={() => setCoffeeModalOpen(true)}
        />
      </Tooltip>
    </VStack>
  );
};

export default IconMenu;
