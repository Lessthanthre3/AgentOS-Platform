import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  useToast,
  Heading,
  Divider,
  Badge,
  List,
  ListItem,
  Icon,
  Flex,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Spinner,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  IconButton,
} from '@chakra-ui/react';
import { FaBrain, FaCheckCircle, FaArrowRight, FaBook, FaCode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import useLearningProgress from '../../hooks/useLearningProgress';

const ModuleCard = ({ module, onSelect, isCompleted }) => (
  <Box
    as={motion.div}
    whileHover={{ scale: 1.02 }}
    p={4}
    bg="gray.800"
    borderRadius="lg"
    borderWidth="1px"
    borderColor={isCompleted ? "green.500" : "gray.600"}
    cursor="pointer"
    onClick={() => onSelect(module)}
    position="relative"
    overflow="hidden"
  >
    <HStack spacing={4} align="start">
      <Icon as={FaBrain} boxSize={6} color="green.400" />
      <VStack align="start" spacing={2} flex={1}>
        <Heading size="sm">{module.title}</Heading>
        <Text fontSize="sm" color="gray.400">{module.description}</Text>
        <HStack>
          <Badge colorScheme={
            module.difficulty === 'beginner' ? 'green' : 
            module.difficulty === 'intermediate' ? 'yellow' : 
            'red'
          }>
            {module.difficulty}
          </Badge>
          <Badge colorScheme="purple">{module.estimatedTime} min</Badge>
          <Badge colorScheme="blue">{module.points} points</Badge>
        </HStack>
      </VStack>
      {isCompleted && (
        <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
      )}
    </HStack>
  </Box>
);

const QuestionSection = ({ question, onAnswer, userAnswer }) => {
  return (
    <Box mt={4} p={4} bg="gray.700" borderRadius="md">
      <Text fontWeight="bold" mb={3}>{question.question}</Text>
      <RadioGroup onChange={(value) => onAnswer(parseInt(value))} value={userAnswer}>
        <Stack>
          {question.options.map((option, idx) => (
            <Radio key={idx} value={idx} colorScheme="green">
              {option}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
      {userAnswer !== undefined && (
        <Box mt={3} p={3} bg={userAnswer === question.correctAnswer ? "green.700" : "red.700"} borderRadius="md">
          <Text>{question.explanation}</Text>
        </Box>
      )}
    </Box>
  );
};

const NeuralNetwork = () => {
  const { publicKey } = useWallet();
  const { progress, setProgress } = useLearningProgress();
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const toast = useToast();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3001/api/modules');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Failed to load learning modules. Please make sure the server is running.');
        toast({
          title: 'Error',
          description: 'Failed to load learning modules. Please make sure the server is running.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [toast]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        p={4}
      >
        <Text color="red.500" mb={4}>{error}</Text>
        <Button 
          colorScheme="green" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setUserAnswers({});
  };

  const handleAnswer = (questionIdx, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIdx]: answer
    }));
  };

  const handleModuleComplete = async (moduleId) => {
    try {
      const updatedProgress = {
        completedModules: [...(progress?.completedModules || []), moduleId]
      };
      
      const success = await setProgress(updatedProgress);
      
      if (success) {
        toast({
          title: 'Module Completed!',
          description: 'Great job! Keep learning to unlock more advanced content.',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={6} height="100%" overflow="auto" bg="gray.900" color="green.100">
      <VStack spacing={6} align="stretch">
        {!selectedModule ? (
          <>
            <Heading size="lg" color="green.400">Neural Network Training</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {modules.map((module) => (
                <Card
                  key={module._id}
                  bg="gray.800"
                  borderColor="green.500"
                  borderWidth="1px"
                  _hover={{ transform: 'scale(1.02)', cursor: 'pointer' }}
                  onClick={() => handleModuleSelect(module)}
                >
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md" color="green.400">{module.title}</Heading>
                      <Badge colorScheme={progress?.completedModules?.includes(module._id) ? 'green' : 'gray'}>
                        {progress?.completedModules?.includes(module._id) ? 'COMPLETED' : module.difficulty.toUpperCase()}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text>{module.description}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </>
        ) : (
          <Box>
            <HStack mb={4}>
              <IconButton
                icon={<FaArrowRight transform="rotate(180)" />}
                onClick={() => setSelectedModule(null)}
                aria-label="Back"
                variant="ghost"
                colorScheme="green"
              />
              <Heading size="lg" color="green.400">{selectedModule.title}</Heading>
            </HStack>
            {selectedModule.lessons.map((lesson, index) => (
              <Box key={`${selectedModule._id}-lesson-${index}`} mb={6}>
                <Heading size="md" mb={4} color="green.300">{lesson.title}</Heading>
                <Text whiteSpace="pre-wrap" mb={4}>{lesson.content}</Text>
                {lesson.quiz && (
                  <Box bg="gray.800" p={4} borderRadius="md">
                    <Heading size="sm" mb={4} color="green.300">Quiz</Heading>
                    {lesson.quiz.map((question, qIndex) => (
                      <Box key={`${selectedModule._id}-question-${qIndex}`} mb={4}>
                        <Text mb={2}>{question.text}</Text>
                        <RadioGroup
                          value={userAnswers[`${index}-${qIndex}`]}
                          onChange={(value) => handleAnswer(qIndex, parseInt(value, 10))}
                        >
                          <Stack>
                            {question.options.map((option, oIndex) => (
                              <Radio key={`${selectedModule._id}-option-${oIndex}`} value={oIndex.toString()}>
                                {option}
                              </Radio>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default NeuralNetwork;
