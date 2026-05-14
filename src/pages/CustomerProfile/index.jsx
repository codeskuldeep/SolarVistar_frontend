import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetLeadByIdQuery } from "../../context/api/leadsApi";
import { useGetProjectsQuery, useCreateProjectMutation } from "../../context/api/projectsApi";
import { useGetLeadQuotationsQuery } from "../../context/api/quotationsApi";
import { useGetVisitsQuery } from "../../context/api/visitsApi";
import { useGetLeadDocumentsQuery, useGetVisitDocumentsQuery } from "../../context/api/documents";
import { useDispatch } from "react-redux";
import { addToast } from "../../context/slices/toastSlice";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ClipboardList, 
  FileText, 
  Plus, 
  LayoutDashboard, 
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Receipt,
  Map,
  MessageSquare,
  List,
  Clock,
  Download,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";

const STAGE_NAMES = {
  DOCUMENTATION: "Documentation",
  TECHNICAL_FINANCIAL: "Technical & Financial",
  INSTALLATION: "Installation",
  FILE_PREPARATION: "File Preparation",
  GOVT_APPROVALS: "Govt Approvals",
  SUBSIDY: "Subsidy",
};

const TABS = [
  { id: "projects", label: "Projects", icon: LayoutDashboard },
  { id: "overview", label: "Lead Details", icon: User },
  { id: "quotations", label: "Quotations", icon: Receipt },
  { id: "visits", label: "Site Visits", icon: Map },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function CustomerProfile() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  // Core Data
  const { data: lead, isLoading: leadLoading, isError: leadError } = useGetLeadByIdQuery(leadId);
  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useGetProjectsQuery({ limit: 50, leadId }, { skip: !leadId });

  // Tab Data (Lazy loaded based on activeTab)
  const { data: quotesData, isLoading: isLoadingQuotes } = useGetLeadQuotationsQuery(leadId, { skip: activeTab !== "quotations" });
  const { data: visitsData, isLoading: isLoadingVisits } = useGetVisitsQuery({ leadId: leadId }, { skip: activeTab !== "visits" });
  const { data: documentsData, isLoading: isLoadingDocs } = useGetLeadDocumentsQuery(leadId, { skip: activeTab !== "documents" });

  const [createProject] = useCreateProjectMutation();
  const projects = projectsData?.projects ?? [];

  const handleCreateProject = async () => {
    if (!window.confirm("Create a new project for this customer?")) return;
    setCreating(true);
    try {
      const result = await createProject({ leadId });
      if (result.error) {
        dispatch(addToast({ message: result.error?.data?.message || "Failed to create project", type: "error" }));
      } else {
        dispatch(addToast({ message: "New project created successfully!", type: "success" }));
        refetchProjects();
      }
    } finally {
      setCreating(false);
    }
  };

  if (leadLoading) return <ProfileSkeleton />;
  
  if (leadError || !lead) {
    return (
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>
        <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Customer Not Found</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">The requested customer profile could not be loaded. They may have been removed or you lack permission.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderProjects = () => (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Customer Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projects.length} active or historical projects for this account.</p>
        </div>
        <button
          onClick={handleCreateProject}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-md text-sm font-medium hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
        >
          {creating ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            <><Plus className="w-4 h-4" /> New Project</>
          )}
        </button>
      </div>

      {projectsLoading ? <ProjectsListSkeleton /> : projects.length === 0 ? (
        <div className="py-16 text-center border border-gray-200 dark:border-dark-border border-dashed rounded-lg bg-gray-50 dark:bg-dark-surface/50">
          <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No projects yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">This customer doesn't have any active installations.</p>
          <button onClick={handleCreateProject} className="text-sm font-medium text-brand-green hover:underline decoration-1 underline-offset-2">
            Create their first project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => {
            const isCompleted = project.status === "COMPLETED";
            const isOnHold = project.status === "ON_HOLD";
            let statusStyles = "bg-brand-blue/10 text-brand-blue-dark dark:text-blue-400";
            if (isCompleted) statusStyles = "bg-brand-green/10 text-brand-green-dark dark:text-brand-green";
            if (isOnHold) statusStyles = "bg-brand-yellow/15 text-brand-yellow-dark dark:text-brand-yellow";

            return (
              <div key={project.id} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Project Site {index + 1}</h3>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded">#{project.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Stage:</span>
                      <span className="font-medium">{STAGE_NAMES[project.currentStage] || project.currentStage}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${statusStyles}`}>
                        {project.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-48 shrink-0">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className={isCompleted ? "text-brand-green" : "text-brand-blue dark:text-blue-400"}>{project.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ease-out rounded-full ${isCompleted ? 'bg-brand-green' : 'bg-brand-blue dark:bg-brand-blue'}`} style={{ width: `${Math.max(project.progressPercent, 2)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-dark-border w-full md:w-auto">
                  <button onClick={() => navigate(`/customers/${leadId}/documents`)} className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <FileText className="w-4 h-4" /> <span className="md:hidden">Docs</span>
                  </button>
                  <button onClick={() => navigate(`/projects/${project.id}`)} className="flex-[2] md:flex-none inline-flex justify-center items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-blue dark:bg-brand-blue hover:bg-brand-blue-dark transition-colors rounded-md shadow-sm">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField icon={Mail} label="Email Address" value={lead.email || "N/A"} />
        <DetailField icon={MapPin} label="Address" value={lead.address || "N/A"} />
        <DetailField icon={List} label="Lead Source" value={lead.leadSource || "N/A"} />
        <DetailField icon={User} label="Assigned To" value={lead.assignedTo?.name || "Unassigned"} />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <DetailField icon={ClipboardList} label="Requirements" value={lead.requirements || "None specified"} fullWidth />
        <DetailField icon={MessageSquare} label="Notes" value={lead.notes || "No notes"} fullWidth />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-green" />
          Lead Follow-up History
        </h3>
        {lead.followUps && lead.followUps.length > 0 ? (
          <div className="space-y-4">
            {lead.followUps.map((fu) => (
              <div key={fu.id} className="flex gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-slate-900/20 border border-gray-100 dark:border-dark-border">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-brand-green ring-4 ring-brand-green/20 dark:ring-brand-green/10" />
                </div>
                <div>
                  <p className="text-xs font-medium text-brand-green-dark dark:text-brand-green mb-1">
                    {fu.method.replace(/_/g, " ")} • {new Date(fu.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{fu.remarks}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No follow-ups recorded.</p>
        )}
      </div>
    </div>
  );

  const renderQuotations = () => {
    if (isLoadingQuotes) return <SkeletonLoader />;
    const quotes = quotesData || [];
    if (quotes.length === 0) return <EmptyState icon={Receipt} message="No quotations created for this lead." />;
    return (
      <div className="space-y-3">
        {quotes.map(quote => (
          <div key={quote.id} className="p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created: {new Date(quote.createdAt).toLocaleDateString("en-IN")}</p>
                {quote.panelName && <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{quote.panelName}</p>}
              </div>
              {quote.quotationValue ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-green/10 text-brand-green-dark dark:text-brand-green">
                  ₹{Number(quote.quotationValue).toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500">No value set</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quote.loadKw && <MiniStat label="Load" value={`${quote.loadKw} kW`} />}
              {quote.panelType && <MiniStat label="Panel Type" value={quote.panelType} />}
              {quote.numberOfPanels && <MiniStat label="Panels" value={quote.numberOfPanels} />}
              {quote.dcrStatus && (
                <div className="bg-gray-50 dark:bg-slate-900/30 p-2 rounded-md">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">DCR</p>
                  <p className={`text-sm font-medium ${quote.dcrStatus === "DCR" ? "text-brand-green dark:text-brand-green" : "text-amber-600 dark:text-amber-400"}`}>
                    {quote.dcrStatus === "DCR" ? "DCR Compliant" : "Non-DCR"}
                  </p>
                </div>
              )}
            </div>
            {quote.subsidy && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Subsidy: <span className="font-medium text-gray-700 dark:text-gray-300">₹{Number(quote.subsidy).toLocaleString("en-IN")}</span>
                {quote.quotationValue && <> · Net: <span className="font-medium text-brand-green dark:text-brand-green">₹{Number(quote.quotationValue - quote.subsidy).toLocaleString("en-IN")}</span></>}
              </p>
            )}
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800/50 flex justify-end">
              <button onClick={() => navigate(`/quotations?quoteId=${quote.id}`)} className="text-xs font-bold text-brand-green hover:text-brand-green-dark flex items-center gap-1 transition-colors">
                View Full Details <ChevronRight className="w-4 h-4" />
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
    if (visits.length === 0) return <EmptyState icon={Map} message="No site visits scheduled yet." />;
    return <div className="space-y-4">{visits.map(visit => <VisitCard key={visit.id} visit={visit} />)}</div>;
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
              <div className="p-2 bg-brand-green/10 text-brand-green-dark dark:text-brand-green rounded">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {doc.category === "OTHER" && doc.task ? doc.task.name : doc.category.replace(/_/g, " ")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">{doc.format || 'FILE'}</span>
                  <span className="text-gray-300 dark:text-slate-700">•</span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${doc.task ? 'text-brand-blue dark:text-blue-400' : 'text-brand-green dark:text-brand-green'}`}>
                    {doc.task ? "Project Task" : "Lead Document"}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => window.open(doc.url, '_blank')} className="p-2 text-gray-500 hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-colors flex-shrink-0" title="Download">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl pb-12">
      <button onClick={() => navigate("/customers")} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Customers
      </button>

      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg mb-8 shadow-sm overflow-hidden">
        {/* Customer Header Info */}
        <div className="p-6 flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                  {lead.customerName}
                </h1>
                <div className="flex gap-2 items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide bg-brand-green/10 text-brand-green-dark dark:text-brand-green uppercase">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Converted
                  </span>
                  <span className="text-xs text-gray-400 font-mono">ID: {lead.id}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-6">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{lead.phoneNumber}</p>
              </div>
              {lead.email && (
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-all">{lead.email}</p>
                </div>
              )}
              {lead.address && (
                <div className="flex items-start gap-2.5 md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{lead.address}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col lg:items-end gap-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-dark-border">
            {lead.assignedTo && (
              <div className="text-left lg:text-right w-full">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Assigned Agent</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.assignedTo.name}</p>
              </div>
            )}
            <button onClick={() => navigate(`/customers/${leadId}/documents`)} className="mt-2 w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors shadow-sm">
              <FileText className="w-4 h-4 text-gray-400" /> Official Documents (KYC)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 flex overflow-x-auto border-t border-gray-200 dark:border-dark-border scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-green text-brand-green dark:border-brand-green dark:text-brand-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm p-6">
        {activeTab === "projects" && renderProjects()}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "quotations" && renderQuotations()}
        {activeTab === "visits" && renderVisits()}
        {activeTab === "documents" && renderDocuments()}
      </div>
    </div>
  );
}

// Subcomponents
const DetailField = ({ icon: Icon, label, value, fullWidth }) => (
  <div className={`flex flex-col gap-1.5 border border-gray-100 dark:border-dark-border p-4 rounded-md bg-gray-50/60 dark:bg-slate-900/40 hover:border-gray-200 dark:hover:border-slate-700 transition-colors ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"><Icon className="w-3.5 h-3.5" /> {label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{value}</span>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-slate-900/30 p-2 rounded-md">
    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
  </div>
);

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-slate-800 rounded-lg w-full"></div>)}
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="py-12 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

const VisitCard = ({ visit }) => {
  const { data: photos = [], isLoading } = useGetVisitDocumentsQuery(visit.id);
  const locData = (() => {
    try { return JSON.parse(visit.siteLocation); } catch { return { tagName: visit.siteLocation }; }
  })();

  const isCompleted = visit.status === "COMPLETED";
  const isRescheduled = visit.status === "RESCHEDULED";
  
  let statusColor = "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400";
  if (isCompleted) statusColor = "bg-brand-green/10 text-brand-green-dark dark:text-brand-green";
  else if (visit.status === "PENDING") statusColor = "bg-brand-blue/10 text-brand-blue-dark dark:text-blue-400";
  else if (isRescheduled) statusColor = "bg-brand-yellow/15 text-brand-yellow-dark dark:text-brand-yellow";
  else if (visit.status === "CANCELLED") statusColor = "bg-red-100 text-red-700 dark:text-red-400";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
        <div className="flex items-start gap-3 w-full">
          <div className={`mt-0.5 p-1.5 rounded-lg ${isCompleted ? "bg-brand-green/10" : "bg-brand-yellow/10"}`}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-brand-green" /> : <Clock className="w-4 h-4 text-brand-yellow" />}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{visit.purpose}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date(visit.visitDatetime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              {visit.assignedStaff?.name && ` · ${visit.assignedStaff.name}`}
            </p>
            {locData && (
              <div className="mt-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-md p-2">
                <p className="text-[11px] text-gray-700 dark:text-gray-300 flex items-start gap-1 font-medium mb-1">
                  <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" /> {locData.tagName}
                </p>
              </div>
            )}
          </div>
        </div>
        <span className={`self-start sm:self-center inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase ${statusColor}`}>
          {visit.status}
        </span>
      </div>

      {isLoading ? (
        <div className="px-4 pb-4"><div className="grid grid-cols-4 gap-2 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-slate-700" />)}</div></div>
      ) : photos.length > 0 ? (
        <div className="px-4 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-2">Site Photos ({photos.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {photos.map(photo => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 hover:opacity-80 transition-opacity group relative">
                <img src={photo.url} alt={photo.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={(e) => { e.target.style.display = "none"; }} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">{photo.category?.replace(/_/g, " ")}</div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> No site photos uploaded yet.</div>
      )}
    </div>
  );
};

// Custom Skeletons
function ProfileSkeleton() {
  return (
    <div className="w-full max-w-5xl animate-pulse">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              <div className="h-4 w-full max-w-md bg-gray-100 dark:bg-gray-800/50 rounded md:col-span-2"></div>
            </div>
          </div>
          <div className="w-full lg:w-40 pt-2 lg:pt-0 space-y-4">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              <div className="h-3 w-8 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="h-9 w-12 md:w-20 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            <div className="h-9 w-full md:w-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}