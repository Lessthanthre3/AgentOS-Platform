import { 
  IconButton, 
  useToast, 
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Button,
  VStack
} from '@chakra-ui/react';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { useState } from 'react';
import useAdminStore from '../../store/adminStore';

const AdminLock = ({ onAdminAccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { setAdminToken } = useAdminStore();
  const toast = useToast();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token
      setAdminToken(data.token);
      
      // Close modal and notify success
      setIsOpen(false);
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 3000,
      });
      
      // Grant admin access
      onAdminAccess();
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <>
      <Tooltip 
        label="Admin Access"
        placement="top"
      >
        <IconButton
          icon={isHovered ? <FaLockOpen /> : <FaLock />}
          variant="ghost"
          colorScheme="blue"
          size="sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(true)}
          opacity={0.8}
          _hover={{ opacity: 1 }}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Admin Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button
                colorScheme="blue"
                width="100%"
                onClick={handleLogin}
                isLoading={isLoading}
              >
                Login
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AdminLock;
