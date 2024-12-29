import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Switch,
  Text,
  Heading,
  Badge,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Button,
  Tooltip,
  Spinner
} from '@chakra-ui/react';
import { featureFlags, FLAGS } from '../../config/featureFlags';
import { metricsService } from '../../services/metricsService';

const FeatureFlagManager = () => {
  const [flags, setFlags] = useState({});
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchMetrics = async () => {
    try {
      const allMetrics = await metricsService.getAllMetrics();
      setMetrics(allMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    const loadFlags = async () => {
      // Initialize flags
      const currentFlags = {};
      for (const flag of Object.keys(FLAGS)) {
        currentFlags[flag] = await featureFlags.isEnabled(flag);
      }
      setFlags(currentFlags);

      // Subscribe to flag changes
      const handleFlagChange = async (newFlags) => {
        setFlags(newFlags);
      };
      
      featureFlags.subscribe(handleFlagChange);
      return () => featureFlags.unsubscribe(handleFlagChange);
    };

    loadFlags();
    fetchMetrics().finally(() => setLoading(false));

    const metricsInterval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(metricsInterval);
  }, []);

  const handleToggle = async (flag) => {
    try {
      const newState = !flags[flag];
      if (newState) {
        await featureFlags.enable(flag);
      } else {
        await featureFlags.disable(flag);
      }
      
      // Update local state immediately for better UX
      setFlags(prev => ({
        ...prev,
        [flag]: newState
      }));

      toast({
        title: `Feature ${newState ? 'Enabled' : 'Disabled'}`,
        description: `${flag} has been ${newState ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating feature flag',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      await fetchMetrics();
      toast({
        title: 'Metrics Synced',
        description: 'Latest metrics have been fetched',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="green.400">Feature Flag Management</Heading>
        <Button onClick={handleSync} colorScheme="green" variant="outline">
          Sync Settings
        </Button>
      </HStack>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {Object.keys(FLAGS).map((flag) => (
          <Card
            key={flag}
            borderColor="green.500"
            borderWidth="1px"
            bg="gray.800"
          >
            <CardHeader>
              <HStack justify="space-between">
                <Text color="white" fontFamily="monospace">{flag}</Text>
                <Badge colorScheme={flags[flag] ? 'green' : 'red'}>
                  {flags[flag] ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </HStack>
            </CardHeader>

            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Switch
                  isChecked={flags[flag]}
                  onChange={() => handleToggle(flag)}
                  colorScheme="green"
                />

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Stat>
                    <StatLabel color="gray.400">Active Users</StatLabel>
                    <StatNumber color="white">
                      {metrics[flag]?.activeUsers || 0}
                    </StatNumber>
                    <StatHelpText color="gray.400">Current session</StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.400">Errors</StatLabel>
                    <StatNumber color="white">
                      {metrics[flag]?.errors || 0}
                    </StatNumber>
                    <StatHelpText color="gray.400">Last 24h</StatHelpText>
                  </Stat>
                </Grid>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>Usage</Text>
                  <Box
                    w="100%"
                    h="4px"
                    bg="gray.700"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      w={`${metrics[flag]?.performance || 0}%`}
                      h="100%"
                      bg="green.500"
                      transition="width 0.3s ease-in-out"
                    />
                  </Box>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureFlagManager;
