import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';

class LearningModel {
  constructor() {
    this.model = null;
    this.difficultyModel = null;
    this.topicModel = null;
    this.initialized = false;
  }

  async initialize() {
    // Main learning effectiveness model
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [15],  // Extended features including crypto-specific metrics
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 4,  // Extended outputs: comprehension, engagement, retention, crypto_confidence
          activation: 'softmax'
        })
      ]
    });

    // Difficulty adjustment model
    this.difficultyModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10],
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 3,  // Easy, Medium, Hard
          activation: 'softmax'
        })
      ]
    });

    // Topic recommendation model
    this.topicModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [20],  // User history + current performance
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 10,  // Number of main crypto topics
          activation: 'softmax'
        })
      ]
    });

    // Compile models
    const modelConfig = {
      optimizer: tf.train.adam(0.01),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    };

    this.model.compile(modelConfig);
    this.difficultyModel.compile(modelConfig);
    this.topicModel.compile(modelConfig);

    this.initialized = true;
  }

  preprocessData(userData) {
    return tf.tidy(() => {
      const features = [
        // Basic learning metrics
        userData.timeSpent / 3600,
        userData.attemptCount / 10,
        userData.correctAnswers / userData.totalQuestions,
        userData.averageResponseTime / 60,
        userData.helpRequestCount / 5,
        userData.revisitCount / 3,
        userData.completionRate,
        userData.engagementScore,
        userData.difficultyRating / 5,
        userData.confidenceScore / 100,
        
        // Crypto-specific metrics
        userData.cryptoTerminologyScore / 100,
        userData.practicalApplicationScore / 100,
        userData.securityAwarenessScore / 100,
        userData.marketUnderstandingScore / 100,
        userData.technicalConceptScore / 100
      ];

      return tf.tensor2d([features]);
    });
  }

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
      retention: results[0][2],
      cryptoConfidence: results[0][3]
    };
  }

  async predictNextTopic(userData) {
    if (!this.initialized) await this.initialize();
    
    const userFeatures = this.preprocessData(userData);
    const prediction = this.topicModel.predict(userFeatures);
    const topicScores = await prediction.data();
    
    // Get top 3 recommended topics
    return Array.from(topicScores)
      .map((score, index) => ({ score, topic: this.getTopicName(index) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  async adjustDifficulty(userData) {
    if (!this.initialized) await this.initialize();
    
    const features = this.preprocessData(userData);
    const prediction = this.difficultyModel.predict(features);
    const [easy, medium, hard] = await prediction.data();
    
    // Return recommended difficulty level and confidence
    const difficulties = [
      { level: 'easy', confidence: easy },
      { level: 'medium', confidence: medium },
      { level: 'hard', confidence: hard }
    ];
    
    return difficulties.sort((a, b) => b.confidence - a.confidence)[0];
  }

  getTopicName(index) {
    const topics = [
      'blockchain_basics',
      'crypto_wallets',
      'defi_fundamentals',
      'security_best_practices',
      'trading_basics',
      'smart_contracts',
      'nft_fundamentals',
      'market_analysis',
      'regulatory_compliance',
      'risk_management'
    ];
    return topics[index];
  }

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
        data.retentionScore / 100,
        data.cryptoConfidenceScore / 100
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

  async saveModel() {
    if (this.initialized) {
      await this.model.save('localstorage://learning-model');
      await this.difficultyModel.save('localstorage://difficulty-model');
      await this.topicModel.save('localstorage://topic-model');
    }
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('localstorage://learning-model');
      this.difficultyModel = await tf.loadLayersModel('localstorage://difficulty-model');
      this.topicModel = await tf.loadLayersModel('localstorage://topic-model');
      this.initialized = true;
    } catch (error) {
      console.log('No saved model found, creating new one');
      await this.initialize();
    }
  }
}

export default LearningModel;
