import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const RafflePage = () => {
  const { connected } = useWallet();
  const [liveRaffles, setLiveRaffles] = useState([]);
  const [endedRaffles, setEndedRaffles] = useState([]);
  const [eligibleRaffles, setEligibleRaffles] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to view raffles',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // TODO: Fetch raffles from backend
    // This will be implemented when we connect to the backend
    fetchRaffles();
  }, [connected]);

  const fetchRaffles = async () => {
    try {
      // Placeholder data - will be replaced with actual API calls
      setLiveRaffles([
        { id: 1, name: 'Raffle #1', prize: 'Prize 1', endTime: '2024-12-31' },
        { id: 2, name: 'Raffle #2', prize: 'Prize 2', endTime: '2024-12-30' },
      ]);
      setEndedRaffles([
        { id: 3, name: 'Raffle #3', prize: 'Prize 3', winner: 'Wallet123' },
      ]);
      setEligibleRaffles([
        { id: 1, name: 'Raffle #1', prize: 'Prize 1', endTime: '2024-12-31' },
      ]);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch raffles',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const RaffleCard = ({ raffle, type }) => (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="whiteAlpha.100"
      _hover={{ bg: 'whiteAlpha.200' }}
    >
      <Heading size="md">{raffle.name}</Heading>
      <Text>Prize: {raffle.prize}</Text>
      {type !== 'ended' ? (
        <Text>Ends: {raffle.endTime}</Text>
      ) : (
        <Text>Winner: {raffle.winner}</Text>
      )}
    </Box>
  );

  if (!connected) {
    return (
      <Container centerContent py={10}>
        <Heading mb={6}>Raffle System</Heading>
        <Text mb={4}>Connect your wallet to view and participate in raffles</Text>
        <WalletMultiButton />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Raffle System</Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Live Raffles</Tab>
          <Tab>Eligible Raffles</Tab>
          <Tab>Ended Raffles</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {liveRaffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} type="live" />
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {eligibleRaffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} type="eligible" />
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {endedRaffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} type="ended" />
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default RafflePage;
