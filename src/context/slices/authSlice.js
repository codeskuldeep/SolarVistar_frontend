import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      
      // 1. Extract both token and user from the backend payload
      const { token, user } = response.data.data;
      
      // 2. Store the token securely in sessionStorage
      sessionStorage.setItem("authToken", token);
      
      return { user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    // 1. Fast fail: Don't bother hitting the API if the token isn't there
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      return rejectWithValue("No token found, user is not authenticated");
    }

    try {
      // (Your Axios interceptor in api.js should automatically attach the token here)
      const response = await api.get("/auth/me"); 
      return { user: response.data.data.user };
    } catch (error) {
      // 2. If the token is invalid/expired, clear it out
      sessionStorage.removeItem("authToken");
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout", 
  async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout"); 
    // 1. Clear the token on successful logout
    sessionStorage.removeItem("authToken");
  } catch (error) {
    // 2. Even if the backend fails, clear the local token to force logout
    sessionStorage.removeItem("authToken");
    return rejectWithValue(
      error.response?.data?.message || "Logout failed",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: true, 
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user; 
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; 
      });
  },
});

export const { clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;