import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /dashboard/admin-stats
    getAdminStats: builder.query({
      query: () => "/dashboard/admin-stats",
      transformResponse: (response) => response.data,
      providesTags: [{ type: "Dashboard", id: "STATS" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminStatsQuery } = dashboardApi;
