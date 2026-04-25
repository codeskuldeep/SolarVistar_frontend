// src/components/ui/SitePhotoModal.jsx
import { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetVisitDocumentsQuery,
  useUploadVisitDocumentMutation,
  useDeleteDocumentMutation,
} from "../../context/api/documents";
import { useUpdateVisitLocationMutation } from "../../context/api/visitsApi";
import { addToast } from "../../context/slices/toastSlice";
import {
  XIcon,
  CameraIcon,
  MapPinIcon,
  SolarPanelIcon,
  LightningIcon,
  TrashIcon,
  PlusIcon,
  ImageIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";

// ─── Constants ───────────────────────────────────────────────────────────────

const PHOTO_SECTIONS = [
  {
    id: "pre",
    label: "Pre-Installation",
    icon: MapPinIcon,
    color: "blue",
    description: "Document the site before any work begins.",
    category: "PRE_INSTALL_SITE",
    geoRequired: true,
  },
  {
    id: "post_panels",
    label: "Solar Panels",
    icon: SolarPanelIcon,
    color: "green",
    description: "Confirm installed panels after completion.",
    category: "POST_INSTALL_PANELS",
    geoRequired: true,
  },
  {
    id: "post_inverter",
    label: "Inverter",
    icon: SolarPanelIcon,
    color: "emerald",
    description: "Show the inverter with panel/system number.",
    category: "POST_INSTALL_INVERTER",
    geoRequired: false,
  },
  {
    id: "activation",
    label: "Activation",
    icon: LightningIcon,
    color: "amber",
    description: "Capture proof of system going live.",
    category: "ACTIVATION_CONSUMER_PLANT",
    geoRequired: true,
  },
];

const SECTION_COLORS = {
  blue: {
    header: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    icon: "text-blue-600 dark:text-blue-400",
    tab: "border-blue-500 text-blue-600 dark:text-blue-400",
    tabInactive: "text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400",
    uploadBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  },
  green: {
    header: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    tab: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    tabInactive: "text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400",
    uploadBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
  emerald: {
    header: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    tab: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    tabInactive: "text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400",
    uploadBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    header: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    icon: "text-amber-600 dark:text-amber-400",
    tab: "border-amber-500 text-amber-600 dark:text-amber-400",
    tabInactive: "text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400",
    uploadBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  },
};

const formatBytes = (bytes = 0) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Camera Capture Sub-modal ─────────────────────────────────────────────────
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setReady(true); }
      })
      .catch((err) => { if (active) setError(`Camera access denied: ${err.message}`); });
    return () => { active = false; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) { onCapture(new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" })); }
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
          <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CameraIcon size={16} weight="bold" className="text-emerald-500" /> Camera Capture
          </span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <XIcon size={14} weight="bold" />
          </button>
        </div>
        <div className="relative bg-black aspect-video">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400 px-4 text-center">{error}</div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!ready && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-white border-r-transparent animate-spin" /></div>}
            </>
          )}
        </div>
        <div className="p-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button type="button" onClick={handleCapture} disabled={!ready || !!error} className="flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
            <CameraIcon size={16} weight="bold" /> Snap Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Single uploaded photo thumbnail ────────────────────────────────────────
