import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { updateRaffleStatuses, getRaffleStatus } from '../../utils/raffleUtils';

const RaffleAdmin = () => {
  const { publicKey } = useWallet();
  const toast = useToast();
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [newRaffle, setNewRaffle] = useState({
    name: '',
    ticketAmount: 100,
    costPerTicket: 0.1,
    startDate: '',
    endDate: '',
  });
  
  // For delete confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [raffleToDelete, setRaffleToDelete] = useState(null);
  
  // For winner selection modal
  const { isOpen: isWinnerOpen, onOpen: onWinnerOpen, onClose: onWinnerClose } = useDisclosure();
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // For transaction ID prompt
  const [txIdPromptIsOpen, setTxIdPromptIsOpen] = useState(false);
  const [selectedRaffleForTx, setSelectedRaffleForTx] = useState(null);
  const [txId, setTxId] = useState('');
  const txIdCancelRef = useRef();

  // Update status check to use utility functions
  useEffect(() => {
    const checkRaffleStatus = () => {
      const updatedRaffles = updateRaffleStatuses();
      setActiveRaffles(updatedRaffles);
    };

    // Initial check
    checkRaffleStatus();

    // Set up periodic checks
    const interval = setInterval(checkRaffleStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteClick = (raffle) => {
    setRaffleToDelete(raffle);
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (!raffleToDelete) return;
    
    try {
      // Get current raffles
      const updatedRaffles = activeRaffles.filter(raffle => raffle.id !== raffleToDelete.id);
      setActiveRaffles(updatedRaffles);
      localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));

      toast({
        title: 'Success',
        description: 'Raffle deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete raffle',
        status: 'error',
        duration: 3000,
      });
    }
    
    onDeleteClose();
    setRaffleToDelete(null);
  };

  const selectWinner = (raffle) => {
    setSelectedRaffle(raffle);
    
    // Get all tickets for this raffle
    const allStorageKeys = Object.keys(localStorage);
    const ticketKeys = allStorageKeys.filter(key => key.startsWith('tickets_'));
    let allTickets = [];
    
    ticketKeys.forEach(key => {
      const userTickets = JSON.parse(localStorage.getItem(key) || '[]');
      const raffleTickets = userTickets.filter(ticket => ticket.raffleId === raffle.id);
      allTickets = [...allTickets, ...raffleTickets];
    });

    if (allTickets.length === 0) {
      toast({
        title: 'No participants',
        description: 'No tickets were purchased for this raffle',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Randomly select winner
    const winningTicket = allTickets[Math.floor(Math.random() * allTickets.length)];
    setWinnerInfo(winningTicket);

    // Update raffle with winner
    const updatedRaffles = activeRaffles.map(r => {
      if (r.id === raffle.id) {
        return {
          ...r,
          winner: winningTicket.userAddress,
          winningTicket: winningTicket.ticketId,
        };
      }
      return r;
    });

    setActiveRaffles(updatedRaffles);
    localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));
    onWinnerOpen();
  };

  const handleRaffleStatusToggle = (raffleId) => {
    const updatedRaffles = activeRaffles.map(raffle => {
      if (raffle.id === raffleId) {
        // If raffle is pending, start it immediately
        if (getRaffleStatus(raffle) === 'pending') {
          return {
            ...raffle,
            startDate: new Date().toISOString(),
            status: 'active'
          };
        }
        // If raffle is active, end it immediately
        else if (getRaffleStatus(raffle) === 'active') {
          return {
            ...raffle,
            endDate: new Date().toISOString(),
            status: 'ended'
          };
        }
      }
      return raffle;
    });

    setActiveRaffles(updatedRaffles);
    localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));

    toast({
      title: 'Success',
      description: `Raffle status updated`,
      status: 'success',
      duration: 3000,
    });
  };

  const handlePaymentStatusToggle = (raffle) => {
    if (raffle.paymentStatus === 'unpaid') {
      setSelectedRaffleForTx(raffle);
      setTxIdPromptIsOpen(true);
    } else {
      // If changing from paid to unpaid, just remove the tx
      const updatedRaffles = activeRaffles.map(r => {
        if (r.id === raffle.id) {
          const { transactionId, ...rest } = r;
          return {
            ...rest,
            paymentStatus: 'unpaid'
          };
        }
        return r;
      });

      setActiveRaffles(updatedRaffles);
      localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));
    }
  };

  const handleTxIdSubmit = () => {
    if (!txId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid transaction ID',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const updatedRaffles = activeRaffles.map(raffle => {
      if (raffle.id === selectedRaffleForTx.id) {
        return {
          ...raffle,
          paymentStatus: 'paid',
          transactionId: txId.trim()
        };
      }
      return raffle;
    });

    setActiveRaffles(updatedRaffles);
    localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));
    setTxIdPromptIsOpen(false);
    setTxId('');
    setSelectedRaffleForTx(null);

    toast({
      title: 'Payment Status Updated',
      description: 'Payment verified with transaction ID',
      status: 'success',
      duration: 3000,
    });
  };

  const handleInputChange = (field, value) => {
    setNewRaffle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateRaffle = async () => {
    try {
      // Validate inputs
      if (!newRaffle.name || !newRaffle.ticketAmount || !newRaffle.startDate || !newRaffle.endDate) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all fields',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const startDate = new Date(newRaffle.startDate);
      const endDate = new Date(newRaffle.endDate);
      const now = new Date();

      if (endDate <= startDate) {
        toast({
          title: 'Validation Error',
          description: 'End date must be after start date',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Create new raffle object
      const raffleData = {
        ...newRaffle,
        id: Date.now().toString(),
        createdBy: publicKey.toString(),
        status: startDate <= now ? 'active' : 'pending',
        ticketsSold: 0,
        createdAt: new Date().toISOString(),
        paymentStatus: 'unpaid',
      };

      // Add to active raffles and save to localStorage
      const updatedRaffles = [...activeRaffles, raffleData];
      setActiveRaffles(updatedRaffles);
      localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));

      // Reset form
      setNewRaffle({
        name: '',
        ticketAmount: 100,
        costPerTicket: 0.1,
        startDate: '',
        endDate: '',
      });

      toast({
        title: 'Success',
        description: 'Raffle created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create raffle',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const calculatePrizePool = (raffle) => {
    return (raffle.ticketsSold || 0) * raffle.costPerTicket;
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Create New Raffle</Heading>
        
        <FormControl isRequired>
          <FormLabel>Raffle Name</FormLabel>
          <Input
            value={newRaffle.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter raffle name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Number of Tickets</FormLabel>
          <NumberInput
            value={newRaffle.ticketAmount}
            onChange={(value) => handleInputChange('ticketAmount', parseInt(value))}
            min={1}
            max={10000}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Cost per Ticket (SOL)</FormLabel>
          <NumberInput
            value={newRaffle.costPerTicket}
            onChange={(value) => handleInputChange('costPerTicket', parseFloat(value))}
            min={0.1}
            max={10}
            step={0.1}
            precision={2}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="datetime-local"
            value={newRaffle.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>End Date</FormLabel>
          <Input
            type="datetime-local"
            value={newRaffle.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
          />
        </FormControl>

        <Button colorScheme="green" onClick={handleCreateRaffle}>
          Create Raffle
        </Button>

        <Tabs>
          <TabList>
            <Tab>Active Raffles</Tab>
            <Tab>Previous Winners</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Tickets</Th>
                    <Th>Cost (SOL)</Th>
                    <Th>Prize Pool</Th>
                    <Th>Start Date</Th>
                    <Th>End Date</Th>
                    <Th>Status</Th>
                    <Th>Winner</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeRaffles.map((raffle) => {
                    const currentStatus = getRaffleStatus(raffle);
                    return (
                      <Tr key={raffle.id}>
                        <Td>{raffle.name}</Td>
                        <Td>{raffle.ticketAmount}</Td>
                        <Td>{raffle.costPerTicket}</Td>
                        <Td>{calculatePrizePool(raffle)} SOL</Td>
                        <Td>{new Date(raffle.startDate).toLocaleString()}</Td>
                        <Td>{new Date(raffle.endDate).toLocaleString()}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              currentStatus === 'active' ? 'green' : 
                              currentStatus === 'ended' ? 'red' : 'yellow'
                            }
                          >
                            {currentStatus.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          {raffle.winner ? (
                            <Text fontSize="sm" isTruncated maxW="150px">
                              {raffle.winner.slice(0, 6)}...{raffle.winner.slice(-4)}
                            </Text>
                          ) : (
                            'Not drawn'
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {currentStatus === 'ended' && !raffle.winner && (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => selectWinner(raffle)}
                              >
                                Draw Winner
                              </Button>
                            )}
                            <Button
                              size="sm"
                              colorScheme={currentStatus === 'active' ? 'red' : 'green'}
                              onClick={() => handleRaffleStatusToggle(raffle.id)}
                              isDisabled={currentStatus === 'ended' || raffle.winner !== undefined}
                            >
                              {currentStatus === 'active' ? 'End' : 'Start'}
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDeleteClick(raffle)}
                              isDisabled={currentStatus === 'active'}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TabPanel>

            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Raffle Name</Th>
                    <Th>End Date</Th>
                    <Th>Prize Amount</Th>
                    <Th>Winner</Th>
                    <Th>Payment Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeRaffles
                    .filter(raffle => raffle.winner && getRaffleStatus(raffle) === 'ended')
                    .map((raffle) => (
                      <Tr key={raffle.id}>
                        <Td>{raffle.name}</Td>
                        <Td>{new Date(raffle.endDate).toLocaleString()}</Td>
                        <Td>{calculatePrizePool(raffle)} SOL</Td>
                        <Td>
                          <Text fontSize="sm" isTruncated maxW="150px">
                            {raffle.winner.slice(0, 6)}...{raffle.winner.slice(-4)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={raffle.paymentStatus === 'paid' ? 'green' : 'red'}
                            cursor="pointer"
                            onClick={() => handlePaymentStatusToggle(raffle)}
                          >
                            {raffle.paymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleDeleteClick(raffle)}
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={undefined}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Raffle
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this raffle? This action cannot be undone.
                {raffleToDelete?.status === 'ended' && (
                  <Text color="red.500" mt={2}>
                    Warning: Make sure all prizes have been distributed before deleting an ended raffle.
                  </Text>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Winner Selection Modal */}
        <Modal isOpen={isWinnerOpen} onClose={onWinnerClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Raffle Winner</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {winnerInfo && (
                <VStack align="stretch" spacing={3}>
                  <Text><strong>Winning Ticket:</strong> #{winnerInfo.ticketId}</Text>
                  <Text><strong>Winner Address:</strong> {winnerInfo.userAddress}</Text>
                  <Text><strong>Prize Amount:</strong> {selectedRaffle ? calculatePrizePool(selectedRaffle) : 0} SOL</Text>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onWinnerClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Transaction ID Prompt */}
        <AlertDialog
          isOpen={txIdPromptIsOpen}
          leastDestructiveRef={txIdCancelRef}
          onClose={() => {
            setTxIdPromptIsOpen(false);
            setTxId('');
            setSelectedRaffleForTx(null);
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Enter Transaction ID
              </AlertDialogHeader>

              <AlertDialogBody>
                <Text mb={4}>Please enter the Solana transaction ID for payment verification:</Text>
                <Input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Enter transaction ID"
                />
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={txIdCancelRef} onClick={() => {
                  setTxIdPromptIsOpen(false);
                  setTxId('');
                  setSelectedRaffleForTx(null);
                }}>
                  Cancel
                </Button>
                <Button colorScheme="green" onClick={handleTxIdSubmit} ml={3}>
                  Verify Payment
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </Box>
  );
};

export default RaffleAdmin;
