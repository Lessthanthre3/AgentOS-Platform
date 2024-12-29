import { Box, VStack, HStack, Text, Icon, useDisclosure, useToast } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot,
  FaChartLine,
  FaCog,
  FaDatabase,
  FaNetworkWired,
  FaWallet,
  FaUsers
} from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';

const MenuItem = ({ icon, text, onClick, disabled, variant }) => (
  <HStack
    px={4}
    py={2}
    spacing={3}
    cursor={disabled ? 'not-allowed' : 'pointer'}
    opacity={disabled ? 0.5 : 1}
    _hover={!disabled ? { 
      bg: variant === 'danger' ? 'red.900' : 'whiteAlpha.100',
      color: variant === 'danger' ? 'red.300' : 'green.100'
    } : {}}
    color={variant === 'danger' ? 'red.400' : 'green.100'}
    transition="all 0.2s"
    onClick={!disabled ? onClick : undefined}
  >
    <Icon as={icon} color={variant === 'danger' ? 'red.400' : 'green.400'} />
    <Text>{text}</Text>
  </HStack>
);

const StartMenu = ({ isOpen, onClose, onLaunchApp }) => {
  const { connected, disconnect, connect, select, publicKey } = useWallet();
  const toast = useToast();

  const handleWalletAction = async () => {
    try {
      if (connected) {
        await disconnect();
        toast({
          title: 'Wallet Disconnected',
          description: 'Successfully disconnected from Phantom wallet',
          status: 'success',
          duration: 3000,
        });
      } else {
        select('phantom');
        await connect();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to manage wallet connection',
        status: 'error',
        duration: 3000,
      });
    }
    onClose();
  };

  const menuItems = [
    { icon: FaRobot, text: 'AI Agent', id: 'ai-agent', requiresWallet: true },
    { icon: FaChartLine, text: 'Token Tracker', id: 'token-tracker', requiresWallet: true },
    { icon: FaNetworkWired, text: 'DEX Monitor', id: 'network', description: 'View and manage promoted tokens' },
    { icon: FaUsers, text: 'Socials', id: 'socials', description: 'Connect with our community' },
    { icon: FaCog, text: 'Settings', id: 'settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            onClick={onClose}
          />

          {/* Menu */}
          <Box
            as={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            position="fixed"
            bottom="48px"
            left={0}
            width="280px"
            bg="gray.900"
            borderRight="1px solid"
            borderTop="1px solid"
            borderColor="green.500"
            boxShadow="0 0 20px rgba(0, 255, 0, 0.1)"
            zIndex={1000}
            overflow="hidden"
          >
            <VStack spacing={0} align="stretch" py={2}>
              {menuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  text={item.text}
                  disabled={item.requiresWallet && !connected}
                  onClick={() => {
                    onLaunchApp(item);
                    onClose();
                  }}
                />
              ))}

              <Box borderTop="1px solid" borderColor="whiteAlpha.100" my={2} />

              <MenuItem
                icon={FaWallet}
                text={connected ? 'Disconnect Wallet' : 'Connect Wallet'}
                onClick={handleWalletAction}
                variant={connected ? 'danger' : undefined}
              />
            </VStack>
          </Box>
        </>
      )}
    </AnimatePresence>
  );
};

export default StartMenu;
