import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard';
import SalesDashboard from './SalesDashboard';
import InstallationDashboard from './InstallationDashboard';
import SupportDashboard from './SupportDashboard';

const Overview = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Fallback while user state is loading
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // 1. If Admin, show the God-Mode Dashboard
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  // 2. If Staff, route to their specific department dashboard
  const dept = (user.department?.name || user.department || '').toUpperCase();

  switch (dept) {
    case 'SALES':
      return <SalesDashboard />;
    case 'INSTALLATION':
      return <InstallationDashboard />;
    case 'SUPPORT':
      return <SupportDashboard />;
    default:
      return (
        <div className="p-8 text-center bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Welcome, {user.name}</h2>
          <p className="text-gray-500">Your specific department dashboard ({dept || 'Unknown'}) is currently being configured.</p>
        </div>
      );
  }
};

export default Overview;
