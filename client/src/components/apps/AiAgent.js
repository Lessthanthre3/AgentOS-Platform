import { Box, VStack, Input, Button, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const AiAgent = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey } = useWallet();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const result = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          walletAddress: publicKey?.toString(),
        }),
      });

      const data = await result.json();
      setResponse(data.response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" h="100%">
      <Box flex="1" overflowY="auto" p={4} bg="gray.700" borderRadius="md">
        {response && (
          <Text color="green.300" whiteSpace="pre-wrap">
            {response}
          </Text>
        )}
      </Box>
      <Box p={4} borderTop="1px solid" borderColor="gray.600">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your prompt..."
          bg="gray.700"
          border="none"
          _focus={{ border: 'none' }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
        <Button
          mt={2}
          colorScheme="green"
          onClick={handleSubmit}
          isLoading={isLoading}
          width="100%"
        >
          Send
        </Button>
      </Box>
    </VStack>
  );
};

export default AiAgent;
