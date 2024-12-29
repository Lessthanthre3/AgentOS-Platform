import { Box, HStack, IconButton, Tooltip, useColorModeValue, Button } from '@chakra-ui/react';
import { FaWallet, FaRobot, FaChartLine, FaCog } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useDisclosure } from '@chakra-ui/react';
import useSystemState from '../../store/systemStore';
import useWindowManager from '../../hooks/useWindowManager';
import AdminLock from '../admin/AdminLock';
import StartMenu from './StartMenu';

const Taskbar = ({ onLaunchApp }) => {
  const { connected } = useWallet();
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const { toggleSettings } = useSystemState();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { windows, minimizeWindow } = useWindowManager();

  const handleAdminAccess = () => {
    onLaunchApp({
      id: 'admin-panel',
      title: 'Admin Panel',
      icon: FaCog,
      requiresWallet: true,
    });
  };

  return (
    <>
      <StartMenu isOpen={isOpen} onClose={onClose} onLaunchApp={onLaunchApp} />
      
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        height="48px"
        bg={bgColor}
        borderTop="1px solid"
        borderColor="green.500"
        boxShadow="0 0 20px rgba(0, 255, 0, 0.1)"
        zIndex={1000}
      >
        <HStack
          height="100%"
          px={2}
          spacing={2}
          align="center"
        >
          {/* Start Button */}
          <Button
            variant="ghost"
            colorScheme="green"
            fontFamily="monospace"
            fontSize="sm"
            px={4}
            height="40px"
            _hover={{ bg: 'whiteAlpha.100' }}
            _active={{ bg: 'whiteAlpha.200' }}
            onClick={onToggle}
            leftIcon={
              <Box
                as="span"
                width="4px"
                height="4px"
                borderRadius="full"
                bg={connected ? "green.400" : "red.400"}
                boxShadow={`0 0 10px ${connected ? "#48BB78" : "#F56565"}`}
              />
            }
          >
            AgentOS
          </Button>

          {/* Running Apps */}
          <Box flex={1} px={2}>
            <HStack spacing={1}>
              {windows.map((window) => (
                <Tooltip key={window.id} label={window.isMinimized ? `Restore ${window.title}` : window.title}>
                  <IconButton
                    icon={window.icon ? <window.icon /> : null}
                    aria-label={window.title}
                    variant={window.isMinimized ? "solid" : "ghost"}
                    colorScheme="green"
                    size="sm"
                    opacity={window.isMinimized ? 0.6 : 0.8}
                    _hover={{ opacity: 1 }}
                    onClick={() => minimizeWindow(window.id)}
                  />
                </Tooltip>
              ))}
            </HStack>
          </Box>

          {/* Right side - System controls */}
          <HStack spacing={2}>
            <WalletMultiButton />
            <AdminLock onAdminAccess={handleAdminAccess} />
            <IconButton
              icon={<FaCog />}
              aria-label="Settings"
              variant="ghost"
              colorScheme="green"
              onClick={toggleSettings}
            />
          </HStack>
        </HStack>
      </Box>
    </>
  );
};

export default Taskbar;
