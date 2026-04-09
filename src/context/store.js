import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Safe cross-bundler storage wrapper
const customStorage = {
  getItem: (key) => {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key, item) => {
    return Promise.resolve(localStorage.setItem(key, item));
  },
  removeItem: (key) => {
    return Promise.resolve(localStorage.removeItem(key));
  },
};

import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import leadReducer from "./slices/leadSlice";
import visitReducer from "./slices/visitSlice";
import toastReducer from "./slices/toastSlice";
import quotationReducer from "./slices/quotationSlice";

const persistConfig = {
  key: "crm-root",
  storage: customStorage,
  whitelist: ["leads", "visits", "users", "quotations"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  toasts: toastReducer,
  users: userReducer,
  leads: leadReducer,
  visits: visitReducer,
  quotations: quotationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
