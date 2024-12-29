import { Box, VStack, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DesktopIcon = ({ icon: IconComponent, label, onClick, isActive }) => {
  return (
    <MotionBox
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      cursor="pointer"
      onClick={onClick}
      userSelect="none"
    >
      <VStack
        spacing={1}
        p={2}
        borderRadius="md"
        bg={isActive ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
        _hover={{ bg: 'rgba(0, 255, 65, 0.05)' }}
      >
        <Icon
          as={IconComponent}
          boxSize={8}
          color="brand.text.primary"
          filter="drop-shadow(0 0 2px rgba(0, 255, 65, 0.5))"
        />
        <Text
          color="brand.text.primary"
          fontSize="sm"
          textAlign="center"
          textShadow="0 0 5px rgba(0, 255, 65, 0.5)"
        >
          {label}
        </Text>
      </VStack>
    </MotionBox>
  );
};

export default DesktopIcon;
