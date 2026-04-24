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
      query: ({ leadId, category, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        // IMPORTANT: category & leadId go in the URL as query params,
        // NOT in the form data. Do NOT set Content-Type header manually —
        // the browser must set multipart boundaries automatically.
        return {
          url: `/documents?category=${encodeURIComponent(category)}&leadId=${encodeURIComponent(leadId)}`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { leadId }) => [
        { type: 'LeadDocuments', id: leadId },
        'LeadDocuments',
      ],
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