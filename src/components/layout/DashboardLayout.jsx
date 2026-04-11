import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, resetAuthState } from "../../context/slices/authSlice";

import {
  XIcon,
  HouseIcon,
  UsersIcon,
  CalendarCheckIcon,
  UserCircleIcon,
  SignOutIcon,
  ListIcon,
  SunIcon,
  MoonIcon,
  SolarPanelIcon,
  MoneyIcon,
} from "@phosphor-icons/react";
import { IndianRupeeIcon } from "lucide-react";


const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetAuthState());
    navigate("/login");
  };

  // RBAC filtered navigation
  const allNavigation = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: HouseIcon,
      roles: ["ADMIN", "STAFF"],
    },
    {
      name: "Lead Management",
      href: "/leads",
      icon: UsersIcon,
      roles: ["ADMIN", "STAFF"],
    },
    {
      name: "Site Visits",
      href: "/visits",
      icon: CalendarCheckIcon,
      roles: ["ADMIN", "STAFF"],
    },
    {
      name: "Team Management",
      href: "/users",
      icon: UserCircleIcon,
      roles: ["ADMIN"],
    },
    {
      name: "Quotations",
      href: "/quotations",
      icon: MoneyIcon,
      roles: ["ADMIN", "STAFF"],
    },
    {
      name: "Customers",
      href: "/customers",
      icon: UsersIcon,
      roles: ["ADMIN", "STAFF"],
    },
  ];

  const navigation = allNavigation.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg transition-colors duration-200 flex font-sans">
      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR — fixed height, never scrolls with content */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-white dark:bg-dark-surface 
        border-r border-gray-200 dark:border-dark-border
        transform transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <SolarPanelIcon size={18} weight="fill" className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide text-gray-900 dark:text-white leading-none">
                SolarVistar
              </span>
              <span className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 tracking-wider uppercase">
                CRM Platform
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <XIcon size={24} weight="bold" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-6 pb-2 shrink-0">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
            Navigation
          </span>
        </div>

        {/* Nav Links — this is the only scrollable part if items overflow */}
        <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150
                ${
                  isActive
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/40"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-border dark:hover:text-white border border-transparent"
                }
              `}
            >
              <item.icon
                className="mr-3 flex-shrink-0"
                size={20}
                weight={
                  window.location.pathname.includes(item.href)
                    ? "fill"
                    : "regular"
                }
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer — pinned to bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-dark-border shrink-0">
          <div className="flex items-center px-3 py-2.5 mb-1 rounded-lg bg-gray-50 dark:bg-dark-bg">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || "Staff Member"}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                {user?.role?.toLowerCase() || "user"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <SignOutIcon
              size={20}
              className="mr-3 flex-shrink-0"
              weight="bold"
            />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border transition-colors shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ListIcon size={24} weight="bold" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <SolarPanelIcon
              size={16}
              weight="duotone"
              className="text-green-600 dark:text-green-500"
            />
            <span>Solar Energy Operations</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-50 hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-border rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <SunIcon size={18} weight="bold" />
              ) : (
                <MoonIcon size={18} weight="bold" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
