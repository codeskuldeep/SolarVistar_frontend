import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVisits,
  createVisit,
  updateVisitStatus,
  clearVisitMessages,
} from "../../context/slices/visitSlice";
import { fetchUsers } from "../../context/slices/userSlice";
import { fetchLeads } from "../../context/slices/leadSlice";
import { addToast } from "../../context/slices/toastSlice";
import {
  CalendarPlusIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CheckSquareOffsetIcon,
} from "@phosphor-icons/react";
import { TableSkeleton } from "../../components/ui/Skeletons";

const Visits = () => {
  const dispatch = useDispatch();

  const { visits, isLoading, error, successMessage, hasFetched, meta } =
    useSelector((state) => state.visits);
  const { users } = useSelector((state) => state.users);
  const { leads } = useSelector((state) => state.leads);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [activeModal, setActiveModal] = useState(null); // 'CREATE', 'UPDATE'
  const [selectedVisit, setSelectedVisit] = useState(null);

  const [createData, setCreateData] = useState({
    customerName: "",
    phoneNumber: "",
    address: "",
    visitDatetime: "",
    purpose: "",
    leadId: "",
    assignedStaffId: "",
  });

  const [updateData, setUpdateData] = useState({
    status: "SCHEDULED",
    comments: "",
    customerFeedback: "",
    workCompleted: "",
    issuesIdentified: "",
    nextSteps: "",
    assignedStaffId: "",
  });

  useEffect(() => {
    if (!hasFetched && !isLoading)
      dispatch(fetchVisits({ page: 1, limit: meta.itemsPerPage })); // Fetch all visits for simplicity
    if (users.length === 0) dispatch(fetchUsers());
    if (leads.length === 0) dispatch(fetchLeads());
  }, [
    dispatch,
    hasFetched,
    isLoading,
    users.length,
    leads.length,
    meta.itemsPerPage,
  ]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => dispatch(clearVisitMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleCloseModal = () => {
    setActiveModal(null);
    setCreateData({
      customerName: "",
      phoneNumber: "",
      address: "",
      visitDatetime: "",
      purpose: "",
      leadId: "",
      assignedStaffId: "",
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createVisit(createData));
    if (createVisit.fulfilled.match(result)) {
      handleCloseModal();
      dispatch(
        addToast({ message: "Visit scheduled successfully", type: "success" }),
      );
    } else {
      dispatch(
        addToast({
          message: result.payload || "Failed to schedule visit",
          type: "error",
        }),
      );
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...updateData,
      assignedStaffId: updateData.assignedStaffId || undefined, // Only pass if provided
    };
    const result = await dispatch(
      updateVisitStatus({ id: selectedVisit.id, updateData: payload }),
    );
    if (updateVisitStatus.fulfilled.match(result)) {
      setActiveModal(null);
      dispatch(
        addToast({ message: "Visit updated successfully", type: "success" }),
      );
    } else {
      dispatch(
        addToast({
          message: result.payload || "Failed to update visit",
          type: "error",
        }),
      );
    }
  };

  const handlePageChange = (newPage) => {
    // Only fetch if the page is actually valid
    if (newPage >= 1 && newPage <= meta.totalPages) {
      // Dispatching directly here bypasses the `hasFetched` block!
      dispatch(fetchVisits({ page: newPage, limit: meta.itemsPerPage }));
    }
  };


  const getStatusStyle = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "COMPLETED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "RESCHEDULED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const visitsList = Array.isArray(visits) ? visits : [];
  const staffUsers = Array.isArray(users) ? users : [];
  const leadsList = Array.isArray(leads) ? leads : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Site Visits
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Schedule and track field operations and site assessments.
          </p>
        </div>
        <button
          onClick={() => setActiveModal("CREATE")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <CalendarPlusIcon weight="bold" size={18} />
          Schedule Visit
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 w-48 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status & Staff
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
              {isLoading ? (
                <TableSkeleton columns={5} />
              ) : visitsList.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No upcoming visits found.
                  </td>
                </tr>
              ) : (
                visitsList.map((visit) => {
                  const visitDate = new Date(visit.visitDatetime);
                  return (
                    <tr
                      key={visit.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white font-medium mb-1">
                          <ClockIcon className="mr-2 text-green-500" />
                          {visitDate.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                          {visitDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {visit.customerName}
                        </div>
                        <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <PhoneIcon /> {visit.phoneNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon /> {visit.address}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {visit.purpose}
                        {visit.lead && (
                          <span className="block mt-1 text-xs text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded w-fit">
                            Linked to Lead
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${getStatusStyle(visit.status || "SCHEDULED")}`}
                        >
                          {(visit.status || "SCHEDULED").replace("_", " ")}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <UserIcon
                            size={16}
                            weight="regular"
                            className="mr-1.5"
                          />
                          {visit.assignedStaff?.name || (
                            <span className="italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedVisit(visit);
                            setUpdateData({
                              status: visit.status || "SCHEDULED",
                              comments: visit.comments || "",
                              customerFeedback: visit.customerFeedback || "",
                              workCompleted: visit.workCompleted || "",
                              issuesIdentified: visit.issuesIdentified || "",
                              nextSteps: visit.nextSteps || "",
                              assignedStaffId: visit.assignedStaffId || "",
                            });
                            setActiveModal("UPDATE");
                          }}
                          className="text-gray-500 hover:text-green-600 transition-colors"
                          title="Update Visit & Log Notes"
                        >
                          <CheckSquareOffsetIcon size={20} weight="regular" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-lg shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeModal === "CREATE"
                  ? "Schedule New Visit"
                  : `Update Visit: ${selectedVisit?.customerName}`}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {/* SCHEDULE VISIT FORM */}
              {activeModal === "CREATE" && (
                <form
                  id="visitForm"
                  onSubmit={handleCreateSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={createData.customerName}
                        onChange={(e) =>
                          setCreateData({
                            ...createData,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={createData.phoneNumber}
                        onChange={(e) =>
                          setCreateData({
                            ...createData,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Visit Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createData.visitDatetime}
                      onChange={(e) =>
                        setCreateData({
                          ...createData,
                          visitDatetime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address / Location *
                    </label>
                    <textarea
                      required
                      rows="2"
                      value={createData.address}
                      onChange={(e) =>
                        setCreateData({
                          ...createData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Purpose of Visit *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Initial Site Assessment, Panel Installation"
                      required
                      value={createData.purpose}
                      onChange={(e) =>
                        setCreateData({
                          ...createData,
                          purpose: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Link to Lead (Optional)
                      </label>
                      <select
                        value={createData.leadId}
                        onChange={(e) =>
                          setCreateData({
                            ...createData,
                            leadId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      >
                        <option value="">-- No Lead --</option>
                        {leadsList.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.customerName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className={
                        currentUser?.role !== "ADMIN" ? "tooltip-wrapper" : ""
                      }
                    >
                      {currentUser?.role !== "ADMIN" && (
                        <span className="tooltip-text">
                          Can't access: Assign Staff
                        </span>
                      )}
                      <label
                        className={`block text-sm font-medium mb-1 ${currentUser?.role === "ADMIN" ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}
                      >
                        Assign Staff
                      </label>
                      <select
                        value={createData.assignedStaffId}
                        disabled={currentUser?.role !== "ADMIN"}
                        onChange={(e) =>
                          setCreateData({
                            ...createData,
                            assignedStaffId: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-md sm:text-sm ${
                          currentUser?.role === "ADMIN"
                            ? "border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:ring-1 focus:ring-blue-500"
                            : "border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-bg/50 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        <option value="">-- Unassigned --</option>
                        {staffUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
              )}

              {/* UPDATE VISIT FORM */}
              {activeModal === "UPDATE" && (
                <form
                  id="visitForm"
                  onSubmit={handleUpdateSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={updateData.status}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div
                      className={
                        currentUser?.role !== "ADMIN" ? "tooltip-wrapper" : ""
                      }
                    >
                      {currentUser?.role !== "ADMIN" && (
                        <span className="tooltip-text">
                          Can't access: Reassign Visit
                        </span>
                      )}
                      <label
                        className={`block text-sm font-medium mb-1 ${currentUser?.role === "ADMIN" ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}
                      >
                        Reassign Staff{" "}
                        {currentUser?.role !== "ADMIN" && "(Admin Only)"}
                      </label>
                      <select
                        value={updateData.assignedStaffId}
                        disabled={currentUser?.role !== "ADMIN"}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            assignedStaffId: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-md sm:text-sm ${
                          currentUser?.role === "ADMIN"
                            ? "border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:ring-1 focus:ring-blue-500"
                            : "border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-bg/50 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        <option value="">-- Unassigned --</option>
                        {staffUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Work Completed
                    </label>
                    <textarea
                      rows="2"
                      value={updateData.workCompleted}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          workCompleted: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      placeholder="Details of the assessment or installation..."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Issues Identified
                      </label>
                      <textarea
                        rows="2"
                        value={updateData.issuesIdentified}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            issuesIdentified: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                        placeholder="Shading issues, roof condition, etc."
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Next Steps
                      </label>
                      <textarea
                        rows="2"
                        value={updateData.nextSteps}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            nextSteps: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                        placeholder="Generate quote, schedule install..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Customer Feedback
                      </label>
                      <input
                        type="text"
                        value={updateData.customerFeedback}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            customerFeedback: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Internal Comments
                      </label>
                      <input
                        type="text"
                        value={updateData.comments}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            comments: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="visitForm"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-70"
              >
                {activeModal === "CREATE" ? "Schedule Visit" : "Save Update"}
              </button>
            </div>
          </div>
        </div>
      )}
      {meta?.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {(meta.currentPage - 1) * meta.itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {meta.totalItems}
            </span>{" "}
            leads
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(meta.currentPage - 1)}
              disabled={meta.currentPage === 1 || isLoading}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {meta.currentPage} of {meta.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(meta.currentPage + 1)}
              disabled={meta.currentPage === meta.totalPages || isLoading}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visits;
