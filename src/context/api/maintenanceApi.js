import { baseApi } from "./baseApi";

export const maintenanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /amc — global list of all AMC records for the /maintenance page
    getAllAmcRecords: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "", startDateFrom = "", startDateTo = "" } = {}) => ({
        url: "/amc",
        params: {
          page,
          limit,
          ...(search        ? { search }        : {}),
          ...(status        ? { status }        : {}),
          ...(startDateFrom ? { startDateFrom } : {}),
          ...(startDateTo   ? { startDateTo }   : {}),
        },
      }),
      transformResponse: (response) => ({
        amcRecords: response.data.amcRecords,
        meta: response.data.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.amcRecords.map(({ id }) => ({ type: "Amc", id })),
              { type: "Amc", id: "LIST" },
            ]
          : [{ type: "Amc", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllAmcRecordsQuery } = maintenanceApi;
