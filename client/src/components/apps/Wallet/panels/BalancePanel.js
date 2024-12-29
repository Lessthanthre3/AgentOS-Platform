import { Box, VStack, HStack, Text, Spinner, Image, Divider } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import useWalletStore from '../../../../store/walletStore';

const TokenBalance = ({ symbol, balance, icon, price }) => (
  <HStack
    w="100%"
    p={4}
    bg="whiteAlpha.50"
    borderRadius="md"
    justify="space-between"
    _hover={{ bg: 'whiteAlpha.100' }}
    transition="all 0.2s"
  >
    <HStack spacing={4}>
      <Image src={icon} boxSize="32px" borderRadius="full" />
      <Box>
        <Text color="green.200" fontSize="lg">{symbol}</Text>
        <Text color="gray.400" fontSize="sm">
          ${(balance * (price || 0)).toFixed(2)} USD
        </Text>
      </Box>
    </HStack>
    <Text color="green.400" fontSize="lg" fontFamily="monospace">
      {parseFloat(balance).toFixed(4)}
    </Text>
  </HStack>
);

const RaffleTickets = ({ tickets }) => (
  <Box w="100%" p={4} bg="whiteAlpha.50" borderRadius="md">
    <Text color="green.200" fontSize="lg" mb={2}>Active Raffle Tickets</Text>
    {tickets.length > 0 ? (
      tickets.map((ticket, index) => (
        <HStack key={index} justify="space-between" mt={2}>
          <Text color="gray.400">{ticket.raffleName}</Text>
          <Text color="green.400" fontFamily="monospace">#{ticket.ticketNumber}</Text>
        </HStack>
      ))
    ) : (
      <Text color="gray.400">No active raffle tickets</Text>
    )}
  </Box>
);

const BalancePanel = () => {
  const { publicKey } = useWallet();
  const { solBalance, aisBalance, isLoading, activeRaffleTickets, fetchActiveRaffleTickets } = useWalletStore();

  useEffect(() => {
    if (publicKey) {
      fetchActiveRaffleTickets(publicKey.toString());
    }
  }, [publicKey, fetchActiveRaffleTickets]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner color="green.400" />
        <Text color="green.200" mt={4}>Loading balances...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box mb={4}>
        <Text color="gray.400" fontSize="sm" mb={2}>Wallet Address</Text>
        <Text color="green.200" fontSize="md" fontFamily="monospace">
          {publicKey?.toString()}
        </Text>
      </Box>

      <TokenBalance
        symbol="SOL"
        balance={solBalance}
        icon="/images/solana-logo.png"
        price={0} // TODO: Add real SOL price
      />

      <TokenBalance
        symbol="AIS"
        balance={aisBalance}
        icon="/images/ais-logo.png"
        price={0} // TODO: Add real AIS price
      />

      <Box mt={4} p={4} bg="whiteAlpha.50" borderRadius="md">
        <Text color="gray.400" fontSize="sm" mb={2}>Total Portfolio Value</Text>
        <Text color="green.400" fontSize="2xl" fontFamily="monospace">
          ${((solBalance * 100) + (aisBalance * 1)).toFixed(2)}
        </Text>
      </Box>

      <Divider my={4} borderColor="whiteAlpha.200" />
      
      <RaffleTickets tickets={activeRaffleTickets} />
    </VStack>
  );
};

export default BalancePanel;
