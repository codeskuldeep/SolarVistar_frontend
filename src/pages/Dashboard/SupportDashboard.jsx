import { Ticket, CheckCircle, WarningCircle, ChatCircleText } from '@phosphor-icons/react';

export default function SupportDashboard() {
  // Using empty array as placeholder since tickets backend/RTK slice is not yet implemented
  const tickets = [];
  const isLoading = false;

  // KPI Calculations
  const openTicketsCount = tickets?.filter((ticket) => 
    ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS'
  ).length || 0;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const resolvedThisMonth = tickets?.filter((ticket) => {
    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') return false;
    const date = new Date(ticket.updatedAt || ticket.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length || 0;

  // Active Ticket Queue Data
  // Filters out closed tickets and sorts by creation date (oldest first, or could be priority)
  const activeTicketQueue = (tickets || [])
    .filter((ticket) => ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Support Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor active customer inquiries and resolution metrics
          </p>
        </div>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
          <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Ticket size={22} weight="duotone" className="text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Open Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white kpi-value">
              {openTicketsCount}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
          <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckCircle size={22} weight="duotone" className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resolved (This Month)</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 kpi-value">
              {resolvedThisMonth}
            </p>
          </div>
        </div>
      </div>

      {/* Table Component: Active Ticket Queue */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Ticket Queue</h2>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Showing {activeTicketQueue.length} tickets
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-medium">Customer</th>
                <th className="px-6 py-3.5 font-medium">Subject</th>
                <th className="px-6 py-3.5 font-medium">Priority</th>
                <th className="px-6 py-3.5 w-40 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {activeTicketQueue.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    You have no active support tickets in the queue.
                  </td>
                </tr>
              ) : (
                activeTicketQueue.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    
                    {/* Customer Info */}
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {ticket.customerName}
                    </td>
                    
                    {/* Ticket Subject */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 truncate max-w-xs" title={ticket.subject}>
                        <ChatCircleText size={14} weight="regular" className="text-gray-400 shrink-0" />
                        {ticket.subject}
                      </span>
                    </td>
                    
                    {/* Priority Badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5">
                        <WarningCircle 
                          size={14} 
                          weight="fill" 
                          className={`
                            ${ticket.priority === 'HIGH' ? 'text-red-500' : 
                              ticket.priority === 'MEDIUM' ? 'text-amber-500' : 'text-gray-400'}
                          `} 
                        />
                        <span className="capitalize">{ticket.priority?.toLowerCase() || 'Low'}</span>
                      </span>
                    </td>
                    
                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {ticket.status?.replace('_', ' ')}
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