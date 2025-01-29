import { VStack, IconButton } from "@chakra-ui/react";
import { Calendar, BarChart3, HelpCircle, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {config} from '../config'

const IconMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultBg = "white";
  const defaultIconColor = config.black;
  const selectedBg = config.black;
  const selectedIconColor = "white";

  const menuItems = [
    { icon: Calendar, route: "/calculator" },
    { icon: BarChart3, route: "/analysis" }, // Fixed: Using 'BarChart3' instead of 'ChartNoAxesCombined'
    { icon: HelpCircle, route: "/faq" },
    { icon: Settings, route: "/setup" },
    { icon: LogOut, route: "/logout" },
  ];

  return (
    <VStack spacing={5} mb={5}>
      {menuItems.map((item, index) => {
        const isSelected = location.pathname === item.route;
        return (
          <IconButton
            key={index}
            icon={<item.icon size={20} />}
            aria-label={item.route}
            onClick={() => navigate(item.route)}
            bg={isSelected ? selectedBg : defaultBg}
            color={isSelected ? selectedIconColor : defaultIconColor}
            variant="solid"
            isRound
            transition="all 0.2s"
            _hover={{ bg: selectedBg, color: selectedIconColor }}
          />
        );
      })}
    </VStack>
  );
};

export default IconMenu;
