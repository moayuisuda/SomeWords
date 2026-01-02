import { useState, useEffect } from 'react';

const STORAGE_KEY = 'retro_vision_daily_limit';
const DAILY_MAX = 10;

interface DailyLimitState {
  count: number;
  lastResetDate: string; // YYYY-MM-DD
}

export const useDailyLimit = () => {
  const [remaining, setRemaining] = useState<number>(DAILY_MAX);
  
  useEffect(() => {
    // Initial check on mount
    checkLimit();
  }, []);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const checkLimit = () => {
    const today = getTodayString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const state: DailyLimitState = JSON.parse(stored);
        if (state.lastResetDate !== today) {
          // New day, reset
          resetLimit();
        } else {
          // Same day, update remaining
          setRemaining(Math.max(0, DAILY_MAX - state.count));
        }
      } catch (e) {
        // Error parsing, reset
        resetLimit();
      }
    } else {
      // No record, init
      resetLimit();
    }
  };

  const resetLimit = () => {
    const today = getTodayString();
    const newState: DailyLimitState = {
      count: 0,
      lastResetDate: today
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setRemaining(DAILY_MAX);
  };

  const incrementUsage = () => {
    const today = getTodayString();
    const stored = localStorage.getItem(STORAGE_KEY);
    let currentCount = 0;

    if (stored) {
      try {
        const state: DailyLimitState = JSON.parse(stored);
        if (state.lastResetDate === today) {
          currentCount = state.count;
        }
      } catch (e) {
        // ignore
      }
    }

    const newCount = currentCount + 1;
    const newState: DailyLimitState = {
      count: newCount,
      lastResetDate: today
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setRemaining(Math.max(0, DAILY_MAX - newCount));
  };

  return {
    remaining,
    isLimitReached: remaining <= 0,
    incrementUsage,
    DAILY_MAX
  };
};
