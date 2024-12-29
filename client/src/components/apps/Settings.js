import { Box, VStack, HStack, Switch, Text, Divider, useColorMode } from '@chakra-ui/react';
import useSystemState from '../../store/systemStore';

const Settings = () => {
  const { isMatrixEnabled, toggleMatrix } = useSystemState();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" color="green.300" fontWeight="bold">
          System Settings
        </Text>

        <Divider borderColor="green.500" opacity={0.3} />

        <VStack spacing={4} align="stretch">
          {/* Matrix Rain Effect */}
          <HStack justify="space-between">
            <Text color="white">Matrix Rain Effect</Text>
            <Switch
              isChecked={isMatrixEnabled}
              onChange={toggleMatrix}
              colorScheme="green"
            />
          </HStack>

          {/* Dark Mode Toggle */}
          <HStack justify="space-between">
            <Text color="white">Dark Mode</Text>
            <Switch
              isChecked={colorMode === 'dark'}
              onChange={toggleColorMode}
              colorScheme="green"
            />
          </HStack>
        </VStack>

        <Divider borderColor="green.500" opacity={0.3} />

        <Text fontSize="sm" color="gray.500">
          AgentOS v1.0.0
        </Text>
      </VStack>
    </Box>
  );
};

export default Settings;
