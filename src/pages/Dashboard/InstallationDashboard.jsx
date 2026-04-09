import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVisits } from '../../context/slices/visitSlice';
import { Wrench, CheckCircle, MapPin, Clock } from '@phosphor-icons/react';

export default function InstallationDashboard() {
  const dispatch = useDispatch();
  const { visits, hasFetched, isLoading, lastFetchedAt } = useSelector((state) => state.visits);

  const STALE_MS = 2 * 60 * 1000;

  useEffect(() => {
    const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_MS;
    if (isStale) {
      dispatch(fetchVisits({ page: 1, limit: 50 }));
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // KPI Calculations
  const pendingJobs = visits?.filter((visit) => visit.status === 'PENDING').length || 0;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedJobsThisMonth = visits?.filter((visit) => {
    if (visit.status !== 'COMPLETED') return false;
    const date = new Date(visit.visitDatetime);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length || 0;

  // Today's Schedule Data
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaysSchedule = (visits || [])
    .filter((visit) => {
      const visitDate = new Date(visit.visitDatetime);
      return visitDate >= startOfToday && visitDate <= endOfToday;
    })
    .sort((a, b) => new Date(a.visitDatetime) - new Date(b.visitDatetime))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Installation Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your installation jobs and daily schedule</p>
        </div>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
          <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Wrench size={22} weight="duotone" className="text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Jobs</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white kpi-value">{pendingJobs}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
          <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckCircle size={22} weight="duotone" className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed (This Month)</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 kpi-value">{completedJobsThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Table Component: Today's Schedule */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Schedule</h2>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-medium">Customer</th>
                <th className="px-6 py-3.5 font-medium">Time</th>
                <th className="px-6 py-3.5 font-medium">Address</th>
                <th className="px-6 py-3.5 w-40 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {todaysSchedule.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    Your schedule is clear for today.
                  </td>
                </tr>
              ) : (
                todaysSchedule.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {visit.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} weight="regular" className="text-gray-400" />
                        {new Date(visit.visitDatetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 truncate max-w-xs">
                        <MapPin size={14} weight="regular" className="text-gray-400 shrink-0" />
                        {visit.address}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        visit.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        visit.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
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

