// src/components/ui/SitePhotoModal.jsx
import { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetVisitDocumentsQuery,
  useUploadVisitDocumentMutation,
  useDeleteDocumentMutation,
} from "../../context/api/documents";
import { addToast } from "../../context/slices/toastSlice";
import {
  XIcon,
  CameraIcon,
  UploadSimpleIcon,
  MapPinIcon,
  SolarPanelIcon,
  LightningIcon,
  UsersIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowsCounterClockwiseIcon,
  ImageIcon,
} from "@phosphor-icons/react";

// ─── Constants ───────────────────────────────────────────────────────────────

const PHOTO_SECTIONS = [
  {
    id: "pre",
    label: "Pre-Installation",
    icon: MapPinIcon,
    color: "blue",
    description: "Document the site before any work begins.",
    photos: [
      {
        category: "PRE_INSTALL_SITE",
        label: "Site Overview Photo",
        hint: "Geotagged photo of the installation site",
        geoRequired: true,
      },
    ],
  },
  {
    id: "post",
    label: "Post-Installation",
    icon: SolarPanelIcon,
    color: "green",
    description: "Confirm installation quality after completion.",
    photos: [
      {
        category: "POST_INSTALL_PANELS",
        label: "Installed Solar Panels",
        hint: "Geotagged photo of the mounted panels",
        geoRequired: true,
      },
      {
        category: "POST_INSTALL_INVERTER",
        label: "Inverter with Panel Number",
        hint: "Clearly show the panel/system number on the inverter",
        geoRequired: false,
      },
    ],
  },
  {
    id: "activation",
    label: "System Activation",
    icon: LightningIcon,
    color: "amber",
    description: "Capture proof of system going live.",
    photos: [
      {
        category: "ACTIVATION_CONSUMER_PLANT",
        label: "Consumer with Solar Plant",
        hint: "Geotagged photo of the consumer standing with the system",
        geoRequired: true,
      },
    ],
  },
];

const SECTION_COLORS = {
  blue: {
    header: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    icon: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    tab: "border-blue-500 text-blue-600 dark:text-blue-400",
    tabInactive: "text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400",
    uploadBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    cameraBtn: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800/40",
  },
  green: {
    header: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    tab: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    tabInactive: "text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400",
    uploadBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    cameraBtn: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/40",
  },
  amber: {
    header: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    icon: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    tab: "border-amber-500 text-amber-600 dark:text-amber-400",
    tabInactive: "text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400",
    uploadBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    cameraBtn: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/40",
  },
};

const formatBytes = (bytes = 0) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Camera Capture Sub-modal ─────────────────────────────────────────────────

