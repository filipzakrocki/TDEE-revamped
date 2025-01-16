
import { HStack, IconButton, useColorModeValue } from '@chakra-ui/react';
import { CalendarIcon, QuestionIcon, DragHandleIcon, CloseIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const IconMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedColor = useColorModeValue('blue.200', 'red.200');

  const menuItems = [
    { icon: CalendarIcon, route: '/calculator' },
    { icon: DragHandleIcon, route: '/analysis' },
    { icon: QuestionIcon, route: '/faq' },
    { icon: CloseIcon, route: '/logout' },
  ];

  return (
    <HStack spacing={20}>
      {menuItems.map((item, index) => (
        <IconButton
          key={index}
          icon={<item.icon />}
          aria-label={item.route}
          onClick={() => navigate(item.route)}
          color={location.pathname === item.route ? selectedColor : 'white'}
          fontSize={'20px'}
          variant={'solid'}
          colorScheme='transparent'
        />
      ))}
    </HStack>
  );
};

export default IconMenu;