import { Box, Flex, IconButton, Text, useDisclosure } from '@chakra-ui/react';
import { FaMinus, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const MatrixWindow = ({ 
  title, 
  children, 
  onClose, 
  isMinimized,
  onMinimize,
  initialPosition = { x: 0, y: 0 },
  width = "400px",
  height = "auto"
}) => {
  const { isOpen } = useDisclosure({ defaultIsOpen: true });

  if (!isOpen || isMinimized) return null;

  return (
    <MotionBox
      position="absolute"
      drag
      dragMomentum={false}
      initial={initialPosition}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      width={width}
      height={height}
      bg="brand.background.secondary"
      borderColor="brand.primary"
      borderWidth="1px"
      borderRadius="4px"
      boxShadow="0 0 10px rgba(0, 255, 65, 0.3)"
      overflow="hidden"
      zIndex={2}
    >
      {/* Window Header */}
      <Flex
        bg="brand.background.tertiary"
        borderBottom="1px solid"
        borderColor="brand.primary"
        p={2}
        alignItems="center"
        justifyContent="space-between"
        cursor="grab"
        _active={{ cursor: "grabbing" }}
      >
        <Text color="brand.text.primary" fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        <Flex gap={2}>
          <IconButton
            icon={<FaMinus />}
            size="xs"
            variant="ghost"
            onClick={onMinimize}
            aria-label="Minimize"
            color="brand.text.primary"
            _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
          />
          <IconButton
            icon={<FaTimes />}
            size="xs"
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
            color="brand.text.primary"
            _hover={{ bg: 'rgba(255, 0, 0, 0.1)', color: 'red.500' }}
          />
        </Flex>
      </Flex>

      {/* Window Content */}
      <Box p={4} height="calc(100% - 40px)" overflowY="auto">
        {children}
      </Box>
    </MotionBox>
  );
};

export default MatrixWindow;
