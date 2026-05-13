import { useSelector } from 'react-redux';
import AdminDashboard from './AdminDashboard';

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

  // Everyone sees the unified overview now
  return <AdminDashboard />;
};

export default Overview;
