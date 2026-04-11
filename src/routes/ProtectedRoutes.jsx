import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Wait for the initial getCurrentUser() thunk to resolve/reject.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          {/* Simple Tailwind Spinner */}
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  // If loading is done and we have no valid session, kick them out.
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  // Session is valid, render the protected component.
  return <Outlet />;
};

export default ProtectedRoute;