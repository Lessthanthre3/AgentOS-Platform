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

    fetchRaffles();
    // Set up periodic status updates
    const interval = setInterval(fetchRaffles, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [connected]);

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
    return (raffle.ticketsSold || 0) * raffle.costPerTicket;
  };

  const RaffleCard = ({ raffle, type }) => (
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
      <VStack align="start" spacing={2}>
        <Text>Cost per Ticket: {raffle.costPerTicket} SOL</Text>
        <Text>Total Prize Pool: {calculatePrizePool(raffle)} SOL</Text>
        <Text>Available Tickets: {raffle.ticketAmount - (raffle.ticketsSold || 0)}</Text>
        {type !== 'ended' ? (
          <Text>
            Ends: {new Date(raffle.endDate).toLocaleDateString()},{' '}
            {new Date(raffle.endDate).toLocaleTimeString()}
          </Text>
        ) : (
          <Text>Winner: {raffle.winner || 'Drawing pending...'}</Text>
        )}
        {type !== 'ended' ? (
          <Button
            colorScheme="green"
            size="sm"
            onClick={() => handleEnterRaffle(raffle)}
            isDisabled={!connected || raffle.ticketAmount <= (raffle.ticketsSold || 0)}
          >
            Enter Raffle
          </Button>
        ) : null}
      </VStack>
    </Box>
  );

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

      // Check user's existing tickets for this raffle
      const userAddress = publicKey.toString();
      const existingTickets = JSON.parse(localStorage.getItem(`tickets_${userAddress}`) || '[]');
      const userTicketsForRaffle = existingTickets.filter(ticket => ticket.raffleId === raffle.id);

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

      // Create the Solana transaction
      const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: RAFFLE_WALLET,
          lamports: web3.LAMPORTS_PER_SOL * raffle.costPerTicket,
        })
      );

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Request signature from Phantom wallet
      try {
        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature);

        // Generate a unique ticket ID
        const ticketId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create new ticket
        const newTicket = {
          ticketId,
          raffleId: raffle.id,
          purchaseDate: new Date().toISOString(),
          userAddress,
          transactionSignature: signature,
        };

        // Add to user's tickets
        const updatedTickets = [...existingTickets, newTicket];
        localStorage.setItem(`tickets_${userAddress}`, JSON.stringify(updatedTickets));

        // Update raffle's sold tickets count
        const allRaffles = JSON.parse(localStorage.getItem('activeRaffles') || '[]');
        const updatedRaffles = allRaffles.map(r => {
          if (r.id === raffle.id) {
            return {
              ...r,
              ticketsSold: (r.ticketsSold || 0) + 1,
            };
          }
          return r;
        });
        localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));

        toast({
          title: 'Success!',
          description: `You've entered the raffle! Your ticket ID is: ${ticketId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Refresh the raffles display
        fetchRaffles();
      } catch (err) {
        if (err.code === 4001) {
          toast({
            title: 'Transaction Cancelled',
            description: 'You cancelled the transaction',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Error entering raffle:', error);
      toast({
        title: 'Error',
        description: 'Failed to enter raffle: ' + error.message,
        status: 'error',
        duration: 3000,
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

  if (!connected) {
    return (
      <Container centerContent py={10}>
        <Heading mb={6}>Raffle System</Heading>
        <Text mb={4}>Please connect your wallet to view and participate in raffles</Text>
      </Container>
    );
  }

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
