import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";
import {
  useGetVisitsQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
} from "../../context/api/visitsApi";
import { useGetLeadsQuery } from "../../context/api/leadsApi";
import { useGetUsersQuery } from "../../context/api/usersApi";
import { useCreateLeadMutation } from "../../context/api/leadsApi";
import { addToast } from "../../context/slices/toastSlice";
import {
  CalendarPlusIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CheckSquareOffsetIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { TableSkeleton } from "../../components/ui/Skeletons";
import Pagination from "../../components/ui/Pagination";
import SearchAutocomplete from "../../components/ui/SearchAutocomplete";

const QuickLeadModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({ customerName: "", phoneNumber: "" });
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createLead(formData);
    if (!res.error && res.data?.id) {
      onCreated(res.data.id);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Create Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
            <input type="text" required value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-950 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
            <input type="tel" required value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-950 dark:text-white" />
          </div>
          <div className="flex justify-end pt-2 gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">
              {isLoading ? "Saving..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Visits = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const canAssign = currentUser?.role === "ADMIN" || currentUser?.department?.name === "Sales";

  // ── Table search ──
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);

  // ── Form search state (separate from table, won't interfere) ──
  const [leadSearch, setLeadSearch] = useState("");
  const [debouncedLeadSearch] = useDebounce(leadSearch, 300);
  const [staffSearch, setStaffSearch] = useState("");
  const [debouncedStaffSearch] = useDebounce(staffSearch, 300);

  // ── Modal state ──
  const [activeModal, setActiveModal] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showQuickLead, setShowQuickLead] = useState(false);

  const [createData, setCreateData] = useState({
    customerName: "", phoneNumber: "", address: "",
    visitDatetime: "", purpose: "", leadId: "", assignedStaffId: "",
  });
  const [updateData, setUpdateData] = useState({
    status: "SCHEDULED", comments: "", customerFeedback: "",
    workCompleted: "", issuesIdentified: "", nextSteps: "", assignedStaffId: "",
  });

  const VISITS_PER_PAGE = 10;

  // ── RTK Query hooks ──
  const { data: visitsData, isLoading, isFetching } = useGetVisitsQuery({
    page, limit: VISITS_PER_PAGE, search: debouncedSearch,
  });

  const { data: leadsData, isFetching: leadsFetching } = useGetLeadsQuery(
    { limit: 10, search: debouncedLeadSearch },
    { skip: !activeModal }
  );

  const { data: staffData, isFetching: staffFetching } = useGetUsersQuery(
    { limit: 10, search: debouncedStaffSearch },
    { skip: !activeModal || !canAssign }
  );

  const [createVisit, { isLoading: isCreating }] = useCreateVisitMutation();
  const [updateVisit, { isLoading: isUpdating }] = useUpdateVisitMutation();

  const visitsList = visitsData?.visits ?? [];
  const meta = visitsData?.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 };
  const leadsList = leadsData?.leads ?? [];
  const staffUsers = staffData?.users ?? [];

  const handleSearchChange = (value) => { setSearchTerm(value); setPage(1); };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) setPage(newPage);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setCreateData({ customerName: "", phoneNumber: "", address: "", visitDatetime: "", purpose: "", leadId: "", assignedStaffId: "" });
    setLeadSearch("");
    setStaffSearch("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const result = await createVisit(createData);
    if (!result.error) {
      handleCloseModal();
      dispatch(addToast({ message: "Visit scheduled successfully", type: "success" }));
    } else {
      dispatch(addToast({ message: result.error?.data?.message || "Failed to schedule visit", type: "error" }));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const result = await updateVisit({
      id: selectedVisit.id,
      updateData: { ...updateData, assignedStaffId: updateData.assignedStaffId || null },
    });
    if (!result.error) {
      setActiveModal(null);
      dispatch(addToast({ message: "Visit updated successfully", type: "success" }));
    } else {
      dispatch(addToast({ message: result.error?.data?.message || "Failed to update visit", type: "error" }));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "COMPLETED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "RESCHEDULED": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-1 focus:ring-green-500 dark:bg-dark-bg dark:text-white sm:text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Site Visits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schedule and track field operations and site assessments.</p>
        </div>
        <button
          onClick={() => setActiveModal("CREATE")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <CalendarPlusIcon weight="bold" size={18} />
          Schedule Visit
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" weight="bold" />
        <input type="text" value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, phone, or address..."
          className="w-full pl-9 pr-9 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm" />
        {searchTerm && (
          <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className={`bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden shadow-sm transition-opacity ${isFetching && !isLoading ? "opacity-70" : "opacity-100"}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer & Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 w-48 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status & Staff</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
              {isLoading ? (
                <TableSkeleton columns={5} />
              ) : visitsList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No upcoming visits found.</td>
                </tr>
              ) : (
                visitsList.map((visit) => {
                  const visitDate = new Date(visit.visitDatetime);
                  return (
                    <tr key={visit.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white font-medium mb-1">
                          <ClockIcon className="mr-2 text-green-500" />
                          {visitDate.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                          {visitDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{visit.customerName}</div>
                        <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><PhoneIcon /> {visit.phoneNumber}</span>
                          <span className="flex items-center gap-1"><MapPinIcon /> {visit.address}</span>
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
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${getStatusStyle(visit.status || "SCHEDULED")}`}>
                          {(visit.status || "SCHEDULED").replace("_", " ")}
                        </span>
                        <div className="flex items-start text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <UserIcon size={16} weight="regular" className="mr-1.5 mt-0.5" />
                          {visit.assignedStaff?.name ? (
                            <div>
                              <span>{visit.assignedStaff.name}</span>
                              {visit.assignedStaff.department && (
                                <span className="block text-xs text-gray-400">
                                  {visit.assignedStaff.department?.name || visit.assignedStaff.department}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="italic mt-0.5">Unassigned</span>
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
                {activeModal === "CREATE" ? "Schedule New Visit" : `Update Visit: ${selectedVisit?.customerName}`}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
            </div>

            <div className="overflow-y-auto p-6">
              {/* SCHEDULE VISIT FORM */}
              {activeModal === "CREATE" && (
                <form id="visitForm" onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <SearchAutocomplete
                      items={leadsList}
                      selectedId={createData.leadId}
                      onSearch={setLeadSearch}
                      isLoading={leadsFetching}
                      onSelect={(id) => {
                        if (!id) {
                          setCreateData((prev) => ({ ...prev, leadId: "", customerName: "", phoneNumber: "", address: "" }));
                          return;
                        }
                        const lead = leadsList.find((l) => l.id === id);
                        if (lead) {
                          setCreateData((prev) => ({
                            ...prev,
                            leadId: id,
                            customerName: lead.customerName,
                            phoneNumber: lead.phoneNumber,
                            address: lead.address || "TBD (No address on lead)",
                          }));
                        }
                      }}
                      label="Select Lead *"
                      placeholder="Search lead by name or phone..."
                      required={true}
                      selectedTheme="emerald"
                      renderItem={(lead, isSelected) =>
                        isSelected ? `${lead.customerName} (${lead.phoneNumber})` : (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">{lead.customerName}</span>
                            <span className="text-xs text-gray-500">{lead.phoneNumber}</span>
                          </div>
                        )
                      }
                      searchFilter={(lead, term) => {
                        const t = term.toLowerCase();
                        return (lead.customerName || "").toLowerCase().includes(t) || (lead.phoneNumber || "").includes(term);
                      }}
                      noResultsAction={(closeDropdown) => (
                        <button type="button" onClick={() => { closeDropdown(); setShowQuickLead(true); }}
                          className="w-full text-center py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">
                          + Create New Lead
                        </button>
                      )}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visit Date & Time *</label>
                      <input type="datetime-local" required value={createData.visitDatetime}
                        onChange={(e) => setCreateData({ ...createData, visitDatetime: e.target.value })}
                        className={inputCls} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose of Visit *</label>
                      <input type="text" placeholder="e.g. Initial Site Assessment, Panel Installation" required
                        value={createData.purpose}
                        onChange={(e) => setCreateData({ ...createData, purpose: e.target.value })}
                        className={inputCls} />
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
                      <SearchAutocomplete
                        items={staffUsers}
                        selectedId={createData.assignedStaffId}
                        onSearch={setStaffSearch}
                        isLoading={staffFetching}
                        onSelect={(id) => setCreateData((prev) => ({ ...prev, assignedStaffId: id }))}
                        label="Assign Staff"
                        placeholder={canAssign ? "Search staff by name..." : "You cannot assign staff"}
                        selectedTheme="neutral"
                        disabled={!canAssign}
                        renderItem={(staff, isSelected) =>
                          isSelected ? `${staff.name} (${staff.department?.name || staff.department || staff.role})` : (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-white">{staff.name}</span>
                              <span className="text-xs text-gray-500">{staff.department?.name || staff.department || staff.role}</span>
                            </div>
                          )
                        }
                        searchFilter={(staff, term) => (staff.name || "").toLowerCase().includes(term.toLowerCase())}
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* UPDATE VISIT FORM */}
              {activeModal === "UPDATE" && (
                <form id="visitForm" onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select value={updateData.status}
                        onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                        className={inputCls}>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <SearchAutocomplete
                      items={staffUsers}
                      selectedId={updateData.assignedStaffId}
                      onSearch={setStaffSearch}
                      isLoading={staffFetching}
                      onSelect={(id) => setUpdateData((prev) => ({ ...prev, assignedStaffId: id || "" }))}
                      label={`Reassign Staff${!canAssign ? " (Restricted)" : ""}`}
                      placeholder={canAssign ? "Search staff by name..." : "You cannot assign staff"}
                      selectedTheme="neutral"
                      disabled={!canAssign}
                      renderItem={(staff, isSelected) =>
                        isSelected ? `${staff.name} (${staff.department?.name || staff.department || staff.role})` : (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">{staff.name}</span>
                            <span className="text-xs text-gray-500">{staff.department?.name || staff.department || staff.role}</span>
                          </div>
                        )
                      }
                      searchFilter={(staff, term) => (staff.name || "").toLowerCase().includes(term.toLowerCase())}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Completed</label>
                    <textarea rows="2" value={updateData.workCompleted}
                      onChange={(e) => setUpdateData({ ...updateData, workCompleted: e.target.value })}
                      className={inputCls} placeholder="Details of the assessment or installation..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issues Identified</label>
                      <textarea rows="2" value={updateData.issuesIdentified}
                        onChange={(e) => setUpdateData({ ...updateData, issuesIdentified: e.target.value })}
                        className={inputCls} placeholder="Shading issues, roof condition, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Steps</label>
                      <textarea rows="2" value={updateData.nextSteps}
                        onChange={(e) => setUpdateData({ ...updateData, nextSteps: e.target.value })}
                        className={inputCls} placeholder="Generate quote, schedule install..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Feedback</label>
                      <input type="text" value={updateData.customerFeedback}
                        onChange={(e) => setUpdateData({ ...updateData, customerFeedback: e.target.value })}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Comments</label>
                      <input type="text" value={updateData.comments}
                        onChange={(e) => setUpdateData({ ...updateData, comments: e.target.value })}
                        className={inputCls} />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" form="visitForm"
                disabled={isCreating || isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-70">
                {activeModal === "CREATE" ? "Schedule Visit" : "Save Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuickLead && (
        <QuickLeadModal
          onClose={() => setShowQuickLead(false)}
          onCreated={(id) => {
            setCreateData((prev) => ({ ...prev, leadId: id }));
            setShowQuickLead(false);
          }}
        />
      )}

      <Pagination meta={meta} isLoading={isLoading} onPageChange={handlePageChange} itemName="visits" />
    </div>
  );
};

export default Visits;
