import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
  useClipboard,
  Tooltip,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { FaCopy, FaTicketAlt } from 'react-icons/fa';

const Wallet = () => {
  const { publicKey, connected } = useWallet();
  const toast = useToast();
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [aisBalance, setAisBalance] = useState(0);
  const [myTickets, setMyTickets] = useState([]);
  const { onCopy } = useClipboard(publicKey?.toString() || '');

  // Connection to Solana network (devnet for now)
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
      fetchMyTickets();
    }
  }, [connected, publicKey]);

  const fetchBalances = async () => {
    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(publicKey);
      setSolanaBalance(balance / LAMPORTS_PER_SOL);

      // TODO: Fetch AIS token balance
      // This will be implemented once the AIS token is created
      setAisBalance(0);
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet balances',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchMyTickets = () => {
    try {
      // Get all raffles from localStorage
      const allRaffles = JSON.parse(localStorage.getItem('activeRaffles') || '[]');
      
      // Get user's tickets from localStorage
      const userTickets = JSON.parse(localStorage.getItem(`tickets_${publicKey.toString()}`) || '[]');
      
      // Combine raffle information with ticket information
      const ticketsWithRaffleInfo = userTickets.map(ticket => {
        const raffle = allRaffles.find(r => r.id === ticket.raffleId);
        return {
          ...ticket,
          raffleName: raffle?.name || 'Unknown Raffle',
          raffleStatus: raffle?.status || 'unknown',
          endDate: raffle?.endDate,
        };
      });

      setMyTickets(ticketsWithRaffleInfo);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch raffle tickets',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCopyAddress = () => {
    onCopy();
    toast({
      title: 'Address Copied',
      description: 'Wallet address copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  if (!connected) {
    return (
      <Box p={6} textAlign="center">
        <Heading size="md" mb={4}>My Wallet</Heading>
        <Text>Please connect your wallet to view your balances and tickets.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Wallet Address */}
        <Card>
          <CardHeader>
            <Heading size="md">Wallet Address</Heading>
          </CardHeader>
          <CardBody>
            <HStack>
              <Text fontSize="sm" fontFamily="monospace">
                {publicKey.toString()}
              </Text>
              <Tooltip label="Copy Address">
                <Button size="sm" onClick={handleCopyAddress}>
                  <FaCopy />
                </Button>
              </Tooltip>
            </HStack>
          </CardBody>
        </Card>

        {/* Balances */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>SOL Balance</StatLabel>
                <StatNumber>{solanaBalance.toFixed(4)} SOL</StatNumber>
                <StatHelpText>Solana Network</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>$AIS Balance</StatLabel>
                <StatNumber>{aisBalance.toFixed(2)} AIS</StatNumber>
                <StatHelpText>Agent Intelligence System Token</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* My Raffle Tickets */}
        <Card>
          <CardHeader>
            <Heading size="md">My Raffle Tickets</Heading>
          </CardHeader>
          <CardBody>
            {myTickets.length === 0 ? (
              <Text>You haven't entered any raffles yet.</Text>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Raffle</Th>
                    <Th>Ticket ID</Th>
                    <Th>Status</Th>
                    <Th>End Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {myTickets.map((ticket) => (
                    <Tr key={ticket.ticketId}>
                      <Td>{ticket.raffleName}</Td>
                      <Td>
                        <HStack>
                          <FaTicketAlt />
                          <Text>#{ticket.ticketId}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            ticket.raffleStatus === 'active' ? 'green' :
                            ticket.raffleStatus === 'ended' ? 'red' : 'yellow'
                          }
                        >
                          {ticket.raffleStatus}
                        </Badge>
                      </Td>
                      <Td>{new Date(ticket.endDate).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Wallet;
