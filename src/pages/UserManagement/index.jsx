import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useDispatch } from "react-redux";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} from "../../context/api/usersApi";
import { addToast } from "../../context/slices/toastSlice";
import {
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  XIcon,
  WarningCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { TableSkeleton } from "../../components/ui/Skeletons";
import Pagination from "../../components/ui/Pagination";

const USERS_PER_PAGE = 10;

// ── Validation ───────────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (data) => {
  const errors = {};
  if (!data.name.trim() || data.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";
  if (!data.email.trim())
    errors.email = "Email is required.";
  else if (!emailRegex.test(data.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!data.password)
    errors.password = "Password is required.";
  else if (data.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  else if (!/[A-Za-z]/.test(data.password) || !/[0-9]/.test(data.password))
    errors.password = "Must contain at least one letter and one number.";
  if (!data.confirmPassword)
    errors.confirmPassword = "Please confirm the password.";
  else if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  if (data.role === "STAFF" && !data.department)
    errors.department = "Department is required for staff.";
  return errors;
};

// ── FieldError helper ────────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <WarningCircleIcon size={12} weight="fill" />
      {msg}
    </p>
  ) : null;

const inputCls = (hasError) =>
  `w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 dark:bg-dark-bg dark:text-white transition-colors
  ${hasError
    ? "border-red-400 dark:border-red-600 focus:ring-red-400 focus:border-red-400"
    : "border-gray-300 dark:border-dark-border focus:ring-green-500 focus:border-green-500"
  }`;

// ── Password strength bar ────────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500", "bg-emerald-600"];

const PasswordStrength = ({ password }) => {
  const strength = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? STRENGTH_COLORS[strength] : "bg-gray-200 dark:bg-dark-border"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${strength <= 1 ? "text-red-500" : strength <= 2 ? "text-orange-400" : strength <= 3 ? "text-yellow-500" : "text-emerald-600"}`}>
        {STRENGTH_LABELS[strength]}
      </p>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "", role: "STAFF", department: "" };

const Users = () => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page, limit: USERS_PER_PAGE, search: debouncedSearch,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const usersList = data?.users ?? [];
  const meta = data?.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 };

  const handleSearchChange = (val) => { setSearchTerm(val); setPage(1); };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) setPage(newPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const next = {
      ...formData,
      [name]: value,
      ...(name === "role" && value === "ADMIN" ? { department: "" } : {}),
    };
    setFormData(next);
    // Re-validate live if already submitted or field touched
    if (submitted || touchedFields[name]) {
      setFormErrors(validateForm(next));
    }
  };

  const handleBlur = (name) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setFormErrors(validateForm(formData));
  };

  const fieldError = (name) => (submitted || touchedFields[name]) ? formErrors[name] : undefined;

  const handleOpenModal = () => {
    setFormData({ ...EMPTY_FORM });
    setFormErrors({});
    setTouchedFields({});
    setSubmitted(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const { confirmPassword, ...payload } = formData;
    const result = await createUser(payload);
    if (!result.error) {
      handleCloseModal();
      dispatch(addToast({ message: "User created successfully", type: "success" }));
    } else {
      dispatch(addToast({ message: result.error?.data?.message || "Failed to create user", type: "error" }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      const result = await deleteUser(id);
      if (!result.error) {
        dispatch(addToast({ message: "User deleted successfully", type: "success" }));
      } else {
        dispatch(addToast({ message: result.error?.data?.message || "Failed to delete user", type: "error" }));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Team Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage system access, roles, and departments.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon weight="bold" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" weight="bold" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-9 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
        />
        {searchTerm && (
          <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden shadow-sm transition-opacity ${isFetching && !isLoading ? "opacity-70" : "opacity-100"}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
              {isLoading ? (
                <TableSkeleton columns={4} />
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              ) : (
                usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" weight="light" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${user.role === "ADMIN" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {user.department || <span className="text-gray-400 italic text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete User"
                      >
                        <TrashIcon size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add New User</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All fields are required for staff accounts.</p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("name")}
                  placeholder="e.g. Ravi Sharma"
                  className={inputCls(!!fieldError("name"))}
                />
                <FieldError msg={fieldError("name")} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="ravi@solarvistar.com"
                  className={inputCls(!!fieldError("email"))}
                />
                <FieldError msg={fieldError("email")} />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="Min. 8 chars, letter + number"
                    className={`${inputCls(!!fieldError("password"))} pr-10`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPw ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
                <FieldError msg={fieldError("password")} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Re-enter password"
                    className={`${inputCls(!!fieldError("confirmPassword"))} pr-10`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirm ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {/* Match indicator */}
                {formData.confirmPassword && !fieldError("confirmPassword") && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircleIcon size={12} weight="fill" /> Passwords match
                  </p>
                )}
                <FieldError msg={fieldError("confirmPassword")} />
              </div>

              {/* Role + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={inputCls(false)}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department {formData.role === "STAFF" && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("department")}
                    disabled={formData.role === "ADMIN"}
                    className={`${inputCls(!!fieldError("department"))} disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-dark-bg/50 dark:disabled:text-gray-600`}
                  >
                    <option value="" disabled>-- Select --</option>
                    <option value="Sales Department">Sales Department</option>
                    <option value="Installation & Maintenance Department">Installation & Maintenance Department</option>
                    <option value="Operations Department">Operations Department</option>
                  </select>
                  <FieldError msg={fieldError("department")} />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-dark-border mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-dark-surface dark:text-gray-300 dark:border-dark-border dark:hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-70 flex items-center justify-center min-w-[100px] transition-colors"
                >
                  {isCreating ? "Saving…" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Pagination meta={meta} isLoading={isLoading} onPageChange={handlePageChange} itemName="users" />
    </div>
  );
};

export default Users;
