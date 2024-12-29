import { useState, useRef, useEffect } from 'react';
import { Box, VStack, Text, useToast } from '@chakra-ui/react';
import LearningModel from '../../ml/LearningModel';

const AIAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');
  const [learningData, setLearningData] = useState(null);
  const learningModel = useRef(new LearningModel());
  const toast = useToast();

  useEffect(() => {
    // Initialize learning model
    learningModel.current.loadModel();
  }, []);

  const handleUserInput = async (input) => {
    try {
      const response = await learningModel.current.processInput(input);
      setMessage(response);
      setLearningData(learningModel.current.getLearningData());
    } catch (error) {
      console.error('Error processing input:', error);
      toast({
        title: 'Error',
        description: 'Failed to process input',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Text>{message}</Text>
        {learningData && (
          <Text fontSize="sm" color="gray.500">
            Learning progress: {JSON.stringify(learningData)}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default AIAssistant;
