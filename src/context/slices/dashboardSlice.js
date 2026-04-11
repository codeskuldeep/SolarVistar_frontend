import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAdminStats = createAsyncThunk(
  "dashboard/fetchAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/admin-stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    adminStats: {
      totalUsers: 0,
      activeLeadsCount: 0,
      pendingVisitsCount: 0,
      conversionRate: 0,
      recentVisits: [],
    },
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminStats = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
