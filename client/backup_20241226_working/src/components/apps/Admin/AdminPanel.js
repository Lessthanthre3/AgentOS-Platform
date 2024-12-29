import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  IconButton,
  Flex,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useState } from 'react';
import useAdminStore from '../../../store/adminStore';

const AdminPanel = () => {
  const toast = useToast();
  const { tokens, addToken, removeToken, updateToken } = useAdminStore();
  const [newToken, setNewToken] = useState({
    name: '',
    symbol: '',
    address: '',
    isPromoted: false,
    description: '',
    website: '',
    twitter: '',
    telegram: '',
  });

  const handleAddToken = () => {
    if (!newToken.name || !newToken.symbol || !newToken.address) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    addToken({
      ...newToken,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    });

    setNewToken({
      name: '',
      symbol: '',
      address: '',
      isPromoted: false,
      description: '',
      website: '',
      twitter: '',
      telegram: '',
    });

    toast({
      title: 'Success',
      description: 'Token added successfully',
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <Box>
      <Text fontSize="2xl" color="brand.text.primary" mb={6}>
        Token Management
      </Text>

      {/* Add New Token Form */}
      <Box
        bg="brand.background.secondary"
        p={4}
        borderRadius="md"
        borderColor="brand.primary"
        borderWidth="1px"
        mb={6}
      >
        <Text fontSize="lg" color="brand.text.primary" mb={4}>
          Add New Token
        </Text>
        <VStack spacing={4}>
          <HStack width="100%" spacing={4}>
            <FormControl>
              <FormLabel color="brand.text.secondary">Name</FormLabel>
              <Input
                variant="matrix"
                value={newToken.name}
                onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                placeholder="Token Name"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="brand.text.secondary">Symbol</FormLabel>
              <Input
                variant="matrix"
                value={newToken.symbol}
                onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                placeholder="Token Symbol"
              />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel color="brand.text.secondary">Contract Address</FormLabel>
            <Input
              variant="matrix"
              value={newToken.address}
              onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
              placeholder="Solana Contract Address"
            />
          </FormControl>

          <HStack width="100%" spacing={4}>
            <FormControl>
              <FormLabel color="brand.text.secondary">Website</FormLabel>
              <Input
                variant="matrix"
                value={newToken.website}
                onChange={(e) => setNewToken({ ...newToken, website: e.target.value })}
                placeholder="Website URL"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="brand.text.secondary">Twitter</FormLabel>
              <Input
                variant="matrix"
                value={newToken.twitter}
                onChange={(e) => setNewToken({ ...newToken, twitter: e.target.value })}
                placeholder="Twitter URL"
              />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel color="brand.text.secondary">Description</FormLabel>
            <Input
              variant="matrix"
              value={newToken.description}
              onChange={(e) => setNewToken({ ...newToken, description: e.target.value })}
              placeholder="Token Description"
            />
          </FormControl>

          <HStack width="100%" justify="space-between">
            <FormControl display="flex" alignItems="center">
              <FormLabel color="brand.text.secondary" mb={0}>
                Promoted
              </FormLabel>
              <Switch
                colorScheme="green"
                isChecked={newToken.isPromoted}
                onChange={(e) => setNewToken({ ...newToken, isPromoted: e.target.checked })}
              />
            </FormControl>
            <Button leftIcon={<FaPlus />} onClick={handleAddToken}>
              Add Token
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Token List */}
      <Box
        overflowX="auto"
        bg="brand.background.secondary"
        p={4}
        borderRadius="md"
        borderColor="brand.primary"
        borderWidth="1px"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="brand.text.secondary">Name</Th>
              <Th color="brand.text.secondary">Symbol</Th>
              <Th color="brand.text.secondary">Address</Th>
              <Th color="brand.text.secondary">Status</Th>
              <Th color="brand.text.secondary">Added Date</Th>
              <Th color="brand.text.secondary">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tokens.map((token) => (
              <Tr key={token.id}>
                <Td color="brand.text.primary">{token.name}</Td>
                <Td color="brand.text.primary">{token.symbol}</Td>
                <Td color="brand.text.primary">
                  <Text isTruncated maxW="200px">
                    {token.address}
                  </Text>
                </Td>
                <Td>
                  <Switch
                    colorScheme="green"
                    isChecked={token.isPromoted}
                    onChange={() =>
                      updateToken(token.id, { ...token, isPromoted: !token.isPromoted })
                    }
                  />
                </Td>
                <Td color="brand.text.primary">
                  {new Date(token.dateAdded).toLocaleDateString()}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<FaEdit />}
                      variant="ghost"
                      onClick={() => {/* Implement edit */}}
                      aria-label="Edit"
                    />
                    <IconButton
                      icon={<FaTrash />}
                      variant="ghost"
                      onClick={() => removeToken(token.id)}
                      aria-label="Delete"
                      _hover={{ color: 'red.500' }}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AdminPanel;
