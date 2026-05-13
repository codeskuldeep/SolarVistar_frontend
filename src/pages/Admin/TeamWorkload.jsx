import React from "react";
import { useGetTeamWorkloadQuery } from "../../context/api/dashboardApi";
import { ChartBarIcon, UsersIcon } from "@phosphor-icons/react";

export default function TeamWorkload() {
  const { data: workloadData, isLoading } = useGetTeamWorkloadQuery();

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
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400">
          <ChartBarIcon size={24} weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Workload</h1>
          <p className="text-gray-500 dark:text-gray-400">Track active tasks and resolution times across departments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {workloadData?.map((dept, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{dept.team}</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dept.activeTasks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Delayed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dept.delayedTasks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Completed (Week)</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dept.completedThisWeek}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Avg Resolution</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dept.avgResolutionDays}d</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <UsersIcon size={16} /> Member Breakdown
              </h3>
              <div className="space-y-3">
                {dept.members.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No active members.</p>
                ) : (
                  dept.members.map(member => (
                    <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">{member.openTasks}</strong> Open</span>
                        {member.delayedTasks > 0 && (
                          <span className="text-red-600 dark:text-red-400"><strong className="text-red-600 dark:text-red-400">{member.delayedTasks}</strong> Delayed</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
