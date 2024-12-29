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
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedToken, setSelectedToken] = useState(null);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  const {
    tokens,
    addToken,
    removeToken,
    updateToken,
    fetchTokens,
    getPromotedTokens,
    isWalletWhitelisted,
  } = useAdminStore();

  useEffect(() => {
    if (!isWalletWhitelisted(window.solana?.publicKey?.toString())) {
      router.push('/');
      return;
    }
    fetchTokens();
  }, [fetchTokens, isWalletWhitelisted]);

  const handleAddToken = useCallback((token) => {
    addToken(token);
    onClose();
    toast({
      title: 'Token added.',
      description: "We've added the token for you.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }, [addToken, onClose, toast]);

  const handleEditToken = useCallback((token) => {
    setSelectedToken(token);
    onOpen();
  }, [onOpen]);

  const handleSaveToken = useCallback((token) => {
    if (selectedToken) {
      updateToken({ ...token, id: selectedToken.id });
      toast({
        title: 'Token updated.',
        description: "We've updated the token for you.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      handleAddToken(token);
    }
    setSelectedToken(null);
    onClose();
  }, [selectedToken, updateToken, handleAddToken, onClose, toast]);

  const handleDeleteToken = useCallback((tokenId) => {
    removeToken(tokenId);
    toast({
      title: 'Token removed.',
      description: "We've removed the token for you.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }, [removeToken, toast]);

  return (
    <Box p={5}>
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>Token Management</Tab>
          <Tab>Feature Flags</Tab>
          <Tab>Raffle Management</Tab>
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
                    <Th>Address</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tokens.map((token) => (
                    <Tr key={token.id}>
                      <Td>{token.name}</Td>
                      <Td>{token.symbol}</Td>
                      <Td>{token.network}</Td>
                      <Td>
                        <Text isTruncated maxW="200px">
                          {token.address}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit token"
                            icon={<FaEdit />}
                            size="sm"
                            onClick={() => handleEditToken(token)}
                          />
                          <IconButton
                            aria-label="Delete token"
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteToken(token.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>

            <TokenModal
              isOpen={isOpen}
              onClose={onClose}
              token={selectedToken}
              onSave={handleSaveToken}
            />
          </TabPanel>

          <TabPanel>
            <FeatureFlagManager />
          </TabPanel>

          <TabPanel>
            <RaffleAdmin />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminPanel;
