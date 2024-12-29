require('dotenv').config();
const app = require('../src/app');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// Ensure we have required environment variables
const requiredEnvVars = [
  'MONGODB_URI'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Set production environment if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Log startup information
console.log('Starting server with configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
console.log('PORT:', process.env.PORT || 3001);

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers based on CPU cores
  const workerCount = process.env.NODE_ENV === 'production' ? numCPUs : 1;
  
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });
} else {
  // Use the PORT environment variable provided by Render
  const PORT = process.env.PORT || 3001;
  
  // Listen on all network interfaces
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Trying another port...`);
      // Try another port
      const newPort = parseInt(PORT) + 1;
      app.listen(newPort, '0.0.0.0', () => {
        console.log(`Worker ${process.pid} started on alternate port ${newPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}
