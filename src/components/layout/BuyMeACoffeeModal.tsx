import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Box,
  Flex,
  Text,
  Link,
  Button,
  useClipboard,
} from '@chakra-ui/react';
import { config, donationConfig } from '../../config';

interface BuyMeACoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QR_SIZE = 100;
const QR_URL = (address: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(`bitcoin:${address}`)}`;

export const BuyMeACoffeeModal: React.FC<BuyMeACoffeeModalProps> = ({ isOpen, onClose }) => {
  const { hasCopied, onCopy } = useClipboard(donationConfig.btcAddress);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent maxW="440px">
        <ModalHeader fontSize="md" pb={2}>
          Buy me a coffee
        </ModalHeader>
        <ModalBody pb={4}>
          <Flex gap={4} align="stretch" flexDir={{ base: 'column', sm: 'row' }}>
            <Box flex={1} textAlign="center">
              <Text fontSize="xs" fontWeight="600" mb={2} color="gray.600">
                Bitcoin
              </Text>
              <Box
                as="img"
                src={QR_URL(donationConfig.btcAddress)}
                alt="Bitcoin QR code"
                width={`${QR_SIZE}px`}
                height={`${QR_SIZE}px`}
                mx="auto"
                mb={2}
                borderRadius="md"
              />
              <Text
                fontSize="xs"
                fontFamily="mono"
                wordBreak="break-all"
                color={config.black}
                mb={2}
              >
                {donationConfig.btcAddress}
              </Text>
              <Button
                size="xs"
                variant="outline"
                onClick={onCopy}
                colorScheme="gray"
                _hover={{ bg: 'gray.50' }}
              >
                {hasCopied ? 'Copied' : 'Copy address'}
              </Button>
            </Box>
            <Box
              flexShrink={0}
              width="1px"
              bg="gray.200"
              alignSelf="stretch"
              display={{ base: 'none', sm: 'block' }}
              aria-hidden
            />
            <Box flex={1} display="flex" flexDir="column" justifyContent="center" textAlign="center">
              <Text fontSize="xs" fontWeight="600" mb={3} color="gray.600">
                PayPal
              </Text>
              <Link href={donationConfig.paypalLink} isExternal _hover={{ textDecoration: 'none' }}>
                <Button
                  bg="#0070ba"
                  color="white"
                  size="sm"
                  width="full"
                  _hover={{ bg: '#005ea6' }}
                  _active={{ bg: '#004c85' }}
                >
                  Donate with PayPal
                </Button>
              </Link>
            </Box>
          </Flex>
          <Text fontSize="sm" color="gray.600" textAlign="center" mt={4} pt={3} borderTopWidth="1px" borderTopColor="gray.100">
            Thank you for your support!
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BuyMeACoffeeModal;
