const app = require('./app');

// Use the PORT environment variable provided by Render
const PORT = process.env.PORT || 3001;

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying another port...`);
    // Try another port
    const newPort = parseInt(PORT) + 1;
    app.listen(newPort, '0.0.0.0', () => {
      console.log(`Server started on alternate port ${newPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
