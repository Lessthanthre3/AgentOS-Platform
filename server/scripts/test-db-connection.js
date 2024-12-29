require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

async function testConnection() {
    const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        
        // List all databases
        const databasesList = await client.db().admin().listDatabases();
        console.log('Your databases:');
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
        
    } catch (error) {
        console.error('Connection error:', error);
    } finally {
        await client.close();
    }
}

testConnection().catch(console.error);
