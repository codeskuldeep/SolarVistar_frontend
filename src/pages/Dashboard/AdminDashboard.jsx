import React from "react";
import { useGetAdminStatsQuery } from "../../context/api/dashboardApi";
import {
  TrendUpIcon,
  CalendarCheckIcon,
  TargetIcon,
  UsersThreeIcon,
  CalendarBlankIcon,
  ExportIcon,
} from "@phosphor-icons/react";

// ==========================================
// INLINE UI COMPONENTS
// ==========================================

const StatusChip = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "COMPLETED": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "RESCHEDULED": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles()}`}>
      {status || "UNKNOWN"}
    </span>
  );
};

const TimelineItem = ({ title, subtitle, timeAgo, colorScheme }) => {
  const getColor = () => {
    switch (colorScheme) {
      case "primary": return "bg-blue-500";
      case "secondary": return "bg-emerald-500";
      case "error": return "bg-red-500";
      case "tertiary": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      <div className={`absolute left-[-5px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getColor()}`}></div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
        <div>
          <h5 className="font-semibold text-gray-900 dark:text-white">{title}</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {timeAgo}
        </span>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, subtitle, icon: Icon, colorScheme, trend, variant, isLoading }) => {
  const getIconColors = () => {
    if (variant === "gradient") return "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg";
    switch (colorScheme) {
      case "primary": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "secondary": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "tertiary": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${getIconColors()}`}>
          <Icon size={24} weight={variant === "gradient" ? "fill" : "duotone"} />
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
            {trend}
          </span>
        )}
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

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-2xl p-8 shadow-sm ${className}`}>
    {children}
  </div>
);

const GradientButton = ({ children, className = "", ...props }) => (
  <button
    className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function AdminDashboard() {
  const { data, isLoading, isFetching } = useGetAdminStatsQuery();

  const totalUsers = data?.totalUsers ?? 0;
  const activeLeadsCount = data?.activeLeadsCount ?? 0;
  const pendingVisitsCount = data?.pendingVisitsCount ?? 0;
  const conversionRate = data?.conversionRate ?? 0;
  const recentVisits = data?.recentVisits ?? [];

  return (
    <div className="pt-4 md:pt-8 px-2 md:px-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 flex items-center">
            Welcome back, Architect. Here is your radiant status report.
            {(isLoading || isFetching) && (
              <span className="inline-block ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
            )}
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CalendarBlankIcon size={18} />
            Last 30 Days
          </button>
          <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ExportIcon size={18} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Team"
          value={totalUsers}
          subtitle="Active team members"
          icon={UsersThreeIcon}
          colorScheme="primary"
          trend="+5%"
          isLoading={isLoading}
        />
        <KpiCard
          title="Company Leads"
          value={activeLeadsCount}
          subtitle="Active outreach campaigns"
          icon={TargetIcon}
          colorScheme="secondary"
          trend="+12.5%"
          isLoading={isLoading}
        />
        <KpiCard
          title="Pending Visits"
          value={pendingVisitsCount}
          subtitle="Scheduled for survey"
          icon={CalendarCheckIcon}
          colorScheme="tertiary"
          isLoading={isLoading}
        />
        <KpiCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Win rate this month"
          icon={TrendUpIcon}
          variant="gradient"
          trend="+3.2%"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Layout: Timeline & Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Activity Timeline</h4>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="space-y-0 relative ml-2">
              <div className="absolute left-[3px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700"></div>
              {isLoading ? (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading recent activity...</div>
              ) : recentVisits.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No recent visits</div>
              ) : (
                recentVisits.map((visit, idx) => {
                  const colors = ["primary", "secondary", "error", "tertiary"];
                  const color = colors[idx % colors.length];
                  return (
                    <TimelineItem
                      key={visit.id}
                      title={`Visit for ${visit.customerName}`}
                      subtitle={`Purpose: ${visit.purpose}`}
                      timeAgo={new Date(visit.visitDatetime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      colorScheme={color}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Glassmorphism Promo */}
          <GlassCard className="flex flex-col md:flex-row items-center gap-8">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="flex-1 z-10">
              <h5 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Efficiency Insights Available</h5>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Our new AI-driven module predicts lead conversion based on panel layout preferences. 
                Activate the architect tool to increase closing rates by 15%.
              </p>
              <div className="flex gap-4 items-center">
                <GradientButton>Explore Module</GradientButton>
                <button className="text-gray-500 dark:text-gray-400 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dismiss</button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Upcoming Visits */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <CalendarCheckIcon size={24} className="text-emerald-500" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Recent Updates</h4>
            </div>
            
            <div className="space-y-4">
               {isLoading ? (
                 <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading updates...</div>
               ) : recentVisits.length === 0 ? (
                 <p className="text-sm text-gray-500 dark:text-gray-400">No actions pending.</p>
               ) : (
                 recentVisits.slice(0, 4).map((visit, idx) => {
                   const borders = ["border-emerald-500", "border-blue-500", "border-purple-500", "border-red-500"];
                   const bColor = borders[idx % borders.length];
                   return (
                     <div key={`recent-${visit.id}`} className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-l-4 ${bColor} transition-transform hover:translate-x-1 cursor-pointer border-t border-r border-b border-gray-100 dark:border-gray-700`}>
                       <div className="flex justify-between mb-1">
                         <span className={`text-xs font-black tracking-wider uppercase text-gray-500 dark:text-gray-400`}>
                           {new Date(visit.visitDatetime).toLocaleDateString()}
                         </span>
                       </div>
                       <p className="font-bold text-gray-900 dark:text-white">{visit.customerName}</p>
                       <div className="mt-3 flex items-center gap-2">
                         <StatusChip status={visit.status} />
                         <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{visit.purpose}</span>
                       </div>
                     </div>
                   );
                 })
               )}
            </div>
            <button className="w-full mt-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                Manage All Schedules
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}