import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
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
  Button,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { updateRaffleStatuses, getRaffleStatus } from '../../utils/raffleUtils';

// Initialize Solana connection and constants
const connection = new web3.Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || web3.clusterApiUrl('devnet'),
  'confirmed'
);

const RAFFLE_WALLET = new web3.PublicKey(process.env.NEXT_PUBLIC_RAFFLE_WALLET_ADDRESS || 'F2NMjJX7xHfKWfgAEv9uATcgx2nabzDFkKtk8szoJASN');

const Raffle = () => {
  const { connected, publicKey } = useWallet();
  const [liveRaffles, setLiveRaffles] = useState([]);
  const [endedRaffles, setEndedRaffles] = useState([]);
  const [userTickets, setUserTickets] = useState({});
  const toast = useToast();

  // Fetch raffles regardless of wallet connection
  useEffect(() => {
    fetchRaffles();
    // Set up periodic status updates
    const interval = setInterval(fetchRaffles, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch user's tickets when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserTickets();
    } else {
      setUserTickets({});
    }
  }, [connected, publicKey]);

  const fetchUserTickets = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/wallet/${publicKey.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      
      const tickets = await response.json();
      // Organize tickets by raffle ID
      const ticketsByRaffle = tickets.reduce((acc, ticket) => {
        acc[ticket.raffleId] = [...(acc[ticket.raffleId] || []), ticket];
        return acc;
      }, {});
      
      setUserTickets(ticketsByRaffle);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
    }
  };

  const fetchRaffles = async () => {
    try {
      const updatedRaffles = await updateRaffleStatuses();
      
      // Filter raffles by their current status
      const live = updatedRaffles.filter(raffle => getRaffleStatus(raffle) === 'active');
      const ended = updatedRaffles.filter(raffle => getRaffleStatus(raffle) === 'ended');

      setLiveRaffles(live);
      setEndedRaffles(ended);
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

  const calculatePrizePool = (raffle) => {
    return raffle.totalTickets * raffle.costPerTicket;
  };

  const RaffleCard = ({ raffle, type }) => {
    const userTicketCount = userTickets[raffle._id]?.length || 0;
    
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        bg="whiteAlpha.100"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        <Heading size="md" mb={2} color="green.400">
          {raffle.name}
        </Heading>
        <Text fontSize="sm" color="gray.400" mb={3}>
          {raffle.description}
        </Text>
        <VStack align="start" spacing={2}>
          <Text>Cost per Ticket: {raffle.costPerTicket} SOL</Text>
          <Text>Total Prize Pool: {calculatePrizePool(raffle)} SOL</Text>
          <Text>Total Tickets: {raffle.totalTickets}</Text>
          {connected && (
            <Text color="green.400">Your Tickets: {userTicketCount}</Text>
          )}
          {type !== 'ended' ? (
            <Text>
              Ends: {new Date(raffle.endDate).toLocaleDateString()},{' '}
              {new Date(raffle.endDate).toLocaleTimeString()}
            </Text>
          ) : (
            <Text>Winner: {raffle.winner || 'Drawing pending...'}</Text>
          )}
          {type !== 'ended' && (
            <Button
              colorScheme="green"
              size="sm"
              onClick={() => handleEnterRaffle(raffle)}
              isDisabled={!connected || userTicketCount >= 10}
            >
              {!connected ? 'Connect Wallet to Enter' : 
               userTicketCount >= 10 ? 'Max Tickets Reached' : 
               'Enter Raffle'}
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  const handleEnterRaffle = async (raffle) => {
    try {
      if (!publicKey) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your Phantom wallet first',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check user's existing tickets for this raffle from the API
      const userAddress = publicKey.toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/raffle/${raffle.id}`);
      const tickets = await response.json();
      const userTicketsForRaffle = tickets.filter(ticket => ticket.walletAddress === userAddress);

      if (userTicketsForRaffle.length >= 10) {
        toast({
          title: 'Ticket Limit Reached',
          description: 'You can only purchase up to 10 tickets per raffle',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create transaction
      const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
      const transaction = new web3.Transaction();
      
      // Add transfer instruction
      const transferInstruction = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new web3.PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET),
        lamports: web3.LAMPORTS_PER_SOL * raffle.costPerTicket,
      });
      
      transaction.add(transferInstruction);
      
      // Sign and send transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      // Purchase ticket through API
      const ticketResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raffleId: raffle.id,
          walletAddress: userAddress,
          transactionSignature: signature,
        }),
      });

      if (!ticketResponse.ok) {
        throw new Error('Failed to purchase ticket');
      }

      const newTicket = await ticketResponse.json();

      toast({
        title: 'Success!',
        description: `Successfully purchased ticket #${newTicket.ticketNumber}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh raffle data
      fetchRaffles();
    } catch (error) {
      console.error('Error entering raffle:', error);
      toast({
        title: 'Error',
        description: 'Failed to enter raffle. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const WinnerInfo = ({ raffle }) => (
    <HStack spacing={2}>
      <Text fontSize="sm" isTruncated maxW="150px">
        {raffle.winner.slice(0, 6)}...{raffle.winner.slice(-4)}
      </Text>
      {raffle.paymentStatus === 'paid' && raffle.transactionId && (
        <Link
          href={`https://solscan.io/tx/${raffle.transactionId}`}
          isExternal
          color="green.400"
        >
          <ExternalLinkIcon boxSize={4} />
        </Link>
      )}
    </HStack>
  );

  return (
    <Container maxW="container.xl" p={4}>
      <Heading mb={6} color="green.400">Raffle System</Heading>
      
      <Tabs>
        <TabList>
          <Tab>Live Raffles</Tab>
          <Tab>Ended Raffles</Tab>
          <Tab>Previous Winners</Tab>
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
              {endedRaffles
                .filter(raffle => !raffle.winner)
                .map((raffle) => (
                  <RaffleCard key={raffle.id} raffle={raffle} type="ended" />
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Raffle Name</Th>
                  <Th>End Date</Th>
                  <Th>Prize Amount</Th>
                  <Th>Winner</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {endedRaffles
                  .filter(raffle => raffle.winner)
                  .map((raffle) => (
                    <Tr key={raffle.id}>
                      <Td>{raffle.name}</Td>
                      <Td>{new Date(raffle.endDate).toLocaleString()}</Td>
                      <Td>{calculatePrizePool(raffle)} SOL</Td>
                      <Td>
                        <WinnerInfo raffle={raffle} />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={raffle.paymentStatus === 'paid' ? 'green' : 'red'}
                          >
                            {raffle.paymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                          </Badge>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Raffle;
