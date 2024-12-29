import { metricsService } from '../services/metricsService';

// Feature Flags Configuration
const defaultFlags = {
  SENTINEL: false,
  ALPHA_CALENDAR: false,
  REWARDS: false,
  BETA_TESTING: false
};

class FeatureFlags {
  constructor() {
    this.flags = { ...defaultFlags };
    this.subscribers = new Set();
    this.activeFeatures = new Map(); // Track which features are active per user
  }

  initialize() {
    // Load from environment variables if available
    Object.keys(this.flags).forEach(flag => {
      this.flags[flag] = process.env[`ENABLE_${flag}`] === 'true';
    });

    // Load from localStorage in client-side
    if (typeof window !== 'undefined') {
      const storedFlags = localStorage.getItem('featureFlags');
      if (storedFlags) {
        this.flags = { ...this.flags, ...JSON.parse(storedFlags) };
      }
    }
  }

  async isEnabled(flag, userId) {
    const isEnabled = !!this.flags[flag];
    
    // Track feature usage if enabled and we have a userId
    if (isEnabled && userId && !this.activeFeatures.get(`${flag}-${userId}`)) {
      this.activeFeatures.set(`${flag}-${userId}`, true);
      await metricsService.trackFeatureUsage(flag, userId);
    }
    
    return isEnabled;
  }

  async enable(flag) {
    if (flag in this.flags) {
      this.flags[flag] = true;
      this.persist();
      this.notifySubscribers();
    }
  }

  async disable(flag) {
    if (flag in this.flags) {
      this.flags[flag] = false;
      this.persist();
      this.notifySubscribers();
    }
  }

  persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.flags));
  }

  // Track errors for a specific feature
  async trackError(flag, error, userId) {
    if (userId) {
      await metricsService.trackError(flag, error, userId);
    }
  }
}

export const featureFlags = new FeatureFlags();
export const FLAGS = Object.keys(defaultFlags).reduce((acc, flag) => {
  acc[flag] = flag;
  return acc;
}, {});
