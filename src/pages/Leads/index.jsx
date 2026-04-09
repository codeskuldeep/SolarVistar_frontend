import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// 1. 👇 Import useNavigate from react-router-dom
import { useNavigate } from "react-router-dom";
import {
  fetchLeads,
  createLead,
  updateLeadStatus,
  addFollowUp,
} from "../../context/slices/leadSlice";
import { fetchUsers } from "../../context/slices/userSlice";
import { addToast } from "../../context/slices/toastSlice";
import {
  PlusIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  NotePencilIcon,
  CalendarPlusIcon,
  WhatsappLogoIcon,
  UserIcon,
  // 2. 👇 Import an icon for the Quotation button (Receipt or FileText)
  ReceiptIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { MobileCardSkeleton } from "../../components/ui/Skeletons";
import Pagination from "../../components/ui/Pagination";
import SearchAutocomplete from "../../components/ui/SearchAutocomplete";

/* ─── Status config ─── */
const STATUS_CONFIG = {
  NEW: {
    label: "New",
    bg: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800",
  },
  CONTACTED: {
    label: "Contacted",
    bg: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  },
  INTERESTED: {
    label: "In Progress",
    bg: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800",
  },
  CONVERTED: {
    label: "Won",
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  },
  NOT_INTERESTED: {
    label: "Lost",
    bg: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800",
  },
};

const getStatusCfg = (s) =>
  STATUS_CONFIG[s] ?? {
    label: s,
    bg: "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700",
  };

/* ─── Shared field styles ─── */
const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg shadow-sm bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-colors";
const labelCls =
  "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5";

/* ═══════════════════════════════════════════ */
const Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { leads, isLoading } = useSelector((state) => state.leads);
  const { users } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [createData, setCreateData] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    address: "",
    requirements: "",
    notes: "",
    assignedToId: "",
  });
  const [updateData, setUpdateData] = useState({
    status: "NEW",
    assignedToId: "",
  });
  const [followUpData, setFollowUpData] = useState({
    method: "PHONE_CALL",
    remarks: "",
    nextFollowUpDate: "",
  });

  // Pull the flags from both slices
  const { hasFetched: hasFetchedLeads, meta, lastFetchedAt } = useSelector(
    (state) => state.leads,
  );
  const { hasFetched: hasFetchedUsers, lastFetchedAt: usersLastFetchedAt } = useSelector((state) => state.users);
  const isAdmin = currentUser?.role === "ADMIN";
  const canAssign = isAdmin || currentUser?.department?.name === "Sales";

  const LEADS_PER_PAGE = 10;
  const STALE_MS = 2 * 60 * 1000; // 2 minutes

  // Debounced server-side search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const prevSearchRef = useRef("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Smart fetch: search always fetches, global list respects TTL
  useEffect(() => {
    const isSearching = debouncedSearch.length > 0;
    const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_MS;
    const searchCleared = prevSearchRef.current.length > 0 && debouncedSearch.length === 0;

    if (isSearching || isStale || searchCleared) {
      dispatch(fetchLeads({ page: 1, limit: LEADS_PER_PAGE, search: debouncedSearch }));
    }
    if (canAssign) {
      const usersStale = !usersLastFetchedAt || Date.now() - usersLastFetchedAt > STALE_MS;
      if (usersStale) dispatch(fetchUsers({ limit: 100 }));
    }
    
    prevSearchRef.current = debouncedSearch;
  }, [dispatch, debouncedSearch, canAssign, lastFetchedAt, usersLastFetchedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pagination handler — carries current search forward
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      dispatch(fetchLeads({ page: newPage, limit: LEADS_PER_PAGE, search: debouncedSearch }));
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setCreateData({
      customerName: "",
      phoneNumber: "",
      email: "",
      address: "",
      requirements: "",
      notes: "",
      assignedToId: "",
    });
    setFollowUpData({
      method: "PHONE_CALL",
      remarks: "",
      nextFollowUpDate: "",
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createLead(createData));
    if (createLead.fulfilled.match(result)) {
      handleCloseModal();
      dispatch(
        addToast({ message: "Lead created successfully", type: "success" }),
      );
    } else {
      dispatch(
        addToast({
          message: result.payload || "Failed to create lead",
          type: "error",
        }),
      );
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      updateLeadStatus({
        id: selectedLead.id,
        status: updateData.status,
        assignedToId: updateData.assignedToId || null,
      }),
    );
    if (updateLeadStatus.fulfilled.match(result)) {
      setActiveModal(null);
      dispatch(
        addToast({ message: "Lead updated successfully", type: "success" }),
      );
    } else {
      dispatch(
        addToast({
          message: result.payload || "Failed to update lead",
          type: "error",
        }),
      );
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      addFollowUp({ id: selectedLead.id, followUpData }),
    );
    if (addFollowUp.fulfilled.match(result)) {
      handleCloseModal();
      dispatch(
        addToast({ message: "Follow-up logged successfully", type: "success" }),
      );
    } else {
      dispatch(
        addToast({
          message: result.payload || "Failed to log follow-up",
          type: "error",
        }),
      );
    }
  };

  const sanitizePhone = (phone) => phone?.replace(/\D/g, "") ?? "";
  const leadsList = Array.isArray(leads) ? leads : [];
  const staffUsers = Array.isArray(users) ? users : [];
  return (
    <div className="space-y-5 px-1">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Lead Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track and manage potential solar installations.
          </p>
        </div>
        <button
          onClick={() => setActiveModal("CREATE")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          <PlusIcon size={17} weight="bold" />
          Add Lead
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" weight="bold" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-9 pr-9 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>
      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
          {[
            "Customer Info",
            "Status",
            "Assigned To",
            "Last Follow-up",
            "Actions",
          ].map((h) => (
            <span
              key={h}
              className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 items-center px-6 py-4 animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : leadsList.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">
              No leads yet. Add your first lead!
            </div>
          ) : (
            leadsList.map((lead) => {
              const phone = sanitizePhone(lead.phoneNumber);
              const { label, bg } = getStatusCfg(lead.status || "NEW");
              return (
                <div
                  key={lead.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50/60 dark:hover:bg-dark-bg/40 transition-colors"
                >
                  {/* ... customer info, status, assigned to, followups ... */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {lead.customerName}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <PhoneIcon size={12} /> {lead.phoneNumber}
                      </span>
                      {lead.email && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                          <EnvelopeSimpleIcon size={12} /> {lead.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${bg}`}
                    >
                      {label}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {lead.assignedTo?.name ? (
                      <div>
                        {lead.assignedTo.name}
                        {lead.assignedTo.department && (
                          <>
                            <br />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {lead.assignedTo.department?.name || lead.assignedTo.department}
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div>
                    {lead.followUps?.length > 0 ? (
                      <div>
                        <span className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          {lead.followUps[0].method.replace(/_/g, " ")}
                        </span>
                        <span className="block text-xs text-gray-500 truncate max-w-[160px]">
                          {lead.followUps[0].remarks}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No history
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <ActionButton
                      href={`https://wa.me/${phone}`}
                      title="WhatsApp"
                      hoverColor="hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <WhatsappLogoIcon size={17} />
                    </ActionButton>
                    <ActionButton
                      href={`tel:${lead.phoneNumber}`}
                      title="Call"
                      hoverColor="hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                      <PhoneIcon size={17} />
                    </ActionButton>

                    {/* 4. 👇 The new Desktop Quotation Button */}
                    <ActionButton
                      title="Create Quotation"
                      hoverColor="hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      onClick={() => navigate(`/quotations?leadId=${lead.id}`)}
                    >
                      <ReceiptIcon size={17} />
                    </ActionButton>

                    <ActionButton
                      title="Update Status"
                      hoverColor="hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => {
                        setSelectedLead(lead);
                        setUpdateData({
                          status: lead.status || "NEW",
                          assignedToId: lead.assignedToId || "",
                        });
                        setActiveModal("UPDATE_STATUS");
                      }}
                    >
                      <NotePencilIcon size={17} />
                    </ActionButton>
                    <ActionButton
                      title="Add Follow-up"
                      hoverColor="hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => {
                        setSelectedLead(lead);
                        setActiveModal("ADD_FOLLOWUP");
                      }}
                    >
                      <CalendarPlusIcon size={17} />
                    </ActionButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <MobileCardSkeleton />
        ) : leadsList.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            No leads yet. Add your first lead!
          </div>
        ) : (
          leadsList.map((lead) => {
            const phone = sanitizePhone(lead.phoneNumber);
            const { label, bg } = getStatusCfg(lead.status || "NEW");
            return (
              <div
                key={lead.id}
                className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden"
              >
                {/* ... Card top & Meta row ... */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {lead.customerName}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <PhoneIcon size={12} /> {lead.phoneNumber}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${bg}`}
                  >
                    {label}
                  </span>
                </div>

                {/* Action bar */}
                <div className="px-3 py-2 flex items-center gap-1 bg-gray-50/60 dark:bg-dark-bg/30 overflow-x-auto">
                  <MobileActionBtn
                    href={`https://wa.me/${phone}`}
                    label="WhatsApp"
                    color="text-green-600 bg-green-50 dark:bg-green-900/20"
                  >
                    <WhatsappLogoIcon size={15} />
                  </MobileActionBtn>
                  <MobileActionBtn
                    href={`tel:${lead.phoneNumber}`}
                    label="Call"
                    color="text-sky-600 bg-sky-50 dark:bg-sky-900/20"
                  >
                    <PhoneIcon size={15} />
                  </MobileActionBtn>

                  <div className="flex-1" />

                  {/* 5. 👇 The new Mobile Quotation Button */}
                  <button
                    onClick={() => navigate(`/quotations?leadId=${lead.id}`)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 transition-colors whitespace-nowrap"
                  >
                    <ReceiptIcon size={13} /> Quote
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setUpdateData({
                        status: lead.status || "NEW",
                        assignedToId: lead.assignedToId || "",
                      });
                      setActiveModal("UPDATE_STATUS");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900/30 transition-colors"
                  >
                    <NotePencilIcon size={13} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setActiveModal("ADD_FOLLOWUP");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/30 transition-colors whitespace-nowrap"
                  >
                    <CalendarPlusIcon size={13} /> Follow-up
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        meta={meta}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        itemName="leads"
      />

      {/* ── MODALS (Unchanged) ── */}
      {/* ── MODALS ── */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="bg-white dark:bg-dark-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 dark:border-dark-border overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal drag handle (mobile) */}
            <div className="flex sm:hidden justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {activeModal === "CREATE" && "Add New Lead"}
                {activeModal === "UPDATE_STATUS" &&
                  `Update: ${selectedLead?.customerName}`}
                {activeModal === "ADD_FOLLOWUP" && `Log Follow-up`}
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* ── CREATE LEAD ── */}
            {activeModal === "CREATE" && (
              <form
                onSubmit={handleCreateSubmit}
                className="p-5 space-y-4 overflow-y-auto flex-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Customer Name *</label>
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
                      placeholder="Full name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number *</label>
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
                      placeholder="+91 98765 43210"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={createData.email}
                    onChange={(e) =>
                      setCreateData({ ...createData, email: e.target.value })
                    }
                    placeholder="optional@email.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Address / Location</label>
                  <input
                    type="text"
                    value={createData.address}
                    onChange={(e) =>
                      setCreateData({ ...createData, address: e.target.value })
                    }
                    placeholder="City, area…"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Requirements</label>
                  <input
                    type="text"
                    value={createData.requirements}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        requirements: e.target.value,
                      })
                    }
                    placeholder="e.g. 5kW rooftop"
                    className={inputCls}
                  />
                </div>

                {/* Assign To — admin or sales only */}
                <AssignSelect
                  isAdmin={canAssign}
                  value={createData.assignedToId}
                  onChange={(v) =>
                    setCreateData({ ...createData, assignedToId: v })
                  }
                  staffUsers={staffUsers}
                />

                <div>
                  <label className={labelCls}>Initial Notes</label>
                  <textarea
                    rows="3"
                    value={createData.notes}
                    onChange={(e) =>
                      setCreateData({ ...createData, notes: e.target.value })
                    }
                    placeholder="Any additional context…"
                    className={inputCls}
                  />
                </div>

                <ModalFooter
                  onCancel={handleCloseModal}
                  isLoading={isLoading}
                  submitLabel="Save Lead"
                  submitColor="bg-green-600 hover:bg-green-700"
                />
              </form>
            )}

            {/* ── UPDATE STATUS ── */}
            {activeModal === "UPDATE_STATUS" && (
              <form
                onSubmit={handleUpdateSubmit}
                className="p-5 space-y-4 overflow-y-auto flex-1"
              >
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, status: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">
                      In Progress (Site Visit / Quote)
                    </option>
                    <option value="CONVERTED">Won (Converted)</option>
                    <option value="NOT_INTERESTED">Lost</option>
                  </select>
                </div>

                <AssignSelect
                  isAdmin={canAssign}
                  value={updateData.assignedToId}
                  onChange={(v) =>
                    setUpdateData({ ...updateData, assignedToId: v })
                  }
                  staffUsers={staffUsers}
                  label="Reassign Lead"
                />

                <ModalFooter
                  onCancel={handleCloseModal}
                  isLoading={isLoading}
                  submitLabel="Update Lead"
                  submitColor="bg-green-600 hover:bg-green-700"
                />
              </form>
            )}

            {/* ── ADD FOLLOW-UP ── */}
            {activeModal === "ADD_FOLLOWUP" && (
              <form
                onSubmit={handleFollowUpSubmit}
                className="p-5 space-y-4 overflow-y-auto flex-1"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 -mt-1">
                  For:{" "}
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {selectedLead?.customerName}
                  </span>
                </div>
                <div>
                  <label className={labelCls}>Contact Method *</label>
                  <select
                    required
                    value={followUpData.method}
                    onChange={(e) =>
                      setFollowUpData({
                        ...followUpData,
                        method: e.target.value,
                      })
                    }
                    className={inputCls}
                  >
                    <option value="PHONE_CALL">📞 Phone Call</option>
                    <option value="WHATSAPP">💬 WhatsApp</option>
                    <option value="EMAIL">✉️ Email</option>
                    <option value="IN_PERSON">🤝 In Person Meeting</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Remarks / Notes *</label>
                  <textarea
                    required
                    rows="4"
                    value={followUpData.remarks}
                    onChange={(e) =>
                      setFollowUpData({
                        ...followUpData,
                        remarks: e.target.value,
                      })
                    }
                    placeholder="What was discussed? Any commitments made?"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Next Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={followUpData.nextFollowUpDate}
                    onChange={(e) =>
                      setFollowUpData({
                        ...followUpData,
                        nextFollowUpDate: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <ModalFooter
                  onCancel={handleCloseModal}
                  isLoading={isLoading}
                  submitLabel="Log Activity"
                  submitColor="bg-blue-600 hover:bg-blue-700"
                />
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Leads;

/* ─── Small reusable sub-components ─── */

const ActionButton = ({ href, onClick, title, hoverColor, children }) => {
  const cls = `w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 ${hoverColor} transition-colors`;
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      title={title}
      className={cls}
    >
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} title={title} className={cls}>
      {children}
    </button>
  );
};

const MobileActionBtn = ({ href, label, color, children }) => (
  <a
    href={href}
    target={href?.startsWith("http") ? "_blank" : undefined}
    rel="noopener noreferrer"
    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium ${color} transition-colors whitespace-nowrap`}
  >
    {children} <span className="hidden sm:inline">{label}</span>
  </a>
);

// ... keep AssignSelect and ModalFooter exactly the same

/* ─── Small reusable sub-components ─── */

const AssignSelect = ({
  isAdmin,
  value,
  onChange,
  staffUsers,
  label = "Assign To",
}) => (
  <div className={!isAdmin ? "opacity-60 pointer-events-none" : ""}>
    <SearchAutocomplete
      items={staffUsers}
      selectedId={value}
      onSelect={onChange}
      label={`${label} ${!isAdmin ? "(Restricted)" : ""}`}
      placeholder={isAdmin ? "Search staff by name..." : "You cannot assign staff"}
      selectedTheme="neutral"
      disabled={!isAdmin}
      renderItem={(staff, isSelected) =>
        isSelected ? (
          `${staff.name} (${staff.department || staff.role})`
        ) : (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {staff.name}
            </span>
            <span className="text-xs text-gray-500">{staff.department || staff.role}</span>
          </div>
        )
      }
      searchFilter={(staff, term) =>
        (staff.name || "").toLowerCase().includes(term.toLowerCase())
      }
    />
  </div>
);

const ModalFooter = ({ onCancel, isLoading, submitLabel, submitColor }) => (
  <div className="flex justify-end gap-3 pt-2 pb-1">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isLoading}
      className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60 ${submitColor}`}
    >
      {isLoading ? "Saving…" : submitLabel}
    </button>
  </div>
);
