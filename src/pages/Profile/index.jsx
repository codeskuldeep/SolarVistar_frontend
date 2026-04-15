import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  EnvelopeSimple, // Phosphor's cleaner mail icon
  Briefcase,
  Buildings,      // Phosphor uses plural for the office building
  CheckCircle,
  SignOut,        // Phosphor's equivalent to LogOut
  Copy,
  Check,
  Shield,
  CalendarBlank,  // A cleaner, standard calendar
  Hash,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { logoutUser } from "../../context/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [copiedField, setCopiedField] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleCopy = (value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Loading profile…
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          User data not available.
        </span>
      </div>
    );
  }

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "US";

  const roleLabel = user.role
    ?.toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              My Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {/* Top Section: Avatar & Core Identity */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-md bg-emerald-800 text-white flex items-center justify-center text-2xl font-medium tracking-wide">
                {getInitials(user.name)}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <Briefcase weight="regular" className="w-4 h-4" />
                  {roleLabel}
                </p>
              </div>
            </div>

            {user.isActive && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle weight="fill" className="w-4 h-4" />
                Active
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Contact & Department
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailField
                icon={EnvelopeSimple}
                label="Email Address"
                value={user.email}
                copyable
                onCopy={() => handleCopy(user.email, "email")}
                copied={copiedField === "email"}
              />

              <DetailField
                icon={Buildings}
                label="Department"
                value={user?.department?.name || "Unassigned"}
                badge={
                  user.departmentId && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 font-mono">
                      #{user.departmentId}
                    </span>
                  )
                }
              />

              <DetailField
                icon={Shield}
                label="Access Role"
                value={roleLabel}
              />

              <DetailField
                icon={Hash}
                label="User ID"
                value={user.id}
                mono
                copyable
                onCopy={() => handleCopy(user.id, "id")}
                copied={copiedField === "id"}
              />
            </div>
          </div>

          {/* Account Status Strip */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CalendarBlank className="w-3.5 h-3.5" />
              <span>Session active in this browser</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Read-only profile
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Need to update details? Contact your workspace administrator.
          </p>
          <button
            onClick={() => dispatch(logoutUser())}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <SignOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable detail field component
const DetailField = ({
  icon: Icon,
  label,
  value,
  badge,
  mono,
  copyable,
  onCopy,
  copied,
}) => (
  <div className="group relative flex flex-col gap-1.5 border border-gray-100 dark:border-gray-800 p-4 rounded-md bg-gray-50/60 dark:bg-gray-900/40 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
      <Icon weight="regular" className="w-3.5 h-3.5" /> {label}
    </span>
    <div className="flex items-center justify-between gap-2">
      <span
        className={`text-sm font-medium text-gray-900 dark:text-gray-200 truncate ${
          mono ? "font-mono text-xs" : ""
        }`}
        title={value}
      >
        {value}
        {badge}
      </span>
      {copyable && (
        <button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-opacity"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <Copy weight="regular" className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  </div>
);

export default Profile;