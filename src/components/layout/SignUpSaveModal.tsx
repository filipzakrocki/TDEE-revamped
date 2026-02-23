import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Box,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { useAuth } from '../../stores/auth/authStore';
import { useCalc } from '../../stores/calc/calcStore';
import { useCustomToast } from '../../utils/useCustomToast';

interface SignUpSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignUpSaveModal: React.FC<SignUpSaveModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { syncToCloud } = useCalc();
  const showToast = useCustomToast();

  const handleGoToLogin = () => {
    onClose();
    navigate('/logout');
  };

  const handleSignUpAndSave = async () => {
    if (!email || !password) {
      showToast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      showToast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      showToast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password);
      
      // Small delay to ensure auth state is updated before syncing
      setTimeout(() => {
        syncToCloud();
      }, 500);

      showToast({
        title: 'Success',
        description: 'Account created and data saved!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      showToast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Save Your Data</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.600">
              Your data is currently saved locally in your browser. Create an account to save it to the cloud and access it from any device.
            </Text>
            
            <FormControl>
              <FormLabel fontSize="sm">Email</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
              />
            </FormControl>

            <Text fontSize="xs" color="gray.500" mt={-2} alignSelf="flex-start">
              Your email can be fake — I will never send you any messages.
            </Text>

            <FormControl>
              <FormLabel fontSize="sm">Password</FormLabel>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Confirm Password</FormLabel>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                type="password"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Button variant="link" color={config.black} size="xs" onClick={handleGoToLogin}>
            Go to login screen
          </Button>
          <Box display="flex" gap={2}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              bg={config.test5}
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={handleSignUpAndSave}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Sign Up and Save
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SignUpSaveModal;
