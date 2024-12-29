import { IconButton, useToast, Tooltip } from '@chakra-ui/react';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import useAdminStore from '../../store/adminStore';

const AdminLock = ({ onAdminAccess }) => {
  const { publicKey } = useWallet();
  const { isWalletWhitelisted } = useAdminStore();
  const [isHovered, setIsHovered] = useState(false);
  const toast = useToast();

  const handleClick = () => {
    if (!publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const walletAddress = publicKey.toString();
    if (isWalletWhitelisted(walletAddress)) {
      onAdminAccess();
    } else {
      toast({
        title: 'Unauthorized Access Attempt',
        description: 'Gaining unauthorized entry to our admin controls will enable our security protocol and you may temporarily lose your funds until KYC\'d. Please leave, thanks.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
        variant: 'solid',
        bg: 'red.600',
      });
    }
  };

  return (
    <Tooltip 
      label={publicKey && isWalletWhitelisted(publicKey.toString()) 
        ? "Access Admin Panel" 
        : "Restricted Access"}
      placement="top"
    >
      <IconButton
        icon={isHovered ? <FaLockOpen /> : <FaLock />}
        variant="ghost"
        colorScheme={publicKey && isWalletWhitelisted(publicKey.toString()) ? "green" : "red"}
        size="sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        opacity={0.8}
        _hover={{ opacity: 1 }}
      />
    </Tooltip>
  );
};

export default AdminLock;
