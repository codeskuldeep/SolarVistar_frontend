import { baseApi } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /users — paginated + searchable
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/users",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      transformResponse: (response) => ({
        users: response.data.users ?? [],
        meta: response.data.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // POST /users
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // DELETE /users/:id
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} = usersApi;
