import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Import your configured axios instance (adjust the path to wherever you saved the file)
import api from "../../services/api";

// --- ASYNC THUNKS ---

// 1. Fetch all quotations (Optionally filter by leadId)
export const fetchQuotations = createAsyncThunk(
  "quotations/fetchQuotations",
  async ({ leadId = null, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const url = leadId ? `/quotations?leadId=${leadId}` : "/quotations";
      const response = await api.get(url, { params: { page, limit } });

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
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 10,
    },

    currentQuotation: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    currentQuotationStatus: "idle",
    createStatus: "idle",
    error: null,
  },
  reducers: {
    clearCurrentQuotation: (state) => {
      state.currentQuotation = null;
      state.currentQuotationStatus = "idle";
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
    },
    resetQuotationState: (state) => {
      state.quotationsList = [];
      state.currentQuotation = null;
      state.status = "idle";
      state.currentQuotationStatus = "idle";
      state.createStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quotations
      .addCase(fetchQuotations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quotationsList = action.payload.quotations;
        state.meta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Single Quotation
      .addCase(fetchQuotationById.pending, (state) => {
        state.currentQuotationStatus = "loading";
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.currentQuotationStatus = "succeeded";
        state.currentQuotation = action.payload;
        state.error = null;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.currentQuotationStatus = "failed";
        state.error = action.payload;
      })

      // Create Quotation
      .addCase(createQuotation.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.quotationsList.unshift(action.payload);
        state.error = null;
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })

      // Update Quotation
      .addCase(updateQuotation.fulfilled, (state, action) => {
        const index = state.quotationsList.findIndex(
          (q) => q.id === action.payload.id,
        );
        if (index !== -1) {
          state.quotationsList[index] = action.payload;
        }
        if (
          state.currentQuotation &&
          state.currentQuotation.id === action.payload.id
        ) {
          state.currentQuotation = action.payload;
        }
      })

      // Delete Quotation
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.quotationsList = state.quotationsList.filter(
          (q) => q.id !== action.payload,
        );
        if (
          state.currentQuotation &&
          state.currentQuotation.id === action.payload
        ) {
          state.currentQuotation = null;
        }
      });
  },
});

export const { clearCurrentQuotation, resetCreateStatus, resetQuotationState } =
  quotationSlice.actions;
export default quotationSlice.reducer;
