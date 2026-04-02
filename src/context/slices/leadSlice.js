import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // Adjust path if needed

// 1. Fetch Leads
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads');
      return response.data.data.leads;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

// 2. Create Lead
export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  }
);

// 3. Update Lead Status (& Reassign)
export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ id, status, assignedToId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leads/${id}/status`, { status, assignedToId });
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

// 4. Add Follow-Up
export const addFollowUp = createAsyncThunk(
  'leads/addFollowUp',
  async ({ id, followUpData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/leads/${id}/followups`, followUpData);
      return { leadId: id, followUp: response.data.data.followUp };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add follow-up');
    }
  }
);

const initialState = {
  leads: [],
  isLoading: false,
  error: null,
  successMessage: null,
  hasFetched: false,
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearLeadMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetLeadsState: (state) => {
      state.leads = [];
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
      state.hasFetched = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload;
        state.hasFetched = true;

      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads.unshift(action.payload); // Add to top of list
        state.successMessage = 'Lead created successfully';
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateLeadStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.leads.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          // Merge updated lead data but preserve the followUps array from existing state
          state.leads[index] = { ...state.leads[index], ...action.payload };
        }
        state.successMessage = 'Lead updated successfully';
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Follow-up
      .addCase(addFollowUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addFollowUp.fulfilled, (state, action) => {
        state.isLoading = false;
        const { leadId, followUp } = action.payload;
        const lead = state.leads.find((l) => l.id === leadId);
        if (lead) {
          // Replace the single visible follow-up with the new one
          lead.followUps = [followUp];
        }
        state.successMessage = 'Follow-up logged successfully';
      })
      .addCase(addFollowUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLeadMessages, resetLeadsState } = leadSlice.actions;
export default leadSlice.reducer;