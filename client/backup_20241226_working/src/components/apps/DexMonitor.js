import { Box, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import useAdminStore from '../../store/adminStore';

const DexMonitor = () => {
  const { tokens, getPromotedTokens } = useAdminStore();
  const [marketData, setMarketData] = useState({});
  
  useEffect(() => {
    // Simulated market data updates - replace with real DEX API integration
    const interval = setInterval(() => {
      const newMarketData = {};
      tokens.forEach(token => {
        newMarketData[token.address] = {
          price: Math.random() * 100,
          volume24h: Math.random() * 1000000,
          liquidity: Math.random() * 5000000,
          priceChange: (Math.random() - 0.5) * 20,
        };
      });
      setMarketData(newMarketData);
    }, 3000);

    return () => clearInterval(interval);
  }, [tokens]);

  const formatNumber = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const promotedTokens = getPromotedTokens();

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" color="green.300" fontWeight="bold">
          DEX Monitor
        </Text>

        {/* Featured Tokens */}
        {promotedTokens.length > 0 && (
          <Box>
            <Text fontSize="lg" color="green.300" mb={3}>
              Featured Tokens
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {promotedTokens.map((token) => (
                <Box
                  key={token.id}
                  p={4}
                  borderRadius="md"
                  bg="gray.800"
                  borderWidth="1px"
                  borderColor="green.500"
                >
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text color="white" fontWeight="bold">
                        {token.name}
                      </Text>
                      <Badge colorScheme="green">{token.symbol}</Badge>
                    </HStack>
                    <Stat>
                      <StatLabel color="gray.400">Price</StatLabel>
                      <StatNumber color="white">
                        ${marketData[token.address]?.price.toFixed(4) || '0.0000'}
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow
                          type={marketData[token.address]?.priceChange >= 0 ? 'increase' : 'decrease'}
                        />
                        {Math.abs(marketData[token.address]?.priceChange || 0).toFixed(2)}%
                      </StatHelpText>
                    </Stat>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* All Tokens Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="green.300">Token</Th>
                <Th color="green.300">Symbol</Th>
                <Th color="green.300" isNumeric>Price</Th>
                <Th color="green.300" isNumeric>24h Volume</Th>
                <Th color="green.300" isNumeric>Liquidity</Th>
                <Th color="green.300" isNumeric>24h Change</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tokens.map((token) => (
                <Tr key={token.id} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td color="white">
                    <HStack>
                      <Text>{token.name}</Text>
                      {token.isPromoted && (
                        <Badge colorScheme="green" variant="solid" size="sm">
                          Featured
                        </Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td color="white">{token.symbol}</Td>
                  <Td color="white" isNumeric>
                    ${marketData[token.address]?.price.toFixed(4) || '0.0000'}
                  </Td>
                  <Td color="white" isNumeric>
                    {formatNumber(marketData[token.address]?.volume24h || 0)}
                  </Td>
                  <Td color="white" isNumeric>
                    {formatNumber(marketData[token.address]?.liquidity || 0)}
                  </Td>
                  <Td isNumeric>
                    <Text
                      color={marketData[token.address]?.priceChange >= 0 ? 'green.400' : 'red.400'}
                    >
                      {marketData[token.address]?.priceChange?.toFixed(2) || '0.00'}%
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

export default DexMonitor;
