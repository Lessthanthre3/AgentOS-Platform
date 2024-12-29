import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaStar, FaFlag, FaTicketAlt } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import useAdminStore from '../../store/adminStore';
import FeatureFlagManager from './FeatureFlagManager';
import RaffleAdmin from './RaffleAdmin';

const TokenModal = ({ isOpen, onClose, token = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    network: '',
    address: '',
    featured: false,
    ...token
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{token ? 'Edit Token' : 'Add New Token'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl>
                <FormLabel>Symbol</FormLabel>
                <Input
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl>
                <FormLabel>Network</FormLabel>
                <Input
                  name="network"
                  value={formData.network}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const AdminPanel = () => {
  const store = useAdminStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedToken, setSelectedToken] = useState(null);
  const toast = useToast();

  const loadTokens = useCallback(async () => {
    try {
      if (typeof store.fetchTokens === 'function') {
        await store.fetchTokens();
      }
    } catch (error) {
      toast({
        title: 'Error fetching tokens',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [store, toast]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleEdit = (token) => {
    setSelectedToken(token);
    onOpen();
  };

  return (
    <Box p={4}>
      <Tabs>
        <TabList>
          <Tab>Tokens</Tab>
          <Tab><HStack><FaFlag /><Text>Feature Flags</Text></HStack></Tab>
          <Tab><HStack><FaTicketAlt /><Text>Raffles</Text></HStack></Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Button colorScheme="blue" onClick={() => { setSelectedToken(null); onOpen(); }}>
                  Add New Token
                </Button>
              </HStack>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Symbol</Th>
                    <Th>Network</Th>
                    <Th>Featured</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {store.tokens.map((token) => (
                    <Tr key={token.id}>
                      <Td>{token.name}</Td>
                      <Td>{token.symbol}</Td>
                      <Td>{token.network}</Td>
                      <Td>
                        <IconButton
                          icon={<FaStar />}
                          colorScheme={token.featured ? "yellow" : "gray"}
                          onClick={() => store.updateToken({ ...token, featured: !token.featured })}
                        />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            onClick={() => handleEdit(token)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            colorScheme="red"
                            onClick={() => store.removeToken(token.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </TabPanel>

          <TabPanel>
            <FeatureFlagManager />
          </TabPanel>

          <TabPanel>
            <RaffleAdmin />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <TokenModal
        isOpen={isOpen}
        onClose={onClose}
        token={selectedToken}
        onSave={(token) => {
          if (token.id) {
            store.updateToken(token);
          } else {
            store.addToken(token);
          }
          onClose();
        }}
      />
    </Box>
  );
};

export default AdminPanel;
