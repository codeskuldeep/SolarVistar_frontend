import { baseApi } from "./baseApi";

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /leads — paginated + searchable
    getLeads: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" } = {}) => ({
        url: "/leads",
        params: { page, limit, ...(search ? { search } : {}), ...(status ? { status } : {}) },
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
        // When a lead is converted to "Won", a Project is auto-created on the backend.
        // Invalidate Project + Dashboard tags so the Customers page & Dashboard update instantly.
        { type: "Project", id: "LIST" },
        "Dashboard",
      ],
    }),

    // PUT /leads/:id — update lead info
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response) => response.data.lead,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
      ],
    }),

    // DELETE /leads/:id
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }],
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
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
  useAddFollowUpMutation,
} = leadsApi;
