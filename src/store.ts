import { configureStore } from '@reduxjs/toolkit';
import resultsReducer from '@/src/slices/resultsSlice';

export const store = configureStore({
  reducer: {
    results: resultsReducer,
    // add more reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
