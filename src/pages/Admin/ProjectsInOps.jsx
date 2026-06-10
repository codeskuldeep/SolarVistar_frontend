import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "../../context/api/projectsApi";
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  Phone, 
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function ProjectsInOps() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useGetProjectsQuery({
    currentStage: "DOCUMENTATION,TECHNICAL_FINANCIAL,FILE_PREPARATION,GOVT_APPROVALS",
    status: "IN_PROGRESS",
    page,
  });

  if (isLoading) return <ProjectsSkeleton />;
  
  if (isError) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Connection Error</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">Unable to load active operations. Please verify your connection or try again.</p>
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
            Projects in Operations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tracking active installations and documentation processes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green-dark dark:text-brand-green text-sm font-medium rounded-md border border-brand-green/20">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            {meta?.totalItems ?? projects.length} Active
          </span>
        </div>
      </header>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="py-16 text-center border border-gray-200 dark:border-dark-border border-dashed rounded-lg bg-gray-50 dark:bg-dark-surface/50">
          <ClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No active projects</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">There are currently no projects marked as In Progress.</p>
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
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
                  disabled={meta.currentPage === 1 || isFetching}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 min-w-20 justify-center">
                  {isFetching && <span className="w-3.5 h-3.5 border-2 border-gray-200 dark:border-gray-700 border-t-brand-green rounded-full animate-spin inline-block" />}
                  {meta.currentPage} / {meta.totalPages}
                </span>
                <button
                  disabled={meta.currentPage === meta.totalPages || isFetching}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
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

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const lead = project.lead || {};
  const customerName = lead.customerName || "Unknown Client";
  const phone = lead.phoneNumber || "No contact info";
  const address = lead.address || "Address pending";
  
  // Format dates safely
  const startDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Format stage to be readable (e.g., "DOCUMENTATION" -> "Documentation")
  const stageDisplay = project.currentStage
    ? project.currentStage.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "Pending";

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-5 transition-all duration-200 hover:shadow-sm hover:border-brand-green/30 dark:hover:border-brand-green/30 flex flex-col h-full cursor-pointer"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="pr-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 uppercase tracking-wide">
            {customerName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Added {startDate}</span>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-brand-yellow/15 text-brand-yellow-dark dark:text-brand-yellow uppercase">
          {stageDisplay}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6 mt-auto bg-gray-50 dark:bg-dark-border/30 p-3 rounded-md border border-gray-100 dark:border-dark-border/50">
        <div className="flex items-start gap-2.5">
          <Phone className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Contact</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0 w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Location</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={address}>
              {address}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="mb-5 space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-600 dark:text-gray-300">Overall Progress</span>
          <span className="text-brand-green-dark dark:text-brand-green">{project.progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-green dark:bg-brand-green transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${Math.max(project.progressPercent, 2)}%` }} // Minimum width of 2% just to show the bar exists
          />
        </div>
      </div>

      {/* Footer / Action */}
      <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          ID: {project.id.split('-')[0]}
        </p>
        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-green-dark dark:text-brand-green hover:text-brand-green transition-colors group-hover:underline decoration-1 underline-offset-2 cursor-pointer">
          Manage Lead
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-8 flex justify-between items-center">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md w-48"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded-md w-72"></div>
        </div>
        <div className="h-9 w-24 bg-brand-green/10 rounded-md"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg p-5 h-[280px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-40"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-24"></div>
              </div>
              <div className="h-6 w-24 bg-brand-yellow/10 rounded-md"></div>
            </div>
            <div className="mt-auto mb-6 bg-gray-50 dark:bg-dark-border/30 p-3 rounded-md space-y-4 border border-gray-100 dark:border-transparent">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex justify-between">
              <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}