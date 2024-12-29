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
} from '@chakra-ui/react';
import useAdminStore from '../../store/adminStore';
import { useRouter } from 'next/router';

const RaffleAdmin = () => {
  const router = useRouter();
  const toast = useToast();
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [raffleToDelete, setRaffleToDelete] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const cancelRef = useRef();

  const {
    login,
    logout,
    isAdmin,
    checkIsAdmin,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    fetchActiveRaffles,
    isWalletWhitelisted,
  } = useAdminStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    prizeAmount: '',
    costPerTicket: '',
  });

  useEffect(() => {
    const checkAdmin = async () => {
      if (!checkIsAdmin()) {
        onLoginOpen();
      }
    };
    checkAdmin();
  }, [checkIsAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchRaffles();
    }
  }, [isAdmin]);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const raffles = await fetchActiveRaffles();
      setActiveRaffles(raffles);
    } catch (error) {
      toast({
        title: 'Error fetching raffles',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const success = await login(loginPassword);
      if (success) {
        onLoginClose();
        await fetchRaffles();
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Login error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createRaffle(formData);
      await fetchRaffles();
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        prizeAmount: '',
        costPerTicket: '',
      });
      toast({
        title: 'Success',
        description: 'Raffle created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error creating raffle',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteRaffle(raffleToDelete._id);
      await fetchRaffles();
      setRaffleToDelete(null);
      onDeleteClose();
      toast({
        title: 'Success',
        description: 'Raffle deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting raffle',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isWalletWhitelisted(window.solana?.publicKey?.toString())) {
    router.push('/');
    return null;
  }

  return (
    <Box p={5}>
      <VStack spacing={8} align="stretch">
        <Heading>Raffle Admin Panel</Heading>

        {/* Create Raffle Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Prize Amount</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.prizeAmount}
                  onChange={(value) => handleNumberInputChange('prizeAmount', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Cost Per Ticket</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.costPerTicket}
                  onChange={(value) => handleNumberInputChange('costPerTicket', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </HStack>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Creating..."
            >
              Create Raffle
            </Button>
          </VStack>
        </Box>

        {/* Active Raffles Table */}
        <Box>
          <Heading size="md" mb={4}>Active Raffles</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Prize Amount</Th>
                <Th>Cost Per Ticket</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activeRaffles.map((raffle) => (
                <Tr key={raffle._id}>
                  <Td>{raffle.name}</Td>
                  <Td>{raffle.description}</Td>
                  <Td>{new Date(raffle.startDate).toLocaleString()}</Td>
                  <Td>{new Date(raffle.endDate).toLocaleString()}</Td>
                  <Td>{raffle.prizeAmount}</Td>
                  <Td>{raffle.costPerTicket}</Td>
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => {
                        setRaffleToDelete(raffle);
                        onDeleteOpen();
                      }}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Raffle</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this raffle? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={onLoginClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Admin Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleLogin}>
              Login
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RaffleAdmin;
