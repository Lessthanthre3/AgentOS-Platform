import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Dynamically import components with client-side only rendering
const Desktop = dynamic(() => import('../components/desktop/Desktop'), {
  ssr: false
});

const MatrixRain = dynamic(() => import('../components/effects/MatrixRain'), {
  ssr: false
});

export default function Home() {
  const { connected } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading state
  }

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
