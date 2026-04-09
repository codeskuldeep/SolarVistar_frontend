import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch all users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users", {
        params: { page, limit, search: search || undefined },
      });

      return {
        users: response.data.data.users ?? [],
        meta: response.data.data.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Create a new user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/users", userData);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user",
      );
    }
  },
);

// Delete a user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

const initialState = {
  users: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  successMessage: null,
  lastFetchedAt: null, // TTL cache timestamp
  meta: {
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  },
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetUserState: (state) => {
      state.users = [];
      state.isLoading = false;
      state.hasFetched = false;
      state.error = null;
      state.successMessage = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.meta = action.payload.meta;
        state.hasFetched = true;
        // Rule B: Only stamp cache for the global (unfiltered) list
        if (!action.meta.arg?.search) {
          state.lastFetchedAt = Date.now();
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.hasFetched = true; // Circuit breaker
      })
      // Create User — Rules D + A
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload); // Rule D: instant UI
        state.lastFetchedAt = null;       // Rule A: invalidate
        state.successMessage = "User created successfully";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete User — Rules D + A
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user.id !== action.payload); // Rule D
        state.lastFetchedAt = null; // Rule A
        state.successMessage = "User deleted successfully";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserMessages, resetUserState } = userSlice.actions;
export default userSlice.reducer;
