import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useGetLeadsQuery } from "../../context/api/leadsApi";
import Pagination from "../../components/ui/Pagination";
import { 
  Search, 
  Users, 
  MapPin, 
  Phone, 
  UserCircle, 
  ArrowRight,
  UserCheck
} from "lucide-react";

export default function Customers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  // 100% server-side search and pagination logic maintained
  const { data, isLoading, isFetching } = useGetLeadsQuery({
    page,
    limit: 10,
    search: debouncedSearch,
    status: "CONVERTED",
  });

  const leads = data?.leads ?? [];
  const meta = data?.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) setPage(newPage);
  };

  // Helper to get initials for the avatar
  const getInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-7xl pb-12">
      {/* Header Section */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Directory of all converted leads and active accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green-dark dark:text-brand-green text-sm font-medium rounded-md border border-brand-green/20">
            <Users className="w-4 h-4" />
            {meta.totalItems} Total
          </span>
        </div>
      </header>

      {/* Toolbar / Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue dark:focus:border-brand-blue transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <CustomersSkeleton />
      ) : leads.length === 0 ? (
        <div className="py-16 text-center border border-gray-200 dark:border-dark-border border-dashed rounded-lg bg-gray-50 dark:bg-dark-surface/50">
          <UserCheck className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No customers found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searchTerm ? "No results match your search criteria." : "Convert a lead to 'Won' to see them appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse whitespace-nowrap transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-200 dark:border-dark-border">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Agent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border/50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-green/10 text-brand-green-dark dark:text-brand-green flex items-center justify-center text-xs font-bold tracking-wider shrink-0">
                          {getInitials(lead.customerName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{lead.customerName}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[200px]" title={lead.address || "No address provided"}>
                              {lead.address || "No address"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {lead.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {lead.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/customers/${lead.id}`)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-green-dark dark:text-brand-green bg-brand-green/10 hover:bg-brand-green hover:text-white dark:hover:bg-brand-green dark:hover:text-white rounded-md transition-all focus:ring-2 focus:ring-offset-1 focus:ring-brand-green dark:focus:ring-offset-dark-surface"
                      >
                        Profile
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintain the existing pagination prop structure */}
      {!isLoading && leads.length > 0 && (
        <Pagination meta={meta} isLoading={isFetching} onPageChange={handlePageChange} itemName="customers" />
      )}
    </div>
  );
}

// Custom Skeleton matching the table layout perfectly to avoid layout shift
function CustomersSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden animate-pulse mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-200 dark:border-dark-border">
              <th className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div></th>
              <th className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></th>
              <th className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div></th>
              <th className="px-6 py-4 flex justify-end"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-100 dark:bg-gray-800/50 rounded"></div></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-4 flex justify-end">
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}