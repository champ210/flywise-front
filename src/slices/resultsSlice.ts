import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchResult } from '@/types';

interface ResultsState {
  results: SearchResult[];
}

const initialState: ResultsState = {
  results: [],
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    setResults(state, action: PayloadAction<SearchResult[]>) {
      console.log({ action })
      state.results = action.payload;
    },
    clearResults(state) {
      state.results = [];
    },
  },
});

export const { setResults, clearResults } = resultsSlice.actions;
export default resultsSlice.reducer;
