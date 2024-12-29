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
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import useAdminStore from '../../store/adminStore';

const TokenModal = ({ isOpen, onClose, token = null, onSave }) => {
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    symbol: '',
    description: '',
    isPromoted: false,
    ...token,
  });

  useEffect(() => {
    if (token) {
      setFormData({ ...token });
    } else {
      setFormData({
        address: '',
        name: '',
        symbol: '',
        description: '',
        isPromoted: false,
      });
    }
  }, [token]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: token?.id || Date.now().toString(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="gray.800" borderColor="green.500" borderWidth="1px">
        <ModalHeader color="green.300">
          {token ? 'Edit Token' : 'Add New Token'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="green.300">Contract Address</FormLabel>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter contract address"
                bg="gray.900"
                borderColor="green.500"
                _hover={{ borderColor: 'green.400' }}
                _focus={{ borderColor: 'green.300', boxShadow: '0 0 0 1px #48BB78' }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="green.300">Token Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter token name"
                bg="gray.900"
                borderColor="green.500"
                _hover={{ borderColor: 'green.400' }}
                _focus={{ borderColor: 'green.300', boxShadow: '0 0 0 1px #48BB78' }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="green.300">Symbol</FormLabel>
              <Input
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="Enter token symbol"
                bg="gray.900"
                borderColor="green.500"
                _hover={{ borderColor: 'green.400' }}
                _focus={{ borderColor: 'green.300', boxShadow: '0 0 0 1px #48BB78' }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="green.300">Description</FormLabel>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter token description"
                bg="gray.900"
                borderColor="green.500"
                _hover={{ borderColor: 'green.400' }}
                _focus={{ borderColor: 'green.300', boxShadow: '0 0 0 1px #48BB78' }}
              />
            </FormControl>
            <Button
              colorScheme="green"
              variant="outline"
              size="sm"
              leftIcon={<FaStar />}
              onClick={() => setFormData({ ...formData, isPromoted: !formData.isPromoted })}
              opacity={formData.isPromoted ? 1 : 0.5}
            >
              {formData.isPromoted ? 'Promoted' : 'Not Promoted'}
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="green" onClick={handleSubmit}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const AdminPanel = () => {
  const { tokens, addToken, removeToken, updateToken } = useAdminStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedToken, setSelectedToken] = useState(null);
  const toast = useToast();

  const handleAddToken = () => {
    setSelectedToken(null);
    onOpen();
  };

  const handleEditToken = (token) => {
    setSelectedToken(token);
    onOpen();
  };

  const handleSaveToken = (tokenData) => {
    try {
      if (selectedToken) {
        updateToken(tokenData.id, tokenData);
        toast({
          title: 'Token Updated',
          description: `Successfully updated ${tokenData.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        addToken(tokenData);
        toast({
          title: 'Token Added',
          description: `Successfully added ${tokenData.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteToken = (tokenId, tokenName) => {
    if (window.confirm(`Are you sure you want to delete ${tokenName}?`)) {
      removeToken(tokenId);
      toast({
        title: 'Token Deleted',
        description: `Successfully deleted ${tokenName}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" color="green.300" fontWeight="bold">
            Token Management
          </Text>
          <Button
            colorScheme="green"
            onClick={handleAddToken}
            size="sm"
          >
            Add New Token
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="green.300">Name</Th>
                <Th color="green.300">Symbol</Th>
                <Th color="green.300">Address</Th>
                <Th color="green.300">Status</Th>
                <Th color="green.300" isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tokens.map((token) => (
                <Tr key={token.id} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td color="white">{token.name}</Td>
                  <Td color="white">{token.symbol}</Td>
                  <Td color="white">
                    <Text isTruncated maxW="200px">
                      {token.address}
                    </Text>
                  </Td>
                  <Td>
                    <IconButton
                      icon={<FaStar />}
                      variant="ghost"
                      colorScheme="yellow"
                      size="sm"
                      opacity={token.isPromoted ? 1 : 0.3}
                      onClick={() => updateToken(token.id, { ...token, isPromoted: !token.isPromoted })}
                    />
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        icon={<FaEdit />}
                        variant="ghost"
                        colorScheme="green"
                        size="sm"
                        onClick={() => handleEditToken(token)}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteToken(token.id, token.name)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <TokenModal
        isOpen={isOpen}
        onClose={onClose}
        token={selectedToken}
        onSave={handleSaveToken}
      />
    </Box>
  );
};

export default AdminPanel;
