import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAdminStatsQuery, useGetUnifiedPipelineQuery } from "../../context/api/dashboardApi";
import {
  UsersThreeIcon,
  ProjectorScreenChartIcon,
  WrenchIcon,
  SunHorizonIcon,
  BankIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

// ==========================================
// INLINE UI COMPONENTS
// ==========================================

const KpiCard = ({ title, value, subtitle, icon: Icon, colorScheme, isLoading }) => {
  const getIconColors = () => {
    switch (colorScheme) {
      case "primary": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "secondary": return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "tertiary": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case "quaternary": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "success": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "purple": return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${getIconColors()}`}>
          <Icon size={24} weight="duotone" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            value
          )}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtitle}</p>
      </div>
    </div>
  );
};

const StatusChip = ({ status, type }) => {
  let style = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  if (type === "Customer") {
    switch (status) {
      case "IN_PROGRESS": style = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"; break;
      case "ON_HOLD": style = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"; break;
      case "COMPLETED": style = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"; break;
    }
  } else {
    switch (status) {
      case "NEW": style = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"; break;
      case "CONTACTED": style = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"; break;
      case "INTERESTED": style = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"; break;
      case "NOT_INTERESTED": style = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"; break;
    }
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${style}`}>
      {status}
    </span>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Filters State
  const [filters, setFilters] = useState({
    type: "All",
    currentStage: "",
    assignedTeam: "",
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // Data Fetching
  const { data: statsData, isLoading: isStatsLoading } = useGetAdminStatsQuery();
  const { data: pipelineData, isLoading: isPipelineLoading, isFetching: isPipelineFetching } = useGetUnifiedPipelineQuery(filters);

  // Destructure Stats
  const {
    totalLeads = 0,
    activeCustomers = 0,
    projectsInOps = 0,
    installationPending = 0,
    subsidyPending = 0,
    completedProjects = 0,
  } = statsData || {};

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 })); // reset to page 1 on filter change
  };

  const handleRowClick = (item) => {
    if (item.type === "Customer") {
      navigate(`/projects/${item.id}`);
    } else {
      navigate(`/leads/${item.id}/profile`);
    }
  };

  return (
    <div className="pt-4 md:pt-8 px-2 md:px-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Unified Pipeline</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Master overview of all Leads and Projects.
          </p>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Total Leads" value={totalLeads} subtitle="All time leads generated" icon={UsersThreeIcon} colorScheme="primary" isLoading={isStatsLoading} />
        <KpiCard title="Active Customers" value={activeCustomers} subtitle="Projects currently in progress" icon={ProjectorScreenChartIcon} colorScheme="secondary" isLoading={isStatsLoading} />
        <KpiCard title="Projects in Operations" value={projectsInOps} subtitle="Docs, Tech/Fin, File Prep stages" icon={WrenchIcon} colorScheme="tertiary" isLoading={isStatsLoading} />
        <KpiCard title="Installation Pending" value={installationPending} subtitle="Projects ready for installation" icon={SunHorizonIcon} colorScheme="quaternary" isLoading={isStatsLoading} />
        <KpiCard title="Subsidy Pending" value={subsidyPending} subtitle="Projects awaiting subsidy disbursement" icon={BankIcon} colorScheme="purple" isLoading={isStatsLoading} />
        <KpiCard title="Completed Projects" value={completedProjects} subtitle="Fully commissioned projects" icon={CheckCircleIcon} colorScheme="success" isLoading={isStatsLoading} />
      </div>

      {/* Unified Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <MagnifyingGlassIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search name, phone..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
                <FunnelIcon size={16} className="text-gray-400" />
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Lead">Leads Only</option>
                  <option value="Customer">Customers Only</option>
                </select>
              </div>

              <select
                name="currentStage"
                value={filters.currentStage}
                onChange={handleFilterChange}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="">All Stages</option>
                <optgroup label="Lead Stages">
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                  <option value="Closed Lost">Closed Lost</option>
                </optgroup>
                <optgroup label="Project Stages">
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="TECHNICAL_FINANCIAL">Technical & Financial</option>
                  <option value="FILE_PREPARATION">File Preparation</option>
                  <option value="GOVT_APPROVALS">Govt Approvals</option>
                  <option value="SUBSIDY">Subsidy</option>
                  <option value="INSTALLATION">Installation</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4 hidden md:table-cell">Pending Action</th>
                <th className="px-6 py-4 text-right">Age (Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {isPipelineLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p>Loading pipeline data...</p>
                    </div>
                  </td>
                </tr>
              ) : pipelineData?.data?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No records found matching your filters.
                  </td>
                </tr>
              ) : (
                pipelineData?.data?.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        row.type === 'Customer' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {row.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-gray-200 font-medium">{row.currentStage}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assigned: {row.assignedTeam}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status={row.status} type={row.type} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${row.progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${row.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{row.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-[200px] truncate text-gray-600 dark:text-gray-300">
                      {row.pendingWork}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <span className={row.daysInCurrentStage > 14 ? 'text-red-600 dark:text-red-400' : row.daysInCurrentStage > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300'}>
                        {row.daysInCurrentStage}d
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pipelineData?.pagination && pipelineData.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(filters.page * filters.limit, pipelineData.pagination.total)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pipelineData.pagination.total}</span> entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={filters.page === 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <CaretLeftIcon size={18} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                Page {filters.page} of {pipelineData.pagination.totalPages}
              </span>
              <button 
                disabled={filters.page === pipelineData.pagination.totalPages}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <CaretRightIcon size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}