import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Wait for the initial getCurrentUser() check to finish before deciding.
  // Without this, isAuthenticated is false on first render and redirects to /login
  // even for users with a valid session.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Authenticating...
        </div>
      </div>
    );
  }
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }
  // <Outlet /> acts as a placeholder for the child routes
  return <Outlet />;
};

export default ProtectedRoute;

