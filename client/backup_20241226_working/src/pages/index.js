import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Desktop from '../components/desktop/Desktop';
import MatrixRain from '../components/effects/MatrixRain';

export default function Home() {
  const { connected } = useWallet();

  return (
    <Box
      position="relative"
      width="100vw"
      height="100vh"
      overflow="hidden"
      bg="brand.background.primary"
    >
      {/* Matrix Rain Effect */}
      <MatrixRain />
      
      {/* Main Desktop Environment */}
      <Desktop />
    </Box>
  );
}
