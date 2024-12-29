import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Image,
  Select,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useWalletStore from '../../../../store/walletStore';

const SwapPanel = () => {
  const { publicKey } = useWallet();
  const { solBalance, aisBalance, fetchQuote, executeSwap } = useWalletStore();
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('AIS');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const tokens = [
    { symbol: 'SOL', balance: solBalance, icon: '/images/solana-logo.png' },
    { symbol: 'AIS', balance: aisBalance, icon: '/images/ais-logo.png' },
  ];

  useEffect(() => {
    if (amount && fromToken && toToken) {
      getQuote();
    }
  }, [amount, fromToken, toToken]);

  const getQuote = async () => {
    try {
      setIsLoading(true);
      const quoteData = await fetchQuote({
        inputMint: fromToken,
        outputMint: toToken,
        amount: parseFloat(amount),
      });
      setQuote(quoteData);
    } catch (error) {
      toast({
        title: 'Error getting quote',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!quote) return;

    try {
      setIsLoading(true);
      await executeSwap(quote);
      toast({
        title: 'Swap successful',
        description: `Swapped ${amount} ${fromToken} to ${toToken}`,
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Swap failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* From Token */}
      <Box>
        <Text color="gray.400" mb={2}>From</Text>
        <HStack>
          <Select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            variant="filled"
            bg="whiteAlpha.50"
            borderColor="green.500"
            color="green.200"
            w="150px"
          >
            {tokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </Select>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            type="number"
            variant="filled"
            bg="whiteAlpha.50"
            borderColor="green.500"
            color="green.200"
          />
        </HStack>
        <Text color="gray.500" fontSize="sm" mt={1}>
          Balance: {tokens.find(t => t.symbol === fromToken)?.balance.toFixed(4) || '0'} {fromToken}
        </Text>
      </Box>

      {/* Switch Button */}
      <Box textAlign="center">
        <IconButton
          icon={<FaExchangeAlt />}
          onClick={switchTokens}
          variant="ghost"
          colorScheme="green"
          transform="rotate(90deg)"
        />
      </Box>

      {/* To Token */}
      <Box>
        <Text color="gray.400" mb={2}>To</Text>
        <HStack>
          <Select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            variant="filled"
            bg="whiteAlpha.50"
            borderColor="green.500"
            color="green.200"
            w="150px"
          >
            {tokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </Select>
          <Input
            value={quote ? quote.outAmount : ''}
            isReadOnly
            placeholder="0.00"
            variant="filled"
            bg="whiteAlpha.50"
            borderColor="green.500"
            color="green.200"
          />
        </HStack>
        <Text color="gray.500" fontSize="sm" mt={1}>
          Balance: {tokens.find(t => t.symbol === toToken)?.balance.toFixed(4) || '0'} {toToken}
        </Text>
      </Box>

      {quote && (
        <Box p={4} bg="whiteAlpha.50" borderRadius="md">
          <HStack justify="space-between">
            <Text color="gray.400">Rate</Text>
            <Text color="green.200">
              1 {fromToken} = {(quote.outAmount / amount).toFixed(4)} {toToken}
            </Text>
          </HStack>
          <HStack justify="space-between" mt={2}>
            <Text color="gray.400">Fee</Text>
            <Text color="green.200">{quote.fee} SOL</Text>
          </HStack>
        </Box>
      )}

      <Button
        colorScheme="green"
        size="lg"
        isLoading={isLoading}
        onClick={handleSwap}
        isDisabled={!quote || isLoading}
      >
        Swap
      </Button>
    </VStack>
  );
};

export default SwapPanel;
