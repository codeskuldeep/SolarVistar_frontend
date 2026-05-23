import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useGetProjectByIdQuery,
  useUpdateProjectTaskMutation,
  useUpsertGovtApprovalMutation,
  useUpsertSubsidyMutation,
  useCreateAmcRecordMutation,
  useUpdateAmcRecordMutation,
  useDeleteAmcRecordMutation,
  useUpsertAmcCheckpointMutation,
  useGetDocumentMatrixQuery,
  useVerifyDocumentMutation,
  useGetProjectActivityQuery,
} from "../../context/api/projectsApi";
import { addToast } from "../../context/slices/toastSlice";
import { useUploadDocumentMutation, useDeleteDocumentMutation } from "../../context/api/documents";
import { useGetUsersQuery } from "../../context/api/usersApi";
import {
  Phone, User, Bank, CheckCircle, CircleNotch, CaretDown,
  Buildings, Seal, CalendarBlank, UploadSimple, FileText, Trash, Link,
  DownloadSimple, Table, ClockCounterClockwise,
  ArrowLeft,
  CaretRight,
  FloppyDisk,
  Coins,
  X,
  PencilSimple,
} from "@phosphor-icons/react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGE_ORDER = ["DOCUMENTATION", "TECHNICAL_FINANCIAL", "INSTALLATION", "FILE_PREPARATION", "GOVT_APPROVALS", "SUBSIDY"];
const STAGE_NAMES = {
  DOCUMENTATION: "Documentation", TECHNICAL_FINANCIAL: "Technical & Financial",
  FILE_PREPARATION: "File Preparation", GOVT_APPROVALS: "Govt Approvals",
  SUBSIDY: "Subsidy", INSTALLATION: "Installation"
};
const STATUS_CONFIG = {
  NOT_STARTED: { label: "Not Started", theme: "text-gray-600 bg-gray-100 ring-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:ring-slate-700" },
  IN_PROGRESS: { label: "In Progress", theme: "text-blue-700 bg-blue-50 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800" },
  DELAYED: { label: "Delayed", theme: "text-red-700 bg-red-50 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800" },
  COMPLETED: { label: "Completed", theme: "text-emerald-700 bg-emerald-50 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800" },
};

// Must exactly match SubsidyStatus enum in schema.prisma
const SUBSIDY_STATUSES = ["NOT_APPLIED", "APPLIED", "REDEEMED", "DISBURSED"];

// Must exactly match PortalName enum in schema.prisma
const PORTAL_NAMES = [
  { value: "URJAS", label: "URJAS" },
  { value: "MPEB", label: "MPEB" },
  { value: "PM_SURYA_GHAR", label: "PM Surya Ghar" },
];

// Tasks that explicitly require document uploads
const TASKS_WITH_DOCS = [
  "Name Transfer", "Registration", "Bank Details Submit",
  "Site Feasibility Check", "Quotation Upload", "Model Agreement", "Loan Process",
  "Joint Inspection", "Work Completion", "Net Meter", "CMC", "CSV File", "DCR Certificate",
  "Urjas Portal Upload", "MPEB Sanction", "PM Surya Ghar Portal Upload", "Sanction Receipt",
  "Panels/Inverter Photo", "Material Photos", "Final Customer Photo with Plant"
];

// Maps task name → document category (must match STAGE_REQUIRED_DOCUMENTS in backend config)
const TASK_TO_CATEGORY = {
  "Name Transfer": "NAME_TRANSFER_FORM",
  "Registration": "ID_PROOF",
  "Bank Details Submit": "BANK_DETAILS",
  "Site Feasibility Check": "SITE_FEASIBILITY_REPORT",
  "Quotation Upload": "FINAL_QUOTATION",
  "Model Agreement": "MODEL_AGREEMENT",
  "Loan Process": "LOAN_SANCTION",
  "Joint Inspection": "JOINT_INSPECTION_REPORT",
  "Work Completion": "WORK_COMPLETION_REPORT",
  "Net Meter": "NET_METER_STAMP",
  "CMC": "CMC_STAMP",
  "CSV File": "CSV_FILE",
  "DCR Certificate": "DCR_CERTIFICATE",
  "Urjas Portal Upload": "URJAS_NET_METERING",
  "MPEB Sanction": "MPEB_SANCTION",
  "PM Surya Ghar Portal Upload": "PM_SURYA_GHAR_DCR",
  "Sanction Receipt": "PM_SURYA_GHAR_SANCTION_LETTER",
  "Panels/Inverter Photo": "KIT_READY_PHOTO",
  "Material Photos": "MATERIAL_PHOTOS",
  "Final Customer Photo with Plant": "FINAL_CUSTOMER_PHOTO_WITH_PLANT",
};

// Restricts accepted file types per task (undefined = all allowed types)
const TASK_FILE_ACCEPT = {
  "Material Photos": "image/jpeg,image/png",
};

