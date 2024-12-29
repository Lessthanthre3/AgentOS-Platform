const { Connection, PublicKey } = require('@solana/web3.js');
const { Program } = require('@project-serum/anchor');
const UserProgress = require('../models/UserProgress');

class ProgressSyncService {
  constructor(programId, connection) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
  }

  async syncUserProgress(walletAddress) {
    try {
      // Get off-chain progress
      let userProgress = await UserProgress.findOne({ walletAddress });
      
      if (!userProgress) {
        userProgress = new UserProgress({ walletAddress });
      }

      // Get on-chain progress
      const userPDA = await this.getUserProgressPDA(walletAddress);
      const onChainProgress = await this.program.account.userProgress.fetch(userPDA);

      // Sync achievements
      const achievementAccounts = await this.getAchievementAccounts(walletAddress);
      const newAchievements = achievementAccounts.filter(
        achievement => !userProgress.achievements.find(
          a => a.nftAddress === achievement.nftAddress
        )
      );

      // Update off-chain progress
      userProgress.totalScore = Math.max(userProgress.totalScore, onChainProgress.totalModulesCompleted * 100);
      userProgress.achievements.push(...newAchievements);
      
      // Save updated progress
      await userProgress.save();

      return userProgress;
    } catch (error) {
      console.error('Error syncing user progress:', error);
      throw error;
    }
  }

  async saveProgress(walletAddress, moduleData) {
    try {
      // Update off-chain progress
      const userProgress = await UserProgress.findOneAndUpdate(
        { walletAddress },
        {
          $set: {
            currentModule: moduleData.moduleId,
            'metrics.cryptoTerminologyScore': moduleData.metrics.terminology,
            'metrics.practicalApplicationScore': moduleData.metrics.practical,
            'metrics.securityAwarenessScore': moduleData.metrics.security,
            'metrics.marketUnderstandingScore': moduleData.metrics.market,
            'metrics.technicalConceptScore': moduleData.metrics.technical,
          },
          $push: {
            moduleProgress: {
              moduleId: moduleData.moduleId,
              status: moduleData.status,
              score: moduleData.score,
              attempts: moduleData.attempts,
              timeSpent: moduleData.timeSpent,
              lastAttempt: new Date(),
              difficulty: moduleData.difficulty
            }
          }
        },
        { new: true, upsert: true }
      );

      // If module is completed with high score, update on-chain progress
      if (moduleData.status === 'completed' && moduleData.score >= 80) {
        await this.program.methods
          .completeModule(moduleData.moduleId, moduleData.score)
          .accounts({
            user: new PublicKey(walletAddress),
            userAccount: await this.getUserProgressPDA(walletAddress),
          })
          .rpc();
      }

      return userProgress;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  async getUserProgressPDA(walletAddress) {
    const [pda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('user-progress'),
        new PublicKey(walletAddress).toBuffer(),
      ],
      this.programId
    );
    return pda;
  }

  async getAchievementAccounts(walletAddress) {
    // Implementation to fetch NFT achievements
    // This would interact with your NFT program
    return [];
  }
}

module.exports = ProgressSyncService;
