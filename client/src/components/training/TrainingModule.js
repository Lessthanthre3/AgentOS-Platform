import { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Badge,
  Divider,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaCheckCircle, FaCircle, FaLock, FaUnlock, FaTrophy } from 'react-icons/fa';
import useUserProgress from '../../hooks/useUserProgress';

const modules = [
  {
    id: 1,
    title: 'Introduction to Web3 Trading',
    lessons: [
      {
        id: 'l1',
        title: 'Understanding Blockchain Basics',
        content: 'Learn the fundamental concepts of blockchain technology...',
        quiz: [
          {
            question: 'What is a blockchain?',
            options: [
              'A type of cryptocurrency',
              'A distributed ledger technology',
              'A trading platform',
              'A digital wallet'
            ],
            correct: 1
          },
          // More quiz questions...
        ]
      },
      // More lessons...
    ]
  },
  // More modules...
];

const TrainingModule = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState({});
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const toast = useToast();
  const { updateProgress, getUserProgress } = useUserProgress();
  const startTime = useRef(Date.now());

  useEffect(() => {
    const savedProgress = getUserProgress();
    if (savedProgress) {
      setProgress(savedProgress);
    }
  }, []);

  const handleAnswer = (questionId, answerIndex) => {
    const isCorrect = modules[currentModule].lessons[currentLesson].quiz[questionId].correct === answerIndex;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        selected: answerIndex,
        isCorrect
      }
    }));

    // Collect learning data
    const timeSpent = (Date.now() - startTime.current) / 1000;
    const learningData = {
      moduleId: modules[currentModule].id,
      lessonId: modules[currentModule].lessons[currentLesson].id,
      questionId,
      timeSpent,
      isCorrect,
      attemptCount: (prev[questionId]?.attempts || 0) + 1
    };

    // Update progress
    updateProgress(learningData);
  };

  const calculateModuleProgress = (moduleId) => {
    const module = modules[moduleId];
    let completed = 0;
    let total = 0;

    module.lessons.forEach(lesson => {
      lesson.quiz.forEach(question => {
        total++;
        if (userAnswers[`${lesson.id}-${question.id}`]?.isCorrect) {
          completed++;
        }
      });
    });

    return (completed / total) * 100;
  };

  const renderContent = () => {
    const currentLessonData = modules[currentModule].lessons[currentLesson];

    if (quizMode) {
      const question = currentLessonData.quiz[currentQuestion];
      return (
        <VStack spacing={4} align="stretch" p={6}>
          <Text fontSize="xl" color="green.300">
            Question {currentQuestion + 1} of {currentLessonData.quiz.length}
          </Text>
          <Text color="white" fontSize="lg">
            {question.question}
          </Text>
          <VStack spacing={3} align="stretch" mt={4}>
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                colorScheme={
                  userAnswers[currentQuestion]?.selected === index
                    ? userAnswers[currentQuestion]?.isCorrect
                      ? 'green'
                      : 'red'
                    : 'gray'
                }
                onClick={() => handleAnswer(currentQuestion, index)}
                isDisabled={userAnswers[currentQuestion] !== undefined}
              >
                {option}
              </Button>
            ))}
          </VStack>
          {userAnswers[currentQuestion] && (
            <Button
              colorScheme="green"
              onClick={() => {
                if (currentQuestion < currentLessonData.quiz.length - 1) {
                  setCurrentQuestion(prev => prev + 1);
                } else {
                  setQuizMode(false);
                  // Check if module is completed
                  if (calculateModuleProgress(currentModule) === 100) {
                    toast({
                      title: 'Module Completed!',
                      description: 'Congratulations on completing this module!',
                      status: 'success',
                      duration: 5000,
                    });
                  }
                }
              }}
            >
              Next
            </Button>
          )}
        </VStack>
      );
    }

    return (
      <VStack spacing={6} align="stretch" p={6}>
        <Text fontSize="2xl" color="green.300">
          {currentLessonData.title}
        </Text>
        <Text color="white" whiteSpace="pre-wrap">
          {currentLessonData.content}
        </Text>
        <Button
          colorScheme="green"
          onClick={() => setQuizMode(true)}
          rightIcon={<FaTrophy />}
        >
          Take Quiz
        </Button>
      </VStack>
    );
  };

  return (
    <Box height="100%" display="flex">
      {/* Sidebar */}
      <Box
        width="300px"
        borderRight="1px solid"
        borderColor="green.500"
        bg="gray.900"
        overflowY="auto"
      >
        <VStack spacing={0} align="stretch">
          {modules.map((module, moduleIndex) => (
            <Accordion
              key={module.id}
              allowToggle
              defaultIndex={currentModule === moduleIndex ? [0] : []}
            >
              <AccordionItem border="none">
                <AccordionButton
                  _hover={{ bg: 'whiteAlpha.100' }}
                  onClick={() => setCurrentModule(moduleIndex)}
                >
                  <HStack flex="1">
                    <Icon
                      as={moduleIndex <= currentModule ? FaUnlock : FaLock}
                      color={moduleIndex <= currentModule ? 'green.400' : 'gray.500'}
                    />
                    <Text color="white">{module.title}</Text>
                  </HStack>
                  <AccordionIcon color="green.400" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <List spacing={2}>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <ListItem
                        key={lesson.id}
                        onClick={() => {
                          if (moduleIndex <= currentModule) {
                            setCurrentLesson(lessonIndex);
                            setQuizMode(false);
                            setCurrentQuestion(0);
                          }
                        }}
                        cursor={moduleIndex <= currentModule ? 'pointer' : 'not-allowed'}
                        _hover={
                          moduleIndex <= currentModule
                            ? { bg: 'whiteAlpha.100' }
                            : {}
                        }
                        p={2}
                        borderRadius="md"
                      >
                        <HStack>
                          <ListIcon
                            as={
                              progress[`${module.id}-${lesson.id}`]?.completed
                                ? FaCheckCircle
                                : FaCircle
                            }
                            color={
                              progress[`${module.id}-${lesson.id}`]?.completed
                                ? 'green.400'
                                : 'gray.500'
                            }
                          />
                          <Text
                            color={
                              moduleIndex <= currentModule
                                ? 'white'
                                : 'gray.500'
                            }
                          >
                            {lesson.title}
                          </Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ))}
        </VStack>
      </Box>

      {/* Content Area */}
      <Box flex="1" overflowY="auto">
        {renderContent()}
      </Box>
    </Box>
  );
};

export default TrainingModule;
