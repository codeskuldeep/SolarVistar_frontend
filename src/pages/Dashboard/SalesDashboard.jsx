import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../../context/slices/leadSlice';
import { Target, TrendUp, PhoneCall, EnvelopeSimple, WhatsappLogo } from '@phosphor-icons/react';

export default function SalesDashboard() {
  const dispatch = useDispatch();
  const { leads, isLoading } = useSelector((state) => state.leads);

  useEffect(() => {
    if (!isLoading) {
      dispatch(fetchLeads({ page: 1, limit: 50 }));
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // KPI Calculations
  const totalLeads = leads?.length || 0;
  
  const activeLeads = leads?.filter(
    (lead) => lead.status === 'NEW' || lead.status === 'CONTACTED' || lead.status === 'INTERESTED'
  ).length || 0;

  const convertedLeads = leads?.filter(
    (lead) => lead.status === 'CONVERTED'
  ).length || 0;

  const conversionRate = totalLeads > 0 
    ? Math.round((convertedLeads / totalLeads) * 100) 
    : 0;

  // Upcoming Follow-ups Table Data
  const upcomingFollowUps = (leads || [])
    .filter(lead => lead.status !== 'CONVERTED' && lead.status !== 'NOT_INTERESTED')
    .flatMap(lead => {
      if (!lead.followUps || lead.followUps.length === 0) return [];
      const latestFollowUp = lead.followUps[0];
      if (!latestFollowUp?.nextFollowUpDate) return [];
      return [{
        ...latestFollowUp,
        leadName: lead.customerName,
        leadId: lead.id,
        phone: lead.phoneNumber
      }];
    })
    .sort((a, b) => new Date(a.nextFollowUpDate) - new Date(b.nextFollowUpDate))
    .filter(followUp => new Date(followUp.nextFollowUpDate) >= new Date(new Date().setHours(0,0,0,0)))
    .slice(0, 5);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'PHONE_CALL': return <PhoneCall size={14} weight="fill" className="mr-1.5" />;
      case 'WHATSAPP': return <WhatsappLogo size={14} weight="fill" className="mr-1.5" />;
      case 'EMAIL': return <EnvelopeSimple size={14} weight="fill" className="mr-1.5" />;
      default: return null;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'PHONE_CALL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'WHATSAPP': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'EMAIL': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Sales Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your leads and follow-up pipeline</p>
        </div>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Target size={22} weight="duotone" className="text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">My Active Leads</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white kpi-value">{activeLeads}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-lg flex items-start gap-4 hover:border-gray-300 dark:hover:border-dark-border/80 transition-colors">
          <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <TrendUp size={22} weight="duotone" className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Conversion Rate</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 kpi-value">{conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* Mini-table: My Upcoming Follow-ups */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Upcoming Follow-ups</h2>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Next 5 scheduled</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-medium">Customer</th>
                <th className="px-6 py-3.5 font-medium">Contact</th>
                <th className="px-6 py-3.5 font-medium">Scheduled Date</th>
                <th className="px-6 py-3.5 font-medium">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {upcomingFollowUps.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    No upcoming follow-ups scheduled.
                  </td>
                </tr>
              ) : (
                upcomingFollowUps.map((followUp) => (
                  <tr key={followUp.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {followUp.leadName}
                    </td>
                    <td className="px-6 py-4">
                      {followUp.phone}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(followUp.nextFollowUpDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(followUp.method)}`}>
                        {getMethodIcon(followUp.method)}
                        {followUp.method?.replace('_', ' ')}
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

