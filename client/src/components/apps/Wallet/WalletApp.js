import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import BalancePanel from './panels/BalancePanel';
import SwapPanel from './panels/SwapPanel';
import TransactionsPanel from './panels/TransactionsPanel';
import useWalletStore from '../../../store/walletStore';
import { useEffect } from 'react';

const WalletApp = () => {
  const { connected, publicKey } = useWallet();
  const { fetchBalances, initializeRPC } = useWalletStore();
  const bgColor = useColorModeValue('gray.800', 'gray.900');

  useEffect(() => {
    if (connected && publicKey) {
      initializeRPC();
      fetchBalances(publicKey.toString());
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <Box p={4} color="green.400" fontFamily="monospace">
        Please connect your wallet to continue...
      </Box>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="md" overflow="hidden" h="100%">
      <Tabs variant="soft-rounded" colorScheme="green" p={4}>
        <TabList mb={4}>
          <Tab 
            _selected={{ 
              color: 'green.200',
              bg: 'whiteAlpha.100' 
            }}
          >
            Balances
          </Tab>
          <Tab 
            _selected={{ 
              color: 'green.200',
              bg: 'whiteAlpha.100' 
            }}
          >
            Swap
          </Tab>
          <Tab 
            _selected={{ 
              color: 'green.200',
              bg: 'whiteAlpha.100' 
            }}
          >
            History
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BalancePanel />
          </TabPanel>
          <TabPanel>
            <SwapPanel />
          </TabPanel>
          <TabPanel>
            <TransactionsPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default WalletApp;
