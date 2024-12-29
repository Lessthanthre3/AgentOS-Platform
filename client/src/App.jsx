import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import LearningPath from './components/LearningPath';
import ModuleDetail from './components/ModuleDetail';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/" 
                sx={{ 
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                Crypto Learning Platform
              </Typography>
              <Button 
                color="inherit" 
                component={Link} 
                to="/"
              >
                Learning Path
              </Button>
            </Toolbar>
          </AppBar>
          
          <Container>
            <Routes>
              <Route path="/" element={<LearningPath />} />
              <Route path="/module/:moduleId" element={<ModuleDetail />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
