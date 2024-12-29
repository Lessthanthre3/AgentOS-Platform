const app = require('../src/app');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

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
  // Use Render's PORT environment variable or fallback to 3001 for local development
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
