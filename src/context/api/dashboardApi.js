import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /dashboard/admin-stats
    getAdminStats: builder.query({
      query: () => "/dashboard/admin-stats",
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard", "Project", "Lead"],
    }),
    
    getUnifiedPipeline: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value);
            }
          });
        }
        return `/dashboard/unified-pipeline?${queryParams.toString()}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard", "Project", "Lead"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminStatsQuery, useGetUnifiedPipelineQuery } = dashboardApi;
