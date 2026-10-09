"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  IconX,
  IconDeviceFloppy,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconTag,
  IconPlus,
  IconWorld,
  IconUpload,
  IconPhoto,
  IconTrash,
  IconEye,
  IconStar,
  IconChevronLeft,
  IconChevronRight,
  IconLink,
  IconCopy,
  IconFolder,
  IconSearch,
  IconSparkles,
  IconDatabase,
  IconCloudUpload,
  IconFilter,
  IconTarget,
  IconFileText,
  IconExternalLink,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { TagIcon } from "@/components/ui/TagBadge";
import { parseYouTubeVideo, OFFICIAL_INSTALLATION_VIDEOS } from "@/lib/products";

const TARGET_LOCALES = [
  { code: "en", label: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP (£)" },
  { code: "us", label: "US", name: "United States", flag: "🇺🇸", currency: "USD ($)" },
  { code: "de", label: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR (€)" },
  { code: "fr", label: "FR", name: "France", flag: "🇫🇷", currency: "EUR (€)" },
  { code: "es", label: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR (€)" },
  { code: "por", label: "POR", name: "Portugal", flag: "🇵🇹", currency: "EUR (€)" },
  { code: "it", label: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR (€)" },
];

export function ProductEditDrawer({ product, isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [notifyRestock, setNotifyRestock] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [isQuickTagOpen, setIsQuickTagOpen] = useState(false);
  const [quickTagName, setQuickTagName] = useState("");
  const [quickTagColor, setQuickTagColor] = useState("#D4AF37");
  const [descLocaleTab, setDescLocaleTab] = useState("en");

  // Installation Manual states
  const [manualsList, setManualsList] = useState([]);
  const [uploadingManual, setUploadingManual] = useState(false);
  const [manualFeedback, setManualFeedback] = useState(null);
  const manualFileRef = useRef(null);

  // Image upload and gallery management states
  const [uploadFolder, setUploadFolder] = useState("wallbeds/1K");
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [isAddUrlOpen, setIsAddUrlOpen] = useState(false);
  const [customGalleryUrl, setCustomGalleryUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [galleryFeedback, setGalleryFeedback] = useState(null);

  // Storage Browser & Prefix Matching states
  const [availablePrefixes, setAvailablePrefixes] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const [matchSummary, setMatchSummary] = useState(null);
  const [checkingMatch, setCheckingMatch] = useState(false);
  const [applyingMatch, setApplyingMatch] = useState(false);

  // Storage Media Library Modal
  const [isStorageBrowserOpen, setIsStorageBrowserOpen] = useState(false);
  const [browserTarget, setBrowserTarget] = useState(null); // null | 'image' | 'hover_image' | 'gallery'
  const [availableFolders, setAvailableFolders] = useState([
    "wallbeds/1K",
    "wallbeds/2K",
    "mattresses",
    "sofas",
    "tables",
    "cabinets",
  ]);
  const [browserFolder, setBrowserFolder] = useState("wallbeds/1K");
  const [browserFiles, setBrowserFiles] = useState([]);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserSearch, setBrowserSearch] = useState("");
  const [browserUploading, setBrowserUploading] = useState(false);
  const [browserNotice, setBrowserNotice] = useState(null);

  const primaryFileRef = useRef(null);
  const hoverFileRef = useRef(null);
  const galleryFileRef = useRef(null);
  const browserFileRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.categories)) setCategoriesList(d.categories);
      })
      .catch((e) => console.warn(e));

    fetch("/api/admin/tags")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.tags)) setTagsList(d.tags);
      })
      .catch((e) => console.warn(e));

    // Load available prefixes from Supabase storage
    fetch("/api/admin/storage?prefixes=true")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.prefixes)) setAvailablePrefixes(d.prefixes);
      })
      .catch((e) => console.warn(e));

    // Dynamically load available folders from Supabase storage
    fetch("/api/admin/storage?folders=true")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.folders) && d.folders.length > 0) {
          setAvailableFolders(d.folders);
        }
      })
      .catch((e) => console.warn(e));

    // Load available installation manuals from Supabase storage (SupportFiles/InstallationManuals)
    fetch("/api/admin/storage?manuals=true")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.manuals)) {
          setManualsList(d.manuals);
        }
      })
      .catch((e) => console.warn("Failed to load manuals:", e));
  }, []);

  const checkPrefixMatch = async (prefix) => {
    if (!prefix) {
      setMatchSummary(null);
      return;
    }
    setCheckingMatch(true);
    try {
      const res = await fetch(`/api/admin/storage?matchPrefix=${encodeURIComponent(prefix)}`);
      const data = await res.json();
      if (data.success && data.matched && (data.matched.total1K > 0 || data.matched.total2K > 0)) {
        setMatchSummary(data.matched);
      } else {
        setMatchSummary(null);
      }
    } catch (err) {
      console.warn("Error checking prefix match:", err);
      setMatchSummary(null);
    } finally {
      setCheckingMatch(false);
    }
  };

  useEffect(() => {
    if (product) {
      const defaultLocales = ["en", "us", "de", "fr", "es", "por", "it"];
      const baseName = product.name || product.title || "";
      const masterEan = product.ean || "";
      const mainImage = product.image || "";
      const hoverImage = product.hover_image || product.hoverImage || "";
      const gallery = Array.isArray(product.product_images) && product.product_images.length > 0
        ? product.product_images
        : mainImage
        ? [mainImage]
        : [];

      setFormData({
        ...product,
        image: mainImage,
        hover_image: hoverImage,
        product_images: gallery,
        name_en: product.name_en ?? baseName,
        name_us: product.name_us ?? baseName,
        name_de: product.name_de ?? baseName,
        name_fr: product.name_fr ?? baseName,
        name_es: product.name_es ?? baseName,
        name_por: product.name_por ?? product.name_pt ?? baseName,
        name_it: product.name_it ?? baseName,

        gtin_en: product.gtin_en ?? product.ean_uk ?? masterEan,
        gtin_us: product.gtin_us ?? product.ean_us ?? masterEan,
        gtin_de: product.gtin_de ?? product.ean_de ?? masterEan,
        gtin_fr: product.gtin_fr ?? product.ean_fr ?? masterEan,
        gtin_es: product.gtin_es ?? product.ean_es ?? masterEan,
        gtin_por: product.gtin_por ?? product.gtin_pt ?? product.ean_pt ?? masterEan,
        gtin_it: product.gtin_it ?? product.ean_it ?? masterEan,

        description_en: product.description_en ?? product.description ?? "",
        description_us: product.description_us ?? product.description_en ?? product.description ?? "",
        description_de: product.description_de ?? product.description ?? "",
        description_fr: product.description_fr ?? product.description ?? "",
        description_es: product.description_es ?? product.description ?? "",
        description_por: product.description_por ?? product.description_pt ?? product.description ?? "",
        description_it: product.description_it ?? product.description ?? "",

        extended_description_en: product.extended_description_en ?? product.extended_description ?? "",
        extended_description_us: product.extended_description_us ?? product.extended_description_en ?? product.extended_description ?? "",
        extended_description_de: product.extended_description_de ?? "",
        extended_description_fr: product.extended_description_fr ?? "",
        extended_description_es: product.extended_description_es ?? "",
        extended_description_por: product.extended_description_por ?? product.extended_description_pt ?? "",
        extended_description_it: product.extended_description_it ?? "",

        tags: Array.isArray(product.tags) ? product.tags : [],
        available_locales:
          Array.isArray(product.available_locales) && product.available_locales.length > 0
            ? product.available_locales
            : defaultLocales,
        installation_manual: product.installation_manual || "",
      });

      // Calculate candidate Morphy prefix from dimensions and type/orientation
      const w = product.width ? Math.round(Number(product.width) / 10) : null;
      const l = product.length ? Math.round(Number(product.length) / 10) : null;
      let sizePart = (w && l) ? `${w}x${l}` : "";
      const typeCode = (product.type === "Integrated") ? "I" : (product.type === "Studio") ? "S" : "C";
      const orientCode = (product.orientation === "Horizontal") ? "H" : "V";
      const guessedPrefix = sizePart ? `${sizePart}-${typeCode}${orientCode}-MORPHY` : "";

      setSelectedPrefix(guessedPrefix);
      if (guessedPrefix) {
        checkPrefixMatch(guessedPrefix);
      } else {
        setMatchSummary(null);
      }

      // If product was out of stock, default notifyRestock to true
      setNotifyRestock(Number(product.stock ?? 0) <= 0);
    }
  }, [product]);

  const handleCopyBaseNameToAll = () => {
    const baseName = formData?.name || "";
    if (!baseName) return;
    setFormData((prev) => ({
      ...prev,
      name_en: baseName,
      name_us: baseName,
      name_de: baseName,
      name_fr: baseName,
      name_es: baseName,
      name_por: baseName,
      name_it: baseName,
    }));
  };

  const handleCopyBaseDescToAll = () => {
    const baseDesc = formData?.description_en || formData?.description || "";
    if (!baseDesc) return;
    setFormData((prev) => ({
      ...prev,
      description_en: baseDesc,
      description_us: baseDesc,
      description_de: baseDesc,
      description_fr: baseDesc,
      description_es: baseDesc,
      description_por: baseDesc,
      description_it: baseDesc,
    }));
  };

  const handleCopyMasterGtinToAll = () => {
    const master = formData?.ean || formData?.gtin_en || "";
    if (!master) return;
    setFormData((prev) => ({
      ...prev,
      gtin_en: master,
      gtin_us: master,
      gtin_de: master,
      gtin_fr: master,
      gtin_es: master,
      gtin_por: master,
      gtin_it: master,
    }));
  };

  const toggleLocale = (code) => {
    const current = Array.isArray(formData?.available_locales)
      ? [...formData.available_locales]
      : ["en", "us", "de", "fr", "es", "por", "it"];
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    handleChange("available_locales", next);
  };

  const selectAllLocales = () => {
    handleChange("available_locales", ["en", "us", "de", "fr", "es", "por", "it"]);
  };

  const clearAllLocales = () => {
    handleChange("available_locales", []);
  };

  const toggleTag = (tagId) => {
    const currentTags = Array.isArray(formData?.tags) ? [...formData.tags] : [];
    const exists = currentTags.includes(tagId);
    const newTags = exists
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];
    handleChange("tags", newTags);
  };

  const handleCreateQuickTag = async (e) => {
    e.preventDefault();
    if (!quickTagName.trim()) return;
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: quickTagName.trim(), color: quickTagColor }),
      });
      const data = await res.json();
      if (data.success && data.tag) {
        setTagsList((prev) => [...prev, data.tag]);
        toggleTag(data.tag.id);
        setQuickTagName("");
        setIsQuickTagOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? null : value,
    }));
  };

  const handleNumberChange = (field, value) => {
    const parsed = value === "" ? null : Number(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? null : parsed,
    }));
  };

  const handleUploadSingle = async (file, field, defaultSubfolder = "1K") => {
    if (!file) return;
    const isPrimary = field === "image";
    if (isPrimary) setUploadingPrimary(true);
    else setUploadingHover(true);

    try {
      const data = new FormData();
      data.append("file", file);
      const folderPath = uploadFolder || `wallbeds/${defaultSubfolder}`;
      data.append("folder", folderPath);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success && result.url) {
        handleChange(field, result.url);
      } else {
        alert(result.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("[Upload Error]:", err);
      alert("Network error while uploading image.");
    } finally {
      if (isPrimary) setUploadingPrimary(false);
      else setUploadingHover(false);
    }
  };

  const handleUploadManual = async (file) => {
    if (!file) return;
    setUploadingManual(true);
    setManualFeedback(null);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("bucket", "SupportFiles");
      data.append("folder", "InstallationManuals");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to upload manual PDF");
      }

      handleChange("installation_manual", result.url);
      setManualFeedback(`✓ Successfully uploaded: ${result.fileName}`);
      setManualsList((prev) => {
        if (prev.some((m) => m.url === result.url)) return prev;
        return [{ name: result.fileName, url: result.url, path: result.path, size: result.size || file.size }, ...prev];
      });
    } catch (err) {
      console.error("[Manual Upload Error]:", err);
      setManualFeedback(`✗ Upload failed: ${err.message}`);
    } finally {
      setUploadingManual(false);
    }
  };

  const handleUploadGalleryFiles = async (files, defaultSubfolder = "2K") => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    const targetFolder = uploadFolder === "wallbeds/1K" ? "wallbeds/2K" : (uploadFolder || `wallbeds/${defaultSubfolder}`);
    const newUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setGalleryUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        data.append("folder", targetFolder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.success && result.url) {
          newUrls.push(result.url);
        }
      }

      if (newUrls.length > 0) {
        const currentGallery = Array.isArray(formData?.product_images)
          ? [...formData.product_images]
          : [];
        handleChange("product_images", [...currentGallery, ...newUrls]);
      }
    } catch (err) {
      console.error("[Gallery Upload Error]:", err);
      alert("Error while uploading gallery files.");
    } finally {
      setUploadingGallery(false);
      setGalleryUploadProgress(null);
    }
  };

  const handleRemoveGalleryItem = (indexToRemove, e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    let removedUrl = null;
    let remainingCount = 0;

    setFormData((prev) => {
      if (!prev) return prev;
      let current = [];
      if (Array.isArray(prev.product_images)) {
        current = [...prev.product_images];
      } else if (typeof prev.product_images === "string" && prev.product_images.trim()) {
        try {
          const parsed = JSON.parse(prev.product_images);
          current = Array.isArray(parsed) ? parsed : [prev.product_images];
        } catch {
          current = [prev.product_images];
        }
      }

      removedUrl = current[indexToRemove];
      const updated = current.filter((_, i) => i !== indexToRemove);
      remainingCount = updated.length;

      const next = {
        ...prev,
        product_images: updated,
      };

      // If removed item was also set as primary or hover image, update gracefully
      if (removedUrl && prev.image === removedUrl) {
        next.image = updated[0] || "";
      }
      if (removedUrl && prev.hover_image === removedUrl) {
        next.hover_image = updated[1] || updated[0] || "";
      }

      return next;
    });

    const msg = `Photo removed from gallery (${remainingCount} remaining). Don't forget to save changes!`;
    setGalleryFeedback(msg);
    setMessage({
      type: "success",
      text: msg,
    });
    setTimeout(() => {
      setGalleryFeedback(null);
      setMessage(null);
    }, 4500);
  };

  const handleClearAllGallery = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!window.confirm("Are you sure you want to remove all images from this product's gallery?")) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      product_images: [],
    }));
    const msg = "All gallery photos removed. Click 'Save to Supabase' or 'Save Now' to persist.";
    setGalleryFeedback(msg);
    setMessage({
      type: "success",
      text: msg,
    });
    setTimeout(() => {
      setGalleryFeedback(null);
      setMessage(null);
    }, 4500);
  };

  const handleMoveGalleryItem = (fromIndex, toIndex) => {
    const current = Array.isArray(formData?.product_images) ? [...formData.product_images] : [];
    if (toIndex < 0 || toIndex >= current.length) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    handleChange("product_images", current);
  };

  const handleAddCustomGalleryUrl = (e) => {
    e?.preventDefault();
    if (!customGalleryUrl.trim()) return;
    const current = Array.isArray(formData?.product_images) ? [...formData.product_images] : [];
    handleChange("product_images", [...current, customGalleryUrl.trim()]);
    setCustomGalleryUrl("");
    setIsAddUrlOpen(false);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleApplyMatchedImages = () => {
    if (!matchSummary) return;
    setApplyingMatch(true);

    if (matchSummary.primaryUrl) {
      handleChange("image", matchSummary.primaryUrl);
    }
    if (matchSummary.hoverUrl) {
      handleChange("hover_image", matchSummary.hoverUrl);
    }
    if (Array.isArray(matchSummary.galleryUrls) && matchSummary.galleryUrls.length > 0) {
      handleChange("product_images", matchSummary.galleryUrls);
    }

    setMessage({
      type: "success",
      text: `✓ Applied ${matchSummary.total1K + matchSummary.total2K} photos from Supabase Storage (${matchSummary.prefix})!`,
    });
    setTimeout(() => setMessage(null), 3500);
    setApplyingMatch(false);
  };

  const loadAvailableFolders = async (forceRefresh = false) => {
    try {
      const res = await fetch(`/api/admin/storage?folders=true${forceRefresh ? "&refresh=true" : ""}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.folders) && data.folders.length > 0) {
        setAvailableFolders(data.folders);
      }
    } catch (err) {
      console.warn("Folders fetch error:", err);
    }
  };

  const handleOpenBrowserFor = (target = null) => {
    setBrowserTarget(target);
    setBrowserNotice(null);

    // Smart default folder based on product category & target
    const cat = (formData?.parent_category || product?.parent_category || formData?.category || product?.category || "").toLowerCase();
    let initialFolder = browserFolder;
    if (cat.includes("mattress")) {
      initialFolder = "mattresses";
    } else if (cat.includes("sofa")) {
      initialFolder = "sofas";
    } else if (cat.includes("table")) {
      initialFolder = "tables";
    } else if (cat.includes("cabinet")) {
      initialFolder = "cabinets";
    } else if (cat.includes("bed")) {
      initialFolder = target === "gallery" ? "wallbeds/2K" : "wallbeds/1K";
    }

    setBrowserFolder(initialFolder);
    setIsStorageBrowserOpen(true);
    loadStorageBrowserFiles(initialFolder, browserSearch);
    loadAvailableFolders();
  };

  const handleAssignImage = (target, url, filename = "") => {
    if (!target || !url) return;
    const displayName = filename || url.split("/").pop() || "image";

    if (target === "image") {
      handleChange("image", url);
      const msg = `✓ Set as Primary Image: ${displayName}`;
      setBrowserNotice(msg);
      setMessage({ type: "success", text: msg });
    } else if (target === "hover_image") {
      handleChange("hover_image", url);
      const msg = `✓ Set as Hover Image: ${displayName}`;
      setBrowserNotice(msg);
      setMessage({ type: "success", text: msg });
    } else if (target === "gallery") {
      const current = Array.isArray(formData?.product_images) ? [...formData.product_images] : [];
      if (!current.includes(url)) {
        handleChange("product_images", [...current, url]);
        const msg = `✓ Added to Gallery: ${displayName}`;
        setBrowserNotice(msg);
        setMessage({ type: "success", text: msg });
      } else {
        const next = current.filter((u) => u !== url);
        handleChange("product_images", next);
        const msg = `Removed from Gallery: ${displayName}`;
        setBrowserNotice(msg);
        setMessage({ type: "success", text: msg });
      }
    }

    setTimeout(() => {
      setBrowserNotice(null);
      setMessage(null);
    }, 3500);
  };

  const loadStorageBrowserFiles = async (folder = browserFolder, search = browserSearch) => {
    setBrowserLoading(true);
    try {
      const query = new URLSearchParams({ folder });
      if (search && search.trim()) query.set("search", search.trim());
      const res = await fetch(`/api/admin/storage?${query.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setBrowserFiles(data.files);
        if (Array.isArray(data.availableFolders) && data.availableFolders.length > 0) {
          setAvailableFolders(data.availableFolders);
        }
      } else {
        setBrowserFiles([]);
      }
    } catch (err) {
      console.warn("Storage browser fetch error:", err);
      setBrowserFiles([]);
    } finally {
      setBrowserLoading(false);
    }
  };

  useEffect(() => {
    if (isStorageBrowserOpen) {
      loadStorageBrowserFiles(browserFolder, browserSearch);
    }
  }, [isStorageBrowserOpen, browserFolder]);

  const handleBrowserSearchSubmit = (e) => {
    e?.preventDefault();
    loadStorageBrowserFiles(browserFolder, browserSearch);
  };

  const handleBrowserUpload = async (file) => {
    if (!file) return;
    setBrowserUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", browserFolder);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        loadStorageBrowserFiles(browserFolder, browserSearch);
      } else {
        alert(result.error || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while uploading.");
    } finally {
      setBrowserUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        notifyRestock: Boolean(notifyRestock),
      };

      const res = await fetch(`/api/admin/products/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const restockNote =
          data.restockNotifiedCount > 0
            ? ` (${data.restockNotifiedCount} waitlist customer(s) notified via email!)`
            : "";
        setMessage({
          type: "success",
          text: `Product saved successfully!${restockNote}`,
        });
        onSaveSuccess?.(data.product || formData);
        setTimeout(
          () => {
            setMessage(null);
            onClose();
          },
          data.restockNotifiedCount > 0 ? 2500 : 1200
        );
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save product." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-50 flex flex-col font-poppins overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-wbk-gold uppercase tracking-wider">
                ID: #{formData.id}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white uppercase font-medium">
                {formData.parent_category || "beds"}
              </span>
            </div>
            <h2 className="font-poppins text-lg text-white font-semibold truncate max-w-md mt-0.5">
              {formData.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Status banner */}
        {message && (
          <div
            className={`p-3 text-xs font-medium flex items-center gap-2 border-b shrink-0 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <IconCheck size={16} />
            ) : (
              <IconAlertCircle size={16} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          id="productEditForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#FBF9F8]"
        >
          {/* Section 1: Basic Information */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  SEO Slug (URL identifier)
                </label>
                <input
                  type="text"
                  value={formData.slug || ""}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MORPHY-V-D"
                  value={formData.sku || ""}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono font-medium"
                />
              </div>

              {/* Country-Specific Localized Product Names */}
              <div className="md:col-span-2 p-3.5 bg-[#FAF9F7] border border-wbk-lightgrey/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-wbk-black uppercase tracking-wider block">
                      Localized Product Names (Country Specific)
                    </span>
                    <span className="text-[10px] text-wbk-brown">
                      Individual title override for each regional storefront. Takes 100% priority over general translations.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBaseNameToAll}
                    className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-white hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-lightgrey transition-colors rounded-none shadow-2xs cursor-pointer"
                  >
                    Copy base name to all
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇬🇧</span>
                      <span>UK / English (EN)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Product name in English"
                      value={formData.name_en || ""}
                      onChange={(e) => handleChange("name_en", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇺🇸</span>
                      <span>United States (US)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Product name in US English"
                      value={formData.name_us || ""}
                      onChange={(e) => handleChange("name_us", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇩🇪</span>
                      <span>Germany / Deutsch (DE)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Deutscher Produktname"
                      value={formData.name_de || ""}
                      onChange={(e) => handleChange("name_de", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇫🇷</span>
                      <span>France / Français (FR)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nom du produit en français"
                      value={formData.name_fr || ""}
                      onChange={(e) => handleChange("name_fr", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇪🇸</span>
                      <span>Spain / Español (ES)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del producto en español"
                      value={formData.name_es || ""}
                      onChange={(e) => handleChange("name_es", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇵🇹</span>
                      <span>Portugal / Português (POR)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do produto em português"
                      value={formData.name_por || ""}
                      onChange={(e) => {
                        handleChange("name_por", e.target.value);
                        handleChange("name_pt", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                      <span className="text-sm">🇮🇹</span>
                      <span>Italy / Italiano (IT)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nome del prodotto in italiano"
                      value={formData.name_it || ""}
                      onChange={(e) => handleChange("name_it", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Country-Specific GTIN Barcodes */}
              <div className="md:col-span-2 p-3.5 bg-[#F4F2F0]/60 border border-wbk-lightgrey/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-wbk-black uppercase tracking-wider block">
                      GTIN Barcodes (Country Specific)
                    </span>
                    <span className="text-[10px] text-wbk-brown">
                      Market-specific GTIN-13 / EAN / UPC for Google Shopping feed, Amazon & logistics.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMasterGtinToAll}
                    className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-white hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-lightgrey transition-colors rounded-none shadow-2xs cursor-pointer"
                  >
                    Copy master GTIN to all
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-4 bg-white/70 p-2 border border-wbk-lightgrey/50">
                    <label className="block text-[10px] font-semibold text-wbk-black mb-1">
                      Master / Default GTIN (Global EAN)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5070502507993"
                      value={formData.ean || ""}
                      onChange={(e) => handleChange("ean", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇬🇧</span> UK (GB) GTIN
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN UK"
                      value={formData.gtin_en || ""}
                      onChange={(e) => {
                        handleChange("gtin_en", e.target.value);
                        handleChange("ean_uk", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇺🇸</span> US GTIN / UPC
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN US"
                      value={formData.gtin_us || ""}
                      onChange={(e) => {
                        handleChange("gtin_us", e.target.value);
                        handleChange("ean_us", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇩🇪</span> Germany (DE) GTIN
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN DE"
                      value={formData.gtin_de || ""}
                      onChange={(e) => {
                        handleChange("gtin_de", e.target.value);
                        handleChange("ean_de", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇫🇷</span> France (FR) GTIN
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN FR"
                      value={formData.gtin_fr || ""}
                      onChange={(e) => {
                        handleChange("gtin_fr", e.target.value);
                        handleChange("ean_fr", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇪🇸</span> Spain (ES) GTIN
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN ES"
                      value={formData.gtin_es || ""}
                      onChange={(e) => {
                        handleChange("gtin_es", e.target.value);
                        handleChange("ean_es", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇵🇹</span> Portugal (POR) GTIN
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN POR"
                      value={formData.gtin_por || ""}
                      onChange={(e) => {
                        handleChange("gtin_por", e.target.value);
                        handleChange("gtin_pt", e.target.value);
                        handleChange("ean_pt", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5 flex items-center gap-1">
                      <span>🇮🇹</span> Italy (IT) GTIN
                    </label>
                    <input
                      type="text"
                      placeholder="GTIN IT"
                      value={formData.gtin_it || ""}
                      onChange={(e) => {
                        handleChange("gtin_it", e.target.value);
                        handleChange("ean_it", e.target.value);
                      }}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Primary Category
                </label>
                <select
                  value={formData.parent_category || "beds"}
                  onChange={(e) => handleChange("parent_category", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none font-medium text-wbk-black"
                >
                  {categoriesList.length > 0 ? (
                    categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name || cat.title} ({cat.id})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="beds">Murphy Beds (beds)</option>
                      <option value="sofas">Sofas & Seating (sofas)</option>
                      <option value="tables">Tables & Desks (tables)</option>
                      <option value="mattresses">Mattresses (mattresses)</option>
                      <option value="cabinets">Cabinets & Storage (cabinets)</option>
                      <option value="extras">Extras & Accessories (extras)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Sub-Category / Model Line
                </label>
                {(() => {
                  const currentCategory = categoriesList.find(
                    (c) => c.id === (formData.parent_category || "beds")
                  );
                  const subcats = currentCategory?.subcategories || [];
                  return (
                    <div className="space-y-1">
                      <input
                        type="text"
                        list="subcategories-datalist"
                        placeholder="e.g. Classic Vertical or custom"
                        value={formData.sub_category || ""}
                        onChange={(e) => handleChange("sub_category", e.target.value)}
                        className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                      />
                      {subcats.length > 0 && (
                        <datalist id="subcategories-datalist">
                          {subcats.map((sub, idx) => (
                            <option key={idx} value={sub} />
                          ))}
                        </datalist>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Bed / Furniture Type
                </label>
                <select
                  value={formData.type || "Classic"}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                >
                  <option value="Classic">Classic</option>
                  <option value="Studio">Studio</option>
                  <option value="Integrated">Integrated</option>
                  <option value="Transforming">Transforming</option>
                  <option value="Wall-Mounted">Wall-Mounted</option>
                  <option value="Extending">Extending</option>
                  <option value="Coffee & Side">Coffee & Side</option>
                  <option value="Modular">Modular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Orientation
                </label>
                <select
                  value={formData.orientation || "Vertical"}
                  onChange={(e) => handleChange("orientation", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                >
                  <option value="Vertical">Vertical</option>
                  <option value="Horizontal">Horizontal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  value={formData.stock ?? 100}
                  onChange={(e) => handleNumberChange("stock", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                />
                <label className="mt-1.5 flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyRestock}
                    onChange={(e) => setNotifyRestock(e.target.checked)}
                    className="accent-wbk-gold rounded-xs w-3.5 h-3.5"
                  />
                  <span className="text-[10px] text-wbk-brown">
                    Email waitlist subscribers on restock
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Visibility Status
                </label>
                <select
                  value={formData.visibility || "Visible"}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                >
                  <option value="Visible">Visible (Published)</option>
                  <option value="Hidden">Hidden (Draft)</option>
                </select>
              </div>

              {/* Product Tags Selection Section */}
              <div className="md:col-span-2 pt-3 border-t border-wbk-lightgrey/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <IconTag size={15} className="text-wbk-gold" />
                    <span className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                      Product Tags
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F4F2F0] text-wbk-brown font-mono">
                      {Array.isArray(formData.tags) ? formData.tags.length : 0} selected
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQuickTagOpen((v) => !v)}
                    className="text-[11px] text-wbk-brown hover:text-wbk-black flex items-center gap-1 font-medium transition-colors"
                  >
                    <IconPlus size={13} />
                    <span>{isQuickTagOpen ? "Cancel" : "New Tag"}</span>
                  </button>
                </div>

                {/* Quick Add Tag Form */}
                {isQuickTagOpen && (
                  <div className="p-3 bg-[#F4F2F0]/80 border border-wbk-lightgrey/70 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase text-wbk-black tracking-wider">
                        Create New Tag
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tag name (e.g. Clearance)"
                        value={quickTagName}
                        onChange={(e) => setQuickTagName(e.target.value)}
                        className="flex-1 p-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                      />
                      <input
                        type="color"
                        value={quickTagColor}
                        onChange={(e) => setQuickTagColor(e.target.value)}
                        className="w-8 h-8 p-0.5 bg-white border border-wbk-lightgrey cursor-pointer shrink-0"
                        title="Choose tag color"
                      />
                      <button
                        type="button"
                        onClick={handleCreateQuickTag}
                        className="px-3 py-1.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-medium rounded-none transition-colors shrink-0"
                      >
                        Add & Select
                      </button>
                    </div>
                  </div>
                )}

                {/* Tag Selection Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {tagsList.length === 0 ? (
                    <span className="text-[11px] text-wbk-brown italic">
                      No tags available yet. Click &quot;New Tag&quot; above to create one.
                    </span>
                  ) : (
                    tagsList.map((tag) => {
                      const isSelected = Array.isArray(formData.tags) && formData.tags.includes(tag.id || tag.slug);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id || tag.slug)}
                          className={`flex items-center gap-1.5 px-3 py-1 text-xs transition-all border select-none cursor-pointer rounded-full ${
                            isSelected
                              ? "bg-wbk-black text-white border-wbk-black shadow-xs font-medium"
                              : "bg-[#FBF9F8] border-wbk-lightgrey/80 text-wbk-black hover:border-wbk-black"
                          }`}
                        >
                          <TagIcon
                            tagIdOrSlug={tag.id}
                            iconName={tag.icon}
                            size={12}
                            className={isSelected ? "text-white/80 shrink-0" : "text-wbk-black/70 shrink-0"}
                          />
                          <span>{tag.name}</span>
                          {isSelected && (
                            <IconCheck size={12} className="shrink-0 text-white ml-0.5 stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Target Markets & Country Visibility */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconWorld size={16} className="text-wbk-gold" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
                  Target Markets & Regional Visibility
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllLocales}
                  className="text-[11px] text-wbk-black hover:text-wbk-gold font-medium underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-wbk-brown/40">|</span>
                <button
                  type="button"
                  onClick={clearAllLocales}
                  className="text-[11px] text-wbk-brown hover:text-red-600 font-medium underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <p className="text-[11px] text-wbk-brown">
              Choose which regional storefronts and language countries display this product. When all are selected, it is visible across all markets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {TARGET_LOCALES.map((loc) => {
                const isSelected =
                  Array.isArray(formData.available_locales) &&
                  formData.available_locales.includes(loc.code);

                return (
                  <label
                    key={loc.code}
                    className={`flex items-center justify-between p-3 border cursor-pointer select-none transition-all ${
                      isSelected
                        ? "bg-amber-50/40 border-wbk-black shadow-2xs"
                        : "bg-[#FBF9F8] border-wbk-lightgrey/70 opacity-60 hover:opacity-100 hover:border-wbk-black"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLocale(loc.code)}
                        className="accent-wbk-gold w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-xs text-wbk-black">
                          <span className="text-base leading-none">{loc.flag}</span>
                          <span>{loc.label}</span>
                          <span className="text-[10px] text-wbk-brown font-normal">({loc.code})</span>
                        </div>
                        <div className="text-[10px] text-wbk-brown mt-0.5">
                          {loc.name} &bull; {loc.currency}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-xs">
                        Active
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="text-[11px] text-wbk-brown flex items-center justify-between pt-1 border-t border-wbk-lightgrey/40">
              <span>
                Active markets count:{" "}
                <strong>
                  {Array.isArray(formData.available_locales) ? formData.available_locales.length : 7} / 7
                </strong>
              </span>
              {(formData.available_locales?.length === 7 || !formData.available_locales) && (
                <span className="text-emerald-700 font-semibold text-[10px]">
                  ✓ Visible across all international storefronts
                </span>
              )}
              {formData.available_locales?.length === 0 && (
                <span className="text-red-600 font-semibold text-[10px]">
                  ⚠ Hidden from all storefronts (No active markets)
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Multi-Currency Pricing & Discounts */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
                2. Multi-Currency Pricing & Discounts
              </h3>
              <span className="text-[10px] text-wbk-brown">
                Direct Supabase columns
              </span>
            </div>

            {/* GBP Market (UK) */}
            <div className="p-3.5 bg-[#F4F2F0]/50 border border-wbk-lightgrey/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="en" size={14} />
                <span>UK Market (GBP - £)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Regular Price (price_gbp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">£</span>
                    <input
                      type="number"
                      value={formData.price_gbp ?? ""}
                      onChange={(e) => handleNumberChange("price_gbp", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none font-semibold focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Sale Price (sale_price_gbp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">£</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={formData.sale_price_gbp ?? ""}
                      onChange={(e) => handleNumberChange("sale_price_gbp", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* EUR Market (DE, FR, ES, POR, IT) */}
            <div className="p-3.5 bg-[#F4F2F0]/50 border border-wbk-lightgrey/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="de" size={14} />
                <span>European Market (EUR - €)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Regular Price (price_euro)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">€</span>
                    <input
                      type="number"
                      value={formData.price_euro ?? ""}
                      onChange={(e) => handleNumberChange("price_euro", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none font-semibold focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Sale Price (sale_price_euro)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">€</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={formData.sale_price_euro ?? ""}
                      onChange={(e) => handleNumberChange("sale_price_euro", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* USD Market (US) */}
            <div className="p-3.5 bg-[#F4F2F0]/50 border border-wbk-lightgrey/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="us" size={14} />
                <span>US Market (USD - $)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Regular Price (price_usd)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">$</span>
                    <input
                      type="number"
                      value={formData.price_usd ?? ""}
                      onChange={(e) => handleNumberChange("price_usd", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none font-semibold focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Sale Price (sale_price_usd)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">$</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={formData.sale_price_usd ?? ""}
                      onChange={(e) => handleNumberChange("sale_price_usd", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Percentage Discount */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Discount Percentage (sale_percent)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="e.g. 30 (for -30%)"
                  value={formData.sale_percent ?? ""}
                  onChange={(e) => handleNumberChange("sale_percent", e.target.value)}
                  className="w-36 p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none font-semibold"
                />
                <span className="text-xs text-wbk-brown">
                  {formData.sale_percent ? `Active discount: -${formData.sale_percent}%` : "No percentage discount"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Dimensions */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              3. Dimensions (in mm)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={formData.width ?? ""}
                  onChange={(e) => handleNumberChange("width", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Length (mm)
                </label>
                <input
                  type="number"
                  value={formData.length ?? ""}
                  onChange={(e) => handleNumberChange("length", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Folded-up Height
                </label>
                <input
                  type="number"
                  value={formData.folded_up_height ?? ""}
                  onChange={(e) => handleNumberChange("folded_up_height", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Folded-up Projection
                </label>
                <input
                  type="number"
                  value={formData.folded_up_projection ?? ""}
                  onChange={(e) => handleNumberChange("folded_up_projection", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Folded-down Projection
                </label>
                <input
                  type="number"
                  value={formData.folded_down_projection ?? ""}
                  onChange={(e) => handleNumberChange("folded_down_projection", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Max Mattress Depth
                </label>
                <input
                  type="number"
                  value={formData.maximum_mattress_depth ?? 300}
                  onChange={(e) => handleNumberChange("maximum_mattress_depth", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Net Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 52.5"
                  value={formData.weight ?? ""}
                  onChange={(e) => handleNumberChange("weight", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>
            </div>

            {/* Box Packaging Breakdown */}
            <div className="pt-3 border-t border-wbk-lightgrey/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-wbk-black uppercase tracking-wider">
                  Box Packaging Dimensions (cm, e.g. 215x30x12)
                </span>
                <span className="text-[10px] text-wbk-brown">
                  Used for freight logistics & package display
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">Box 1</label>
                  <input
                    type="text"
                    placeholder="e.g. 215x30x12"
                    value={formData.pack_1 || ""}
                    onChange={(e) => handleChange("pack_1", e.target.value)}
                    className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">Box 2</label>
                  <input
                    type="text"
                    placeholder="e.g. 150x25x10"
                    value={formData.pack_2 || ""}
                    onChange={(e) => handleChange("pack_2", e.target.value)}
                    className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">Box 3</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formData.pack_3 || ""}
                    onChange={(e) => handleChange("pack_3", e.target.value)}
                    className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">Box 4</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formData.pack_4 || ""}
                    onChange={(e) => handleChange("pack_4", e.target.value)}
                    className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">
                  Composite Package Summary (package_dimensions)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Box 1: 215x30x12 | Box 2: 150x25x10"
                  value={formData.package_dimensions || ""}
                  onChange={(e) => handleChange("package_dimensions", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description & Media Management */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-wbk-lightgrey/40 pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
                  4. Description & Media Management
                </h3>
                <p className="text-[11px] text-wbk-brown mt-0.5">
                  Direct Supabase Storage integration with live preview, upload, and gallery curation.
                </p>
              </div>

              {/* Target folder selection */}
              <div className="flex items-center gap-1.5 bg-[#F8F6F4] p-1 border border-wbk-lightgrey/60 rounded-md text-[11px] self-start sm:self-auto">
                <IconFolder size={14} className="text-wbk-gold ml-1" />
                <span className="text-wbk-brown font-medium mr-1">Storage Folder:</span>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="bg-white border border-wbk-lightgrey/60 text-wbk-black text-[11px] px-2 py-0.5 rounded focus:outline-none focus:border-wbk-black font-poppins"
                >
                  <option value="wallbeds/1K">wallbeds/1K (Cards / 1000px)</option>
                  <option value="wallbeds/2K">wallbeds/2K (Galleries / 2000px)</option>
                  <option value="wallbeds">wallbeds (Root)</option>
                  <option value="products">products (General)</option>
                </select>
              </div>
            </div>

            {/* Localized Descriptions Section */}
            <div className="bg-[#FAF9F7] p-3.5 border border-wbk-lightgrey/80 rounded-none space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-wbk-lightgrey/40 pb-2">
                <div>
                  <label className="block text-xs font-semibold text-wbk-black">
                    Product Description (Multi-Market)
                  </label>
                  <p className="text-[10px] text-wbk-brown/70 font-poppins">
                    Localized descriptions displayed on product detail pages and buy box.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBaseDescToAll}
                  className="text-[10px] font-medium text-wbk-green hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>📋</span>
                  <span>Copy English description to all markets</span>
                </button>
              </div>

              {/* Market Language Pills */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "en", flag: "🇬🇧", label: "UK / EN" },
                  { id: "us", flag: "🇺🇸", label: "US" },
                  { id: "de", flag: "🇩🇪", label: "DE (German)" },
                  { id: "fr", flag: "🇫🇷", label: "FR (French)" },
                  { id: "es", flag: "🇪🇸", label: "ES (Spanish)" },
                  { id: "por", flag: "🇵🇹", label: "POR (Portuguese)" },
                  { id: "it", flag: "🇮🇹", label: "IT (Italian)" },
                ].map((market) => (
                  <button
                    key={market.id}
                    type="button"
                    onClick={() => setDescLocaleTab(market.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium border flex items-center gap-1.5 transition-colors ${
                      descLocaleTab === market.id
                        ? "bg-wbk-black text-white border-wbk-black"
                        : "bg-white text-wbk-black/80 border-wbk-lightgrey hover:bg-[#F0EDE8]"
                    }`}
                  >
                    <span>{market.flag}</span>
                    <span>{market.label}</span>
                  </button>
                ))}
              </div>

              {/* Active Market Description Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-wbk-brown uppercase tracking-wider">
                  Main Description ({descLocaleTab.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={
                    formData[`description_${descLocaleTab}`] ??
                    (descLocaleTab === "en" ? formData.description : "") ??
                    ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange(`description_${descLocaleTab}`, val);
                    if (descLocaleTab === "en") {
                      handleChange("description", val);
                      handleChange("description_en", val);
                    }
                    if (descLocaleTab === "por") {
                      handleChange("description_pt", val);
                    }
                  }}
                  placeholder={`Detailed description for ${descLocaleTab.toUpperCase()} market...`}
                  className="w-full p-2.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins leading-relaxed"
                />
              </div>

              {/* Extended Description (Technical specs & details) */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-semibold text-wbk-brown uppercase tracking-wider">
                  Extended Description / Materials & Specs ({descLocaleTab.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={
                    formData[`extended_description_${descLocaleTab}`] ??
                    (descLocaleTab === "en" ? formData.extended_description : "") ??
                    ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange(`extended_description_${descLocaleTab}`, val);
                    if (descLocaleTab === "en") {
                      handleChange("extended_description", val);
                      handleChange("extended_description_en", val);
                    }
                    if (descLocaleTab === "por") {
                      handleChange("extended_description_pt", val);
                    }
                  }}
                  placeholder={`Optional extended description (for cabinets, mattresses, etc.) in ${descLocaleTab.toUpperCase()}...`}
                  className="w-full p-2.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins leading-relaxed"
                />
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={primaryFileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUploadSingle(e.target.files[0], "image", "1K");
                e.target.value = "";
              }}
            />
            <input
              type="file"
              ref={hoverFileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUploadSingle(e.target.files[0], "hover_image", "1K");
                e.target.value = "";
              }}
            />
            <input
              type="file"
              ref={galleryFileRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleUploadGalleryFiles(Array.from(e.target.files), "2K");
                e.target.value = "";
              }}
            />
            <input
              type="file"
              ref={browserFileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleBrowserUpload(e.target.files[0]);
                e.target.value = "";
              }}
            />

            {/* Supabase Storage Sync & Match Toolbar */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-[#FAF9F8] to-blue-500/10 border border-wbk-gold/40 rounded-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-wbk-gold/20 text-wbk-black rounded">
                    <IconSparkles size={16} className="text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-wbk-black uppercase tracking-wider flex items-center gap-1.5">
                      <span>Supabase Storage Integration</span>
                      {matchSummary && (
                        <span className="text-[10px] font-semibold normal-case px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono">
                          ✓ {matchSummary.total1K + matchSummary.total2K} matching photos in bucket
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-wbk-brown">
                      Directly pull pre-uploaded Morphy 1K (cards) and 2K (gallery) photos from Supabase Storage or browse bucket.
                    </p>
                  </div>
                </div>

                {/* Browse storage button */}
                <button
                  type="button"
                  onClick={() => handleOpenBrowserFor(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-wbk-black hover:text-white border border-wbk-lightgrey/80 text-wbk-black text-xs font-medium rounded transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                >
                  <IconDatabase size={14} className="text-wbk-gold" />
                  <span>Browse Storage Bucket</span>
                </button>
              </div>

              {/* Auto-match row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-wbk-gold/20">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[11px] font-medium text-wbk-brown shrink-0">Product Prefix:</span>
                  <select
                    value={selectedPrefix}
                    onChange={(e) => {
                      setSelectedPrefix(e.target.value);
                      checkPrefixMatch(e.target.value);
                    }}
                    className="flex-1 max-w-xs p-1.5 text-xs bg-white border border-wbk-lightgrey rounded focus:outline-none focus:border-wbk-black font-mono font-medium text-wbk-black"
                  >
                    <option value="">-- Choose or detected prefix --</option>
                    {availablePrefixes.map((pfx) => (
                      <option key={pfx} value={pfx}>
                        {pfx}
                      </option>
                    ))}
                  </select>

                  {checkingMatch && (
                    <IconRefresh size={14} className="animate-spin text-wbk-brown" />
                  )}
                </div>

                {matchSummary && (
                  <button
                    type="button"
                    onClick={handleApplyMatchedImages}
                    disabled={applyingMatch}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <IconSparkles size={14} />
                    <span>Apply Matching Photos (Main, Hover & Gallery)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Primary & Hover Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Primary Image */}
              <div className="bg-[#FAF9F8] border border-wbk-lightgrey/60 rounded-md p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-wbk-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-wbk-gold inline-block" />
                      Primary Image (1K)
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                      Category & Card
                    </span>
                  </div>

                  {/* Thumbnail / Dropzone Area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleUploadSingle(e.dataTransfer.files[0], "image", "1K");
                      }
                    }}
                    className="relative group aspect-[16/10] bg-white border border-wbk-lightgrey/80 rounded flex items-center justify-center overflow-hidden p-2 mb-2"
                  >
                    {uploadingPrimary ? (
                      <div className="flex flex-col items-center gap-1.5 text-xs text-wbk-brown">
                        <IconRefresh size={22} className="animate-spin text-wbk-gold" />
                        <span>Uploading to Supabase...</span>
                      </div>
                    ) : formData.image ? (
                      <>
                        <img
                          src={formData.image}
                          alt="Primary preview"
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="hidden flex flex-col items-center justify-center text-xs text-red-500">
                          <IconAlertCircle size={20} />
                          <span>Image load failed</span>
                        </div>
                        {/* Overlay quick actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePreviewUrl(formData.image)}
                            title="Preview full size"
                            className="p-1.5 bg-white/90 hover:bg-white text-wbk-black rounded-full shadow cursor-pointer"
                          >
                            <IconEye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBrowserFor("image")}
                            title="Browse Storage for Primary Image"
                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow cursor-pointer"
                          >
                            <IconDatabase size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => primaryFileRef.current?.click()}
                            title="Upload replacement file"
                            className="p-1.5 bg-white/90 hover:bg-white text-wbk-black rounded-full shadow cursor-pointer"
                          >
                            <IconUpload size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange("image", "")}
                            title="Remove image"
                            className="p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-full shadow cursor-pointer"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenBrowserFor("image")}
                        className="flex flex-col items-center justify-center text-center p-3 text-wbk-brown hover:text-wbk-black transition-colors cursor-pointer w-full h-full"
                      >
                        <IconDatabase size={24} className="text-wbk-gold mb-1" />
                        <span className="text-xs font-medium">Browse Storage or drop image</span>
                        <span className="text-[10px] text-wbk-brown/70">Recommended: 1K (1000px WebP)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Path input & Action Buttons */}
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="https://... or /product-images/..."
                      value={formData.image || ""}
                      onChange={(e) => handleChange("image", e.target.value)}
                      className="flex-1 p-1.5 text-[11px] bg-white border border-wbk-lightgrey rounded focus:outline-none focus:border-wbk-black font-mono text-wbk-black"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.image)}
                      disabled={!formData.image}
                      title="Copy URL"
                      className="p-1.5 bg-white border border-wbk-lightgrey hover:bg-[#F4F2F0] text-wbk-brown rounded cursor-pointer disabled:opacity-40"
                    >
                      {copiedUrl === formData.image ? <IconCheck size={14} className="text-green-600" /> : <IconCopy size={14} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenBrowserFor("image")}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold rounded transition-all cursor-pointer shadow-xs"
                      title="Select primary image from Supabase Storage"
                    >
                      <IconDatabase size={13} className="text-amber-700" />
                      <span>Browse Storage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => primaryFileRef.current?.click()}
                      disabled={uploadingPrimary}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-wbk-black hover:text-white border border-wbk-lightgrey text-[11px] font-medium text-wbk-black rounded transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <IconUpload size={13} />
                      <span>{formData.image ? "Upload File" : "Upload File"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Hover Image */}
              <div className="bg-[#FAF9F8] border border-wbk-lightgrey/60 rounded-md p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-wbk-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Hover Image (1K)
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                      Card Hover / Mattress
                    </span>
                  </div>

                  {/* Thumbnail / Dropzone Area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleUploadSingle(e.dataTransfer.files[0], "hover_image", "1K");
                      }
                    }}
                    className="relative group aspect-[16/10] bg-white border border-wbk-lightgrey/80 rounded flex items-center justify-center overflow-hidden p-2 mb-2"
                  >
                    {uploadingHover ? (
                      <div className="flex flex-col items-center gap-1.5 text-xs text-wbk-brown">
                        <IconRefresh size={22} className="animate-spin text-blue-600" />
                        <span>Uploading to Supabase...</span>
                      </div>
                    ) : formData.hover_image ? (
                      <>
                        <img
                          src={formData.hover_image}
                          alt="Hover preview"
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="hidden flex flex-col items-center justify-center text-xs text-red-500">
                          <IconAlertCircle size={20} />
                          <span>Image load failed</span>
                        </div>
                        {/* Overlay quick actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePreviewUrl(formData.hover_image)}
                            title="Preview full size"
                            className="p-1.5 bg-white/90 hover:bg-white text-wbk-black rounded-full shadow cursor-pointer"
                          >
                            <IconEye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBrowserFor("hover_image")}
                            title="Browse Storage for Hover Image"
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow cursor-pointer"
                          >
                            <IconDatabase size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => hoverFileRef.current?.click()}
                            title="Upload replacement file"
                            className="p-1.5 bg-white/90 hover:bg-white text-wbk-black rounded-full shadow cursor-pointer"
                          >
                            <IconUpload size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange("hover_image", "")}
                            title="Remove image"
                            className="p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-full shadow cursor-pointer"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenBrowserFor("hover_image")}
                        className="flex flex-col items-center justify-center text-center p-3 text-wbk-brown hover:text-wbk-black transition-colors cursor-pointer w-full h-full"
                      >
                        <IconDatabase size={24} className="text-blue-500 mb-1" />
                        <span className="text-xs font-medium">Browse Storage or drop hover image</span>
                        <span className="text-[10px] text-wbk-brown/70">Recommended: 1K (with mattress or open)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Path input & Action Buttons */}
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="https://... or /product-images/..."
                      value={formData.hover_image || ""}
                      onChange={(e) => handleChange("hover_image", e.target.value)}
                      className="flex-1 p-1.5 text-[11px] bg-white border border-wbk-lightgrey rounded focus:outline-none focus:border-wbk-black font-mono text-wbk-black"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.hover_image)}
                      disabled={!formData.hover_image}
                      title="Copy URL"
                      className="p-1.5 bg-white border border-wbk-lightgrey hover:bg-[#F4F2F0] text-wbk-brown rounded cursor-pointer disabled:opacity-40"
                    >
                      {copiedUrl === formData.hover_image ? <IconCheck size={14} className="text-green-600" /> : <IconCopy size={14} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenBrowserFor("hover_image")}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-[11px] font-semibold rounded transition-all cursor-pointer shadow-xs"
                      title="Select hover image from Supabase Storage"
                    >
                      <IconDatabase size={13} className="text-blue-700" />
                      <span>Browse Storage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => hoverFileRef.current?.click()}
                      disabled={uploadingHover}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-wbk-black hover:text-white border border-wbk-lightgrey text-[11px] font-medium text-wbk-black rounded transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <IconUpload size={13} />
                      <span>{formData.hover_image ? "Upload File" : "Upload File"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Gallery Section */}
            <div className="pt-2 border-t border-wbk-lightgrey/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-wbk-black flex items-center gap-2">
                    <IconPhoto size={16} className="text-wbk-gold" />
                    <span>Product Gallery ({Array.isArray(formData.product_images) ? formData.product_images.length : 0} Images)</span>
                  </h4>
                  <p className="text-[11px] text-wbk-brown mt-0.5">
                    Full resolution photos (2K) rendered on the product detail page carousel and configurator.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {Array.isArray(formData.product_images) && formData.product_images.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllGallery}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded transition-colors cursor-pointer"
                      title="Clear all images from gallery"
                    >
                      <IconTrash size={13} />
                      <span>Clear All</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenBrowserFor("gallery")}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded transition-colors cursor-pointer"
                  >
                    <IconDatabase size={14} className="text-wbk-gold" />
                    <span>Browse Storage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddUrlOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded transition-colors cursor-pointer"
                  >
                    <IconLink size={14} />
                    <span>+ Add URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryFileRef.current?.click()}
                    disabled={uploadingGallery}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white font-medium rounded transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {uploadingGallery ? <IconRefresh size={14} className="animate-spin" /> : <IconUpload size={14} />}
                    <span>Upload Images (2K)</span>
                  </button>
                </div>
              </div>

              {/* Progress banner */}
              {uploadingGallery && (
                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-center justify-between text-xs text-amber-900 animate-pulse">
                  <div className="flex items-center gap-2">
                    <IconRefresh size={16} className="animate-spin text-amber-700" />
                    <span className="font-medium">{galleryUploadProgress || "Uploading images to Supabase Storage..."}</span>
                  </div>
                  <span className="text-[11px] text-amber-700">Please wait</span>
                </div>
              )}

              {/* Inline feedback banner for gallery deletions/updates */}
              {galleryFeedback && (
                <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-md flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <IconCheck size={16} className="text-emerald-700 shrink-0" />
                    <span className="font-medium">{galleryFeedback}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {saving ? <IconRefresh size={13} className="animate-spin" /> : <IconDeviceFloppy size={13} />}
                    <span>{saving ? "Saving..." : "Save Now"}</span>
                  </button>
                </div>
              )}

              {/* Collapsible Add by URL Form */}
              {isAddUrlOpen && (
                <div className="mb-3 p-3 bg-[#F8F6F4] border border-wbk-lightgrey rounded-md flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Enter public image URL (e.g. https://.../image.webp)"
                    value={customGalleryUrl}
                    onChange={(e) => setCustomGalleryUrl(e.target.value)}
                    className="flex-1 p-2 text-xs bg-white border border-wbk-lightgrey rounded focus:outline-none focus:border-wbk-black font-mono text-wbk-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGalleryUrl}
                    disabled={!customGalleryUrl.trim()}
                    className="px-3 py-2 bg-wbk-black text-white text-xs font-semibold rounded hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddUrlOpen(false);
                      setCustomGalleryUrl("");
                    }}
                    className="px-2 py-2 text-xs text-wbk-brown hover:text-wbk-black cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.isArray(formData.product_images) &&
                  formData.product_images.map((imgUrl, idx) => {
                    const isPrimary = imgUrl === formData.image;
                    const isHover = imgUrl === formData.hover_image;

                    return (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className={`group relative bg-white border rounded-md overflow-hidden flex flex-col justify-between transition-all shadow-xs ${
                          isPrimary
                            ? "border-amber-400 ring-2 ring-amber-400/30"
                            : isHover
                            ? "border-blue-400 ring-2 ring-blue-400/30"
                            : "border-wbk-lightgrey/70 hover:border-wbk-black"
                        }`}
                      >
                        {/* Image Preview Container */}
                        <div className="relative aspect-[4/3] bg-[#FAF9F8] p-1 flex items-center justify-center overflow-hidden">
                          {/* Image preview with click-to-lightbox */}
                          <div
                            onClick={() => setActivePreviewUrl(imgUrl)}
                            className="w-full h-full cursor-pointer flex items-center justify-center"
                            title="Click to preview large"
                          >
                            <img
                              src={imgUrl}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.opacity = "0.2";
                              }}
                            />
                          </div>

                          {/* Index badge */}
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded z-10 pointer-events-none">
                            #{idx + 1}
                          </span>

                          {/* Role badges */}
                          {isPrimary && (
                            <span className="absolute top-1.5 left-7 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded shadow-xs flex items-center gap-0.5 z-10 pointer-events-none">
                              <IconStar size={9} /> Main
                            </span>
                          )}
                          {!isPrimary && isHover && (
                            <span className="absolute top-1.5 left-7 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded shadow-xs z-10 pointer-events-none">
                              Hover
                            </span>
                          )}

                          {/* Prominent Quick Delete Button (Top-Right) */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveGalleryItem(idx, e)}
                            title="Delete this image from gallery"
                            className="absolute top-1.5 right-1.5 z-20 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                          >
                            <IconTrash size={12} />
                          </button>

                          {/* Hover action bar overlay */}
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none p-2 z-15">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePreviewUrl(imgUrl);
                              }}
                              title="Preview large"
                              className="p-1.5 bg-white hover:bg-[#FAF9F8] text-wbk-black rounded-full shadow hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
                            >
                              <IconEye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChange("image", imgUrl);
                              }}
                              title="Set as Main Image"
                              className={`p-1.5 rounded-full shadow hover:scale-110 transition-transform cursor-pointer pointer-events-auto ${
                                isPrimary
                                  ? "bg-amber-500 text-white"
                                  : "bg-white hover:bg-amber-50 text-wbk-black hover:text-amber-600"
                              }`}
                            >
                              <IconStar size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChange("hover_image", imgUrl);
                              }}
                              title="Set as Hover Image"
                              className={`p-1.5 rounded-full shadow hover:scale-110 transition-transform cursor-pointer pointer-events-auto ${
                                isHover
                                  ? "bg-blue-600 text-white"
                                  : "bg-white hover:bg-blue-50 text-wbk-black hover:text-blue-600"
                              }`}
                            >
                              <IconPhoto size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveGalleryItem(idx, e)}
                              title="Delete from gallery"
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
                            >
                              <IconTrash size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Card controls bar */}
                        <div className="p-1.5 bg-[#FAF9F8] border-t border-wbk-lightgrey/40 flex items-center justify-between text-[11px]">
                          {/* Reorder arrows */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveGalleryItem(idx, idx - 1);
                              }}
                              disabled={idx === 0}
                              title="Move left"
                              className="p-1 text-wbk-brown hover:text-wbk-black disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <IconChevronLeft size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveGalleryItem(idx, idx + 1);
                              }}
                              disabled={idx === formData.product_images.length - 1}
                              title="Move right"
                              className="p-1 text-wbk-brown hover:text-wbk-black disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <IconChevronRight size={13} />
                            </button>
                          </div>

                          {/* Role toggles & Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChange("image", imgUrl);
                              }}
                              title={isPrimary ? "Already main image" : "Set as Main Image"}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                isPrimary ? "text-amber-500 font-bold" : "text-wbk-brown hover:text-amber-500"
                              }`}
                            >
                              <IconStar size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChange("hover_image", imgUrl);
                              }}
                              title={isHover ? "Already hover image" : "Set as Hover Image"}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                isHover ? "text-blue-600 font-bold" : "text-wbk-brown hover:text-blue-600"
                              }`}
                            >
                              <IconPhoto size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveGalleryItem(idx, e)}
                              title="Delete from gallery"
                              className="flex items-center gap-0.5 px-1.5 py-0.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded transition-colors cursor-pointer font-medium text-[10px]"
                            >
                              <IconTrash size={12} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Dropzone card for adding new photos */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.length) {
                      handleUploadGalleryFiles(Array.from(e.dataTransfer.files), "2K");
                    }
                  }}
                  onClick={() => galleryFileRef.current?.click()}
                  className="aspect-[4/3] border-2 border-dashed border-wbk-lightgrey hover:border-wbk-gold bg-[#FAF9F8] hover:bg-[#F5F2EF] rounded-md flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group"
                >
                  <IconUpload size={20} className="text-wbk-gold group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[11px] font-medium text-wbk-black">+ Add Photos</span>
                  <span className="text-[9px] text-wbk-brown">Drop 2K WebP files</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Assembly & Installation Manual */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-wbk-lightgrey/40 pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold flex items-center gap-2">
                  <IconFileText size={16} />
                  <span>5. Assembly & Installation Manual</span>
                </h3>
                <p className="text-[11px] text-wbk-brown mt-0.5">
                  Official PDF guide from Supabase Storage (SupportFiles/InstallationManuals). Displayed on the storefront Support & Guides tab. If left empty, the page will display &quot;In progress&quot;.
                </p>
              </div>
            </div>

            {/* Current Manual Display */}
            {formData.installation_manual ? (
              <div className="p-4 bg-[#FAF9F8] border border-wbk-lightgrey/70 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-sm bg-white border border-wbk-lightgrey/80 text-wbk-gold flex items-center justify-center shrink-0 shadow-xs">
                    <IconFileText size={22} stroke={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold text-wbk-gold uppercase tracking-wider bg-white px-1.5 py-0.5 border border-wbk-gold/30 rounded-xs">
                        Active Manual
                      </span>
                      <span className="text-[10px] text-green-700 font-medium">
                        ✓ Linked to Product
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-wbk-black truncate mt-1">
                      {formData.installation_manual.split("/").pop()}
                    </p>
                    <p className="text-[10px] text-wbk-brown font-mono truncate max-w-md">
                      {formData.installation_manual}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <a
                    href={formData.installation_manual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-[11px] font-medium rounded transition-colors cursor-pointer"
                  >
                    <IconExternalLink size={13} />
                    <span>View PDF</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("installation_manual", "");
                      setManualFeedback("Manual unlinked from this product.");
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium rounded transition-colors cursor-pointer"
                    title="Remove manual assignment"
                  >
                    <IconTrash size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#FAF9F8] border border-dashed border-amber-300 rounded-sm flex items-center gap-3">
                <IconAlertCircle size={20} className="text-amber-600 shrink-0" />
                <div className="text-[11px] text-wbk-brown">
                  <span className="font-semibold text-amber-800">No manual currently assigned. </span>
                  The storefront Support &amp; Guides tab will display <span className="font-semibold text-wbk-black">&quot;In progress&quot;</span> for this product until a manual is selected or uploaded.
                </div>
              </div>
            )}

            {/* Manual Feedback Notification */}
            {manualFeedback && (
              <div className="text-[11px] px-3 py-2 bg-neutral-100 border border-neutral-300 rounded text-wbk-black">
                {manualFeedback}
              </div>
            )}

            {/* Pick from existing manuals */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-wbk-black">
                Select from Existing Storage Manuals ({manualsList.length} available)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.installation_manual || ""}
                  onChange={(e) => {
                    handleChange("installation_manual", e.target.value);
                    if (e.target.value) {
                      setManualFeedback(`✓ Selected manual: ${e.target.value.split("/").pop()}`);
                    }
                  }}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins"
                >
                  <option value="">-- None (Show &apos;In progress&apos; on product page) --</option>
                  {manualsList.map((m) => (
                    <option key={m.name} value={m.url}>
                      {m.name} {m.size ? `(${Math.round(m.size / 1024)} KB)` : ""}
                    </option>
                  ))}
                </select>
                {formData.installation_manual && (
                  <button
                    type="button"
                    onClick={() => handleChange("installation_manual", "")}
                    className="px-2.5 py-2 text-xs border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black rounded-none cursor-pointer"
                    title="Clear selection"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Upload or Drop New PDF Manual */}
            <div className="space-y-1.5 pt-2 border-t border-wbk-lightgrey/40">
              <label className="block text-xs font-medium text-wbk-black">
                Or Upload New Manual (PDF)
              </label>
              <input
                ref={manualFileRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUploadManual(e.target.files[0]);
                  }
                }}
              />
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleUploadManual(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => manualFileRef.current?.click()}
                className="border-2 border-dashed border-wbk-lightgrey hover:border-wbk-gold bg-[#FAF9F8] hover:bg-[#F5F2EF] p-4 text-center cursor-pointer transition-all rounded-sm flex flex-col items-center justify-center gap-1 group"
              >
                {uploadingManual ? (
                  <>
                    <IconRefresh size={22} className="animate-spin text-wbk-gold mb-1" />
                    <span className="text-xs font-medium text-wbk-black">Uploading PDF to Supabase Storage...</span>
                    <span className="text-[10px] text-wbk-brown">Bucket: SupportFiles/InstallationManuals</span>
                  </>
                ) : (
                  <>
                    <IconUpload size={22} className="text-wbk-gold group-hover:scale-110 transition-transform mb-0.5" />
                    <span className="text-xs font-medium text-wbk-black">Click or drag &amp; drop a PDF manual to upload</span>
                    <span className="text-[10px] text-wbk-brown">Uploads directly to Supabase SupportFiles/InstallationManuals</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Installation & Assembly Video (YouTube) */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-wbk-lightgrey/40 pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 flex items-center gap-2">
                  <IconBrandYoutube size={16} />
                  <span>6. Installation Video (YouTube)</span>
                </h3>
                <p className="text-[11px] text-wbk-brown mt-0.5">
                  Official assembly guide video embedded directly into the storefront product page under &quot;Support &amp; Guides&quot;.
                </p>
              </div>
            </div>

            {/* Current Video Display & Live Preview */}
            {(() => {
              const parsed = parseYouTubeVideo(formData.installation_video);
              if (parsed) {
                return (
                  <div className="p-4 bg-[#FAF9F8] border border-wbk-lightgrey/70 rounded-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-red-600 uppercase tracking-wider bg-red-50 px-1.5 py-0.5 border border-red-200/80 rounded-xs">
                            Active Video
                          </span>
                          <span className="text-[10px] text-green-700 font-medium">
                            ✓ YouTube ID: {parsed.videoId}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-wbk-black truncate mt-1">
                          {formData.installation_video}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={parsed.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-600 hover:text-white text-wbk-black border border-wbk-lightgrey text-[11px] font-medium rounded transition-colors cursor-pointer shadow-2xs"
                        >
                          <IconExternalLink size={13} />
                          <span>Watch on YouTube</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleChange("installation_video", "")}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium rounded transition-colors cursor-pointer"
                          title="Remove video assignment"
                        >
                          <IconTrash size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Player Preview */}
                    <div className="relative aspect-video max-w-md bg-black border border-wbk-lightgrey/80 overflow-hidden shadow-xs">
                      <iframe
                        src={parsed.embedUrl}
                        title="Installation video preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div className="p-4 bg-[#FAF9F8] border border-dashed border-amber-300 rounded-sm flex items-center gap-3">
                  <IconAlertCircle size={20} className="text-amber-600 shrink-0" />
                  <div className="text-[11px] text-wbk-brown">
                    <span className="font-semibold text-amber-800">No video currently assigned. </span>
                    The storefront Support &amp; Guides tab will display <span className="font-semibold text-wbk-black">&quot;Coming soon&quot;</span> until a YouTube video is selected or entered.
                  </div>
                </div>
              );
            })()}

            {/* Quick Presets Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-wbk-black">
                Select from Official WallBedKing Presets
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={
                    OFFICIAL_INSTALLATION_VIDEOS.find(
                      (v) => v.videoId === parseYouTubeVideo(formData.installation_video)?.videoId
                    )?.videoId || ""
                  }
                  onChange={(e) => {
                    const found = OFFICIAL_INSTALLATION_VIDEOS.find((v) => v.videoId === e.target.value);
                    if (found) {
                      handleChange("installation_video", found.url);
                    }
                  }}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins"
                >
                  <option value="">-- Choose an official guide video --</option>
                  {OFFICIAL_INSTALLATION_VIDEOS.map((v) => (
                    <option key={v.videoId} value={v.videoId}>
                      {v.title} ({v.model})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom URL / Video ID input */}
            <div className="space-y-1.5 pt-2 border-t border-wbk-lightgrey/40">
              <label className="block text-xs font-medium text-wbk-black">
                Or Paste Custom YouTube URL / Video ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. https://www.youtube.com/watch?v=1MQ7Ksb2t-Y or 1MQ7Ksb2t-Y"
                    value={formData.installation_video || ""}
                    onChange={(e) => handleChange("installation_video", e.target.value)}
                    className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                  />
                  {formData.installation_video && parseYouTubeVideo(formData.installation_video) && (
                    <span className="absolute right-2.5 top-2 text-[10px] text-green-600 font-semibold flex items-center gap-1">
                      <IconCheck size={12} /> Valid
                    </span>
                  )}
                </div>
                {formData.installation_video && (
                  <button
                    type="button"
                    onClick={() => handleChange("installation_video", "")}
                    className="px-3 py-2 text-xs border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black rounded-none cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[10px] text-wbk-brown">
                Accepts full URLs (e.g. youtube.com/watch?v=..., youtu.be/...) or direct 11-character YouTube video IDs.
              </p>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-wbk-lightgrey/70 flex items-center justify-between shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-wbk-brown hover:text-wbk-black transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="productEditForm"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <IconRefresh size={16} className="animate-spin" />
            ) : (
              <IconDeviceFloppy size={16} />
            )}
            <span>{saving ? "Saving..." : "Save to Supabase"}</span>
          </button>
        </div>

        {/* Full Image Preview Modal / Lightbox */}
        {activePreviewUrl && (
          <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setActivePreviewUrl(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="p-3 bg-[#FAF9F8] border-b border-wbk-lightgrey/60 flex items-center justify-between">
                <span className="text-xs font-mono text-wbk-brown truncate max-w-lg">
                  {activePreviewUrl}
                </span>
                <div className="flex items-center gap-2">
                  {Array.isArray(formData.product_images) && formData.product_images.includes(activePreviewUrl) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        const targetIdx = formData.product_images.indexOf(activePreviewUrl);
                        if (targetIdx !== -1) {
                          handleRemoveGalleryItem(targetIdx, e);
                        }
                        setActivePreviewUrl(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
                      title="Delete this image from gallery"
                    >
                      <IconTrash size={14} />
                      <span>Delete from Gallery</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activePreviewUrl)}
                    className="p-1.5 text-xs text-wbk-brown hover:text-wbk-black flex items-center gap-1 cursor-pointer bg-white border border-wbk-lightgrey/60 rounded"
                  >
                    {copiedUrl === activePreviewUrl ? <IconCheck size={14} className="text-green-600" /> : <IconCopy size={14} />}
                    <span>Copy URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewUrl(null)}
                    className="p-1 text-wbk-brown hover:text-wbk-black rounded-full hover:bg-wbk-lightgrey/50 cursor-pointer"
                  >
                    <IconX size={18} />
                  </button>
                </div>
              </div>

              {/* Modal image */}
              <div className="p-4 bg-[#F2EFEB] flex items-center justify-center max-h-[75vh] overflow-auto">
                <img
                  src={activePreviewUrl}
                  alt="Full preview"
                  className="max-h-[70vh] w-auto object-contain rounded shadow"
                />
              </div>
            </div>
          </div>
        )}

        {/* Supabase Storage Media Browser Modal */}
        {isStorageBrowserOpen && (
          <div
            className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
            onClick={() => setIsStorageBrowserOpen(false)}
          >
            <div
              className="relative w-full max-w-5xl h-[88vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col font-poppins"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 bg-[#090A0A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-wbk-gold text-wbk-black rounded">
                    <IconDatabase size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins text-sm font-semibold text-white flex items-center gap-2">
                      <span>Supabase Storage — ProductImages Bucket</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-wbk-gold">
                        {browserFiles.length} files
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/60">
                      Browse pre-uploaded images from Supabase Storage and assign them to this product.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStorageBrowserOpen(false)}
                    className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                  >
                    <IconX size={20} />
                  </button>
                </div>
              </div>

              {/* Target Slot Banner (when opened for image, hover_image, or gallery) */}
              {browserTarget && (
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 border-b border-wbk-gold/30 flex flex-wrap items-center justify-between gap-2 text-xs font-poppins shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-wbk-black flex items-center gap-1.5">
                      <IconTarget size={15} className="text-amber-700" />
                      <span>Active Target Slot:</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                        browserTarget === "image"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : browserTarget === "hover_image"
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {browserTarget === "image"
                        ? "⭐ Primary Image (Főkép)"
                        : browserTarget === "hover_image"
                        ? "🔷 Hover Image (Hover kép)"
                        : "🖼️ Product Gallery"}
                    </span>
                    <span className="text-[11px] text-wbk-brown hidden md:inline">
                      — Click any thumbnail below or use the quick buttons!
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-wbk-brown">Switch target:</span>
                    <button
                      type="button"
                      onClick={() => setBrowserTarget("image")}
                      className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer transition-colors ${
                        browserTarget === "image"
                          ? "bg-amber-500 text-white font-bold shadow-xs"
                          : "bg-white border text-wbk-black hover:bg-amber-50"
                      }`}
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrowserTarget("hover_image")}
                      className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer transition-colors ${
                        browserTarget === "hover_image"
                          ? "bg-blue-600 text-white font-bold shadow-xs"
                          : "bg-white border text-wbk-black hover:bg-blue-50"
                      }`}
                    >
                      Hover
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrowserTarget("gallery")}
                      className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer transition-colors ${
                        browserTarget === "gallery"
                          ? "bg-emerald-600 text-white font-bold shadow-xs"
                          : "bg-white border text-wbk-black hover:bg-emerald-50"
                      }`}
                    >
                      Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrowserTarget(null)}
                      className="px-1.5 py-0.5 text-[10px] text-wbk-brown hover:text-wbk-black cursor-pointer rounded"
                      title="Clear slot selection mode"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Action Notification Banner */}
              {browserNotice && (
                <div className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-medium flex items-center justify-between shrink-0 shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <IconCheck size={14} />
                    <span>{browserNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBrowserNotice(null)}
                    className="text-white/80 hover:text-white cursor-pointer px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Folder Tabs & Search Bar */}
              <div className="p-3 bg-[#F8F6F4] border-b border-wbk-lightgrey/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                {/* Dynamic folder buttons from Supabase Storage */}
                <div className="flex flex-wrap items-center gap-1.5 flex-1">
                  <span className="text-[11px] font-semibold text-wbk-brown mr-1 flex items-center gap-1">
                    <IconFolder size={14} className="text-wbk-gold" />
                    <span>Folder:</span>
                  </span>

                  {availableFolders.map((fPath) => {
                    const isSelected = browserFolder === fPath;
                    let label = fPath;
                    if (fPath === "wallbeds/1K") label = "wallbeds/1K (Cards)";
                    else if (fPath === "wallbeds/2K") label = "wallbeds/2K (Gallery)";

                    return (
                      <button
                        key={fPath}
                        type="button"
                        onClick={() => {
                          setBrowserFolder(fPath);
                          loadStorageBrowserFiles(fPath, browserSearch);
                        }}
                        className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer font-medium ${
                          isSelected
                            ? "bg-wbk-black text-white shadow-xs"
                            : "bg-white text-wbk-black hover:bg-[#EFECE8] border border-wbk-lightgrey/80"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      loadAvailableFolders(true);
                      loadStorageBrowserFiles(browserFolder, browserSearch);
                    }}
                    title="Re-scan bucket folders from Supabase"
                    className="p-1 text-wbk-brown hover:text-wbk-black hover:bg-white rounded border border-transparent hover:border-wbk-lightgrey cursor-pointer transition-colors"
                  >
                    <IconRefresh size={13} className={browserLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* Search input & upload button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <IconSearch size={14} className="absolute left-2.5 top-2.5 text-wbk-brown" />
                    <input
                      type="text"
                      placeholder="Search filename (e.g. 120x200, comfort)..."
                      value={browserSearch}
                      onChange={(e) => {
                        setBrowserSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          loadStorageBrowserFiles(browserFolder, e.target.value);
                        }
                      }}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded focus:outline-none focus:border-wbk-black font-poppins"
                    />
                    {browserSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setBrowserSearch("");
                          loadStorageBrowserFiles(browserFolder, "");
                        }}
                        className="absolute right-2 top-2 text-wbk-brown hover:text-wbk-black"
                      >
                        <IconX size={13} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => loadStorageBrowserFiles(browserFolder, browserSearch)}
                    className="p-1.5 bg-white border border-wbk-lightgrey hover:bg-[#FAF9F8] text-wbk-black rounded cursor-pointer"
                    title="Refresh / Search"
                  >
                    <IconRefresh size={15} className={browserLoading ? "animate-spin" : ""} />
                  </button>

                  <button
                    type="button"
                    onClick={() => browserFileRef.current?.click()}
                    disabled={browserUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold rounded cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                  >
                    {browserUploading ? <IconRefresh size={14} className="animate-spin" /> : <IconUpload size={14} />}
                    <span>Upload to Folder</span>
                  </button>
                </div>
              </div>

              {/* Media Browser Body */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#FAF9F8]">
                {browserLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-wbk-brown">
                    <IconRefresh size={28} className="animate-spin text-wbk-gold" />
                    <span className="text-xs">Loading storage files from Supabase...</span>
                  </div>
                ) : browserFiles.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-wbk-brown">
                    <IconFolder size={36} className="text-wbk-lightgrey" />
                    <p className="text-xs font-medium">No files found in &quot;{browserFolder}&quot;.</p>
                    <p className="text-[11px] text-wbk-brown/70">
                      Upload files into this folder or choose another one above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {browserFiles.map((file) => {
                      const isMain = formData.image === file.url;
                      const isHover = formData.hover_image === file.url;
                      const isInGallery = Array.isArray(formData.product_images) && formData.product_images.includes(file.url);

                      return (
                        <div
                          key={file.path}
                          className={`group bg-white border rounded-md overflow-hidden flex flex-col justify-between shadow-2xs transition-all ${
                            isMain
                              ? "border-amber-500 ring-2 ring-amber-500/20"
                              : isHover
                              ? "border-blue-500 ring-2 ring-blue-500/20"
                              : isInGallery
                              ? "border-emerald-500 ring-1 ring-emerald-500/20"
                              : "border-wbk-lightgrey/70 hover:border-wbk-black"
                          }`}
                        >
                          {/* Image preview (clickable to assign if browserTarget is active) */}
                          <div
                            onClick={() => {
                              if (browserTarget) {
                                handleAssignImage(browserTarget, file.url, file.name);
                              }
                            }}
                            className={`relative aspect-[4/3] bg-[#F4F2F0] p-1 flex items-center justify-center overflow-hidden ${
                              browserTarget ? "cursor-pointer" : ""
                            }`}
                            title={browserTarget ? `Click to select as ${browserTarget === "image" ? "Primary Image" : browserTarget === "hover_image" ? "Hover Image" : "Gallery"}` : ""}
                          >
                            <img
                              src={file.url}
                              alt={file.name}
                              loading="lazy"
                              className="w-full h-full object-contain transition-transform group-hover:scale-105"
                            />

                            {/* Active badges */}
                            <div className="absolute top-1 left-1 flex flex-col gap-0.5 pointer-events-none">
                              {isMain && (
                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded shadow-xs flex items-center gap-0.5">
                                  <IconStar size={10} /> Main
                                </span>
                              )}
                              {isHover && (
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded shadow-xs">
                                  Hover
                                </span>
                              )}
                              {isInGallery && (
                                <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded shadow-xs">
                                  ✓ In Gallery
                                </span>
                              )}
                            </div>

                            {/* Quick selection overlay prompt when target active */}
                            {browserTarget && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="px-2 py-1 bg-white text-wbk-black font-semibold text-[10px] rounded shadow">
                                  Select as {browserTarget === "image" ? "Primary" : browserTarget === "hover_image" ? "Hover" : "Gallery"}
                                </span>
                              </div>
                            )}

                            {/* Overlay preview button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePreviewUrl(file.url);
                              }}
                              title="Preview large"
                              className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-white text-wbk-black rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                            >
                              <IconEye size={13} />
                            </button>
                          </div>

                          {/* File info & actions */}
                          <div className="p-2 bg-white space-y-1.5 border-t border-wbk-lightgrey/40">
                            <div className="text-[10px] font-mono text-wbk-black truncate" title={file.name}>
                              {file.name}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-wbk-brown">
                              <span>{file.size ? `${Math.round(file.size / 1024)} KB` : ""}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(file.url)}
                                className="hover:text-wbk-black cursor-pointer"
                                title="Copy public URL"
                              >
                                {copiedUrl === file.url ? "Copied!" : "Copy URL"}
                              </button>
                            </div>

                            {/* Assignment action buttons */}
                            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-wbk-lightgrey/30">
                              <button
                                type="button"
                                onClick={() => handleAssignImage("image", file.url, file.name)}
                                title="Set as primary image"
                                className={`py-1 text-[9px] font-medium rounded transition-colors cursor-pointer text-center ${
                                  isMain
                                    ? "bg-amber-100 text-amber-800 font-bold"
                                    : "bg-[#F4F2F0] hover:bg-amber-50 text-wbk-black hover:text-amber-700"
                                }`}
                              >
                                Main
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignImage("hover_image", file.url, file.name)}
                                title="Set as hover image"
                                className={`py-1 text-[9px] font-medium rounded transition-colors cursor-pointer text-center ${
                                  isHover
                                    ? "bg-blue-100 text-blue-800 font-bold"
                                    : "bg-[#F4F2F0] hover:bg-blue-50 text-wbk-black hover:text-blue-700"
                                }`}
                              >
                                Hover
                              </button>
                              {isInGallery ? (
                                <button
                                  type="button"
                                  onClick={() => handleAssignImage("gallery", file.url, file.name)}
                                  title="Remove from product gallery"
                                  className="py-1 text-[9px] font-bold rounded transition-colors cursor-pointer text-center bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200"
                                >
                                  - Gallery
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAssignImage("gallery", file.url, file.name)}
                                  title="Add to product gallery"
                                  className="py-1 text-[9px] font-medium rounded transition-colors cursor-pointer text-center bg-[#F4F2F0] hover:bg-emerald-50 text-wbk-black hover:text-emerald-700"
                                >
                                  + Gallery
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-[#F8F6F4] border-t border-wbk-lightgrey/60 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-wbk-brown">
                  Click any button to assign photos directly to this product, then click &quot;Save to Supabase&quot;.
                </span>
                <button
                  type="button"
                  onClick={() => setIsStorageBrowserOpen(false)}
                  className="px-4 py-1.5 bg-wbk-black text-white text-xs font-semibold rounded hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
