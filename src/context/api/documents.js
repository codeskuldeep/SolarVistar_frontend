// src/store/api/documentsApi.js
import { baseApi } from './baseApi'; // your base injected API slice

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
          url: `/documents?category=${encodeURIComponent(
            category
          )}&leadId=${encodeURIComponent(leadId)}`,
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
      invalidatesTags: (result, error, id, { getState } = {}) => [
        'LeadDocuments',
      ],
    }),
  }),
});

export const {
  useGetLeadDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;