import { configureStore } from '@reduxjs/toolkit';
import compartmentCountsReducer from '../features/compartmentCounts/counterSlice';

export const store = configureStore({
  reducer: {
    compartmentCounts: compartmentCountsReducer,
  },
});
