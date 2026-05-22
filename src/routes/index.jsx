import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login"; // Adjust path if needed
import ProtectedRoute from "./ProtectedRoutes";
import DashboardLayout from "../components/layout/DashboardLayout"; // 👈 Import Layout
import UserManagement from "../pages/UserManagement";
import Leads from "../pages/Leads";
import Visits from "../pages/Visits";
import Overview from "../pages/Dashboard";
import QuotationManager from "../pages/Quotations";
import ExistingCustomers from "../pages/Customers";
import CustomerProfile from "../pages/CustomerProfile";
import LeadDocuments from "../components/LeadDocuments";
import Profile from "../pages/Profile";
import LeadProfile from "../pages/LeadProfile";
import ProjectProfile from "../pages/ProjectProfile";
import Pendency from "../pages/Admin/Pendency";
import Alerts from "../pages/Admin/Alerts";
import TeamWorkload from "../pages/Admin/TeamWorkload";
import ProjectsInOps from "../pages/Admin/ProjectsInOps";
import InstallationPending from "../pages/Admin/InstallationPending";
import SubsidyPending from "../pages/Admin/SubsidyPending";
import CompletedProjects from "../pages/Admin/CompletedProjects";
import Maintenance from "../pages/Maintenance";

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
          },
          {
            path: "customers",
            element: <ExistingCustomers />, // Future customers page (you'll create this later)
          },
          {
            path: "customers/:customerId/documents",
            element: <LeadDocuments />,
          },
          {
            path: "leads/:id/profile",
            element: <LeadProfile />,
          },
          {
            path: "customers/:leadId",
            element: <CustomerProfile />,
          },
          {
            path: "projects/:id",
            element: <ProjectProfile />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "admin/pendency",
            element: <Pendency />,
          },
          {
            path: "admin/alerts",
            element: <Alerts />,
          },
          {
            path: "admin/team-workload",
            element: <TeamWorkload />,
          },
          {
            path: "admin/projects-in-ops",
            element: <ProjectsInOps />,
          },
          {
            path: "admin/installation-pending",
            element: <InstallationPending />,
          },
          {
            path: "admin/subsidy-pending",
            element: <SubsidyPending />,
          },
          {
            path: "admin/completed-projects",
            element: <CompletedProjects />,
          },
          {
            path: "maintenance",
            element: <Maintenance />,
          },
        ],
      },
    ],
  },
]);
