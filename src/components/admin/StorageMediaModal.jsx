"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconX,
  IconFolder,
  IconSearch,
  IconRefresh,
  IconUpload,
  IconCheck,
  IconEye,
  IconPhoto,
  IconCopy,
  IconLoader2,
  IconStar,
} from "@tabler/icons-react";

const PRESET_SOURCES = [
  { id: "cat-root", label: "Category Images", bucket: "CategoryImages", folder: "" },
  { id: "prod-wallbeds-1k", label: "Wall Beds (1K)", bucket: "ProductImages", folder: "wallbeds/1K" },
  { id: "prod-wallbeds-2k", label: "Wall Beds (2K)", bucket: "ProductImages", folder: "wallbeds/2K" },
  { id: "prod-cabinets", label: "Cabinets", bucket: "ProductImages", folder: "cabinets" },
  { id: "prod-mattresses", label: "Mattresses", bucket: "ProductImages", folder: "mattresses" },
  { id: "prod-sofas", label: "Sofas", bucket: "ProductImages", folder: "sofas" },
  { id: "prod-tables", label: "Tables", bucket: "ProductImages", folder: "tables" },
];

export function StorageMediaModal({
  isOpen,
  onClose,
  onSelect,
  selectedUrl = "",
  initialBucket = "CategoryImages",
  initialFolder = "",
  title = "Supabase Media Library",
}) {
  const [activeBucket, setActiveBucket] = useState(initialBucket);
  const [activeFolder, setActiveFolder] = useState(initialFolder);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(selectedUrl);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveBucket(initialBucket);
      setActiveFolder(initialFolder);
      setSelectedFileUrl(selectedUrl);
      loadFiles(initialBucket, initialFolder, "");
    }
  }, [isOpen, initialBucket, initialFolder, selectedUrl]);

  const loadFiles = async (bucket = activeBucket, folder = activeFolder, searchTerm = search) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ bucket });
      if (folder) {
        query.set("folder", folder);
      } else {
        query.set("folder", "root");
      }
      if (searchTerm && searchTerm.trim()) {
        query.set("search", searchTerm.trim());
      }
      const res = await fetch(`/api/admin/storage?${query.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.warn("StorageMediaModal load error:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setActiveBucket(preset.bucket);
    setActiveFolder(preset.folder);
    loadFiles(preset.bucket, preset.folder, search);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    loadFiles(activeBucket, activeFolder, search);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", activeBucket);
      formData.append("folder", activeFolder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setNotice({
          type: "success",
          text: `Uploaded "${data.fileName}" to ${activeBucket}!`,
        });
        setSelectedFileUrl(data.url);
        if (onSelect) {
          onSelect(data.url, { name: data.fileName, url: data.url });
        }
        loadFiles(activeBucket, activeFolder, search);
      } else {
        setNotice({
          type: "error",
          text: data.error || "Failed to upload file.",
        });
      }
    } catch (err) {
      setNotice({
        type: "error",
        text: "Network error during upload.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChoose = (file) => {
    setSelectedFileUrl(file.url);
    if (onSelect) {
      onSelect(file.url, file);
    }
    setNotice({
      type: "success",
      text: `Selected "${file.name}"`,
    });
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-white shadow-2xl flex flex-col font-poppins border border-wbk-lightgrey z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-wbk-gold/20 flex items-center justify-center text-wbk-gold">
              <IconPhoto size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-wbk-gold">
                {title}
              </h3>
              <p className="text-[11px] text-white/70">
                Browse, select, or upload images directly to Supabase CDN Storage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            className={`px-4 py-2 text-xs flex items-center justify-between shrink-0 ${
              notice.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <IconCheck size={16} />
              <span className="font-medium">{notice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-white/80 hover:text-white cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Toolbar: Source Preset Tabs + Search + Upload */}
        <div className="p-3 bg-[#F8F6F4] border-b border-wbk-lightgrey flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Preset Folder Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <span className="text-[11px] font-semibold text-wbk-brown mr-1 flex items-center gap-1">
              <IconFolder size={14} className="text-wbk-gold" />
              <span>Location:</span>
            </span>

            {PRESET_SOURCES.map((preset) => {
              const isSelected =
                activeBucket === preset.bucket && activeFolder === preset.folder;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 text-xs rounded-none transition-all cursor-pointer font-medium border ${
                    isSelected
                      ? "bg-[#090A0A] text-white border-[#090A0A] shadow-xs"
                      : "bg-white text-wbk-black hover:bg-[#EAE7E4] border-wbk-lightgrey/80"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => loadFiles(activeBucket, activeFolder, search)}
              title="Refresh files list"
              className="p-1.5 text-wbk-brown hover:text-wbk-black bg-white hover:bg-[#EAE7E4] border border-wbk-lightgrey cursor-pointer transition-colors"
            >
              <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search Bar & Upload */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-60">
              <IconSearch size={14} className="absolute left-2.5 top-2.5 text-wbk-brown" />
              <input
                type="text"
                placeholder="Search file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-wbk-lightgrey focus:outline-none focus:border-wbk-black"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    loadFiles(activeBucket, activeFolder, "");
                  }}
                  className="absolute right-2 top-2 text-wbk-brown hover:text-wbk-black"
                >
                  <IconX size={13} />
                </button>
              )}
            </form>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadFile}
              accept="image/webp,image/png,image/jpeg,image/avif"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold rounded-none cursor-pointer shadow-xs disabled:opacity-50 shrink-0 transition-colors"
              title={`Upload image directly to ${activeBucket}${activeFolder ? "/" + activeFolder : ""}`}
            >
              {uploading ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconUpload size={14} />
              )}
              <span>{uploading ? "Uploading..." : "Upload New"}</span>
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F8]">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-wbk-brown">
              <IconRefresh size={28} className="animate-spin text-wbk-gold" />
              <span className="text-xs">Loading media from Supabase Storage...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-wbk-brown">
              <IconPhoto size={36} className="text-wbk-lightgrey" />
              <p className="text-xs font-medium">
                No images found in &quot;{activeBucket}{activeFolder ? "/" + activeFolder : ""}&quot;.
              </p>
              <p className="text-[11px] text-wbk-brown/70">
                Upload images into this folder or switch to another folder tab above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {files.map((file) => {
                const isSelected = selectedFileUrl === file.url;

                return (
                  <div
                    key={file.path || file.url}
                    className={`group bg-white border overflow-hidden flex flex-col justify-between shadow-2xs transition-all ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-600/30"
                        : "border-wbk-lightgrey/80 hover:border-wbk-black"
                    }`}
                  >
                    {/* Thumbnail / Preview Area */}
                    <div
                      onClick={() => handleChoose(file)}
                      className="relative aspect-[4/3] bg-[#F4F2F0] p-1 flex items-center justify-center overflow-hidden cursor-pointer"
                      title={`Click to select "${file.name}"`}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none shadow-xs flex items-center gap-1">
                          <IconCheck size={11} stroke={3} />
                          <span>Selected</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-2.5 py-1 bg-white text-wbk-black font-semibold text-[10px] shadow uppercase tracking-wider">
                          Select Image
                        </span>
                      </div>

                      {/* Large Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(file.url);
                        }}
                        title="Preview large image"
                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-white text-wbk-black rounded shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      >
                        <IconEye size={13} />
                      </button>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-2 bg-white space-y-1.5 border-t border-wbk-lightgrey/40">
                      <div className="text-[10px] font-mono text-wbk-black truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-wbk-brown">
                        <span>{file.size ? `${Math.round(file.size / 1024)} KB` : ""}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(file.url)}
                          className="hover:text-wbk-black cursor-pointer underline"
                          title="Copy direct URL"
                        >
                          {copiedUrl === file.url ? "Copied!" : "Copy URL"}
                        </button>
                      </div>

                      {/* Select Button */}
                      <button
                        type="button"
                        onClick={() => handleChoose(file)}
                        className={`w-full py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-[#F4F2F0] hover:bg-wbk-gold hover:text-wbk-black text-wbk-black"
                        }`}
                      >
                        {isSelected ? "✓ Chosen" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8F6F4] border-t border-wbk-lightgrey flex items-center justify-between shrink-0">
          <div className="text-[11px] text-wbk-brown">
            Bucket: <strong>{activeBucket}</strong>
            {activeFolder ? ` / ${activeFolder}` : " (root)"} • {files.length} images found
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Large Image Lightbox Preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white p-2 border border-white/20">
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center shadow-md font-bold cursor-pointer"
            >
              ✕
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
