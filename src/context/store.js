import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import leadReducer from "./slices/leadSlice";
import visitReducer from "./slices/visitSlice";
import toastReducer from "./slices/toastSlice";
import quotationReducer from "./slices/quotationSlice";

const appReducer = combineReducers({
  auth: authReducer,
  toasts: toastReducer,
  users: userReducer,
  leads: leadReducer,
  visits: visitReducer,
  quotations: quotationReducer,
});

const rootReducer = (state, action) => {
  // If the user logs out, we reset the entire state to undefined.
  // This causes all reducers to return their initialState.
  if (action.type === "auth/logout/fulfilled") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
