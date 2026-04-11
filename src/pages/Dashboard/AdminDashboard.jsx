import { useGetAdminStatsQuery } from "../../context/api/dashboardApi";
import {
  TrendUpIcon,
  CalendarCheckIcon,
  TargetIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

export default function AdminDashboard() {
  const { data, isLoading, isFetching } = useGetAdminStatsQuery();

  const totalUsers = data?.totalUsers ?? 0;
  const activeLeadsCount = data?.activeLeadsCount ?? 0;
  const pendingVisitsCount = data?.pendingVisitsCount ?? 0;
  const conversionRate = data?.conversionRate ?? 0;
  const recentVisits = data?.recentVisits ?? [];

  const kpiCards = [
    { label: "Active Team Members", value: totalUsers, icon: UsersThreeIcon, iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400" },
    { label: "Company Active Leads", value: activeLeadsCount, icon: TargetIcon, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-700 dark:text-blue-400" },
    { label: "Pending Visits", value: pendingVisitsCount, icon: CalendarCheckIcon, iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-700 dark:text-amber-400" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendUpIcon, iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-700 dark:text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Company-wide performance overview</p>
        </div>
        {(isLoading || isFetching) && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div key={card.label}
            className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
            <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
              <card.icon size={22} weight="duotone" className={card.iconColor} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white kpi-value">
                {isLoading ? (
                  <span className="inline-block w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                ) : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Visits Overview</h2>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Last 5 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-medium">Customer</th>
                <th className="px-6 py-3.5 font-medium">Date & Time</th>
                <th className="px-6 py-3.5 font-medium">Purpose</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {recentVisits.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    {isLoading ? "Loading visits..." : "No recent visits found"}
                  </td>
                </tr>
              ) : (
                recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{visit.customerName}</td>
                    <td className="px-6 py-4">
                      {new Date(visit.visitDatetime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{visit.purpose}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        visit.status === "SCHEDULED" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : visit.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : visit.status === "RESCHEDULED" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
