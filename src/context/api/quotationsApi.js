import { baseApi } from "./baseApi";

export const quotationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /quotations — paginated, filterable by leadId/search
    getQuotations: builder.query({
      query: ({ page = 1, limit = 10, search = "", leadId = null } = {}) => ({
        url: "/quotations",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(leadId ? { leadId } : {}),
        },
      }),
      transformResponse: (response) => ({
        quotations: response.data.quotations,
        meta: response.data.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.quotations.map(({ id }) => ({ type: "Quotation", id })),
              { type: "Quotation", id: "LIST" },
            ]
          : [{ type: "Quotation", id: "LIST" }],
    }),

    // GET /quotations?leadId=... — scoped query for the visit quotations drawer
    getLeadQuotations: builder.query({
      query: (leadId) => ({
        url: "/quotations",
        params: { leadId, limit: 50 },
      }),
      transformResponse: (response) => response.data.quotations ?? [],
      providesTags: (_result, _error, leadId) => [
        { type: "LeadQuotations", id: leadId },
        "LeadQuotations",
      ],
    }),

    // GET /quotations/:id
    getQuotationById: builder.query({
      query: (id) => `/quotations/${id}`,
      transformResponse: (response) => response.data.quotation,
      providesTags: (_result, _error, id) => [{ type: "Quotation", id }],
    }),

    // POST /quotations
    createQuotation: builder.mutation({
      query: (quotationData) => ({
        url: "/quotations",
        method: "POST",
        body: quotationData,
      }),
      transformResponse: (response) => response.data.quotation,
      invalidatesTags: (_result, _error, arg) => [
        { type: "Quotation", id: "LIST" },
        { type: "LeadQuotations", id: arg?.leadId },
        "LeadQuotations",
      ],
    }),

    // PUT /quotations/:id
    updateQuotation: builder.mutation({
      query: ({ id, quotationData }) => ({
        url: `/quotations/${id}`,
        method: "PUT",
        body: quotationData,
      }),
      transformResponse: (response) => response.data.quotation,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
        "LeadQuotations",
      ],
    }),

    // DELETE /quotations/:id
    deleteQuotation: builder.mutation({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
        "LeadQuotations",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuotationsQuery,
  useGetLeadQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationsApi;
