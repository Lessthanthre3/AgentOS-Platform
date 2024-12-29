import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DataItem = ({ label, value, isNegative }) => (
  <VStack align="start" spacing={1}>
    <Text color="brand.text.secondary" fontSize="sm">
      {label}
    </Text>
    <Text 
      color={isNegative ? "red.400" : "brand.text.primary"} 
      fontSize="xl" 
      fontWeight="bold"
    >
      {value}
      {isNegative && <Text as="span" color="red.400"> ▼</Text>}
    </Text>
  </VStack>
);

const TokenDataCard = ({
  price,
  priceChange,
  volume,
  liquidity,
  fdv,
  tokenAddress,
  pairAddress,
  contractAddress,
}) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        bg="brand.background.secondary"
        borderColor="brand.primary"
        borderWidth="1px"
        borderRadius="md"
        p={6}
        position="relative"
        overflow="hidden"
      >
        {/* Title */}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="brand.text.primary"
          mb={6}
        >
          $AIS Token Data
        </Text>

        {/* Main Stats Grid */}
        <Flex wrap="wrap" gap={8} mb={8}>
          <DataItem
            label="Price USD"
            value={`$${price}`}
            isNegative={priceChange < 0}
          />
          <DataItem
            label="24h Volume"
            value={`$${volume}`}
          />
          <DataItem
            label="Liquidity"
            value={`$${liquidity}`}
          />
          <DataItem
            label="FDV"
            value={`$${fdv}`}
          />
        </Flex>

        {/* Contract Information */}
        <VStack align="start" spacing={4}>
          <Box>
            <Text color="brand.text.secondary" fontSize="sm" mb={1}>
              Token:
            </Text>
            <Text color="brand.text.primary" fontSize="sm" fontFamily="mono">
              {tokenAddress}
            </Text>
          </Box>
          
          <Box>
            <Text color="brand.text.secondary" fontSize="sm" mb={1}>
              Contract:
            </Text>
            <Text color="brand.text.primary" fontSize="sm" fontFamily="mono">
              {contractAddress}
            </Text>
          </Box>
          
          <Box>
            <Text color="brand.text.secondary" fontSize="sm" mb={1}>
              Pair Address:
            </Text>
            <Text color="brand.text.primary" fontSize="sm" fontFamily="mono">
              {pairAddress}
            </Text>
          </Box>
        </VStack>

        {/* Matrix-style background effect */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          opacity={0.05}
          bgGradient="linear(to-b, transparent, brand.primary, transparent)"
          animation="pulse 3s infinite"
        />
      </Box>
    </MotionBox>
  );
};

export default TokenDataCard;
