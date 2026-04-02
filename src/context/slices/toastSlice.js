import { createSlice } from '@reduxjs/toolkit';

let nextId = 0;

const toastSlice = createSlice({
  name: 'toasts',
  initialState: [],
  reducers: {
    addToast: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: ({ message, type = 'success', duration = 4000 }) => ({
        payload: {
          id: nextId++,
          message,
          type,       // 'success' | 'error' | 'info'
          duration,
          createdAt: Date.now(),
        },
      }),
    },
    removeToast: (state, action) => {
      return state.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
