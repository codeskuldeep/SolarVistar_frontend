import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  ChevronRight,
  Zap,
  IndianRupee,
  Settings,
  Loader2,
  User,
  X,
  Sun,
  Moon,
  ArrowLeft,
  Edit2,
  Printer,
} from "lucide-react";
import {
  fetchQuotations,
  createQuotation,
  updateQuotation,
} from "../../context/slices/quotationSlice";
import { fetchLeads } from "../../context/slices/leadSlice";
import QuotationPDFTemplate from "./QuotationPDFTemplate";
import { useSearchParams } from "react-router-dom"; // 👈 Import this!
export default function QuotationManager() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlLeadId = searchParams.get("leadId"); // 👈 Grab the ID from the URL

  const [view, setView] = useState(urlLeadId ? "create" : "list"); // 'list' | 'create' | 'view'
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  const handleView = (id) => {
    setSelectedQuoteId(id);
    setView("view");
  };
  const handleCancelForm = () => {
    if (urlLeadId) {
      searchParams.delete("leadId");
      setSearchParams(searchParams); // Clears the URL
    }
    setView("list");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-200 transition-colors duration-300">
      {/* HEADER (Hidden during PDF Print) */}
      <header className="print:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-8 py-5">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Quotations
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Manage solar installation estimates and contracts.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {view === "list" ? (
              <button
                onClick={() => setView("create")}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" /> New Quotation
              </button>
            ) : (
              <button
                onClick={() => setView("list")}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md"
              >
                Back to List
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-8 py-8 print:p-0 print:m-0">
        {view === "list" && <QuotationList onView={handleView} />}
        {view === "create" && (
          <QuotationForm
            initialLeadId={urlLeadId}
            onCancel={handleCancelForm}
            onSuccess={handleCancelForm}
          />
        )}
        {view === "view" && (
          <QuotationViewer
            quoteId={selectedQuoteId}
            onBack={() => setView("list")}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================
   LIST VIEW (DUAL THEME)
   ========================================= */
const QuotationList = ({ onView }) => {
  const dispatch = useDispatch();
  const { quotationsList, status, error, meta } = useSelector(
    (state) => state.quotations,
  );

  const [quoteSearch, setQuoteSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce logic (unchanged, it's good!)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(quoteSearch), 300);
    return () => clearTimeout(timer);
  }, [quoteSearch]);

  // Optimized Filtering
  const filteredQuotations = useMemo(() => {
    // Early return if search is empty to save processing
    if (!debouncedSearch.trim()) return quotationsList;

    // Calculate these ONCE outside the loop
    const lowerSearch = debouncedSearch.toLowerCase();
    const numSearch = debouncedSearch.replaceAll(" ", "");

    return quotationsList.filter((q) => {
      // Safely fallback to empty strings to prevent .includes() crashes
      const safeName = q.lead?.customerName || "";
      const safePhone = q.lead?.phoneNumber || "";

      const matchesName = safeName.toLowerCase().includes(lowerSearch);
      const matchesPhone = safePhone.replaceAll(" ", "").includes(numSearch);

      return matchesName || matchesPhone;
    });
  }, [quotationsList, debouncedSearch]); 

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchQuotations({ page: 1, limit: meta.itemsPerPage }));
    }
  }, [dispatch, status]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      dispatch(fetchQuotations({ page: newPage, limit: meta.itemsPerPage }));
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-300">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={quoteSearch}
            onChange={(e) => {
              setQuoteSearch(e.target.value);
            }}
            placeholder="Search quotes..."
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-md text-sm text-gray-900 dark:text-slate-200 w-72 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 dark:placeholder-slate-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4">Lead Info</th>
              <th className="px-6 py-4">System Load</th>
              <th className="px-6 py-4">Panel Type</th>
              <th className="px-6 py-4">DCR Status</th>
              <th className="px-6 py-4 text-right">Value (₹)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
            {quotationsList.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-gray-500 dark:text-slate-500"
                >
                  No quotations found. Create one to get started.
                </td>
              </tr>
            ) : (
              filteredQuotations.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">
                    {q.lead?.customerName || "Unknown Lead"}
                    <span className="block text-xs text-gray-500 dark:text-slate-500 font-normal mt-0.5">
                      {q.lead?.phoneNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                    {q.loadKw ? `${q.loadKw} kW` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {q.panelType ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-transparent dark:border-slate-700">
                        {q.panelType}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {q.dcrStatus === "DCR" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                        DCR Compliant
                      </span>
                    ) : q.dcrStatus === "NON_DCR" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-transparent dark:border-amber-500/20">
                        Non-DCR
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 dark:text-slate-200 font-medium">
                    {q.quotationValue
                      ? `₹${Number(q.quotationValue).toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium inline-flex items-center transition-colors"
                      onClick={() => onView(q.id)}
                    >
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {(meta.currentPage - 1) * meta.itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(
                  meta.currentPage * meta.itemsPerPage,
                  meta.totalItems,
                )}
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
                disabled={meta.currentPage === 1 || status === "loading"} 
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {meta.currentPage} of {meta.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(meta.currentPage + 1)}
                disabled={meta.currentPage === meta.totalPages || status === "loading"}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================
   FORM VIEW & DEBOUNCED SEARCH (DUAL THEME)
   ========================================= */
/* =========================================
   FORM VIEW & DEBOUNCED SEARCH (DUAL THEME)
   ========================================= */
const QuotationForm = ({
  onCancel,
  onSuccess,
  initialData = null,
  isEdit = false,
  initialLeadId = "",
}) => {
  const dispatch = useDispatch();
  const { createStatus, error } = useSelector((state) => state.quotations);

  const [formData, setFormData] = useState({
    leadId: initialLeadId || "",
    panelType: "",
    panelName: "",
    panelSizeWatt: "",
    numberOfPanels: "",
    panelWarrantyYears: "",
    loadKw: "",
    structure: "",
    inverterSizeKw: "",
    inverterWarrantyYears: "",
    acWire: "",
    dcWire: "",
    acdbCompany: "",
    dcdbCompany: "",
    dcCableSqMm: "",
    acCableSqMm: "",
    quotationValue: "",
    subsidy: "",
    dcrStatus: "DCR",
  });

  // 🔥 FIX 2: Added an empty dependency array so it strictly runs ONLY ONCE when opened.
  // This completely kills the cascading/infinite loop error.
  useEffect(() => {
    if (initialData && isEdit) {
      const sanitizedData = Object.keys(initialData).reduce((acc, key) => {
        acc[key] = initialData[key] === null ? "" : initialData[key];
        return acc;
      }, {});
      setFormData(sanitizedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      numberOfPanels: formData.numberOfPanels
        ? parseInt(formData.numberOfPanels, 10)
        : undefined,
      panelWarrantyYears: formData.panelWarrantyYears
        ? parseInt(formData.panelWarrantyYears, 10)
        : undefined,
      loadKw: formData.loadKw ? parseFloat(formData.loadKw) : undefined,
      inverterSizeKw: formData.inverterSizeKw
        ? parseFloat(formData.inverterSizeKw)
        : undefined,
      inverterWarrantyYears: formData.inverterWarrantyYears
        ? parseInt(formData.inverterWarrantyYears, 10)
        : undefined,
      dcCableSqMm: formData.dcCableSqMm
        ? parseFloat(formData.dcCableSqMm)
        : undefined,
      acCableSqMm: formData.acCableSqMm
        ? parseFloat(formData.acCableSqMm)
        : undefined,
      quotationValue: formData.quotationValue
        ? parseFloat(formData.quotationValue)
        : undefined,
      subsidy: formData.subsidy ? parseFloat(formData.subsidy) : undefined,
    };

    if (isEdit) {
      dispatch(
        updateQuotation({ id: initialData.id, quotationData: submissionData }),
      ).then((action) => {
        if (!action.error) onSuccess();
      });
    } else {
      dispatch(createQuotation(submissionData)).then((action) => {
        if (!action.error) onSuccess();
      });
    }
  };

  const componentBrands = [
    "HAVELLS_V_GUARD",
    "HAVELLS_POLYCAB",
    "V_GUARD",
    "HAVELLS",
    "RR_KABLE",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-xl transition-colors duration-300">
      <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Quotation" : "Technical & Commercial Specification"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Update the detailed system metrics for this quotation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div className="mb-6">
          {/* Disable lead search if editing, because the quotation is already tied to the lead! */}
          {!isEdit ? (
            <LeadSearchAutocomplete
              selectedLeadId={formData.leadId || ""}
              onSelect={(id) =>
                setFormData((prev) => ({ ...prev, leadId: id }))
              }
            />
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Attached to Lead:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {initialData.lead?.customerName}
                </span>
              </p>
            </div>
          )}
        </div>

        <section>
          <div className="flex items-center mb-5 border-b border-gray-100 dark:border-slate-800 pb-2">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-500 mr-2" />
            <h3 className="text-md font-medium text-gray-800 dark:text-slate-200">
              Solar Array Specifications
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormSelect
              label="Panel Type"
              name="panelType"
              value={formData.panelType || ""}
              onChange={handleChange}
              options={["TOPCON", "MONOFACIAL"]}
            />
            <FormInput
              label="Panel Name (Brand)"
              name="panelName"
              value={formData.panelName || ""}
              onChange={handleChange}
              placeholder="e.g., Waaree"
            />
            <FormSelect
              label="Panel Size (Watt)"
              name="panelSizeWatt"
              value={formData.panelSizeWatt || ""}
              onChange={handleChange}
              options={["550 - 575", "535 - 550"]}
            />
            <FormInput
              label="Number of Panels"
              name="numberOfPanels"
              type="number"
              value={formData.numberOfPanels || ""}
              onChange={handleChange}
              placeholder="0"
            />
            <FormInput
              label="Warranty (Years)"
              name="panelWarrantyYears"
              type="number"
              value={formData.panelWarrantyYears || ""}
              onChange={handleChange}
              placeholder="25"
            />
            <FormInput
              label="Total Load (kW)"
              name="loadKw"
              type="number"
              step="0.1"
              value={formData.loadKw || ""}
              onChange={handleChange}
              placeholder="5.0"
            />
          </div>
        </section>

        <section>
          <div className="flex items-center mb-5 border-b border-gray-100 dark:border-slate-800 pb-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-500 mr-2" />
            <h3 className="text-md font-medium text-gray-800 dark:text-slate-200">
              Inverter & BOS
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormInput
              label="Structure Type"
              name="structure"
              value={formData.structure || ""}
              onChange={handleChange}
              placeholder="e.g., GI Elevated"
              className="md:col-span-2"
            />
            <FormInput
              label="Inverter Size (kW)"
              name="inverterSizeKw"
              type="number"
              step="0.1"
              value={formData.inverterSizeKw || ""}
              onChange={handleChange}
              placeholder="5.0"
            />
            <FormInput
              label="Inverter Warranty"
              name="inverterWarrantyYears"
              type="number"
              value={formData.inverterWarrantyYears || ""}
              onChange={handleChange}
              placeholder="10"
            />

            <FormSelect
              label="AC Wire Brand"
              name="acWire"
              value={formData.acWire || ""}
              onChange={handleChange}
              options={componentBrands}
            />
            <FormSelect
              label="DC Wire Brand"
              name="dcWire"
              value={formData.dcWire || ""}
              onChange={handleChange}
              options={componentBrands}
            />
            <FormSelect
              label="ACDB Company"
              name="acdbCompany"
              value={formData.acdbCompany || ""}
              onChange={handleChange}
              options={componentBrands}
            />
            <FormSelect
              label="DCDB Company"
              name="dcdbCompany"
              value={formData.dcdbCompany || ""}
              onChange={handleChange}
              options={componentBrands}
            />

            <FormInput
              label="DC Cable (Sq. mm)"
              name="dcCableSqMm"
              type="number"
              step="0.1"
              value={formData.dcCableSqMm || ""}
              onChange={handleChange}
              placeholder="4"
            />
            <FormInput
              label="AC Cable (Sq. mm)"
              name="acCableSqMm"
              type="number"
              step="0.1"
              value={formData.acCableSqMm || ""}
              onChange={handleChange}
              placeholder="6"
            />
          </div>
        </section>

        <section className="bg-emerald-50/50 dark:bg-slate-950 p-6 rounded-lg border border-emerald-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center mb-5 border-b border-emerald-100 dark:border-slate-800 pb-2">
            <IndianRupee className="w-5 h-5 text-emerald-700 dark:text-emerald-500 mr-2" />
            <h3 className="text-md font-medium text-emerald-900 dark:text-slate-200">
              Commercials & Approvals
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Quotation Value (₹)"
              name="quotationValue"
              type="number"
              value={formData.quotationValue || ""}
              onChange={handleChange}
              placeholder="0.00"
              icon="₹"
            />
            <FormInput
              label="Expected Subsidy (₹)"
              name="subsidy"
              type="number"
              value={formData.subsidy || ""}
              onChange={handleChange}
              placeholder="0.00"
              icon="₹"
            />
            <FormSelect
              label="DCR Status"
              name="dcrStatus"
              value={formData.dcrStatus || ""}
              onChange={handleChange}
              options={["DCR", "NON_DCR"]}
            />
          </div>
        </section>

        {error && (
          <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 mr-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              createStatus === "loading" || (!isEdit && !formData.leadId)
            }
            className="flex items-center px-5 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {createStatus === "loading" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {createStatus === "loading"
              ? "Saving..."
              : isEdit
                ? "Update Quotation"
                : "Save Quotation"}
          </button>
        </div>
      </form>
    </div>
  );
};
/* =========================================
   DEBOUNCED AUTOCOMPLETE COMPONENT (DUAL THEME)
   ========================================= */
const LeadSearchAutocomplete = ({ selectedLeadId, onSelect }) => {
  const dispatch = useDispatch();
  const { leads, isLoading } = useSelector((state) => state.leads);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (leads.length === 0 && !hasFetched.current) {
      dispatch(fetchLeads());
      hasFetched.current = true;
    }
  }, [leads.length, isLoading, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLeads = debouncedTerm
    ? (leads || [])
        .filter((l) => {
          const nameMatch = String(l.customerName || "")
            .toLowerCase()
            .includes(debouncedTerm.toLowerCase());
          const phoneMatch = String(l.phoneNumber || "").includes(
            debouncedTerm,
          );
          return nameMatch || phoneMatch;
        })
        .slice(0, 8)
    : (leads || []).slice(0, 8);

  const selectedLead = (leads || []).find((l) => l.id === selectedLeadId);

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    onSelect("");
  };

  return (
    <div className="relative w-full md:w-1/2" ref={wrapperRef}>
      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">
        Search Customer / Lead{" "}
        <span className="text-red-500 dark:text-emerald-500">*</span>
      </label>

      {selectedLead ? (
        <div className="flex items-center justify-between w-full px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/50 rounded-md shadow-sm transition-colors">
          <div className="flex items-center">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
            <span className="text-emerald-900 dark:text-emerald-100 text-sm font-medium">
              {selectedLead.customerName} ({selectedLead.phoneNumber})
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-md text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-gray-400 dark:placeholder-slate-600 shadow-sm"
            placeholder="Type name or phone number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />

          {isOpen && (
            <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg dark:shadow-2xl max-h-60 overflow-y-auto">
              {displayLeads.length > 0 ? (
                displayLeads.map((lead) => (
                  <li
                    key={lead.id}
                    onClick={() => {
                      onSelect(lead.id);
                      setIsOpen(false);
                      setSearchTerm("");
                      setDebouncedTerm("");
                    }}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700/50 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {lead.customerName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {lead.phoneNumber} • {lead.address || "No address"}
                    </p>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-500 dark:text-slate-500 text-center">
                  {isLoading ? "Loading leads..." : "No leads found."}
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================
   REUSABLE UI COMPONENTS (DUAL THEME)
   ========================================= */
const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
  icon,
  required,
  step,
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
      {label}{" "}
      {required && (
        <span className="text-red-500 dark:text-emerald-500">*</span>
      )}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 dark:text-slate-500 sm:text-sm">
            {icon}
          </span>
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        required={required}
        placeholder={placeholder}
        className={`w-full ${icon ? "pl-7" : "pl-3"} pr-3 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm`}
      />
    </div>
  </div>
);

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none shadow-sm"
    >
      <option value="" disabled className="text-gray-500 dark:text-slate-500">
        Select option
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const QuotationViewer = ({ quoteId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { quotationsList } = useSelector((state) => state.quotations);

  // Find the exact quotation from Redux state
  const quote = quotationsList.find((q) => q.id === quoteId);

  if (!quote)
    return <div className="text-center py-10">Quotation not found.</div>;

  const handlePrint = () => {
    window.print(); // Triggers browser PDF generator
  };

  return (
    <div className="w-full">
      {/* Viewer Action Bar (Hidden when printing) */}
      <div className="print:hidden flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Edit2 className="w-4 h-4 mr-2" />{" "}
            {isEditing ? "Cancel Edit" : "Edit Quotation"}
          </button>

          {!isEditing && (
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-500 shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" /> Download / Print PDF
            </button>
          )}
        </div>
      </div>

      {/* Conditional Rendering: Edit Form OR PDF Template */}
      {isEditing ? (
        <QuotationForm
          initialData={quote}
          isEdit={true}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <QuotationPDFTemplate quote={quote} />
      )}
    </div>
  );
};
