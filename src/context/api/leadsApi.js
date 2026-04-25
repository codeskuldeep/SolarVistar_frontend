import { baseApi } from "./baseApi";

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /leads — paginated + searchable
    getLeads: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/leads",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      // Transform to flatten the nested response shape
      transformResponse: (response) => ({
        leads: response.data.leads,
        meta: response.data.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.leads.map(({ id }) => ({ type: "Lead", id })),
              { type: "Lead", id: "LIST" },
            ]
          : [{ type: "Lead", id: "LIST" }],
    }),
    getLeadById: builder.query({
      query: (id) => `/leads/${id}`,
      transformResponse: (response) => response.data.lead,
      providesTags: (_result, _error, id) => [{ type: "Lead", id }],  
    }),
    // POST /leads
    createLead: builder.mutation({
      query: (leadData) => ({
        url: "/leads",
        method: "POST",
        body: leadData,
      }),
      transformResponse: (response) => response.data.lead,
      // Invalidate the list so it auto-refetches
      invalidatesTags: [{ type: "Lead", id: "LIST" }],
    }),

    // PATCH /leads/:id/status
    updateLeadStatus: builder.mutation({
      query: ({ id, status, assignedToId }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body: { status, ...(assignedToId ? { assignedToId } : {}) },
      }),
      transformResponse: (response) => response.data.lead,
      // Invalidate the specific lead + the list (for status-filtered views)
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
      ],
    }),

    // POST /leads/:id/followups
    addFollowUp: builder.mutation({
      query: ({ id, followUpData }) => ({
        url: `/leads/${id}/followups`,
        method: "POST",
        body: followUpData,
      }),
      transformResponse: (response) => response.data.followUp,
      // Invalidate so the lead's followUps array refreshes
      invalidatesTags: (_result, _error, { id }) => [{ type: "Lead", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
  useAddFollowUpMutation,
} = leadsApi;
