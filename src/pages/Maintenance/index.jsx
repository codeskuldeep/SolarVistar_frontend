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

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function getNextCheckpoint(amc) {
  const end = new Date(amc.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cp = new Date(amc.startDate);
  let idx = 0;
  while (cp < today) { cp = addMonths(cp, 3); idx++; }
  if (cp > end) return null;
  return { date: cp, quarterIndex: idx, saved: amc.checkpoints?.find((c) => c.quarterIndex === idx) ?? null };
}

function getQuarterCheckpoint(amc, year, quarter) {
  const quarterStart = new Date(Number(year), (Number(quarter) - 1) * 3, 1);
  const quarterEnd   = new Date(Number(year), (Number(quarter) - 1) * 3 + 3, 0);
  const end = new Date(amc.endDate);
  let cp = new Date(amc.startDate);
  let idx = 0;
  while (cp < quarterStart) { cp = addMonths(cp, 3); idx++; }
  if (cp > quarterEnd || cp > end) return null;
  return { date: cp, quarterIndex: idx, saved: amc.checkpoints?.find((c) => c.quarterIndex === idx) ?? null };
}

const CP_STATUS_CFG = {
  PENDING:     "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  DELAYED:     "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

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

function CheckpointCell({ amc, yearFilter, quarterFilter }) {
  const cpInfo = quarterFilter
    ? getQuarterCheckpoint(amc, yearFilter, quarterFilter)
    : getNextCheckpoint(amc);

  if (!cpInfo) return <span className="text-gray-400 dark:text-gray-600 text-xs">—</span>;

  const status = cpInfo.saved?.status ?? "PENDING";
  return (
    <div className="space-y-0.5 min-w-27.5">
      <p className="text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">{fmt(cpInfo.date)}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none ${CP_STATUS_CFG[status]}`}>
          {status.replace("_", " ")}
        </span>
        {cpInfo.saved?.assignedTo && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-22.5">
            {cpInfo.saved.assignedTo.name}
          </span>
        )}
      </div>
      {cpInfo.saved?.comment && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-37.5">{cpInfo.saved.comment}</p>
      )}
    </div>
  );
}

export default function Maintenance() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [quarterFilter, setQuarterFilter] = useState(null); // 1-4 or null

  const [debouncedSearch] = useDebounce(search, 300);

  const QUARTER_LABELS = [
    { q: 1, label: "Q1", months: "Jan – Mar" },
    { q: 2, label: "Q2", months: "Apr – Jun" },
    { q: 3, label: "Q3", months: "Jul – Sep" },
    { q: 4, label: "Q4", months: "Oct – Dec" },
  ];

  const { data, isLoading, isFetching } = useGetAllAmcRecordsQuery({
    page,
    limit: PER_PAGE,
    search: debouncedSearch,
    status: statusFilter,
    year: quarterFilter ? String(yearFilter) : "",
    quarter: quarterFilter ? String(quarterFilter) : "",
  });

  const records = data?.amcRecords ?? [];
  const meta = data?.meta;

  const checkpointColHeader = quarterFilter ? `Q${quarterFilter} Checkpoint` : "Next Checkpoint";
  const tableHeaders = [
    "Customer", "Phone", "Start Date", "End Date", "Status",
    checkpointColHeader,
    "Support Contact", "Notes", "Project",
  ];

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

        {/* Quarter filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarBlankIcon size={15} />
            <span className="font-medium whitespace-nowrap">Filter by Quarter:</span>
          </div>

          {/* Year selector */}
          <select
            className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={yearFilter}
            onChange={(e) => { setYearFilter(Number(e.target.value)); setPage(1); }}
          >
            {[-2, -1, 0, 1, 2].map((offset) => {
              const y = new Date().getFullYear() + offset;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>

          {/* Q1–Q4 toggle buttons */}
          <div className="flex gap-1.5">
            {QUARTER_LABELS.map(({ q, label, months }) => (
              <button
                key={q}
                title={months}
                onClick={() => { setQuarterFilter(quarterFilter === q ? null : q); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  quarterFilter === q
                    ? "bg-green-600 text-white border-green-600 dark:bg-green-500 dark:border-green-500"
                    : "bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 border-gray-300 dark:border-dark-border hover:border-green-500 hover:text-green-600 dark:hover:text-green-400"
                }`}
              >
                {label}
                <span className="hidden sm:inline text-[10px] font-normal ml-1 opacity-70">{months}</span>
              </button>
            ))}
          </div>

          {quarterFilter && (
            <button
              onClick={() => { setQuarterFilter(null); setPage(1); }}
              className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:underline font-medium"
            >
              <XIcon size={12} /> Clear
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
                    {tableHeaders.map((h) => (
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
                      <td className="px-4 py-3">
                        <CheckpointCell amc={amc} yearFilter={yearFilter} quarterFilter={quarterFilter} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{amc.supportContact?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-45 truncate">{amc.notes ?? "—"}</td>
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
                  <div className="pt-0.5">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                      {quarterFilter ? `Q${quarterFilter} Checkpoint` : "Next Checkpoint"}
                    </p>
                    <CheckpointCell amc={amc} yearFilter={yearFilter} quarterFilter={quarterFilter} />
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
