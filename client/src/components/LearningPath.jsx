import React, { useState, useEffect } from 'react';
import { Card, Typography, List, ListItem, Chip, Box } from '@mui/material';
import { useRouter } from 'next/router';

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error'
};

const LearningPath = () => {
  const [modules, setModules] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/modules/learning-path');
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error('Error fetching learning path:', error);
      }
    };

    fetchModules();
  }, []);

  const renderModule = (module, depth = 0) => (
    <Box key={module.moduleId} sx={{ ml: depth * 4 }}>
      <Card 
        sx={{ 
          my: 2, 
          p: 2, 
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 6
          }
        }}
        onClick={() => router.push(`/module/${module.moduleId}`)}
      >
        <Typography variant="h6">{module.title}</Typography>
        <Typography color="textSecondary" variant="body2">
          {module.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip 
            label={module.difficulty} 
            color={difficultyColors[module.difficulty]} 
            size="small" 
          />
          <Chip 
            label={module.category.replace('_', ' ')} 
            variant="outlined" 
            size="small" 
          />
        </Box>
      </Card>
      {module.children?.length > 0 && (
        <List>
          {module.children.map(child => renderModule(child, depth + 1))}
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Learning Path
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Follow this structured path to master cryptocurrency concepts.
      </Typography>
      {modules.map(module => renderModule(module))}
    </Box>
  );
};

export default LearningPath;
