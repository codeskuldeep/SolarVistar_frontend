import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetLeadByIdQuery } from "../../context/api/leadsApi";
import { useGetLeadQuotationsQuery } from "../../context/api/quotationsApi";
import { useGetVisitsQuery } from "../../context/api/visitsApi";
import { useGetLeadDocumentsQuery } from "../../context/api/documents";
import {
  User,
  Phone,
  EnvelopeSimple,
  MapPin,
  CalendarBlank,
  FileText,
  ChatCircleText,
  ListDashes,
  Receipt,
  MapTrifold,
  ClockCounterClockwise,
  DownloadSimple,
  CheckCircle,
  CaretRight,
} from "@phosphor-icons/react";
import { useSelector } from "react-redux";

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "quotations", label: "Quotations", icon: Receipt },
  { id: "visits", label: "Visits", icon: MapTrifold },
  { id: "documents", label: "Documents", icon: FileText },
];

const LeadProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch Data
  const { data: lead, isLoading, isError, refetch } = useGetLeadByIdQuery(id);
  const { data: quotesData, isLoading: isLoadingQuotes } = useGetLeadQuotationsQuery(id, { skip: activeTab !== "quotations" });
  const { data: visitsData, isLoading: isLoadingVisits } = useGetVisitsQuery({ leadId: id }, { skip: activeTab !== "visits" });
  const { data: documentsData, isLoading: isLoadingDocs } = useGetLeadDocumentsQuery(id, { skip: activeTab !== "documents" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading comprehensive profile…</span>
        </div>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Lead not found or error loading data.</span>
        <button onClick={refetch} className="px-4 py-2 border border-gray-200 dark:border-dark-border rounded text-sm text-gray-700 dark:text-gray-300">Retry</button>
      </div>
    );
  }

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "US";

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField icon={EnvelopeSimple} label="Email Address" value={lead.email || "N/A"} />
        <DetailField icon={MapPin} label="Address" value={lead.address || "N/A"} />
        <DetailField icon={ListDashes} label="Lead Source" value={lead.leadSource || "N/A"} />
        <DetailField icon={User} label="Assigned To" value={lead.assignedTo?.name || "Unassigned"} />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <DetailField icon={FileText} label="Requirements" value={lead.requirements || "None specified"} fullWidth />
        <DetailField icon={ChatCircleText} label="Notes" value={lead.notes || "No notes"} fullWidth />
      </div>

      {/* Follow-ups Timeline */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ClockCounterClockwise weight="bold" className="text-emerald-600" />
          Follow-up History
        </h3>
        {lead.followUps && lead.followUps.length > 0 ? (
          <div className="space-y-4">
            {lead.followUps.map((fu) => (
              <div key={fu.id} className="flex gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-slate-900/20 border border-gray-100 dark:border-dark-border">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/30" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                    {fu.method.replace(/_/g, " ")} • {new Date(fu.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{fu.remarks}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No follow-ups recorded yet.</p>
        )}
      </div>
    </div>
  );

  const renderQuotations = () => {
    if (isLoadingQuotes) return <SkeletonLoader />;
    const quotes = quotesData || [];
    
    if (quotes.length === 0) return <EmptyState icon={Receipt} message="No quotations created for this lead yet." />;
    
    return (
      <div className="space-y-3">
        {quotes.map(quote => (
          <div key={quote.id} className="p-4 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(quote.createdAt).toLocaleDateString("en-IN")}
                </p>
                {quote.panelName && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                    {quote.panelName}
                  </p>
                )}
              </div>
              {quote.quotationValue ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                  ₹{Number(quote.quotationValue).toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                  No value set
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quote.loadKw && (
                <div className="bg-gray-50 dark:bg-slate-900/30 p-2 rounded-md">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Load</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{quote.loadKw} kW</p>
                </div>
              )}
              {quote.panelType && (
                <div className="bg-gray-50 dark:bg-slate-900/30 p-2 rounded-md">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Panel Type</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{quote.panelType}</p>
                </div>
              )}
              {quote.numberOfPanels && (
                <div className="bg-gray-50 dark:bg-slate-900/30 p-2 rounded-md">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Panels</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{quote.numberOfPanels}</p>
                </div>
              )}
              {quote.dcrStatus && (
                <div className="bg-gray-50 dark:bg-slate-900/30 p-2 rounded-md">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">DCR</p>
                  <p className={`text-sm font-medium ${quote.dcrStatus === "DCR" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {quote.dcrStatus === "DCR" ? "DCR Compliant" : "Non-DCR"}
                  </p>
                </div>
              )}
            </div>
            {quote.subsidy && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Subsidy: <span className="font-medium text-gray-700 dark:text-gray-300">₹{Number(quote.subsidy).toLocaleString("en-IN")}</span>
                {quote.quotationValue && (
                  <> · Net: <span className="font-medium text-emerald-600 dark:text-emerald-400">₹{Number(quote.quotationValue - quote.subsidy).toLocaleString("en-IN")}</span></>
                )}
              </p>
            )}
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800/50 flex justify-end">
              <button
                onClick={() => navigate(`/quotations?quoteId=${quote.id}`)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                View Full Details <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVisits = () => {
    if (isLoadingVisits) return <SkeletonLoader />;
    const visits = visitsData?.visits || [];
    
    if (visits.length === 0) return <EmptyState icon={MapTrifold} message="No site visits scheduled yet." />;

    return (
      <div className="space-y-3">
        {visits.map(visit => (
          <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {visit.status === 'COMPLETED' ? <CheckCircle className="text-emerald-500" /> : <ClockCounterClockwise className="text-amber-500" />}
                {visit.purpose}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Assigned: <span className="font-medium">{visit.assignedStaff?.name || 'Unassigned'}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {new Date(visit.visitDatetime).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDocuments = () => {
    if (isLoadingDocs) return <SkeletonLoader />;
    const docs = documentsData || [];
    
    if (docs.length === 0) return <EmptyState icon={FileText} message="No documents uploaded yet." />;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docs.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded">
                <FileText weight="fill" size={20} />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.category}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{doc.fileType?.split('/')[1] || 'FILE'}</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(doc.url, '_blank')}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 rounded-full transition-colors flex-shrink-0"
              title="Download"
            >
              <DownloadSimple size={18} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg px-4 sm:px-6 py-6 transition-colors duration-200">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-dark-surface dark:text-gray-200 dark:border-dark-border dark:hover:bg-slate-800 transition-colors"
        >
          <span className="text-base leading-none">←</span> Back
        </button>

        {/* Header Card */}
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-md bg-emerald-800 text-white flex items-center justify-center text-xl font-medium tracking-wide">
                {getInitials(lead.customerName)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {lead.customerName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                  <Phone weight="regular" className="w-3.5 h-3.5" />
                  {lead.phoneNumber}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 text-sm font-medium">
                {lead.status.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {lead.id}</span>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="px-6 flex overflow-x-auto border-t border-gray-200 dark:border-dark-border scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <tab.icon size={16} weight={activeTab === tab.id ? "fill" : "regular"} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm p-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "quotations" && renderQuotations()}
          {activeTab === "visits" && renderVisits()}
          {activeTab === "documents" && renderDocuments()}
        </div>
      </div>
    </div>
  );
};

const DetailField = ({ icon: Icon, label, value, fullWidth }) => (
  <div className={`flex flex-col gap-1.5 border border-gray-100 dark:border-dark-border p-4 rounded-md bg-gray-50/60 dark:bg-slate-900/40 hover:border-gray-200 dark:hover:border-slate-700 transition-colors ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
      <Icon weight="regular" className="w-3.5 h-3.5" /> {label}
    </span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
      {value}
    </span>
  </div>
);

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-16 bg-gray-200 dark:bg-slate-800 rounded-lg w-full"></div>
    ))}
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="py-12 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
      <Icon size={24} className="text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

export default LeadProfile;
