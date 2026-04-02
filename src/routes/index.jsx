import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/login"; // Adjust path if needed
import ProtectedRoute from "./ProtectedRoutes";
import DashboardLayout from "../components/layout/DashboardLayout"; // 👈 Import Layout
import UserManagement from "../pages/userManagement"; // Placeholder for future user management page
import Leads from "../pages/Leads";
import Visits from "../pages/Visits";
import Overview from "../pages/Dashboard"; // Import the new Dashboard component
import QuotationManager from "../pages/Quotations";
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />, // 🔒 Authentication Guard
    children: [
      {
        path: "/",
        element: <DashboardLayout />, // 🏗️ The UI Shell
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Overview />, // The strict traffic cop switchboard
          },
          {
            path: "leads",
            element: <Leads />,
          },
          {
            path: "users",
            element: <UserManagement />, // Future user management page
          },
          {
            path: "visits",
            element: <Visits />,
          },
          {
            path: "quotations",
            element: <QuotationManager />, // Future quotations page (you'll create this later)
          }
        ],
      },
    ],
  },
]);

