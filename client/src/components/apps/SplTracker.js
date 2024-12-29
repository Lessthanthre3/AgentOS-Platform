import { Box, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import useAdminStore from '../../store/adminStore';

const SplTracker = () => {
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
          SPL Tracker
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
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="green.500"
                >
                  <Stat>
                    <StatLabel color="green.300">{token.symbol}</StatLabel>
                    <StatNumber fontSize="2xl" color="white">
                      {marketData[token.address]
                        ? formatNumber(marketData[token.address].price)
                        : '$0.00'}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow
                        type={
                          marketData[token.address]?.priceChange >= 0
                            ? 'increase'
                            : 'decrease'
                        }
                      />
                      {marketData[token.address]
                        ? `${Math.abs(
                            marketData[token.address].priceChange
                          ).toFixed(2)}%`
                        : '0.00%'}
                    </StatHelpText>
                  </Stat>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* All Tokens Table */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="green.300">TOKEN</Th>
                <Th color="green.300">SYMBOL</Th>
                <Th color="green.300">PRICE</Th>
                <Th color="green.300">24H VOLUME</Th>
                <Th color="green.300">LIQUIDITY</Th>
                <Th color="green.300">24H CHANGE</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tokens.map((token) => (
                <Tr key={token.id}>
                  <Td color="white">{token.name}</Td>
                  <Td>
                    <Badge colorScheme="green">{token.symbol}</Badge>
                  </Td>
                  <Td color="white">
                    {marketData[token.address]
                      ? formatNumber(marketData[token.address].price)
                      : '$0.00'}
                  </Td>
                  <Td color="white">
                    {marketData[token.address]
                      ? formatNumber(marketData[token.address].volume24h)
                      : '$0.00'}
                  </Td>
                  <Td color="white">
                    {marketData[token.address]
                      ? formatNumber(marketData[token.address].liquidity)
                      : '$0.00'}
                  </Td>
                  <Td>
                    <Text
                      color={
                        marketData[token.address]?.priceChange >= 0
                          ? 'green.400'
                          : 'red.400'
                      }
                    >
                      {marketData[token.address]
                        ? `${marketData[token.address].priceChange.toFixed(2)}%`
                        : '0.00%'}
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

export default SplTracker;
