import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { useGetProjectsQuery } from "../../context/api/projectsApi";
import { 
  CheckCircle, 
  ChartBar, 
  MagnifyingGlass, 
  FolderOpen,
  Buildings,
  FunnelSimple,
  CaretDown,
  WarningCircle,
  Clock,
  FolderSimple,
  ArrowRight,
} from "@phosphor-icons/react";

import Pagination from "../../components/ui/Pagination";
import { useNavigate } from "react-router";

// ─── Constants ────────────────────────────────────────────────────────────────
const STAGE_NAMES = {
  DOCUMENTATION: "Documentation",
  TECHNICAL_FINANCIAL: "Technical & Financial",
  FILE_PREPARATION: "File Preparation",
  GOVT_APPROVALS: "Govt Approvals",
  SUBSIDY: "Subsidy",
  INSTALLATION: "Installation",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

const STAGE_OPTIONS = [
  { value: "", label: "All Stages" },
  ...Object.entries(STAGE_NAMES).map(([value, label]) => ({ value, label })),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStageStyles = (stage) => {
  const base = "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 border";
  switch(stage) {
    case 'COMPLETED':
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50`;
    case 'INSTALLATION':
      return `${base} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50`;
    case 'SUBSIDY':
      return `${base} bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50`;
    case 'GOVT_APPROVALS':
      return `${base} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50`;
    default:
      return `${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50`;
  }
};

const getStatusStyles = (status) => {
  switch(status) {
    case 'COMPLETED':
      return "text-emerald-600 dark:text-emerald-400";
    case 'ON_HOLD':
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-blue-600 dark:text-blue-400";
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'COMPLETED': return <CheckCircle size={15} weight="fill" />;
    case 'ON_HOLD': return <WarningCircle size={15} weight="fill" />;
    default: return <Clock size={15} weight="fill" />;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function ExistingCustomers() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const { data, isLoading, isFetching } = useGetProjectsQuery({
    page,
    limit: 10,
    search: debouncedSearch,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(stageFilter ? { currentStage: stageFilter } : {}),
  });

  const projectsList = data?.projects ?? [];
  const meta = data?.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) setPage(newPage);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      

      {/* Header & Controls Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Existing Customers
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl">
            Manage project stages, track progress, upload documents, and review converted accounts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <MagnifyingGlass size={20} />
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <FunnelSimple size={16} weight="bold" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <CaretDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {STAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <CaretDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>

        {(statusFilter || stageFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setStageFilter(""); setPage(1); }}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5 dark:ring-white/5 transition-opacity ${isFetching && !isLoading ? 'opacity-70' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
              {isLoading ? (
                /* Skeleton Loader UI */
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700/50"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700/50 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 dark:bg-slate-700/50 rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-6 w-28 bg-gray-200 dark:bg-slate-700/50 rounded-full"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-200 dark:bg-slate-700/50 rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-2 w-full max-w-[120px] bg-gray-200 dark:bg-slate-700/50 rounded-full"></div></td>
                    <td className="px-6 py-5 text-right"><div className="h-8 w-28 bg-gray-200 dark:bg-slate-700/50 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : projectsList.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan="6">
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-gray-100 dark:ring-slate-700">
                        <FolderOpen size={32} className="text-gray-400" weight="duotone" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">No active projects found</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-sm">
                        {searchTerm || statusFilter || stageFilter
                          ? "We couldn't find any customers matching your filters. Try different criteria."
                          : "You don't have any converted accounts yet. Once a lead is converted to 'Won', their project will appear here automatically."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data Rows */
                projectsList.map((project) => (
                  <tr
                    key={project.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Buildings size={16} weight="fill" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {project.lead?.customerName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">ID: #{project.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                      {project.lead?.phoneNumber || 'N/A'}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={getStageStyles(project.currentStage)}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                        {STAGE_NAMES[project.currentStage] || project.currentStage?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${getStatusStyles(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status?.replace(/_/g, " ")}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 max-w-[140px]">
                        <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${project.progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${project.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-8">
                          {project.progressPercent}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Document Checklist Page */}
                        <button
                          onClick={() => navigate(`/customers/${project.leadId}/documents`)}
                          className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-xs focus:ring-2 focus:ring-amber-500/40 outline-none"
                          title="View Document Checklist"
                        >
                          <FolderSimple size={14} weight="bold" />
                          Documents
                        </button>

                        {/* Open Project Dashboard */}
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-xs focus:ring-2 focus:ring-indigo-500/40 outline-none"
                        >
                          <ChartBar size={14} weight="bold" />
                          Dashboard
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Wrapper */}
        {projectsList.length > 0 && (
          <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 px-6 py-3">
            <Pagination
              meta={meta}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              itemName="projects"
            />
          </div>
        )}
      </div>
    </div>
  );
}