import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { useGetProjectsQuery } from "../../context/api/projectsApi";
import { 
  CheckCircle, 
  ChartBar, 
  MagnifyingGlass, 
  FolderOpen,
  Buildings
} from "@phosphor-icons/react";
import Pagination from "../../components/ui/Pagination";
import { useNavigate } from "react-router";

export default function ExistingCustomers() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const navigate = useNavigate();
  
  const { data, isLoading } = useGetProjectsQuery({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const projectsList = data?.projects ?? [];
  const meta = data?.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) setPage(newPage);
  };

  // Helper for status badge colors
  const getStageStyles = (stage) => {
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase inline-flex items-center gap-1.5 border";
    switch(stage?.toLowerCase()) {
      case 'completed':
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50`;
      case 'in_progress':
        return `${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50`;
      default:
        return `${base} bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`;
    }
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
            Manage installations, track progress, and review documents for converted accounts.
          </p>
        </div>

        {/* Search Bar - Fixed from the original code! */}
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
              setPage(1); // Reset page on new search
            }}
            className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Current Stage</th>
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
                    <td className="px-6 py-5"><div className="h-2 w-full max-w-[120px] bg-gray-200 dark:bg-slate-700/50 rounded-full"></div></td>
                    <td className="px-6 py-5 text-right"><div className="h-8 w-28 bg-gray-200 dark:bg-slate-700/50 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : projectsList.length === 0 ? (
                /* Beautiful Empty State */
                <tr>
                  <td colSpan="5">
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-gray-100 dark:ring-slate-700">
                        <FolderOpen size={32} className="text-gray-400" weight="duotone" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">No active projects found</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-sm">
                        {searchTerm ? "We couldn't find any customers matching your search. Try a different term." : "You don't have any converted accounts yet. Once a lead is converted, they will appear here."}
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
                        {project.currentStage.replace("_", " ")}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 max-w-[140px]">
                        <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className="bg-emerald-500 h-full rounded-full relative"
                            style={{ width: `${project.progressPercent}%` }}
                          >
                            {/* Subtle shimmer effect on the progress bar */}
                            <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20"></div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-8">
                          {project.progressPercent}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-xs focus:ring-2 focus:ring-indigo-500/40 outline-none"
                      >
                        <ChartBar size={16} weight="bold" />
                        Dashboard
                      </button>
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