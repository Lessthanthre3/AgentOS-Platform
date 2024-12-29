import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Text, VStack, HStack, Icon, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ConnectWallet() {
  const { connected, connecting, disconnecting, publicKey, wallet } = useWallet();
  const toast = useToast();

  useEffect(() => {
    if (connected) {
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${wallet?.adapter?.name || 'wallet'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  }, [connected, wallet]);

  return (
    <Box position="relative">
      <WalletMultiButton />
      <VStack mt={2} spacing={1} align="stretch">
        {connecting && (
          <HStack spacing={2}>
            <Icon as={FaExclamationCircle} color="yellow.400" />
            <Text color="yellow.400" fontSize="sm">
              Connecting...
            </Text>
          </HStack>
        )}
        
        {connected && (
          <>
            <HStack spacing={2}>
              <Icon as={FaCheckCircle} color="green.400" />
              <Text color="green.400" fontSize="sm">
                Connected to {wallet?.adapter?.name}
              </Text>
            </HStack>
            {publicKey && (
              <Text color="whiteAlpha.700" fontSize="xs">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </Text>
            )}
          </>
        )}

        {disconnecting && (
          <HStack spacing={2}>
            <Icon as={FaExclamationCircle} color="orange.400" />
            <Text color="orange.400" fontSize="sm">
              Disconnecting...
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
