// src/components/LeadDocuments/LeadDocuments.jsx
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetLeadDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} from "../context/api/documents";
import { useLocation, useNavigate, useParams } from "react-router";
import { useGetLeadByIdQuery, useGetLeadsQuery } from "../context/api/leadsApi";

const DOCUMENT_CHECKLIST = [
  { category: "AADHAR", label: "Aadhaar Card", hint: "Government-issued ID proof" },
  { category: "PAN_CARD", label: "PAN Card", hint: "Tax identification document" },
  { category: "ELECTRICITY_BILL", label: "Electricity Bill", hint: "Latest 1–2 months" },
  { category: "PROPERTY_TAX", label: "Property Tax Receipt", hint: "Most recent year" },
  { category: "ROOF_PHOTO", label: "Roof Photograph", hint: "Clear daylight image" },
];

const formatBytes = (bytes = 0) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Spinner = () => (
  <span
    className="inline-block w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin"
    aria-hidden="true"
  />
);

const LeadDocuments = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const dept = (currentUser?.department?.name || currentUser?.department || "").toUpperCase();
  const isReadOnly = dept === "INSTALLATION" || dept === "SUPPORT";

  const leadId = useParams().customerId;
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useGetLeadDocumentsQuery(leadId, { skip: !leadId });

  const { data: leadsData } = useGetLeadsQuery({
    page: 1,
    limit: 10,
    search: "",
    status: "CONVERTED",
  });
  const cachedCustomer = leadsData?.leads?.find((l) => l.id === leadId);
  const { data: singleCustomer } = useGetLeadByIdQuery(leadId, {
    skip: !!cachedCustomer,
  });
  const customerName = cachedCustomer?.customerName || singleCustomer?.customerName;

  const [uploadDocument] = useUploadDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const [busyCategory, setBusyCategory] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [rowError, setRowError] = useState({});

  const fileInputsRef = useRef({});

  const documentsByCategory = documents.reduce((acc, doc) => {
    acc[doc.category] = doc;
    return acc;
  }, {});

  const handleFileSelected = async (category, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setRowError((e) => ({ ...e, [category]: null }));
    setBusyCategory(category);
    setBusyAction("upload");
    try {
      await uploadDocument({ leadId, category, file }).unwrap();
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [category]: err?.data?.message || "Upload failed. Please try again.",
      }));
    } finally {
      setBusyCategory(null);
      setBusyAction(null);
    }
  };

  const handleDelete = async (category, id) => {
    if (!window.confirm("Remove this document? This action cannot be undone.")) return;
    setRowError((e) => ({ ...e, [category]: null }));
    setBusyCategory(category);
    setBusyAction("delete");
    try {
      await deleteDocument(id).unwrap();
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [category]: err?.data?.message || "Could not delete document.",
      }));
    } finally {
      setBusyCategory(null);
      setBusyAction(null);
    }
  };

  const triggerFilePicker = (category) => {
    fileInputsRef.current[category]?.click();
  };

  const uploadedCount = DOCUMENT_CHECKLIST.filter(
    (d) => documentsByCategory[d.category]
  ).length;
  const progress = Math.round((uploadedCount / DOCUMENT_CHECKLIST.length) * 100);

  // Shared button base
  const btnBase =
    "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-md border transition-colors duration-150 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-bg";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Top bar: back + breadcrumb */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className={`${btnBase} bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-dark-surface dark:text-gray-200 dark:border-dark-border dark:hover:bg-slate-800 dark:hover:border-slate-700`}
          >
            <span className="text-base leading-none">←</span> Back
          </button>
          <p className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 font-mono truncate ml-4">
            {location.pathname}
          </p>
        </div>

        {/* Card */}
        <section
          aria-labelledby="ldx-title"
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 sm:p-8 shadow-sm"
        >
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 mb-6 border-b border-gray-100 dark:border-dark-border">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-green dark:text-emerald-400">
                  Lead Documents
                </span>
              </div>
              <h2
                id="ldx-title"
                className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight truncate"
              >
                {customerName || "Customer"}
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Upload the required documents to progress this lead through verification.
              </p>
            </div>

            {/* Progress */}
            <div
              className="sm:min-w-[200px] sm:text-right"
              aria-label={`${uploadedCount} of ${DOCUMENT_CHECKLIST.length} documents uploaded`}
            >
              <div className="flex sm:justify-end items-baseline gap-1 mb-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">
                  {uploadedCount}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">
                  / {DOCUMENT_CHECKLIST.length}
                </span>
                <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  uploaded
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-green rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </header>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-3 px-4 py-5 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-sm text-gray-500 dark:text-gray-400">
              <Spinner /> <span>Loading documents…</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex items-center justify-between px-4 py-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-sm text-red-700 dark:text-red-400">
              <span>Unable to load documents.</span>
              <button
                type="button"
                onClick={refetch}
                className={`${btnBase} bg-white dark:bg-dark-surface text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/50`}
              >
                Retry
              </button>
            </div>
          )}

          {/* List */}
          {!isLoading && !isError && (
            <ul role="list" className="flex flex-col gap-2.5">
              {DOCUMENT_CHECKLIST.map(({ category, label, hint }) => {
                const doc = documentsByCategory[category];
                const isBusy = busyCategory === category;
                const isUploading = isBusy && busyAction === "upload";
                const isDeleting = isBusy && busyAction === "delete";
                const error = rowError[category];

                return (
                  <li
                    key={category}
                    className={`group grid grid-cols-[28px_1fr_auto] sm:grid-cols-[32px_1fr_auto] items-center gap-4 px-4 sm:px-5 py-4 rounded-lg border transition-all duration-150 ${
                      doc
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                        : "bg-white dark:bg-slate-900/40 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Marker */}
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                        doc
                          ? "bg-brand-green text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500"
                      }`}
                      aria-hidden="true"
                    >
                      {doc ? (
                        <svg viewBox="0 0 20 20" width="14" height="14">
                          <path
                            d="M5 10.5l3 3 7-7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {label}
                      </div>
                      {doc ? (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-mono text-[10px] uppercase tracking-wide">
                              {doc.format || "file"}
                            </span>
                            <span className="tabular-nums">{formatBytes(doc.bytes)}</span>
                          </span>
                          <span className="text-gray-300 dark:text-slate-700" aria-hidden="true">
                            •
                          </span>
                          <span>
                            Uploaded by{" "}
                            <strong className="font-medium text-gray-700 dark:text-gray-200">
                              {doc.uploadedBy?.name || "Unknown"}
                            </strong>
                            {doc.uploadedBy?.role ? (
                              <span className="text-gray-400 dark:text-gray-500">
                                {" "}
                                ({doc.uploadedBy.role})
                              </span>
                            ) : null}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                          {hint}
                        </div>
                      )}
                      {error && (
                        <div className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                          {error}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 col-start-2 sm:col-start-3 row-start-2 sm:row-start-1 justify-end flex-wrap">
                      <input
                        ref={(el) => (fileInputsRef.current[category] = el)}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileSelected(category, e)}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        aria-label={`Upload ${label}`}
                      />

                      {!doc && !isReadOnly && (
                        <button
                          type="button"
                          onClick={() => triggerFilePicker(category)}
                          disabled={isBusy}
                          className={`${btnBase} bg-brand-green text-white border-brand-green hover:bg-brand-green-dark hover:border-brand-green-dark`}
                        >
                          {isUploading ? (
                            <>
                              <Spinner /> Uploading…
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                                <path
                                  d="M10 13V4M10 4L6 8M10 4l4 4M4 14v1a2 2 0 002 2h8a2 2 0 002-2v-1"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Upload File
                            </>
                          )}
                        </button>
                      )}

                      {doc && (
                        <>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${btnBase} bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-slate-900 dark:text-gray-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600`}
                          >
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                              <path
                                d="M11 3h6v6M17 3l-8 8M8 5H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            View
                          </a>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleDelete(category, doc.id)}
                              disabled={isBusy}
                              className={`${btnBase} bg-white text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 dark:bg-slate-900 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-950/30 dark:hover:border-red-900/60`}
                            >
                              {isDeleting ? (
                                <>
                                  <Spinner /> Removing…
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                                    <path
                                      d="M4 6h12M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2m1 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6h8z"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Delete
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default LeadDocuments;