import { useState, useEffect } from 'react';
import { featureFlags, FLAGS } from '../config/featureFlags';

export const useFeatureFlag = (flag) => {
  const [isEnabled, setIsEnabled] = useState(featureFlags.isEnabled(flag));

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe((flags) => {
      setIsEnabled(flags[flag]);
    });

    return unsubscribe;
  }, [flag]);

  return isEnabled;
};

export { FLAGS };
