import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import toastReducer from "./slices/toastSlice";
import { baseApi } from "./api/baseApi";

// Import API files to ensure their endpoints are registered
import "./api/leadsApi";
import "./api/visitsApi";
import "./api/quotationsApi";
import "./api/usersApi";
import "./api/dashboardApi";

const appReducer = combineReducers({
  auth: authReducer,
  toasts: toastReducer,
  // Single RTK Query cache
  [baseApi.reducerPath]: baseApi.reducer,
});

const rootReducer = (state, action) => {
  // On logout → wipe entire Redux state AND the RTK Query cache
  if (action.type === "auth/logout/fulfilled") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