// ─── Shared field style ───────────────────────────────────────────────────────
const INPUT = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
const LABEL = "block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: project, isLoading, isError, refetch } = useGetProjectByIdQuery(id);

  const handleExport = async (format) => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const token = sessionStorage.getItem("authToken");
    try {
      const res = await fetch(`${BASE}/projects/${id}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const customerName = (project?.lead?.customerName || 'Project').replace(/\s+/g, '_');
      const shortId = id.slice(0, 8);
      a.download = `${customerName}_${shortId}.${format === 'pdf' ? 'pdf' : 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      dispatch(addToast({ type: "error", message: `Export failed: ${err.message}` }));
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-950">
      <CircleNotch className="w-6 h-6 animate-spin text-gray-400" />
      <span className="text-sm text-gray-500">Loading workspace...</span>
    </div>
  );

  if (isError || !project) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-slate-950">
      <WarningCircle className="w-8 h-8 text-red-500" />
      <span className="text-gray-600 dark:text-gray-400 font-medium">Failed to load project data.</span>
      <button onClick={refetch} className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50">Retry</button>
    </div>
  );

  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "US";
  const sortedStages = [...(project.stages || [])].sort((a, b) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name));
  const scrollToStage = (id) => document.getElementById(`stage-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 px-4 sm:px-6 py-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-10">

        <button onClick={() => navigate(-1)} className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
        </button>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-base font-bold text-gray-700 dark:text-slate-300">
              {getInitials(project.lead?.customerName)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{project.lead?.customerName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Phone size={13} /> {project.lead?.phoneNumber}</span>
                <span>·</span>
                <span>PID: {project.id.slice(0, 8)}</span>
                <span>·</span>
                <button onClick={() => navigate(`/leads/${project.leadId}/profile`)} className="text-indigo-600 dark:text-indigo-400 hover:underline">View Lead</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-3 w-full md:w-56 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => handleExport('pdf')} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5">
                <DownloadSimple size={14} /> PDF
              </button>
              <button onClick={() => handleExport('csv')} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5">
                <Table size={14} /> CSV
              </button>
            </div>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500 dark:text-slate-400">Overall Progress</span>
                <span>{project.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-700" style={{ width: `${project.progressPercent}%` }} />
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Stage: {STAGE_NAMES[project.currentStage]}</p>
            </div>
          </div>
        </header>

        {/* Stage Nav */}
        <nav className="flex gap-1 overflow-x-auto pb-2 hide-scrollbar">
          {sortedStages.map((stage) => {
            const isCompleted = stage.status === "COMPLETED";
            const isActive = stage.status === "IN_PROGRESS";
            return (
              <button key={stage.id} onClick={() => scrollToStage(stage.id)}
                className={`flex flex-col items-start px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors min-w-[100px] flex-1
                  ${isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : isCompleted ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-gray-50 text-gray-400 dark:bg-slate-900 dark:text-slate-500 hover:bg-gray-100"}`}
              >
                <span>{STAGE_NAMES[stage.name]}</span>
                <div className={`mt-1.5 h-0.5 w-full rounded-full ${isCompleted ? "bg-emerald-500" : isActive ? "bg-indigo-500" : "bg-gray-200 dark:bg-slate-700"}`} />
              </button>
            );
          })}
        </nav>

        {/* Warranty / AMC */}
        <WarrantyProgressBar amcRecord={project.amcRecord} projectId={project.id} dispatch={dispatch} />

        {/* Documents Matrix */}
        <DocumentsMatrix projectId={project.id} />

        {/* Stage Panels */}
        <div className="space-y-12 pb-10">
          {sortedStages.map((stage) => (
            <StagePanel key={stage.id} stage={stage} projectId={project.id} project={project} dispatch={dispatch} />
          ))}
        </div>

        {/* Activity Log */}
        <ProjectActivityLog projectId={project.id} />

      </div>
    </div>
  );
}

