import { baseApi } from "./baseApi";

export const visitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /visits — paginated + searchable
    getVisits: builder.query({
      query: ({ page = 1, limit = 10, search = "", leadId = null } = {}) => ({
        url: "/visits",
        params: { page, limit, ...(search ? { search } : {}), ...(leadId ? { leadId } : {}) },
      }),
      transformResponse: (response) => ({
        visits: response.data.visits,
        meta: response.data.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.visits.map(({ id }) => ({ type: "Visit", id })),
              { type: "Visit", id: "LIST" },
            ]
          : [{ type: "Visit", id: "LIST" }],
    }),

    // POST /visits
    createVisit: builder.mutation({
      query: (visitData) => ({
        url: "/visits",
        method: "POST",
        body: visitData,
      }),
      transformResponse: (response) => response.data.visit,
      invalidatesTags: [{ type: "Visit", id: "LIST" }],
    }),

    // PATCH /visits/:id/status
    updateVisit: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/visits/${id}/status`,
        method: "PATCH",
        body: updateData,
      }),
      transformResponse: (response) => response.data.visit,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Visit", id },
        { type: "Visit", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVisitsQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
} = visitsApi;
