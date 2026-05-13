import React from "react";
import { useGetProjectPendencyQuery } from "../../context/api/projectsApi";
import { useNavigate } from "react-router-dom";
import { ClockIcon, WarningIcon } from "@phosphor-icons/react";

export default function Pendency() {
  const { data, isLoading } = useGetProjectPendencyQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendencyList = data?.pendencyList || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-900/30 dark:text-amber-400">
          <ClockIcon size={24} weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Pendency</h1>
          <p className="text-gray-500 dark:text-gray-400">Items that are delayed or aging beyond thresholds.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4">Pending Item</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Days Delayed</th>
              <th className="px-6 py-4">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {pendencyList.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No pendency items found. Excellent!
                </td>
              </tr>
            ) : (
              pendencyList.map((item, idx) => (
                <tr 
                  key={idx}
                  onClick={() => navigate(`/projects/${item.projectId}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.customerName}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.currentStage}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.pendingTask}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.reason === 'DELAYED_TASK' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                      {item.reason.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-red-600 dark:text-red-400 font-medium">{item.daysDelayed}d</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {item.assignedUser ? `${item.assignedUser} (${item.assignedTeam})` : item.assignedTeam}
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
