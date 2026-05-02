import { baseApi } from "./baseApi";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /projects
    getProjects: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "", currentStage = "", assignedTeam = "" } = {}) => ({
        url: "/projects",
        params: { 
          page, 
          limit, 
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(currentStage ? { currentStage } : {}),
          ...(assignedTeam ? { assignedTeam } : {})
        },
      }),
      transformResponse: (response) => ({
        projects: response.data.projects,
        meta: response.data.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.projects.map(({ id }) => ({ type: "Project", id })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    // GET /projects/stats
    getProjectStats: builder.query({
      query: () => "/projects/stats",
      transformResponse: (response) => response.data,
      providesTags: ["Project", "ProjectStage", "ProjectTask"], // Refresh if anything in projects changes
    }),

    // GET /projects/pendency
    getProjectPendency: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/projects/pendency",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      transformResponse: (response) => ({
        pendencyList: response.data.pendencyList,
        meta: response.data.meta,
      }),
      providesTags: ["Project", "ProjectStage", "ProjectTask"],
    }),

    // GET /projects/:id
    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      transformResponse: (response) => response.data.project,
      providesTags: (_result, _error, id) => [
        { type: "Project", id },
        { type: "ProjectStage", id: `PROJECT_${id}` },
        { type: "ProjectTask", id: `PROJECT_${id}` },
        { type: "Subsidy", id: `PROJECT_${id}` },
        { type: "Amc", id: `PROJECT_${id}` }
      ],
    }),

    // GET /projects/:id/timeline
    getProjectTimeline: builder.query({
      query: (id) => `/projects/${id}/timeline`,
      transformResponse: (response) => response.data.timeline,
      providesTags: (_result, _error, id) => [{ type: "Project", id: `TIMELINE_${id}` }],
    }),

    // PATCH /projects/:projectId/tasks/:taskId
    updateProjectTask: builder.mutation({
      query: ({ projectId, taskId, updateData }) => ({
        url: `/projects/${projectId}/tasks/${taskId}`,
        method: "PATCH",
        body: updateData,
      }),
      // Backend returns null for data.task — just return the raw response to avoid crash
      transformResponse: (response) => response.data ?? null,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "Project", id: "LIST" },
        { type: "ProjectStage", id: `PROJECT_${projectId}` },
        { type: "ProjectTask", id: `PROJECT_${projectId}` },
      ],
    }),

    // PATCH /projects/:projectId/tasks/:taskId/govt-approval
    upsertGovtApproval: builder.mutation({
      query: ({ projectId, taskId, data }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/govt-approval`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response) => response.data.govtApproval,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "ProjectTask", id: `PROJECT_${projectId}` }
      ],
    }),

    // DELETE /projects/:projectId/tasks/:taskId/documents/:documentId
    unlinkProjectTaskDocument: builder.mutation({
      query: ({ projectId, taskId, documentId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "ProjectTask", id: `PROJECT_${projectId}` }
      ],
    }),

    // PATCH /projects/:projectId/stages/:stageId
    updateProjectStage: builder.mutation({
      query: ({ projectId, stageId, updateData }) => ({
        url: `/projects/${projectId}/stages/${stageId}`,
        method: "PATCH",
        body: updateData,
      }),
      transformResponse: (response) => response.data.stage,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "Project", id: "LIST" },
        { type: "ProjectStage", id: `PROJECT_${projectId}` },
        { type: "Project", id: `TIMELINE_${projectId}` }
      ],
    }),

    // PATCH /projects/:projectId/subsidy
    upsertSubsidy: builder.mutation({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/subsidy`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response) => response.data.subsidy,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "Project", id: "LIST" }, // Progress can change
        { type: "ProjectTask", id: `PROJECT_${projectId}` }, // Tasks can auto-complete
        { type: "Subsidy", id: `PROJECT_${projectId}` }
      ],
    }),

    // PATCH /projects/:projectId/amc
    updateAmcRecord: builder.mutation({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/amc`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response) => response.data.amc,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "Amc", id: `PROJECT_${projectId}` }
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectStatsQuery,
  useGetProjectPendencyQuery,
  useGetProjectByIdQuery,
  useGetProjectTimelineQuery,
  useUpdateProjectTaskMutation,
  useUpsertGovtApprovalMutation,
  useUnlinkProjectTaskDocumentMutation,
  useUpdateProjectStageMutation,
  useUpsertSubsidyMutation,
  useUpdateAmcRecordMutation,
} = projectsApi;
