import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "../../context/api/projectsApi";
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  Phone, 
  Landmark,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function SubsidyPending() {
  const { data, isLoading, isError } = useGetProjectsQuery({ currentStage: "SUBSIDY" });

  if (isLoading) return <SubsidySkeleton />;
  
  if (isError) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Connection Error</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">Unable to load subsidy data. Please verify your connection or try again.</p>
        </div>
      </div>
    );
  }

  const projects = data?.projects || [];
  const meta = data?.meta;

  return (
    <div className="w-full">
      {/* Header Section */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Subsidy Processing
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Projects awaiting government subsidy approval and fund disbursement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue-dark dark:text-blue-400 text-sm font-medium rounded-md border border-brand-blue/20">
            <Landmark className="w-3.5 h-3.5" />
            {meta?.totalItems || projects.length} Applications
          </span>
        </div>
      </header>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="py-16 text-center border border-gray-200 dark:border-dark-border border-dashed rounded-lg bg-gray-50 dark:bg-dark-surface/50">
          <Landmark className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No pending subsidies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">There are no projects currently in the subsidy processing stage.</p>
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <SubsidyCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination Footer */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-gray-100">{(meta.currentPage - 1) * meta.itemsPerPage + 1}</span> to <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{meta.totalItems}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={meta.currentPage === 1}
                  className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  disabled={meta.currentPage === meta.totalPages}
                  className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SubsidyCard({ project }) {
  const navigate = useNavigate();
  const lead = project.lead || {};
  const customerName = lead.customerName || "Unknown Client";
  const phone = lead.phoneNumber || "No contact info";
  const address = lead.address || "Address pending";
  
  const createdDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-5 transition-all duration-200 hover:shadow-sm hover:border-brand-blue/40 dark:hover:border-brand-blue/40 flex flex-col h-full cursor-pointer"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="pr-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 uppercase tracking-wide">
            {customerName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Applied {createdDate}</span>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-brand-blue/10 text-brand-blue-dark dark:text-blue-400 uppercase">
          Reviewing
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6 mt-auto bg-gray-50 dark:bg-dark-border/30 p-3 rounded-md border border-gray-100 dark:border-dark-border/50">
        <div className="flex items-start gap-2.5">
          <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Applicant Contact</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
          <div className="min-w-0 w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Registered Site</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={address}>
              {address}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="mb-5 space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-600 dark:text-gray-300">Approval Progress</span>
          <span className="text-brand-blue-dark dark:text-blue-400">{project.progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-blue dark:bg-brand-blue transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${Math.max(project.progressPercent, 2)}%` }}
          />
        </div>
      </div>

      {/* Footer / Action */}
      <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          ID: {project.id.split('-')[0]}
        </p>
        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue dark:text-blue-400 hover:text-brand-blue-dark transition-colors group-hover:underline decoration-1 underline-offset-2">
          View Application
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SubsidySkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-8 flex justify-between items-center">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md w-52"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded-md w-80"></div>
        </div>
        <div className="h-9 w-32 bg-brand-blue/10 rounded-md"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg p-5 h-[280px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-44"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-28"></div>
              </div>
              <div className="h-6 w-20 bg-brand-blue/10 rounded-md"></div>
            </div>
            <div className="mt-auto mb-6 bg-gray-50 dark:bg-dark-border/30 p-3 rounded-md space-y-4 border border-gray-100 dark:border-transparent">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex justify-between">
              <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}