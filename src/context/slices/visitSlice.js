import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; 

// 1. Fetch Visits
export const fetchVisits = createAsyncThunk(
  'visits/fetchVisits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/visits');
      return response.data.data.visits;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visits');
    }
  }
);

// 2. Create Visit
export const createVisit = createAsyncThunk(
  'visits/createVisit',
  async (visitData, { rejectWithValue }) => {
    try {
      const response = await api.post('/visits', visitData);
      return response.data.data.visit;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule visit');
    }
  }
);

// 3. Update Visit Status (& Post-Visit Notes)
export const updateVisitStatus = createAsyncThunk(
  'visits/updateVisitStatus',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/visits/${id}/status`, updateData);
      return response.data.data.visit;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update visit');
    }
  }
);

const initialState = {
  visits: [],
  isLoading: false,
  error: null,
  successMessage: null,
  hasFetched: false,
};

const visitSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    clearVisitMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetVisitState: (state) => {
      state.visits = [];
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
      state.hasFetched = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Visits
      .addCase(fetchVisits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.visits = action.payload;
        state.hasFetched = true;

      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Visit
      .addCase(createVisit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        // Insert and sort to keep chronological order based on datetime
        state.visits.push(action.payload);
        state.visits.sort((a, b) => new Date(a.visitDatetime) - new Date(b.visitDatetime));
        state.successMessage = 'Visit scheduled successfully';
      })
      .addCase(createVisit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Visit Status
      .addCase(updateVisitStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVisitStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.visits.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.visits[index] = { ...state.visits[index], ...action.payload };
        }
        state.successMessage = 'Visit updated successfully';
      })
      .addCase(updateVisitStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVisitMessages, resetVisitState } = visitSlice.actions;
export default visitSlice.reducer;