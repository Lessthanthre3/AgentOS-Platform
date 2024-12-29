const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log('Created data directory');
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    const envContent = `
MONGODB_URI=mongodb://localhost:27017/agentos
PORT=3001
    `.trim();
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env file');
}

console.log('Setup complete!');
