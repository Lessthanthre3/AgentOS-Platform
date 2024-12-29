const concurrently = require('concurrently');
const path = require('path');

// Define the commands to run
const commands = [
    // Main environment
    {
        command: 'npm run dev',
        name: 'client:main',
        cwd: path.join(__dirname, '../client'),
        prefixColor: 'blue'
    },
    {
        command: 'npm run dev',
        name: 'server:main',
        cwd: path.join(__dirname, '../server'),
        prefixColor: 'green'
    },
    
    // Beta environment
    {
        command: 'cross-env PORT=3002 MONGODB_URI=$MONGODB_URI_BETA npm run dev',
        name: 'server:beta',
        cwd: path.join(__dirname, '../server'),
        prefixColor: 'yellow'
    }
];

// Run all commands in parallel
concurrently(commands, {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 3,
}).then(
    () => {
        console.log('All processes completed successfully');
        process.exit(0);
    },
    (error) => {
        console.error('Error occurred:', error);
        process.exit(1);
    }
);
