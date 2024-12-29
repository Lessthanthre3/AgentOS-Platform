import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';

class LearningModel {
  constructor() {
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    // Create a sequential model
    this.model = tf.sequential({
      layers: [
        // Input layer for user interaction features
        tf.layers.dense({
          inputShape: [10],  // Features: time spent, attempts, correct answers, etc.
          units: 16,
          activation: 'relu'
        }),
        
        // Hidden layer
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        
        // Output layer predicting learning effectiveness
        tf.layers.dense({
          units: 3,  // Different aspects: comprehension, engagement, retention
          activation: 'softmax'
        })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.initialized = true;
  }

  // Process user interaction data
  preprocessData(userData) {
    return tf.tidy(() => {
      const features = [
        userData.timeSpent / 3600,  // Normalize time spent to hours
        userData.attemptCount / 10,  // Normalize attempts
        userData.correctAnswers / userData.totalQuestions,
        userData.averageResponseTime / 60,  // Normalize to minutes
        userData.helpRequestCount / 5,  // Normalize help requests
        userData.revisitCount / 3,  // Normalize topic revisits
        userData.completionRate,
        userData.engagementScore,
        userData.difficultyRating / 5,
        userData.confidenceScore / 100
      ];

      return tf.tensor2d([features]);
    });
  }

  // Train the model with new user data
  async train(userDataBatch) {
    if (!this.initialized) await this.initialize();

    const batchSize = userDataBatch.length;
    const features = tf.tensor2d(
      userDataBatch.map(data => this.preprocessData(data).arraySync()[0])
    );
    
    const labels = tf.tensor2d(
      userDataBatch.map(data => [
        data.comprehensionScore / 100,
        data.engagementScore / 100,
        data.retentionScore / 100
      ])
    );

    await this.model.fit(features, labels, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
        }
      }
    });

    // Cleanup tensors
    features.dispose();
    labels.dispose();
  }

  // Predict learning effectiveness for a user
  async predict(userData) {
    if (!this.initialized) await this.initialize();

    const input = this.preprocessData(userData);
    const prediction = this.model.predict(input);
    const results = await prediction.array();
    
    // Cleanup tensors
    input.dispose();
    prediction.dispose();

    return {
      comprehension: results[0][0],
      engagement: results[0][1],
      retention: results[0][2]
    };
  }

  // Save the current model state
  async saveModel() {
    if (this.initialized) {
      await this.model.save('localstorage://learning-model');
    }
  }

  // Load a previously saved model
  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('localstorage://learning-model');
      this.initialized = true;
    } catch (error) {
      console.log('No saved model found, creating new one');
      await this.initialize();
    }
  }
}

export default LearningModel;
