import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useNavigate } from "react-router-dom";
import { useGetAllAmcRecordsQuery } from "../../context/api/maintenanceApi";
import {
  MagnifyingGlassIcon,
  WrenchIcon,
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  SealIcon,
  XIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";
import { TableSkeleton } from "../../components/ui/Skeletons";
import Pagination from "../../components/ui/Pagination";

const PER_PAGE = 10;

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const StatusBadge = ({ status }) => {
  const cfg = {
    ACTIVE:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    EXPIRED:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    RENEWED:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default function Maintenance() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [debouncedSearch] = useDebounce(search, 300);

  const lastDayOfMonth = (ym) => {
    if (!ym) return "";
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m, 0).toISOString().slice(0, 10);
  };

  const { data, isLoading, isFetching } = useGetAllAmcRecordsQuery({
    page,
    limit: PER_PAGE,
    search: debouncedSearch,
    status: statusFilter,
    startDateFrom: dateFrom ? `${dateFrom}-01` : "",
    startDateTo: dateTo ? lastDayOfMonth(dateTo) : "",
  });

  const hasDateFilter = dateFrom || dateTo;
  const clearDates = () => { setDateFrom(""); setDateTo(""); setPage(1); };

  const records = data?.amcRecords ?? [];
  const meta = data?.meta;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <WrenchIcon size={22} className="text-green-600" weight="duotone" />
          Maintenance / AMC
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          All AMC records across projects. Open a project to create, edit, or delete its AMC.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search by customer name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="RENEWED">RENEWED</option>
          </select>
          {isFetching && !isLoading && (
            <ArrowsClockwiseIcon size={18} className="self-center text-green-600 animate-spin" />
          )}
        </div>

        {/* Date range filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarBlankIcon size={15} />
            <span className="font-medium whitespace-nowrap">Start Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">From</label>
            <input
              type="month"
              className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">To</label>
            <input
              type="month"
              className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>
          {hasDateFilter && (
            <button
              onClick={clearDates}
              className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:underline font-medium"
            >
              <XIcon size={12} /> Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={6} /></div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <SealIcon size={44} className="mb-2 opacity-30" />
            <p className="text-sm font-medium">No AMC records found.</p>
            <p className="text-xs mt-1">Open a project and use the AMC section to create one.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-border text-left">
                  <tr>
                    {["Customer", "Phone", "Start Date", "End Date", "Status", "Support Contact", "Notes", "Project"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {records.map((amc) => (
                    <tr key={amc.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/40">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {amc.project?.lead?.customerName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {amc.project?.lead?.phoneNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{fmt(amc.startDate)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{fmt(amc.endDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={amc.status} /></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{amc.supportContact?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[180px] truncate">{amc.notes ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/projects/${amc.projectId}`)}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          <ArrowSquareOutIcon size={13} /> Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
              {records.map((amc) => (
                <div key={amc.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {amc.project?.lead?.customerName ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{amc.project?.lead?.phoneNumber ?? "—"}</p>
                    </div>
                    <StatusBadge status={amc.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <span>Start: {fmt(amc.startDate)}</span>
                    <span>End: {fmt(amc.endDate)}</span>
                    <span>Contact: {amc.supportContact?.name ?? "—"}</span>
                  </div>
                  {amc.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{amc.notes}</p>
                  )}
                  <button
                    onClick={() => navigate(`/projects/${amc.projectId}`)}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium pt-1"
                  >
                    <ArrowSquareOutIcon size={13} /> Open Project
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={meta}
          onPageChange={setPage}
          isLoading={isFetching}
        />
      )}
    </div>
  );
}
