import { Box, VStack, Text, Badge, Spinner } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useWalletStore from '../../../../store/walletStore';

const TransactionItem = ({ transaction }) => (
  <Box
    p={4}
    bg="whiteAlpha.50"
    borderRadius="md"
    _hover={{ bg: 'whiteAlpha.100' }}
    transition="all 0.2s"
  >
    <HStack justify="space-between" align="start">
      <VStack align="start" spacing={1}>
        <Text color="green.200" fontSize="sm" fontFamily="monospace">
          {transaction.signature.slice(0, 8)}...{transaction.signature.slice(-8)}
        </Text>
        <Text color="gray.400" fontSize="xs">
          {new Date(transaction.timestamp * 1000).toLocaleString()}
        </Text>
      </VStack>
      <Badge
        colorScheme={transaction.status === 'success' ? 'green' : 'red'}
        variant="subtle"
      >
        {transaction.status}
      </Badge>
    </HStack>
  </Box>
);

const TransactionsPanel = () => {
  const { publicKey } = useWallet();
  const { transactions, fetchTransactions, isLoading } = useWalletStore();

  useEffect(() => {
    if (publicKey) {
      fetchTransactions(publicKey.toString());
    }
  }, [publicKey]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner color="green.400" />
        <Text color="green.200" mt={4}>Loading transactions...</Text>
      </Box>
    );
  }

  if (!transactions.length) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.400">No transactions found</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {transactions.map((tx) => (
        <TransactionItem key={tx.signature} transaction={tx} />
      ))}
    </VStack>
  );
};

export default TransactionsPanel;
