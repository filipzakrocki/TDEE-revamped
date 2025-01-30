import { VStack, IconButton } from "@chakra-ui/react";

import { useLocation, useNavigate } from "react-router-dom";
import {config} from '../config'

const IconMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = config.menuItems;

  const white = config.backgroundColor;
  const black = config.black;

  return (
    <VStack spacing={5} mb={5}>
      {menuItems.map((item, index) => {
        const isSelected = location.pathname === item.route;
        return (
          <>
          <IconButton
            key={index}
            icon={<item.icon size={20} />}
            aria-label={item.route}
            onClick={() => navigate(item.route)}
            bg={isSelected ? black : white}
            color={isSelected ? white : black}
            variant="solid"
            isRound
            transition="all 0.2s"
            _hover={{ bg: black, color: white }}
          />
          </>
        );
      })}
    </VStack>
  );
};

export default IconMenu;
