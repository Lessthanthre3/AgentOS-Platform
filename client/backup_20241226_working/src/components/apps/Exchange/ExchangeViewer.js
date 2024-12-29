import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  IconButton,
  Tooltip,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { FaSearch, FaStar, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import useAdminStore from '../../../store/adminStore';
import { DexScreenerAPI } from '../../../services/dexscreener';

const ExchangeViewer = () => {
  const { tokens } = useAdminStore();
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('volume24h');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchTokenData = async () => {
      setIsLoading(true);
      try {
        const promotedTokens = tokens.filter(token => token.isPromoted);
        const tokensWithMarketData = await Promise.all(
          promotedTokens.map(async (token) => {
            try {
              const dexData = await DexScreenerAPI.getTokenInfo(token.address);
              const marketData = DexScreenerAPI.formatMarketData(dexData);
              return { ...token, ...marketData };
            } catch (error) {
              console.error(`Error fetching data for ${token.symbol}:`, error);
              return token;
            }
          })
        );

        // Filter out tokens without market data
        const validTokens = tokensWithMarketData.filter(token => token.price);

        // Sort tokens
        const sorted = [...validTokens].sort((a, b) => {
          const aValue = a[sortBy] || 0;
          const bValue = b[sortBy] || 0;
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });

        setFilteredTokens(sorted);
      } catch (error) {
        toast({
          title: 'Error fetching token data',
          description: 'Please try again later',
          status: 'error',
          duration: 5000,
        });
      }
      setIsLoading(false);
    };

    fetchTokenData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, [tokens, sortBy, sortOrder]);

  const formatNumber = (num, decimals = 2) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <Box
      bg="brand.background.secondary"
      borderRadius="md"
      borderColor="brand.primary"
      borderWidth="1px"
      p={4}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" color="brand.text.primary">
          Solana Token Exchange
        </Text>
        <Flex gap={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              variant="matrix"
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Select
            variant="matrix"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            maxW="150px"
          >
            <option value="volume24h">Volume</option>
            <option value="marketCap">Market Cap</option>
            <option value="priceChange24h">Price Change</option>
            <option value="liquidity">Liquidity</option>
          </Select>
        </Flex>
      </Flex>

      {/* Token Table */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="brand.text.secondary">Token</Th>
              <Th color="brand.text.secondary">Price</Th>
              <Th color="brand.text.secondary">24h Change</Th>
              <Th color="brand.text.secondary">24h Volume</Th>
              <Th color="brand.text.secondary">Market Cap</Th>
              <Th color="brand.text.secondary">Liquidity</Th>
              <Th color="brand.text.secondary">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTokens.map((token) => (
              <Tr key={token.id}>
                <Td>
                  <Flex align="center" gap={2}>
                    <FaStar color="#FFD700" />
                    <Box>
                      <Text color="brand.text.primary" fontWeight="bold">
                        {token.name}
                      </Text>
                      <Text color="brand.text.secondary" fontSize="sm">
                        {token.symbol}
                      </Text>
                    </Box>
                  </Flex>
                </Td>
                <Td color="brand.text.primary">
                  {formatPrice(token.price)}
                </Td>
                <Td>
                  <Text
                    color={token.priceChange24h >= 0 ? 'green.400' : 'red.400'}
                    fontWeight="bold"
                  >
                    {token.priceChange24h ? (
                      <>
                        {token.priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(token.priceChange24h).toFixed(2)}%
                      </>
                    ) : 'N/A'}
                  </Text>
                </Td>
                <Td color="brand.text.primary">{formatNumber(token.volume24h)}</Td>
                <Td color="brand.text.primary">{formatNumber(token.marketCap)}</Td>
                <Td color="brand.text.primary">{formatNumber(token.liquidity)}</Td>
                <Td>
                  <Flex gap={2}>
                    <Tooltip label="View Chart">
                      <IconButton
                        icon={<FaChartLine />}
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(token.url, '_blank')}
                      />
                    </Tooltip>
                    <Tooltip label="View on Explorer">
                      <IconButton
                        icon={<FaExternalLinkAlt />}
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://solscan.io/token/${token.address}`, '_blank')}
                      />
                    </Tooltip>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ExchangeViewer;