const PhotoThumb = ({ doc, isReadOnly }) => {
  const dispatch = useDispatch();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const handleDelete = async () => {
    if (!window.confirm("Remove this photo? This cannot be undone.")) return;
    try {
      await deleteDocument(doc.id).unwrap();
      dispatch(addToast({ message: "Photo removed", type: "success" }));
    } catch {
      dispatch(addToast({ message: "Failed to remove photo", type: "error" }));
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 aspect-square">
      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        <img
          src={doc.url}
          alt={doc.category}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-xs text-gray-400">View ↗</div>';
          }}
        />
      </a>
      {/* Overlay info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 translate-y-full group-hover:translate-y-0 transition-transform duration-150 flex items-center justify-between">
        <span>{formatBytes(doc.bytes)} · {doc.uploadedBy?.name || "—"}</span>
        {!isReadOnly && (
          <button
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={isDeleting}
            className="ml-2 p-0.5 rounded bg-red-600/80 hover:bg-red-700 text-white disabled:opacity-60 transition-colors"
            title="Delete photo"
          >
            {isDeleting ? <span className="inline-block w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" /> : <TrashIcon size={11} weight="bold" />}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Reverse-geocode coordinates to a human-readable address ─────────────────
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

// ─── Category Section Panel ──────────────────────────────────────────────────
const CategorySection = ({ section, docs, visitId, onRequestLocation, locationLabel, isReadOnly }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadVisitDocument, { isLoading: isUploading }] = useUploadVisitDocumentMutation();
  const colors = SECTION_COLORS[section.color];
  const Icon = section.icon;

  const doUpload = async (file) => {
    // Trigger location capture on first upload action if not yet captured
    await onRequestLocation();
    try {
      await uploadVisitDocument({ visitId, category: section.category, file }).unwrap();
      dispatch(addToast({ message: "Photo uploaded successfully", type: "success" }));
    } catch (err) {
      dispatch(addToast({ message: err?.data?.message || "Failed to upload photo", type: "error" }));
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    for (const file of files) await doUpload(file);
  };

  const handleCameraClick = async () => {
    await onRequestLocation();
    setShowCamera(true);
  };

  return (
    <>
      {showCamera && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onCapture={async (file) => { setShowCamera(false); await doUpload(file); }}
        />
      )}
      <div className={`rounded-xl border p-4 ${colors.header}`}>
        {/* Section Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Icon size={18} weight="fill" className={colors.icon} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{section.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {section.geoRequired && locationLabel && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800/40 dark:text-green-400 max-w-[140px] truncate" title={locationLabel}>
                <MapPinIcon size={11} weight="fill" className="shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </span>
            )}
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
              {docs.length} photo{docs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Photo Grid */}
        {docs.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {docs.map((doc) => (
              <PhotoThumb key={doc.id} doc={doc} isReadOnly={isReadOnly} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {docs.length === 0 && (
          <div className="flex items-center gap-2 py-3 mb-3 text-xs text-gray-400 dark:text-gray-500">
            <ImageIcon size={16} />
            No photos yet — add as many as needed.
          </div>
        )}

        {/* Upload buttons */}
        {!isReadOnly && (
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${colors.uploadBtn}`}
            >
              {isUploading
                ? <span className="inline-block w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" />
                : <PlusIcon size={13} weight="bold" />
              }
              {isUploading ? "Uploading…" : "Add Photos"}
            </button>
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isUploading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <CameraIcon size={13} weight="bold" />
              Camera
            </button>
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
  const isReadOnly = dept === "OPERATIONS DEPARTMENT";

  const [activeSection, setActiveSection] = useState("pre");
  // Seed from DB — if visit already has a saved location, use it immediately
  const [locationLabel, setLocationLabel] = useState(visit.siteLocation || null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const locationSavedRef = useRef(!!visit.siteLocation); // already in DB?

  const [updateVisitLocation] = useUpdateVisitLocationMutation();
  const { data: documents = [], isLoading } = useGetVisitDocumentsQuery(visit.id, { skip: !visit?.id });

  // Group docs by category
  const docsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const totalPhotos = documents.length;

  // Capture GPS + reverse-geocode + save to DB
  // force=false → only saves if not already in DB
  // force=true  → overwrites (user clicked "Update Location")
  const captureAndSaveLocation = useCallback(async (force = false) => {
    if (!navigator.geolocation) return;
    if (locationSavedRef.current && !force) return; // already persisted, skip

    setIsCapturingLocation(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            setLocationLabel(label);
            await updateVisitLocation({ id: visit.id, siteLocation: label, force }).unwrap();
            locationSavedRef.current = true;
          } catch {
            // silently ignore save errors — UI still shows the label
          } finally {
            setIsCapturingLocation(false);
            resolve();
          }
        },
        () => { setIsCapturingLocation(false); resolve(); }
      );
    });
  }, [visit.id, updateVisitLocation]);

  // Called by CategorySection before any upload
  const handleRequestLocation = useCallback(() => captureAndSaveLocation(false), [captureAndSaveLocation]);

  const currentSection = PHOTO_SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">Site Visit Photos</p>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{visit.customerName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{visit.address}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-gray-200">{totalPhotos}</strong> photo{totalPhotos !== 1 ? "s" : ""} total
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XIcon size={14} weight="bold" />
              </button>
            </div>
          </div>

          {/* Site Location strip */}
          <div className="mt-2 flex items-start gap-2">
            <MapPinIcon size={11} weight="fill" className={`mt-0.5 shrink-0 ${locationLabel ? "text-green-500" : "text-gray-400"}`} />
            {locationLabel ? (
              <span className="text-[11px] text-green-600 dark:text-green-400 leading-snug flex-1">{locationLabel}</span>
            ) : (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                Location will be captured when you upload the first photo.
              </span>
            )}
            {/* Update Location button — only shown when location is already set */}
            {locationLabel && !isReadOnly && (
              <button
                type="button"
                onClick={() => captureAndSaveLocation(true)}
                disabled={isCapturingLocation}
                title="Re-capture and update site location"
                className="ml-1 shrink-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:border-emerald-300 dark:hover:text-emerald-400 dark:hover:border-emerald-700 transition-colors disabled:opacity-60"
              >
                {isCapturingLocation
                  ? <span className="inline-block w-2.5 h-2.5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  : <ArrowCounterClockwiseIcon size={10} weight="bold" />
                }
                Update
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-border shrink-0 bg-white dark:bg-dark-surface overflow-x-auto">
          {PHOTO_SECTIONS.map((section) => {
            const Icon = section.icon;
            const count = (docsByCategory[section.category] || []).length;
            const isActive = activeSection === section.id;
            const sc = SECTION_COLORS[section.color];
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 min-w-[80px] flex flex-col items-center gap-0.5 px-2 py-2.5 text-[11px] font-semibold border-b-2 transition-all duration-150 ${
                  isActive ? `${sc.tab} bg-gray-50 dark:bg-dark-bg` : `border-transparent ${sc.tabInactive}`
                }`}
              >
                <Icon size={15} weight={isActive ? "fill" : "regular"} />
                <span className="hidden sm:block truncate max-w-[80px]">{section.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${sc.badge}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
              <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Loading photos…
            </div>
          ) : (
            <CategorySection
              section={currentSection}
              docs={docsByCategory[currentSection.category] || []}
              visitId={visit.id}
              onRequestLocation={handleRequestLocation}
              locationLabel={locationLabel}
              isReadOnly={isReadOnly}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">All photos stored securely on Cloudinary.</p>
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
