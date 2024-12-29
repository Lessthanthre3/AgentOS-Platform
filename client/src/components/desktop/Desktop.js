import { Box, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import MatrixRain from '../effects/MatrixRain';
import Taskbar from './Taskbar';
import Window from '../windows/Window';
import AdminPanel from '../admin/AdminPanel';
import AiAgent from '../apps/AiAgent';
import NeuralNetwork from '../apps/NeuralNetwork';
import TokenTracker from '../apps/TokenTracker';
import SplTracker from '../apps/SplTracker';
import Settings from '../apps/Settings';
import Socials from '../apps/Socials';
import TrainingModule from '../training/TrainingModule';
import AIAssistant from '../ai/AIAssistant';
import useWindowManager from '../../hooks/useWindowManager';
import useSystemState from '../../store/systemStore';
import useAdminStore from '../../store/adminStore';
import Raffle from '../apps/Raffle';
import Wallet from '../apps/Wallet';

const Desktop = () => {
  const { windows, addWindow } = useWindowManager();
  const { isMatrixEnabled } = useSystemState();
  const { publicKey } = useWallet();
  const { isWalletWhitelisted } = useAdminStore();
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Handle escape key - close focused window
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getWindowComponent = (appId) => {
    switch (appId) {
      case 'admin-panel':
        return AdminPanel;
      case 'ai-agent':
        return AiAgent; 
      case 'neural-network':
        return NeuralNetwork;
      case 'token-tracker':
        return TokenTracker;
      case 'network':
        return SplTracker;
      case 'settings':
        return Settings;
      case 'socials':
        return Socials;
      case 'training':
        return TrainingModule;
      case 'ai-assistant':
        return AIAssistant;
      case 'solana-raffle':
        return Raffle;
      case 'wallet':
        return Wallet;
      default:
        return null;
    }
  };

  const launchApp = (appConfig) => {
    // Check if admin panel and verify wallet
    if (appConfig.id === 'admin-panel') {
      if (!publicKey || !isWalletWhitelisted(publicKey.toString())) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin panel.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    // Check wallet requirement for other apps
    if (appConfig.requiresWallet && !publicKey) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to use this application.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const Component = getWindowComponent(appConfig.id);
    if (!Component) {
      toast({
        title: 'Application Error',
        description: 'This application is not available.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    addWindow({
      ...appConfig,
      component: Component,
      position: { x: Math.random() * 100 + 50, y: Math.random() * 100 + 50 },
      size: { width: appConfig.id === 'socials' ? 400 : 800, height: appConfig.id === 'socials' ? 300 : 600 },
      isMinimized: false,
    });
  };

  return (
    <Box
      position="relative"
      width="100vw"
      height="100vh"
      bg="gray.900"
      overflow="hidden"
    >
      {/* Matrix Rain Effect */}
      {isMatrixEnabled && <MatrixRain />}

      {/* Windows Layer */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom="48px" // Height of taskbar
        overflow="hidden"
      >
        {windows.map((window) => (
          <Window
            key={window.id}
            {...window}
          >
            <window.component />
          </Window>
        ))}
      </Box>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Taskbar */}
      <Taskbar onLaunchApp={launchApp} />
    </Box>
  );
};

export default Desktop;
