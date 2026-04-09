import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// 1. Fetch Leads
export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async ({ page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/leads", {
        params: { page, limit, search: search || undefined },
      });

      return {
        leads: response.data.data.leads,
        meta: response.data.data.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leads",
      );
    }
  },
);

// Fetch ONLY converted customers
export const fetchExistingCustomers = createAsyncThunk(
  "leads/fetchExistingCustomers",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/leads", {
        params: { page, limit, status: "CONVERTED" },
      });
      return {
        customers: response.data.data.leads,
        meta: response.data.data.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers",
      );
    }
  },
);

// 2. Create Lead
export const createLead = createAsyncThunk(
  "leads/createLead",
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post("/leads", leadData);
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lead",
      );
    }
  },
);

// 3. Update Lead Status (& Reassign)
export const updateLeadStatus = createAsyncThunk(
  "leads/updateLeadStatus",
  async ({ id, status, assignedToId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leads/${id}/status`, {
        status,
        assignedToId,
      });
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lead",
      );
    }
  },
);

// 4. Add Follow-Up
export const addFollowUp = createAsyncThunk(
  "leads/addFollowUp",
  async ({ id, followUpData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/leads/${id}/followups`, followUpData);
      return { leadId: id, followUp: response.data.data.followUp };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add follow-up",
      );
    }
  },
);

const initialState = {
  leads: [],
  existingCustomersList: [],
  meta: {
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  },
  isLoading: false,
  error: null,
  successMessage: null,
  hasFetched: false,
  hasFetchedCustomers: false,
  lastFetchedAt: null, // TTL cache timestamp
};

const leadSlice = createSlice({
  name: "leads",
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
      state.lastFetchedAt = null;
    },
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
        state.leads = action.payload.leads;
        state.meta = action.payload.meta;
        state.hasFetched = true;
        // Rule B: Only stamp cache for the global (unfiltered) list
        if (!action.meta.arg?.search) {
          state.lastFetchedAt = Date.now();
        }
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.hasFetched = true; // Circuit breaker
      })
      // Create Lead — Rules D + A
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads.unshift(action.payload); // Rule D: instant UI
        state.lastFetchedAt = null;          // Rule A: invalidate cache
        state.successMessage = "Lead created successfully";
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Status — Rules D + A
      .addCase(updateLeadStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.status === "CONVERTED") {
          state.leads = state.leads.filter((l) => l.id !== action.payload.id);
          state.hasFetchedCustomers = false;
        } else {
          const index = state.leads.findIndex(
            (l) => l.id === action.payload.id,
          );
          if (index !== -1) {
            state.leads[index] = { ...state.leads[index], ...action.payload };
          }
        }
        state.lastFetchedAt = null; // Rule A
        state.successMessage = "Lead updated successfully";
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Follow-up — Rules D + A
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
          lead.followUps = [followUp];
        }
        state.lastFetchedAt = null; // Rule A
        state.successMessage = "Follow-up logged successfully";
      })
      .addCase(addFollowUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Existing Customers
      .addCase(fetchExistingCustomers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchExistingCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.existingCustomersList = action.payload.customers;
        state.meta = action.payload.meta;
        state.hasFetchedCustomers = true;
      })
      .addCase(fetchExistingCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLeadMessages, resetLeadsState } = leadSlice.actions;
export default leadSlice.reducer;
