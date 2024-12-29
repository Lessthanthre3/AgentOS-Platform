require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../src/models/LearningModule');

async function listModules() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\nFetching all modules...');
    const modules = await LearningModule.find({})
      .select('moduleId title difficulty category order')
      .sort({ order: 1 });
    
    console.log('\nAvailable Modules:');
    console.log('=================');
    modules.forEach(module => {
      console.log(`${module.order}. ${module.title}`);
      console.log(`   ID: ${module.moduleId}`);
      console.log(`   Difficulty: ${module.difficulty}`);
      console.log(`   Category: ${module.category}`);
      console.log('---');
    });
    
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

listModules();
