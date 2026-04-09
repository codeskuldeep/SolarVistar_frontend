import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// --- ASYNC THUNKS ---

// 1. Fetch all quotations (Optionally filter by leadId or search)
export const fetchQuotations = createAsyncThunk(
  "quotations/fetchQuotations",
  async ({ leadId = null, page = 1, limit = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (leadId) params.leadId = leadId;
      if (search) params.search = search;

      const response = await api.get("/quotations", { params });

      return {
        quotations: response.data.data.quotations,
        meta: response.data.data.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quotations",
      );
    }
  },
);

// 2. Fetch a single quotation by ID
export const fetchQuotationById = createAsyncThunk(
  "quotations/fetchQuotationById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quotation details",
      );
    }
  },
);

// 3. Create a new quotation
export const createQuotation = createAsyncThunk(
  "quotations/createQuotation",
  async (quotationData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quotations", quotationData);
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create quotation",
      );
    }
  },
);

// 4. Update an existing quotation
export const updateQuotation = createAsyncThunk(
  "quotations/updateQuotation",
  async ({ id, quotationData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/quotations/${id}`, quotationData);
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update quotation",
      );
    }
  },
);

// 5. Delete a quotation
export const deleteQuotation = createAsyncThunk(
  "quotations/deleteQuotation",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/quotations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete quotation",
      );
    }
  },
);

// --- SLICE ---

const quotationSlice = createSlice({
  name: "quotations",
  initialState: {
    quotationsList: [],
    meta: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10,
    },
    currentQuotation: null,
    isLoading: false,
    isFetchingDetails: false,
    isSaving: false,
    hasFetched: false,
    lastFetchedAt: null, // TTL cache timestamp
    error: null,
  },
  reducers: {
    clearCurrentQuotation: (state) => {
      state.currentQuotation = null;
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
    },
    resetQuotationState: (state) => {
      state.quotationsList = [];
      state.currentQuotation = null;
      state.isLoading = false;
      state.isFetchingDetails = false;
      state.isSaving = false;
      state.hasFetched = false;
      state.lastFetchedAt = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quotations
      .addCase(fetchQuotations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotationsList = action.payload.quotations;
        state.meta = action.payload.meta;
        state.hasFetched = true;
        // Rule B: Only stamp cache for the global (unfiltered) list
        if (!action.meta.arg?.search) {
          state.lastFetchedAt = Date.now();
        }
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.hasFetched = true; // Circuit breaker
      })

      // Fetch Single Quotation
      .addCase(fetchQuotationById.pending, (state) => {
        state.isFetchingDetails = true;
        state.error = null;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.isFetchingDetails = false;
        state.currentQuotation = action.payload;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.isFetchingDetails = false;
        state.error = action.payload;
      })

      // Create Quotation — Rules D + A
      .addCase(createQuotation.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.isSaving = false;
        state.quotationsList.unshift(action.payload); // Rule D
        state.lastFetchedAt = null;                   // Rule A
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Update Quotation — Rules D + A
      .addCase(updateQuotation.fulfilled, (state, action) => {
        const index = state.quotationsList.findIndex(
          (q) => q.id === action.payload.id,
        );
        if (index !== -1) {
          state.quotationsList[index] = action.payload; // Rule D
        }
        if (
          state.currentQuotation &&
          state.currentQuotation.id === action.payload.id
        ) {
          state.currentQuotation = action.payload;
        }
        state.lastFetchedAt = null; // Rule A
      })

      // Delete Quotation — Rules D + A
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.quotationsList = state.quotationsList.filter(
          (q) => q.id !== action.payload,
        ); // Rule D
        if (
          state.currentQuotation &&
          state.currentQuotation.id === action.payload
        ) {
          state.currentQuotation = null;
        }
        state.lastFetchedAt = null; // Rule A
      });
  },
});

export const { clearCurrentQuotation, resetCreateStatus, resetQuotationState } =
  quotationSlice.actions;
export default quotationSlice.reducer;
