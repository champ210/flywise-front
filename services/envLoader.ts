import { envConfig } from '../env';

/**
 * Synchronously loads environment variables from env.ts.
 * Populates a global `process.env` object for use by other services.
 */
export const loadEnv = (): void => {
  try {
    // Make the variables globally accessible via a simulated process.env object
    if (typeof (window as any).process === 'undefined') {
      (window as any).process = { env: {} };
    }

    // Merge with any existing process.env variables (e.g., from a platform)
    (window as any).process.env = {
      ...((window as any).process.env || {}),
      ...envConfig,
    };

  } catch (error) {
    console.error('Error loading environment variables from env.ts:', error);
    // Even if fetching fails, ensure a process.env object exists to avoid crashes in other services.
    if (typeof (window as any).process === 'undefined') {
      (window as any).process = { env: {} };
    }
  }
};