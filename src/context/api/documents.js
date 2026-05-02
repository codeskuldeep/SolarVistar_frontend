// src/store/api/documentsApi.js
import { baseApi } from './baseApi';

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Lead Documents ──────────────────────────────────────────────
    getLeadDocuments: builder.query({
      query: (leadId) => `/documents/lead/${leadId}`,
      transformResponse: (response) => response?.data?.documents ?? [],
      providesTags: (result, error, leadId) => [
        { type: 'LeadDocuments', id: leadId },
        'LeadDocuments',
      ],
    }),

    uploadDocument: builder.mutation({
      query: ({ leadId, visitId, projectId, taskId, category, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        let url = `/documents?category=${encodeURIComponent(category)}`;
        if (leadId) url += `&leadId=${encodeURIComponent(leadId)}`;
        if (visitId) url += `&visitId=${encodeURIComponent(visitId)}`;
        if (projectId) url += `&projectId=${encodeURIComponent(projectId)}`;
        if (taskId) url += `&taskId=${encodeURIComponent(taskId)}`;

        return {
          url,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { leadId, projectId }) => {
        const tags = ['LeadDocuments', 'VisitDocuments'];
        if (leadId) tags.push({ type: 'LeadDocuments', id: leadId });
        if (projectId) {
          tags.push({ type: 'ProjectDocuments', id: projectId });
          tags.push({ type: 'Project', id: projectId });
        }
        return tags;
      },
    }),

    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: () => ['LeadDocuments', 'VisitDocuments'],
    }),

    // ── Visit Documents (Site Photos) ────────────────────────────────
    getVisitDocuments: builder.query({
      query: (visitId) => `/documents/visit/${visitId}`,
      transformResponse: (response) => response?.data?.documents ?? [],
      providesTags: (result, error, visitId) => [
        { type: 'VisitDocuments', id: visitId },
        'VisitDocuments',
      ],
    }),

    uploadVisitDocument: builder.mutation({
      query: ({ visitId, category, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/documents?category=${encodeURIComponent(category)}&visitId=${encodeURIComponent(visitId)}`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { visitId }) => [
        { type: 'VisitDocuments', id: visitId },
        'VisitDocuments',
      ],
    }),
  }),
});

export const {
  useGetLeadDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetVisitDocumentsQuery,
  useUploadVisitDocumentMutation,
} = documentsApi;