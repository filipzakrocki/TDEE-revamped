import { VStack, IconButton, Divider, Tooltip, Link } from "@chakra-ui/react";
import { Coffee } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import {config} from '../../config'

const PAYPAL_LINK = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=filipzakrocki@gmail.com&item_name=TDEE+Calculator+Support&currency_code=EUR";

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
          <Tooltip key={index} label={item.label} placement="right" fontSize="xs">
            <IconButton
              icon={<item.icon size={20} />}
              aria-label={item.label}
              onClick={() => navigate(item.route)}
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
        <Link href={PAYPAL_LINK} isExternal>
          <IconButton
            icon={<Coffee size={20} />}
            aria-label="Support via PayPal"
            bg={config.orange}
            color={black}
            variant="solid"
            isRound
            transition="all 0.2s"
            _hover={{ bg: config.test1, color: white }}
          />
        </Link>
      </Tooltip>
    </VStack>
  );
};

export default IconMenu;