const CameraCapture = ({ onCapture, onClose, color }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const colors = SECTION_COLORS[color];

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setReady(true);
        }
      })
      .catch((err) => {
        if (active) setError(`Camera access denied: ${err.message}`);
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      }
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CameraIcon size={18} className={colors.icon} weight="bold" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Camera Capture</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        <div className="relative bg-black aspect-video">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400 px-4 text-center">
              {error}
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white border-r-transparent animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready || !!error}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${colors.uploadBtn}`}
          >
            <CameraIcon size={16} weight="bold" />
            Snap Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Photo Card ──────────────────────────────────────────────────────────────

const PhotoCard = ({ photo, doc, visitId, geo, color, isReadOnly }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [uploadVisitDocument, { isLoading: isUploading }] = useUploadVisitDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  const [showCamera, setShowCamera] = useState(false);
  const colors = SECTION_COLORS[color];

  const doUpload = async (file) => {
    try {
      await uploadVisitDocument({ visitId, category: photo.category, file }).unwrap();
      dispatch(addToast({ message: `${photo.label} uploaded successfully`, type: "success" }));
    } catch (err) {
      dispatch(addToast({
        message: err?.data?.message || `Failed to upload ${photo.label}`,
        type: "error",
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await doUpload(file);
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this photo? This cannot be undone.")) return;
    try {
      await deleteDocument(doc.id).unwrap();
      dispatch(addToast({ message: "Photo removed", type: "success" }));
    } catch {
      dispatch(addToast({ message: "Failed to remove photo", type: "error" }));
    }
  };

  const busy = isUploading || isDeleting;

  return (
    <>
      {showCamera && (
        <CameraCapture
          color={color}
          onClose={() => setShowCamera(false)}
          onCapture={async (file) => {
            setShowCamera(false);
            await doUpload(file);
          }}
        />
      )}

      <div
        className={`rounded-xl border p-4 transition-all duration-200 ${
          doc
            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
            : "bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border"
        }`}
      >
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Status dot */}
          <div
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              doc ? "bg-emerald-500" : "bg-gray-200 dark:bg-slate-700"
            }`}
          >
            {doc ? (
              <CheckCircleIcon size={12} weight="fill" className="text-white" />
            ) : (
              <ImageIcon size={10} className="text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{photo.label}</p>
            {doc ? (
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-mono text-[10px] uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  {doc.format || "jpg"}
                </span>
                <span>{formatBytes(doc.bytes)}</span>
                <span className="text-gray-300 dark:text-slate-700">•</span>
                <span>
                  by <strong className="font-medium text-gray-700 dark:text-gray-200">{doc.uploadedBy?.name || "—"}</strong>
                </span>
                <span className="text-gray-300 dark:text-slate-700">•</span>
                <span>
                  {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{photo.hint}</p>
            )}
          </div>

          {/* Geo badge */}
          {photo.geoRequired && (
            <div
              title={geo ? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}` : "Geolocation unavailable"}
              className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                geo
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800/40 dark:text-green-400"
                  : "bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-800/40 dark:border-slate-700 dark:text-gray-500"
              }`}
            >
              <MapPinIcon size={11} weight="fill" />
              {geo ? `${geo.lat.toFixed(3)}, ${geo.lng.toFixed(3)}` : "No GPS"}
            </div>
          )}
        </div>

        {/* Thumbnail if uploaded */}
        {doc && (
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block mb-3">
            <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:opacity-90 transition-opacity">
              <img
                src={doc.url}
                alt={photo.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.classList.add("flex", "items-center", "justify-center");
                  e.target.parentElement.innerHTML =
                    '<span class="text-xs text-gray-400">View Photo ↗</span>';
                }}
              />
            </div>
          </a>
        )}

        {/* Action buttons */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          aria-label={`Upload ${photo.label}`}
        />

        {!isReadOnly && (
          <div className="flex gap-2 flex-wrap">
            {!doc && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${colors.uploadBtn}`}
                >
                  {isUploading ? (
                    <span className="inline-block w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadSimpleIcon size={13} weight="bold" />
                  )}
                  {isUploading ? "Uploading…" : "Upload File"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  disabled={busy}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${colors.cameraBtn}`}
                >
                  <CameraIcon size={13} weight="bold" />
                  Take Photo
                </button>
              </>
            )}

            {doc && (
              <>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  View Full Photo ↗
                </a>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                  title="Replace photo"
                >
                  <ArrowsCounterClockwiseIcon size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-100 dark:border-red-900/40 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-60"
                  title="Delete photo"
                >
                  {isDeleting ? (
                    <span className="inline-block w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon size={13} weight="bold" />
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const SitePhotoModal = ({ visit, onClose }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const dept = (currentUser?.department?.name || currentUser?.department || "").toUpperCase();
  const isReadOnly = dept === "OPERATIONS DEPARTMENT"; // Installation can always upload

  const [activeSection, setActiveSection] = useState("pre");
  const [geo, setGeo] = useState(null);
  const [geoError, setGeoError] = useState(null);

  // Fetch all existing visit photos
  const { data: documents = [], isLoading } = useGetVisitDocumentsQuery(visit.id, { skip: !visit?.id });

  // Build a lookup map by category
  const docByCategory = documents.reduce((acc, doc) => {
    acc[doc.category] = doc;
    return acc;
  }, {});

  // Attempt geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeoError(`GPS unavailable: ${err.message}`)
    );
  }, []);

  // Count total required vs uploaded
  const allPhotos = PHOTO_SECTIONS.flatMap((s) => s.photos);
  const uploadedCount = allPhotos.filter((p) => docByCategory[p.category]).length;
  const totalCount = allPhotos.length;
  const progress = Math.round((uploadedCount / totalCount) * 100);

  const currentSectionDef = PHOTO_SECTIONS.find((s) => s.id === activeSection);
  const sectionColors = SECTION_COLORS[currentSectionDef.color];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-surface w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                Site Visit Photos
              </p>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {visit.customerName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{visit.address}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <XIcon size={14} weight="bold" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {uploadedCount} of {totalCount} photos uploaded
              </span>
              {geo ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
                  <MapPinIcon size={11} weight="fill" />
                  GPS active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {geoError || "Fetching GPS…"}
                </span>
              )}
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Section Tabs ── */}
        <div className="flex border-b border-gray-200 dark:border-dark-border shrink-0 bg-white dark:bg-dark-surface">
          {PHOTO_SECTIONS.map((section) => {
            const Icon = section.icon;
            const sectionUploaded = section.photos.filter((p) => docByCategory[p.category]).length;
            const isActive = activeSection === section.id;
            const sc = SECTION_COLORS[section.color];
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2.5 text-[11px] font-semibold border-b-2 transition-all duration-150 ${
                  isActive
                    ? `${sc.tab} bg-gray-50 dark:bg-dark-bg`
                    : `border-transparent ${sc.tabInactive}`
                }`}
              >
                <Icon size={15} weight={isActive ? "fill" : "regular"} />
                <span className="hidden sm:block truncate">{section.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  sectionUploaded === section.photos.length
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : sc.badge
                }`}>
                  {sectionUploaded}/{section.photos.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Photo Content ── */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Section header */}
          <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${sectionColors.header}`}>
            {(() => {
              const Icon = currentSectionDef.icon;
              return <Icon size={18} weight="fill" className={sectionColors.icon} />;
            })()}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentSectionDef.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentSectionDef.description}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
              <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Loading photos…
            </div>
          ) : (
            <div className="space-y-3">
              {currentSectionDef.photos.map((photo) => (
                <PhotoCard
                  key={photo.category}
                  photo={photo}
                  doc={docByCategory[photo.category] || null}
                  visitId={visit.id}
                  geo={geo}
                  color={currentSectionDef.color}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All photos are stored securely on Cloudinary.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SitePhotoModal;
