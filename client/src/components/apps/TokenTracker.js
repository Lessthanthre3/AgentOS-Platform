import { Box, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import useAdminStore from '../../store/adminStore';

const TokenTracker = () => {
  const { tokens } = useAdminStore();
  const [prices, setPrices] = useState({});
  const [changes, setChanges] = useState({});

  useEffect(() => {
    // Simulated price updates - replace with real API calls
    const interval = setInterval(() => {
      const newPrices = {};
      const newChanges = {};
      
      tokens.forEach(token => {
        const currentPrice = prices[token.address] || 1.0;
        const change = (Math.random() - 0.5) * 0.1; // -5% to +5% change
        newPrices[token.address] = currentPrice * (1 + change);
        newChanges[token.address] = change * 100;
      });

      setPrices(newPrices);
      setChanges(newChanges);
    }, 5000);

    return () => clearInterval(interval);
  }, [tokens, prices]);

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" color="green.300" fontWeight="bold">
          Token Tracker
        </Text>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="green.300">Token</Th>
                <Th color="green.300">Symbol</Th>
                <Th color="green.300" isNumeric>Price</Th>
                <Th color="green.300" isNumeric>24h Change</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tokens.map((token) => (
                <Tr key={token.id} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td color="white">{token.name}</Td>
                  <Td color="white">{token.symbol}</Td>
                  <Td color="white" isNumeric>
                    ${prices[token.address]?.toFixed(4) || '0.0000'}
                  </Td>
                  <Td isNumeric>
                    <Text
                      color={changes[token.address] >= 0 ? 'green.400' : 'red.400'}
                    >
                      {changes[token.address]?.toFixed(2) || '0.00'}%
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default TokenTracker;
