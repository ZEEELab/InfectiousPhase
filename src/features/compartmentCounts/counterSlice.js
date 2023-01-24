import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  susceptible: 0,
  infected: 0,
  recovered: 0
};

export const counterSlice = createSlice({
  name: 'compartmentCounts',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    add_susceptible: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.susceptible += 1;
    },
    remove_susceptible: (state) => {
      state.susceptible -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    add_n_susceptibles: (state, action) => {
      state.susceptible += action.payload;
    },
    add_infected: (state) => {
      state.infected += 1;
    },
    remove_infected: (state) => {
      state.infected -= 1;
    },
    add_recovered: (state) => {
      state.recovered += 1;
    },
    remove_recovered: (state) => {
      state.recovered -= 1;
    }

  },
});

export const { 
  add_susceptible, 
  remove_susceptible, 
  add_n_susceptibles, 
  add_infected, 
  remove_infected, 
  add_recovered, 
  remove_recovered } = counterSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCount = (state) => state.counter.value;

export default counterSlice.reducer;
