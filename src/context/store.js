import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import leadReducer from "./slices/leadSlice";
import visitReducer from './slices/visitSlice';
import toastReducer from './slices/toastSlice';
import quotationReducer from './slices/quotationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    leads: leadReducer, 
    visits: visitReducer,
    toasts: toastReducer,
    quotations: quotationReducer,
  },
});
