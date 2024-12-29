import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon
} from '@mui/icons-material';

const ModuleDetail = () => {
  const router = useRouter();
  const moduleId = router.query.moduleId;
  const [module, setModule] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/modules/${moduleId}`);
        const data = await response.json();
        setModule(data);
        setAnswers(new Array(data.content.practice.questions.length).fill(null));
      } catch (error) {
        console.error('Error fetching module:', error);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/modules/${moduleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  if (!module) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {module.title}
      </Typography>
      
      {/* Theory Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Theory
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {module.content.theory.text}
          </Typography>
          
          {/* Resources */}
          {module.content.theory.resources?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>
              <List>
                {module.content.theory.resources.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <VideoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={resource.description}
                      secondary={<a href={resource.url} target="_blank" rel="noopener noreferrer">Watch Video</a>}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Practice Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Practice
          </Typography>
          
          {/* Questions */}
          {module.content.practice.questions.map((question, questionIndex) => (
            <Paper key={questionIndex} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {question.question}
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={answers[questionIndex]}
                  onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                >
                  {question.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              {results && (
                <Box sx={{ mt: 2 }}>
                  {results.results[questionIndex].correct ? (
                    <Alert 
                      icon={<CorrectIcon />}
                      severity="success"
                    >
                      Correct!
                    </Alert>
                  ) : (
                    <Alert 
                      icon={<WrongIcon />}
                      severity="error"
                    >
                      {results.results[questionIndex].explanation}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          ))}
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
            disabled={answers.includes(null)}
            fullWidth
          >
            Submit Answers
          </Button>
          
          {results && (
            <Box sx={{ mt: 2 }}>
              <Alert 
                severity={results.passed ? "success" : "warning"}
                sx={{ mb: 2 }}
              >
                Your Score: {results.score}% ({results.passed ? "Passed" : "Try Again"})
              </Alert>
            </Box>
          )}
          
          {/* Exercises */}
          {module.content.practice.exercises?.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Exercises
              </Typography>
              {module.content.practice.exercises.map((exercise, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {exercise.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {exercise.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Hints:
                  </Typography>
                  <List>
                    {exercise.hints.map((hint, hintIndex) => (
                      <ListItem key={hintIndex}>
                        <ListItemText primary={hint} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModuleDetail;
