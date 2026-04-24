// src/components/ui/QuotationsDrawer.jsx
// Generic slide-over drawer for quotations — works on Leads, Customers, and Visits pages.
// Props:
//   leadId   — the lead's ID to fetch/create quotations for (required)
//   title    — main header text (e.g. customer name)
//   subtitle — secondary header text (e.g. phone, address)
//   onClose  — callback to close the drawer
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetLeadQuotationsQuery,
  useCreateQuotationMutation,
} from "../../context/api/quotationsApi";
import { addToast } from "../../context/slices/toastSlice";
import {
  XIcon,
  ReceiptIcon,
  PlusIcon,
  SunIcon,
  LightningIcon,
  CurrencyInrIcon,
  ArrowSquareOutIcon,
  CaretUpIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n != null && n !== "" ? `₹${Number(n).toLocaleString("en-IN")}` : null;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const DCR_BADGE = {
  DCR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  NON_DCR: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors";

const labelCls =
  "block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";

// ─── Quotation Card ──────────────────────────────────────────────────────────

const QuotationCard = ({ q, onView }) => (
  <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all duration-200">
    <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
    <div className="p-4">
      {/* Value row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          {fmt(q.quotationValue) ? (
            <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
              {fmt(q.quotationValue)}
            </p>
          ) : (
            <p className="text-sm italic text-gray-400 dark:text-gray-500">No value set</p>
          )}
          {q.subsidy && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              Subsidy: {fmt(q.subsidy)}
            </p>
          )}
        </div>
        {q.dcrStatus && (
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              DCR_BADGE[q.dcrStatus] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {q.dcrStatus === "DCR" ? (
              <CheckCircleIcon size={11} weight="fill" className="mr-1" />
            ) : (
              <WarningCircleIcon size={11} weight="fill" className="mr-1" />
            )}
            {q.dcrStatus === "NON_DCR" ? "Non-DCR" : "DCR"}
          </span>
        )}
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
        {q.loadKw && (
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <LightningIcon size={12} weight="fill" className="text-amber-500 shrink-0" />
            <span>{q.loadKw} kW Load</span>
          </div>
        )}
        {q.panelType && (
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <SunIcon size={12} weight="fill" className="text-sky-500 shrink-0" />
            <span>{q.panelType}</span>
          </div>
        )}
        {q.numberOfPanels && (
          <div className="text-gray-500 dark:text-gray-500">{q.numberOfPanels} panels</div>
        )}
        {q.inverterSizeKw && (
          <div className="text-gray-500 dark:text-gray-500">{q.inverterSizeKw} kW inverter</div>
        )}
        {q.panelName && (
          <div className="col-span-2 text-gray-500 dark:text-gray-500 truncate">
            {q.panelName}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{fmtDate(q.createdAt)}</span>
        <button
          onClick={() => onView(q.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          View / Print
          <ArrowSquareOutIcon size={12} weight="bold" />
        </button>
      </div>
    </div>
  </div>
);

// ─── Mini Create Form ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  panelType: "",
  panelName: "",
  panelSizeWatt: "",
  numberOfPanels: "",
  panelWarrantyYears: "",
  loadKw: "",
  inverterSizeKw: "",
  inverterWarrantyYears: "",
  quotationValue: "",
  subsidy: "",
  dcrStatus: "DCR",
};

const MiniQuotationForm = ({ leadId, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [createQuotation, { isLoading }] = useCreateQuotationMutation();
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const set = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      leadId,
      panelType: form.panelType || undefined,
      panelName: form.panelName || undefined,
      panelSizeWatt: form.panelSizeWatt || undefined,
      numberOfPanels: form.numberOfPanels ? parseInt(form.numberOfPanels) : undefined,
      panelWarrantyYears: form.panelWarrantyYears ? parseInt(form.panelWarrantyYears) : undefined,
      loadKw: form.loadKw ? parseFloat(form.loadKw) : undefined,
      inverterSizeKw: form.inverterSizeKw ? parseFloat(form.inverterSizeKw) : undefined,
      inverterWarrantyYears: form.inverterWarrantyYears
        ? parseInt(form.inverterWarrantyYears)
        : undefined,
      quotationValue: form.quotationValue ? parseFloat(form.quotationValue) : undefined,
      subsidy: form.subsidy ? parseFloat(form.subsidy) : undefined,
      dcrStatus: form.dcrStatus || "DCR",
    };

    try {
      await createQuotation(payload).unwrap();
      dispatch(addToast({ message: "Quotation created successfully", type: "success" }));
      setForm({ ...EMPTY_FORM });
      onSuccess();
    } catch (err) {
      dispatch(
        addToast({
          message: err?.data?.message || "Failed to create quotation",
          type: "error",
        })
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-4"
    >
      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
        New Quotation
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Panel Type</label>
          <select name="panelType" value={form.panelType} onChange={set} className={inputCls}>
            <option value="">— Select —</option>
            <option value="TOPCON">TOPCON</option>
            <option value="MONOFACIAL">MONOFACIAL</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Load (kW)</label>
          <input
            name="loadKw"
            type="number"
            step="0.1"
            value={form.loadKw}
            onChange={set}
            placeholder="5.0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>No. of Panels</label>
          <input
            name="numberOfPanels"
            type="number"
            value={form.numberOfPanels}
            onChange={set}
            placeholder="10"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Panel Brand</label>
          <input
            name="panelName"
            value={form.panelName}
            onChange={set}
            placeholder="e.g. Waaree"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Inverter Size (kW)</label>
          <input
            name="inverterSizeKw"
            type="number"
            step="0.1"
            value={form.inverterSizeKw}
            onChange={set}
            placeholder="5.0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>DCR Status</label>
          <select name="dcrStatus" value={form.dcrStatus} onChange={set} className={inputCls}>
            <option value="DCR">DCR</option>
            <option value="NON_DCR">Non-DCR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Quotation Value (₹)</label>
          <input
            name="quotationValue"
            type="number"
            value={form.quotationValue}
            onChange={set}
            placeholder="0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Subsidy (₹)</label>
          <input
            name="subsidy"
            type="number"
            value={form.subsidy}
            onChange={set}
            placeholder="0"
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <SpinnerGapIcon size={14} className="animate-spin" />
          ) : (
            <ReceiptIcon size={14} weight="bold" />
          )}
          {isLoading ? "Saving…" : "Save Quotation"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Drawer ─────────────────────────────────────────────────────────────

const QuotationsDrawer = ({ leadId, title, subtitle, onClose }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const dept = (currentUser?.department?.name || currentUser?.department || "").toUpperCase();
  const isReadOnly = dept === "OPERATIONS DEPARTMENT";

  const [showForm, setShowForm] = useState(false);

  const { data: quotations = [], isLoading } = useGetLeadQuotationsQuery(leadId, {
    skip: !leadId,
  });

  const handleView = (id) => {
    onClose();
    navigate(`/quotations?quoteId=${id}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-[95] w-full max-w-sm flex flex-col bg-white dark:bg-dark-surface border-l border-gray-200 dark:border-dark-border shadow-2xl">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                Quotations
              </p>
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <XIcon size={14} weight="bold" />
            </button>
          </div>

          {/* Count chip */}
          {!isLoading && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                <ReceiptIcon size={12} weight="bold" />
                {quotations.length === 0
                  ? "No quotations yet"
                  : `${quotations.length} quotation${quotations.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
              <SpinnerGapIcon size={16} className="animate-spin" />
              Loading quotations…
            </div>
          ) : (
            <>
              {quotations.length === 0 && !showForm && (
                <div className="flex flex-col items-center justify-center text-center px-4 py-10 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CurrencyInrIcon
                      size={26}
                      className="text-emerald-400 dark:text-emerald-500"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    No quotations yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Create the first quotation for this lead.
                  </p>
                </div>
              )}

              {quotations.map((q) => (
                <QuotationCard key={q.id} q={q} onView={handleView} />
              ))}

              {showForm && (
                <MiniQuotationForm
                  leadId={leadId}
                  onSuccess={() => setShowForm(false)}
                  onCancel={() => setShowForm(false)}
                />
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!isReadOnly && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                <PlusIcon size={16} weight="bold" />
                New Quotation
              </button>
            ) : (
              <button
                onClick={() => setShowForm(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                <CaretUpIcon size={14} weight="bold" />
                Hide Form
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QuotationsDrawer;
