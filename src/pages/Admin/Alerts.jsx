import React from "react";
import { useGetAdminAlertsQuery } from "../../context/api/dashboardApi";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "@phosphor-icons/react";

export default function Alerts() {
  const { data: alerts, isLoading } = useGetAdminAlertsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl dark:bg-red-900/30 dark:text-red-400">
          <BellIcon size={24} weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Alerts</h1>
          <p className="text-gray-500 dark:text-gray-400">Action items requiring attention.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Assigned Team</th>
              <th className="px-6 py-4">Days Open</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {(!alerts || alerts.length === 0) ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No active alerts.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr 
                  key={alert.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      alert.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 
                      alert.severity === 'MED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{alert.category.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white font-semibold">{alert.title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{alert.description}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{alert.assignedTeam}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{alert.daysOpen}d</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(alert.actionUrl)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors font-medium text-sm"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
