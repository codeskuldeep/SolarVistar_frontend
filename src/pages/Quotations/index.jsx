import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { TableSkeleton, MobileCardSkeleton } from "../../components/ui/Skeletons";
import Pagination from "../../components/ui/Pagination";
import SearchAutocomplete from "../../components/ui/SearchAutocomplete";




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
  const { quotationsList, isLoading, error, meta } = useSelector(
    (state) => state.quotations,
  );

  const QUOTES_PER_PAGE = 10;

  const [quoteSearch, setQuoteSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const prevSearchRef = useRef("");

  // 400ms debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(quoteSearch), 400);
    return () => clearTimeout(timer);
  }, [quoteSearch]);

  // Fetch logic
  useEffect(() => {
    if (!isLoading) {
      dispatch(fetchQuotations({ page: 1, limit: QUOTES_PER_PAGE, search: debouncedSearch }));
    }
    
    prevSearchRef.current = debouncedSearch;
  }, [dispatch, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      dispatch(fetchQuotations({ page: newPage, limit: QUOTES_PER_PAGE, search: debouncedSearch }));
    }
  };



  if (error && !isLoading) {
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

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
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
            {isLoading ? (
              <TableSkeleton columns={6} />
            ) : quotationsList.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-gray-500 dark:text-slate-500"
                >
                  No quotations found. Create one to get started.
                </td>
              </tr>
            ) : (
              quotationsList.map((q) => (
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
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3 p-4 pt-2">
        {isLoading ? (
          <MobileCardSkeleton />
        ) : quotationsList.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            No quotations found. Create one to get started.
          </div>
        ) : (
          quotationsList.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2 border-b border-gray-50 dark:border-slate-800/50">
                <div className="min-w-0">
                  <div className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {q.lead?.customerName || "Unknown Lead"}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {q.lead?.phoneNumber}
                    </span>
                  </div>
                </div>
                {q.quotationValue && (
                  <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                     ₹{Number(q.quotationValue).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-y-2 text-xs text-gray-600 dark:text-slate-300 bg-gray-50/50 dark:bg-slate-900/30">
                <div>
                  <span className="block text-gray-400 dark:text-slate-500 mb-0.5">Load</span>
                  {q.loadKw ? `${q.loadKw} kW` : "-"}
                </div>
                <div>
                  <span className="block text-gray-400 dark:text-slate-500 mb-0.5">Panel</span>
                  {q.panelType || "-"}
                </div>
              </div>
              <div className="px-3 py-2 flex items-center bg-gray-50 dark:bg-slate-800/50 justify-end">
                <button
                  onClick={() => onView(q.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 transition-colors"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination 
        meta={meta} 
        isLoading={isLoading} 
        onPageChange={handlePageChange} 
        itemName="quotations" 
      />
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
  const { isSaving, error } = useSelector((state) => state.quotations);
  const { leads, isLoading: leadsLoading } = useSelector((state) => state.leads);

  // Server-side search handler — fetch a small set on each keystroke
  const handleLeadSearch = useCallback(
    (term) => {
      dispatch(fetchLeads({ limit: 10, search: term }));
    },
    [dispatch],
  );

  // Fetch initial suggestions once when the form mounts
  useEffect(() => {
    dispatch(fetchLeads({ limit: 10 }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const [cachedLead, setCachedLead] = useState(
    isEdit && initialData?.lead ? initialData.lead : null
  );

  const safeLeadsList = [...leads];
  if (cachedLead && !safeLeadsList.some((l) => l.id === cachedLead.id)) {
    safeLeadsList.push(cachedLead);
  }

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
            <SearchAutocomplete
              items={safeLeadsList}
              selectedId={formData.leadId || ""}
              onSelect={(id) => {
                if (!id) {
                  setCachedLead(null);
                  setFormData((prev) => ({ ...prev, leadId: "" }));
                  return;
                }
                const selectedLead = safeLeadsList.find((l) => l.id === id);
                if (selectedLead) setCachedLead(selectedLead);
                setFormData((prev) => ({ ...prev, leadId: id }));
              }}
              onSearch={handleLeadSearch}
              label="Search Customer / Lead"
              placeholder="Type name or phone number..."
              required={true}
              isLoading={leadsLoading}
              selectedTheme="emerald"
              renderItem={(lead, isSelected) =>
                isSelected ? (
                  `${lead.customerName} (${lead.phoneNumber})`
                ) : (
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {lead.customerName}
                    </span>
                    <span className="text-xs text-gray-500">{lead.phoneNumber}</span>
                  </div>
                )
              }
              searchFilter={(lead, term) => {
                const lowerTerm = term.toLowerCase();
                return (
                  (lead.customerName || "").toLowerCase().includes(lowerTerm) ||
                  (lead.phoneNumber || "").includes(term)
                );
              }}
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
              isSaving || (!isEdit && !formData.leadId)
            }
            className="flex items-center px-5 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isSaving
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