// ─── Stage Panel ─────────────────────────────────────────────────────────────
const StagePanel = ({ stage, projectId, project, dispatch }) => {
  const isSubsidy = stage.name === "SUBSIDY";
  const isGovt = stage.name === "GOVT_APPROVALS";

  return (
    <section id={`stage-${stage.id}`} className="scroll-mt-8">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold tracking-tight">{STAGE_NAMES[stage.name]}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_CONFIG[stage.status]?.theme || STATUS_CONFIG.NOT_STARTED.theme}`}>
          {STATUS_CONFIG[stage.status]?.label || "Not Started"}
        </span>
        {stage.assignedTeam && (
          <span className="ml-auto text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <Buildings size={12} /> {stage.assignedTeam.name}
          </span>
        )}
      </div>

      {/* Subsidy summary banner */}
      {isSubsidy && project.subsidyDetails && (
        <div className="mb-4 flex flex-wrap gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <Bank size={15} /> {project.subsidyDetails.status.replace("_", " ")}
          </span>
          {project.subsidyDetails.disbursedAmount && (
            <span className="text-gray-700 dark:text-gray-300">Disbursed: <strong className="text-emerald-600">₹{project.subsidyDetails.disbursedAmount}</strong></span>
          )}
          {project.subsidyDetails.transactionRef && (
            <span className="text-gray-700 dark:text-gray-300">Ref: <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{project.subsidyDetails.transactionRef}</code></span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {stage.tasks?.filter(t => t.name !== "3D Site Photos").length === 0
          ? <p className="py-6 text-gray-400 dark:text-slate-500 text-sm italic">No tasks assigned.</p>
          : stage.tasks.filter(t => t.name !== "3D Site Photos").map(task => (
            <TaskRow
              key={task.id}
              task={task}
              projectId={projectId}
              stageStatus={stage.status}
              dispatch={dispatch}
              showGovtForm={isGovt}
              showSubsidyForm={isSubsidy}
              subsidyDetails={project.subsidyDetails}
            />
          ))
        }
      </div>
    </section>
  );
};

// ─── Task Row ─────────────────────────────────────────────────────────────────
const TaskRow = ({ task, projectId, stageStatus, dispatch, showGovtForm, showSubsidyForm, subsidyDetails }) => {
  const [updateTask, { isLoading: isUpdating }] = useUpdateProjectTaskMutation();
  const [uploadDocument, { isLoading: isUploadingDoc }] = useUploadDocumentMutation();
  const [deleteDocument, { isLoading: isDeletingDoc }] = useDeleteDocumentMutation();

  const [optimisticStatus, setOptimisticStatus] = useState(task.status);
  const [expanded, setExpanded] = useState(false);
  const [remarks, setRemarks] = useState(task.remarks || "");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");

  useEffect(() => { setOptimisticStatus(task.status); }, [task.status]);

  const isCompleted = optimisticStatus === "COMPLETED";
  const isStageLocked = stageStatus === "NOT_STARTED";
  const activeConfig = STATUS_CONFIG[optimisticStatus] || STATUS_CONFIG.NOT_STARTED;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === optimisticStatus) return;
    const prev = optimisticStatus;
    setOptimisticStatus(newStatus);
    try {
      await updateTask({ projectId, taskId: task.id, updateData: { status: newStatus, remarks: remarks || undefined } }).unwrap();
      dispatch(addToast({ type: "success", message: "Status updated" }));
    } catch (err) {
      setOptimisticStatus(prev);
      dispatch(addToast({ type: "error", message: err.data?.message || "Update failed" }));
    }
  };

  const handleSaveDetails = async () => {
    try {
      await updateTask({ projectId, taskId: task.id, updateData: { remarks: remarks || undefined, dueDate: dueDate || null } }).unwrap();
      dispatch(addToast({ type: "success", message: "Task details saved" }));
    } catch (err) {
      dispatch(addToast({ type: "error", message: err.data?.message || "Save failed" }));
    }
  };

  // Identify special tasks
  const needsGovtApproval = showGovtForm && task.govtApprovalDetails !== undefined;
  const isSubsidyTask = showSubsidyForm && (task.name === "Subsidy Redeemed" || task.name === "Subsidy Disbursed");

  return (
    <div className={`rounded-xl border transition-all ${expanded ? "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm" : "border-transparent hover:border-gray-100 dark:hover:border-slate-800"}`}>
      {/* Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start gap-3">
          <div className="pt-0.5 shrink-0">
            {isCompleted
              ? <CheckCircle size={20} weight="fill" className="text-emerald-500" />
              : <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-600" />}
          </div>
          <div>
            <p className={`font-medium text-sm ${isCompleted ? "line-through text-gray-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
              {task.name}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-400 dark:text-slate-500">
              {task.assignedTo && <span className="flex items-center gap-1"><User size={11} /> {task.assignedTo.name}</span>}
              {dueDate && <span className="flex items-center gap-1"><CalendarBlank size={11} /> Due: {new Date(dueDate).toLocaleDateString()}</span>}
              {task.govtApprovalDetails?.referenceNumber && (
                <span className="flex items-center gap-1"><Seal size={11} /> Ref: {task.govtApprovalDetails.referenceNumber}</span>
              )}
              {optimisticStatus === "DELAYED" && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded font-semibold uppercase text-[10px] tracking-wide">Delayed</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-8 sm:ml-0" onClick={e => e.stopPropagation()}>
          {isUpdating && <CircleNotch size={13} className="animate-spin text-gray-400 shrink-0" />}
          <div className="relative inline-flex items-center">
            <select
              value={optimisticStatus}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={isStageLocked || isUpdating}
              className={`appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold rounded-full ring-1 ring-inset border-0 outline-none cursor-pointer disabled:opacity-50 ${activeConfig.theme}`}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <CaretDown size={11} weight="bold" className="absolute right-2 pointer-events-none" />
          </div>
          <CaretRight size={15} className={`text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100 dark:border-slate-800">

          {/* Basic editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Remarks {optimisticStatus === "DELAYED" && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Add notes or reason for delay…"
                className={INPUT}
              />
            </div>
          </div>

          {/* Govt Approval sub-form — for any task inside GOVT_APPROVALS stage */}
          {showGovtForm && (
            <GovtApprovalForm task={task} projectId={projectId} dispatch={dispatch} />
          )}

          {/* Subsidy sub-form — only on subsidy-critical tasks */}
          {isSubsidyTask && (
            <SubsidyForm projectId={projectId} dispatch={dispatch} existing={subsidyDetails} taskName={task.name} />
          )}

          {/* Document Upload & List (Only shown for relevant tasks) */}
          {(TASKS_WITH_DOCS.includes(task.name) || (task.documents && task.documents.length > 0)) && (
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Attached Documents</span>
                <div>
                  <input
                    type="file"
                    id={`upload-${task.id}`}
                    className="hidden"
                    disabled={isUploadingDoc}
                    accept={TASK_FILE_ACCEPT[task.name]}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const category = TASK_TO_CATEGORY[task.name] || "OTHER";
                      try {
                        await uploadDocument({ projectId, taskId: task.id, category, file }).unwrap();
                        dispatch(addToast({ type: "success", message: "Document uploaded" }));
                      } catch (err) {
                        dispatch(addToast({ type: "error", message: err.data?.message || "Upload failed" }));
                      }
                    }}
                  />
                  <label htmlFor={`upload-${task.id}`} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition ${isUploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploadingDoc ? <CircleNotch size={14} className="animate-spin" /> : <UploadSimple size={14} />}
                    {isUploadingDoc ? "Uploading..." : "Upload Document"}
                  </label>
                </div>
              </div>

              {task.documents && task.documents.length > 0 ? (
                <div className="space-y-2">
                  {task.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="truncate">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-900 dark:text-white hover:underline truncate">
                            {doc.category || "Document"}
                          </a>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                            {doc.format} &middot; {(doc.bytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this document?")) {
                            try {
                              await deleteDocument(doc.id).unwrap();
                              dispatch(addToast({ type: "success", message: "Document deleted" }));
                            } catch (err) {
                              dispatch(addToast({ type: "error", message: err.data?.message || "Delete failed" }));
                            }
                          }
                        }}
                        disabled={isDeletingDoc}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 px-3 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg text-gray-400 dark:text-slate-500 text-xs">
                  No documents uploaded for this task yet.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveDetails}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              <FloppyDisk size={15} /> Save Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Govt Approval Form ───────────────────────────────────────────────────────
const GovtApprovalForm = ({ task, projectId, dispatch }) => {
  const [upsert, { isLoading }] = useUpsertGovtApprovalMutation();

  const buildForm = (g) => ({
    portalName: g?.portalName || "",
    referenceNumber: g?.referenceNumber || "",
    sanctionDate: g?.sanctionDate ? g.sanctionDate.slice(0, 10) : "",
    portalUploadUrl: g?.portalUploadUrl || "",
    notes: g?.notes || "",
  });

  const [form, setForm] = useState(() => buildForm(task.govtApprovalDetails));

  // ✅ Re-sync whenever RTK Query refetches and updates the task prop
  useEffect(() => {
    setForm(buildForm(task.govtApprovalDetails));
  }, [task.govtApprovalDetails]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    try {
      await upsert({ projectId, taskId: task.id, data: { ...form } }).unwrap();
      dispatch(addToast({ type: "success", message: "Govt Approval details saved" }));
    } catch (err) {
      dispatch(addToast({ type: "error", message: err.data?.message || "Save failed" }));
    }
  };

  return (
    <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
        <Seal size={14} /> Government Portal Details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Portal Name</label>
          <div className="relative">
            <select value={form.portalName} onChange={set("portalName")} className={INPUT + " pr-8 appearance-none"}>
              <option value="">— Select Portal —</option>
              {PORTAL_NAMES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <CaretDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>
        <div>
          <label className={LABEL}>Reference / App. Number</label>
          <input value={form.referenceNumber} onChange={set("referenceNumber")} placeholder="e.g. PMSG-2024-XXXXX" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Sanction Date</label>
          <input type="date" value={form.sanctionDate} onChange={set("sanctionDate")} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Portal Upload URL</label>
          <input value={form.portalUploadUrl} onChange={set("portalUploadUrl")} placeholder="https://…" className={INPUT} />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Notes</label>
          <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Any additional notes about the approval process…" className={INPUT + " resize-none"} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition">
          {isLoading ? <CircleNotch size={13} className="animate-spin" /> : <FloppyDisk size={13} />} Save Portal Details
        </button>
      </div>
    </div>
  );
};

// ─── Subsidy Form ─────────────────────────────────────────────────────────────
// This is a single shared record at project level — show ALL fields always.
const SubsidyForm = ({ projectId, dispatch, existing }) => {
  const [upsert, { isLoading }] = useUpsertSubsidyMutation();

  const buildForm = (e) => ({
    status: e?.status || "NOT_APPLIED",
    redeemedAmount: e?.redeemedAmount ?? "",
    redeemedDate: e?.redeemedDate ? e.redeemedDate.slice(0, 10) : "",
    disbursedAmount: e?.disbursedAmount ?? "",
    disbursedDate: e?.disbursedDate ? e.disbursedDate.slice(0, 10) : "",
    bankAccount: e?.bankAccount || "",
    transactionRef: e?.transactionRef || "",
  });

  const [form, setForm] = useState(() => buildForm(existing));

  // ✅ Re-sync whenever RTK Query refetches and updates the existing prop
  useEffect(() => {
    setForm(buildForm(existing));
  }, [existing]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        redeemedAmount: (form.redeemedAmount === "" || form.redeemedAmount === null) ? null : parseFloat(form.redeemedAmount),
        disbursedAmount: (form.disbursedAmount === "" || form.disbursedAmount === null) ? null : parseFloat(form.disbursedAmount),
      };
      await upsert({ projectId, data: payload }).unwrap();
      dispatch(addToast({ type: "success", message: "Subsidy details saved" }));
    } catch (err) {
      dispatch(addToast({ type: "error", message: err.data?.message || "Save failed" }));
    }
  };

  return (
    <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
        <Coins size={14} /> Subsidy Details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={LABEL}>Subsidy Status</label>
          <div className="relative">
            <select value={form.status} onChange={set("status")} className={INPUT + " pr-8 appearance-none"}>
              {SUBSIDY_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <CaretDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>

        {/* Redemption fields */}
        <div>
          <label className={LABEL}>Redeemed Amount (₹)</label>
          <input type="number" value={form.redeemedAmount} onChange={set("redeemedAmount")} placeholder="0" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Redemption Date</label>
          <input type="date" value={form.redeemedDate} onChange={set("redeemedDate")} className={INPUT} />
        </div>

        {/* Disbursement fields */}
        <div>
          <label className={LABEL}>Disbursed Amount (₹) <span className="text-red-500">*</span></label>
          <input type="number" value={form.disbursedAmount} onChange={set("disbursedAmount")} placeholder="0" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Disbursement Date</label>
          <input type="date" value={form.disbursedDate} onChange={set("disbursedDate")} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Bank Account No.</label>
          <input value={form.bankAccount} onChange={set("bankAccount")} placeholder="Customer's bank account" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Transaction Reference <span className="text-red-500">*</span></label>
          <input value={form.transactionRef} onChange={set("transactionRef")} placeholder="UTR / Ref ID" className={INPUT} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition">
          {isLoading ? <CircleNotch size={13} className="animate-spin" /> : <FloppyDisk size={13} />} Save Subsidy Details
        </button>
      </div>
    </div>
  );
};

// ─── Documents Matrix ────────────────────────────────────────────────────────
const DocumentsMatrix = ({ projectId }) => {
  const { data: matrix, isLoading } = useGetDocumentMatrixQuery(projectId);
  const [verify, { isLoading: isVerifying }] = useVerifyDocumentMutation();
  const dispatch = useDispatch();

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (!matrix || matrix.length === 0) return null;

  // Group by stage
  const byStage = matrix.reduce((acc, item) => {
    if (!acc[item.stage]) acc[item.stage] = [];
    acc[item.stage].push(item);
    return acc;
  }, {});

  const handleVerify = async (docId) => {
    try {
      await verify({ projectId, documentId: docId }).unwrap();
      dispatch(addToast({ type: "success", message: "Document verified" }));
    } catch (err) {
      dispatch(addToast({ type: "error", message: err.data?.message || "Verification failed" }));
    }
  };

  return (
    <section className="mb-10 p-5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
        <FileText size={18} className="text-indigo-500" />
        <h3 className="text-base font-semibold tracking-tight">Required Documents Matrix</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(byStage).map(([stageName, docs]) => (
          <div key={stageName}>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-2">{STAGE_NAMES[stageName]}</h4>
            <div className="space-y-2">
              {docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${doc.status === 'UPLOADED' ? 'bg-emerald-500' :
                      doc.status === 'PENDING_REVIEW' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {doc.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline">
                        View
                      </a>
                    )}
                    {doc.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={() => handleVerify(doc.documentId)}
                        disabled={isVerifying}
                        className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wide hover:bg-amber-200 transition"
                      >
                        Verify
                      </button>
                    )}
                    {doc.status === 'UPLOADED' && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle size={10} weight="fill" /> Verified
                      </span>
                    )}
                    {doc.status === 'MISSING' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wide">
                        Missing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Project Activity Log ────────────────────────────────────────────────────
const ProjectActivityLog = ({ projectId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetProjectActivityQuery({ projectId, page, limit: 10 });

  if (isLoading && page === 1) return <div className="animate-pulse h-32 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  const logs = data?.logs || [];
  const meta = data?.meta || {};

  return (
    <section className="mb-10 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
        <ClockCounterClockwise size={18} className="text-gray-500" />
        <h3 className="text-base font-semibold tracking-tight">Project Activity Log</h3>
      </div>

      <div className="p-4 space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No activity recorded yet.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 text-xs font-bold">
                {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <p className="text-sm text-slate-900 dark:text-white">
                  <span className="font-semibold">{log.user?.name || 'System'}</span>
                  <span className="text-gray-500 dark:text-gray-400"> • {log.actionType.replace(/_/g, ' ')}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(log.createdAt).toLocaleString()} • {log.entityType}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {meta.page < Math.ceil(meta.total / meta.limit) && (
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
};

// ─── Warranty / AMC Section ───────────────────────────────────────────────────
const WarrantyProgressBar = ({ amcRecord, projectId, dispatch }) => {
  const [showForm, setShowForm] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const buildForm = (r) => ({
    startDate: r?.startDate ? r.startDate.slice(0, 10) : "",
    endDate: r?.endDate ? r.endDate.slice(0, 10) : "",
    status: r?.status || "ACTIVE",
    supportContactUserId: r?.supportContactUserId || "",
    notes: r?.notes || "",
  });
  const [form, setForm] = useState(() => buildForm(amcRecord));

  useEffect(() => {
    setForm(buildForm(amcRecord));
    setStaffSearch(amcRecord?.supportContact?.name || "");
  }, [amcRecord]);

  const { data: usersData } = useGetUsersQuery(
    { page: 1, limit: 20, search: staffSearch },
    { skip: !showForm || !staffSearch }
  );

  const [createAmc, { isLoading: creating }] = useCreateAmcRecordMutation();
  const [updateAmc, { isLoading: updating }] = useUpdateAmcRecordMutation();
  const [deleteAmc, { isLoading: deleting }] = useDeleteAmcRecordMutation();
  const [upsertCheckpoint, { isLoading: savingCp }] = useUpsertAmcCheckpointMutation();

  // Checkpoint edit state
  const [editingQ, setEditingQ] = useState(null);
  const [cpForm, setCpForm] = useState({ status: "PENDING", assignedToId: "", comment: "" });
  const [cpStaffSearch, setCpStaffSearch] = useState("");

  const { data: cpUsersData } = useGetUsersQuery(
    { page: 1, limit: 20, search: cpStaffSearch },
    { skip: editingQ === null || !cpStaffSearch }
  );

  const savedCp = (qIdx) => amcRecord?.checkpoints?.find((c) => c.quarterIndex === qIdx);

  const openCpEdit = (qIdx) => {
    const cp = savedCp(qIdx);
    setCpForm({
      status: cp?.status || "PENDING",
      assignedToId: cp?.assignedTo?.id || "",
      comment: cp?.comment || "",
    });
    setCpStaffSearch(cp?.assignedTo?.name || "");
    setEditingQ(qIdx);
  };

  const handleSaveCp = async () => {
    try {
      await upsertCheckpoint({
        projectId,
        quarterIndex: editingQ,
        data: { status: cpForm.status, assignedToId: cpForm.assignedToId || null, comment: cpForm.comment || null },
      }).unwrap();
      dispatch(addToast({ type: "success", message: "Checkpoint saved." }));
      setEditingQ(null);
    } catch (err) {
      dispatch(addToast({ type: "error", message: err?.data?.message || "Save failed." }));
    }
  };

  const CP_STATUS_CFG = {
    PENDING:     { label: "Pending",     cls: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300" },
    IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    COMPLETED:   { label: "Completed",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    DELAYED:     { label: "Delayed",     cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const isBusy = creating || updating;

  const handleSave = async () => {
    if (!form.startDate || !form.endDate) {
      dispatch(addToast({ type: "error", message: "Start date and end date are required." }));
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      dispatch(addToast({ type: "error", message: "End date must be after start date." }));
      return;
    }
    try {
      const payload = {
        startDate: form.startDate,
        endDate: form.endDate,
        supportContactUserId: form.supportContactUserId || null,
        notes: form.notes || null,
      };
      if (amcRecord) {
        await updateAmc({ projectId, data: { ...payload, status: form.status } }).unwrap();
        dispatch(addToast({ type: "success", message: "AMC record updated." }));
      } else {
        await createAmc({ projectId, data: payload }).unwrap();
        dispatch(addToast({ type: "success", message: "AMC record created." }));
      }
      setShowForm(false);
    } catch (err) {
      dispatch(addToast({ type: "error", message: err?.data?.message || "Save failed." }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this AMC record? This cannot be undone.")) return;
    try {
      await deleteAmc({ projectId }).unwrap();
      dispatch(addToast({ type: "success", message: "AMC record deleted." }));
    } catch (err) {
      dispatch(addToast({ type: "error", message: err?.data?.message || "Delete failed." }));
    }
  };

  // ── No AMC yet ──────────────────────────────────────────────────────────────
  if (!amcRecord && !showForm) {
    return (
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Seal size={20} className="text-gray-400" /> Warranty / AMC
            </h3>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">No AMC record set up for this project yet.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition shrink-0"
          >
            <FloppyDisk size={15} /> Setup AMC
          </button>
        </div>
      </section>
    );
  }

  // ── Form (create or edit) ────────────────────────────────────────────────────
  if (showForm) {
    return (
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mb-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Seal size={20} className="text-emerald-500" />
            {amcRecord ? "Edit AMC Record" : "Setup AMC Record"}
          </h3>
          <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <CaretDown size={18} className="rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Start Date</label>
            <input type="date" className={INPUT} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>End Date</label>
            <input type="date" className={INPUT} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>

          {amcRecord && (
            <div>
              <label className={LABEL}>Status</label>
              <div className="relative">
                <select className={INPUT + " pr-8 appearance-none"} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="RENEWED">RENEWED</option>
                </select>
                <CaretDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          )}

          <div className={amcRecord ? "" : "sm:col-span-2"}>
            <label className={LABEL}>Support Contact (optional)</label>
            <input
              className={INPUT}
              placeholder="Search staff by name…"
              value={staffSearch}
              onChange={(e) => { setStaffSearch(e.target.value); set("supportContactUserId", ""); }}
            />
            {usersData?.users?.length > 0 && staffSearch && !form.supportContactUserId && (
              <ul className="border border-gray-200 dark:border-slate-700 rounded-lg mt-1 max-h-36 overflow-y-auto bg-white dark:bg-slate-800 text-sm z-10 relative">
                {usersData.users.map((u) => (
                  <li
                    key={u.id}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-white"
                    onClick={() => { set("supportContactUserId", u.id); setStaffSearch(u.name); }}
                  >
                    {u.name} — {u.email}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL}>Notes (optional)</label>
            <textarea rows={2} className={INPUT + " resize-none"} placeholder="Any notes about this AMC…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isBusy} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 disabled:opacity-50 transition">
            {isBusy ? <CircleNotch size={14} className="animate-spin" /> : <FloppyDisk size={14} />}
            {isBusy ? "Saving…" : amcRecord ? "Save Changes" : "Create AMC"}
          </button>
        </div>
      </section>
    );
  }

  // ── Existing AMC display ─────────────────────────────────────────────────────
  const start = new Date(amcRecord.startDate);
  const end = new Date(amcRecord.endDate);
  const now = new Date();
  const totalDays = (end - start) / (1000 * 60 * 60 * 24);
  const elapsedDays = (now - start) / (1000 * 60 * 60 * 24);
  const percentage = Math.max(0, Math.min((elapsedDays / totalDays) * 100, 100));

  const isExpired = percentage >= 100 || amcRecord.status === "EXPIRED";
  const isWarning = percentage > 90 && !isExpired;
  const barColor = isExpired ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-500";

  const remainingDays = Math.max(0, Math.floor(totalDays - elapsedDays));
  const remainingYears = Math.floor(remainingDays / 365);
  const remainingMonths = Math.floor((remainingDays % 365) / 30);
  const remainingText = isExpired
    ? "Warranty Expired"
    : remainingYears > 0
    ? `${remainingYears} Yr ${remainingMonths > 0 ? remainingMonths + " Mo" : ""} Remaining`
    : `${remainingMonths} Months Remaining`;

  // ── 3-month segments ─────────────────────────────────────────────────────────
  const segments = [];
  {
    let cur = new Date(start);
    let idx = 0;
    while (cur < end) {
      const segStart = new Date(cur);
      const next = new Date(cur);
      next.setMonth(next.getMonth() + 3);
      const segEnd = next > end ? new Date(end) : next;
      const segElapsed = Math.max(0, Math.min((now - segStart) / (segEnd - segStart), 1));
      const status = now >= segEnd ? "past" : now >= segStart ? "current" : "upcoming";
      segments.push({ idx, segStart, segEnd, status, segElapsed });
      cur = next;
      idx++;
    }
  }

  // checkpoint tick positions (boundaries between segments, excluding 0% and 100%)
  const ticks = segments.slice(0, -1).map((seg, i) => ({
    pct: ((seg.segEnd - start) / (end - start)) * 100,
    label: `${(i + 1) * 3}M`,
  }));

  const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-10">
        <div className={`absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full blur-3xl opacity-20 pointer-events-none ${isExpired ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-500"}`} />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 relative z-10">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2 mb-1">
              <Seal className={isExpired ? "text-red-500" : "text-emerald-500"} weight="fill" size={24} />
              System Warranty / AMC
            </h3>
            {amcRecord.supportContact && (
              <p className="text-xs text-gray-500 dark:text-slate-400">Support: {amcRecord.supportContact.name}</p>
            )}
            {amcRecord.notes && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 max-w-sm">{amcRecord.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap ${
              isExpired
                ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800"
                : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800"
            }`}>
              {amcRecord.status} • {remainingText}
            </div>
            <button
              onClick={() => setShowForm(true)}
              title="Edit AMC"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition"
            >
              <FloppyDisk size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete AMC"
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition disabled:opacity-40"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar — clickable, shows 3-month tick marks */}
        <div
          className="relative z-10 cursor-pointer group"
          title="Click to view 3-month breakdown"
          onClick={() => setShowBreakdown(true)}
        >
          {/* Bar */}
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner dark:bg-slate-800">
            <div className={`relative h-full transition-all duration-1000 ease-out ${barColor}`} style={{ width: `${percentage}%` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%]" style={{ animation: "shimmer 2s infinite linear" }} />
            </div>
            {/* Tick marks */}
            {ticks.map((tick) => (
              <div
                key={tick.label}
                className="absolute top-0 bottom-0 w-0.5 bg-white/70 dark:bg-white/50 z-10"
                style={{ left: `${tick.pct}%` }}
              />
            ))}
          </div>

          {/* Tick labels below the bar */}
          {ticks.length > 0 && (
            <div className="relative h-4 mt-0.5">
              {ticks.map((tick) => (
                <span
                  key={tick.label}
                  className="absolute -translate-x-1/2 text-[10px] font-semibold text-gray-400 dark:text-slate-500"
                  style={{ left: `${tick.pct}%` }}
                >
                  {tick.label}
                </span>
              ))}
            </div>
          )}

          {/* Date labels */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1 px-1">
            <span>Started: {fmtDate(start)}</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 self-center group-hover:text-green-500 transition-colors">
              Click for breakdown ›
            </span>
            <span>Ends: {fmtDate(end)}</span>
          </div>
        </div>

        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </section>

      {/* ── Breakdown Sidebar ──────────────────────────────────────────────────── */}
      {showBreakdown && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBreakdown(false)}
          />
          {/* Panel */}
          <div className="w-80 sm:w-96 h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700 shrink-0">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Seal size={18} className={isExpired ? "text-red-500" : "text-emerald-500"} weight="fill" />
                  AMC Breakdown
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {fmtDate(start)} — {fmtDate(end)}
                </p>
              </div>
              <button
                onClick={() => setShowBreakdown(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Overall badge */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                isExpired
                  ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800"
              }`}>
                {amcRecord.status} • {remainingText}
              </div>
            </div>

            {/* Segment list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {segments.map((seg, i) => {
                const timeChipCfg = {
                  past:     "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400",
                  current:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  upcoming: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                };
                const timeChipLabel = { past: "Past", current: "Active", upcoming: "Upcoming" };
                const cp = savedCp(seg.idx);
                const isEditing = editingQ === seg.idx;

                return (
                  <div
                    key={i}
                    className={`rounded-xl border transition-colors ${
                      seg.status === "current"
                        ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10"
                        : seg.status === "past"
                        ? "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50"
                        : "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/5"
                    }`}
                  >
                    {/* Card header */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          Q{i + 1} — Months {i * 3 + 1}–{Math.min((i + 1) * 3, Math.round(totalDays / 30))}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${timeChipCfg[seg.status]}`}>
                            {timeChipLabel[seg.status]}
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => openCpEdit(seg.idx)}
                              title="Log update for this quarter"
                              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 dark:text-slate-500 transition"
                            >
                              <PencilSimple size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {fmtDate(seg.segStart)} — {fmtDate(seg.segEnd)}
                      </p>

                      {/* Active-quarter mini progress */}
                      {seg.status === "current" && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-700"
                              style={{ width: `${seg.segElapsed * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            {Math.round(seg.segElapsed * 100)}% of this quarter elapsed
                          </p>
                        </div>
                      )}

                      {/* Saved checkpoint display */}
                      {cp && !isEditing && (
                        <div className="mt-1 pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                          <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full ${CP_STATUS_CFG[cp.status]?.cls}`}>
                            {CP_STATUS_CFG[cp.status]?.label}
                          </span>
                          {cp.assignedTo && (
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{cp.assignedTo.name}</span>
                            </p>
                          )}
                          {cp.comment && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{cp.comment}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline edit form */}
                    {isEditing && (
                      <div className="px-4 pb-4 space-y-3 border-t border-black/5 dark:border-white/5 pt-3">
                        {/* Status */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Status</label>
                          <div className="relative">
                            <select
                              className="w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={cpForm.status}
                              onChange={(e) => setCpForm((f) => ({ ...f, status: e.target.value }))}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="DELAYED">Delayed</option>
                            </select>
                            <CaretDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                          </div>
                        </div>

                        {/* Assign staff */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Assign Staff (optional)</label>
                          <input
                            className="w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Search staff by name…"
                            value={cpStaffSearch}
                            onChange={(e) => { setCpStaffSearch(e.target.value); setCpForm((f) => ({ ...f, assignedToId: "" })); }}
                          />
                          {cpUsersData?.users?.length > 0 && cpStaffSearch && !cpForm.assignedToId && (
                            <ul className="border border-gray-200 dark:border-slate-700 rounded-lg mt-1 max-h-28 overflow-y-auto bg-white dark:bg-slate-800 text-sm z-10 relative">
                              {cpUsersData.users.map((u) => (
                                <li
                                  key={u.id}
                                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-white"
                                  onClick={() => { setCpForm((f) => ({ ...f, assignedToId: u.id })); setCpStaffSearch(u.name); }}
                                >
                                  {u.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Comment (optional)</label>
                          <textarea
                            rows={2}
                            className="w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Any notes for this quarter…"
                            value={cpForm.comment}
                            onChange={(e) => setCpForm((f) => ({ ...f, comment: e.target.value }))}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingQ(null)}
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveCp}
                            disabled={savingCp}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 disabled:opacity-50 transition"
                          >
                            {savingCp ? <CircleNotch size={12} className="animate-spin" /> : <FloppyDisk size={12} />}
                            {savingCp ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`.animate-slide-in-right { animation: slideInRight 0.25s ease-out; } @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
};
