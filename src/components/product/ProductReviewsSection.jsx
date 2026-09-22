"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  IconStar,
  IconShieldCheck,
  IconPhoto,
  IconPlus,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconUpload,
  IconLoader2,
} from "@tabler/icons-react";

export function ProductReviewsSection({
  productSlug,
  productName = "Wall Bed King Murphy Bed",
  initialOpen = false,
  initialRating = 5,
  initialCustomerName = "",
  initialCustomerEmail = "",
}) {
  const searchParams = useSearchParams();
  const urlReview = searchParams?.get("review");
  const urlRating = searchParams?.get("rating") ? parseInt(searchParams.get("rating"), 10) : null;
  const urlName = searchParams?.get("name") || "";
  const urlEmail = searchParams?.get("email") || "";
  const shouldAutoOpen = initialOpen || urlReview === "true" || urlReview === "open" || Boolean(urlRating);

  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, avgRating: 5.0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(shouldAutoOpen);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Form state
  const [rating, setRating] = useState(urlRating || initialRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(urlName || initialCustomerName || "");
  const [authorEmail, setAuthorEmail] = useState(urlEmail || initialCustomerEmail || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal or photo viewer is active
  useEffect(() => {
    if (isModalOpen || selectedPhoto) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen, selectedPhoto]);

  useEffect(() => {
    if (shouldAutoOpen) {
      setIsModalOpen(true);
      if (urlRating || initialRating) setRating(urlRating || initialRating || 5);
      if (urlName || initialCustomerName) setAuthorName(urlName || initialCustomerName);
      if (urlEmail || initialCustomerEmail) setAuthorEmail(urlEmail || initialCustomerEmail);
    }
  }, [shouldAutoOpen, urlRating, initialRating, urlName, initialCustomerName, urlEmail, initialCustomerEmail]);

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productSlug=${encodeURIComponent(productSlug || "")}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit to max 4 photos, 5MB each
    files.slice(0, 4 - photos.length).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Photo ${file.name} is larger than 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotos((prev) => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      setFormFeedback({ type: "error", message: "Please provide your name and review details." });
      return;
    }

    setSubmitting(true);
    setFormFeedback(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          productName,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          rating,
          title: title.trim(),
          content: content.trim(),
          photos,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setFormFeedback({
        type: "success",
        message:
          "Thank you! Your review has been submitted and will appear on the product page as soon as our team approves it.",
      });

      // Reset fields after short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setFormFeedback(null);
        setRating(5);
        setTitle("");
        setContent("");
        setPhotos([]);
      }, 2500);
    } catch (err) {
      setFormFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-poppins">
      {/* Top Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-wbk-lightgrey/60">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-wbk-gold text-lg">
              {"★".repeat(Math.round(stats.avgRating || 5))}
              {"☆".repeat(5 - Math.round(stats.avgRating || 5))}
            </div>
            <span className="font-semibold text-sm text-wbk-black">
              {stats.avgRating || "5.0"} out of 5
            </span>
          </div>
          <p className="text-xs text-wbk-brown">
            Based on {stats.totalCount || reviews.length} verified customer reviews and installations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <IconPlus size={15} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="p-12 text-center text-wbk-brown text-xs">
          <div className="w-8 h-8 border-2 border-wbk-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading customer reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 bg-white border border-wbk-lightgrey text-center space-y-2">
          <p className="text-sm font-medium text-wbk-black">Be the first to review this bed!</p>
          <p className="text-xs text-wbk-brown">
            Share your experience with installation, space-saving benefits, and daily comfort.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 border border-wbk-lightgrey/60 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-wbk-gold text-xs font-semibold tracking-wider">
                    {"★".repeat(rev.rating || 5)}{"☆".repeat(5 - (rev.rating || 5))}
                  </div>

                  <span className="text-[10px] text-wbk-brown uppercase">
                    {new Date(rev.created_at || Date.now()).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="font-semibold text-xs text-wbk-black tracking-wide">
                    {rev.title}
                  </h4>
                )}

                <p className="text-xs leading-relaxed text-wbk-black/90 italic">
                  "{rev.content}"
                </p>

                {/* Customer Photo Thumbnails */}
                {Array.isArray(rev.photos) && rev.photos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block mb-1.5">
                      Customer Photos ({rev.photos.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rev.photos.map((photoUrl, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setSelectedPhoto(photoUrl)}
                          className="w-14 h-14 border border-wbk-lightgrey rounded overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <img
                            src={photoUrl}
                            alt={`Customer room setup ${pIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-wbk-lightgrey/40 flex items-center justify-between text-xs">
                <div className="font-medium text-wbk-black">
                  {rev.author_name}
                </div>
                {rev.verified_buyer && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    <IconShieldCheck size={12} className="text-emerald-600" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write a Review Modal (Portaled to document.body to avoid parent transform/stacking traps) */}
      {mounted && isModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-wbk-black/35 backdrop-blur-[3px] overflow-y-auto overscroll-contain transition-all"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6 py-10 sm:py-16">
            <div
              className="bg-white max-w-lg w-full rounded-2xl border border-wbk-lightgrey/80 shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pinned Modal Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-wbk-lightgrey/60 shrink-0 bg-white">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-wbk-gold block">
                    Feedback
                  </span>
                  <h3 className="font-new-york text-xl text-wbk-black">
                    Write a Product Review
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-wbk-brown hover:text-wbk-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <IconX size={20} />
                </button>
              </div>

              {/* Scrollable Modal Form Body */}
              <div className="overflow-y-auto p-5 sm:p-6 pt-4 space-y-4 text-xs flex-1">
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                      Your Overall Rating *
                    </label>
                    <div className="flex items-center gap-1 text-2xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="text-wbk-gold transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                        >
                          {(hoverRating || rating) >= star ? "★" : "☆"}
                        </button>
                      ))}
                      <span className="ml-3 text-xs font-semibold text-wbk-black">
                        {rating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Author Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-wbk-black mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-3 py-2 border border-wbk-lightgrey/80 rounded-lg bg-[#FBF9F8] text-wbk-black focus:outline-none focus:border-wbk-black focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-wbk-black mb-1">
                        Your Email (not shown publicly)
                      </label>
                      <input
                        type="email"
                        placeholder="sarah@example.com"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-wbk-lightgrey/80 rounded-lg bg-[#FBF9F8] text-wbk-black focus:outline-none focus:border-wbk-black focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-[11px] font-medium text-wbk-black mb-1">
                      Headline / Summary (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Smooth mechanism, huge space saver!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-wbk-lightgrey/80 rounded-lg bg-[#FBF9F8] text-wbk-black focus:outline-none focus:border-wbk-black focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Review Content */}
                  <div>
                    <label className="block text-[11px] font-medium text-wbk-black mb-1">
                      Your Review *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about the installation, build quality, and how the wall bed has improved your room..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-wbk-lightgrey/80 rounded-lg bg-[#FBF9F8] text-wbk-black focus:outline-none focus:border-wbk-black focus:bg-white transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Photo Upload with Previews */}
                  <div>
                    <label className="block text-[11px] font-medium text-wbk-black mb-1.5">
                      Attach Setup Photos (Optional - Max 4)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-wbk-lightgrey/80 rounded-lg overflow-hidden shadow-xs">
                          <img src={p} alt="Upload preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black cursor-pointer transition-colors"
                          >
                            <IconX size={12} />
                          </button>
                        </div>
                      ))}

                      {photos.length < 4 && (
                        <label className="w-16 h-16 border-2 border-dashed border-wbk-lightgrey hover:border-wbk-gold rounded-lg flex flex-col items-center justify-center text-wbk-brown hover:text-wbk-black cursor-pointer transition-colors bg-[#FBF9F8] hover:bg-white">
                          <IconUpload size={16} />
                          <span className="text-[9px] mt-1 font-medium">Add</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Feedback Alert */}
                  {formFeedback && (
                    <div
                      className={`p-3 text-xs border rounded-lg flex items-start gap-2 ${
                        formFeedback.type === "success"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-red-50 border-red-300 text-red-800"
                      }`}
                    >
                      {formFeedback.type === "success" ? (
                        <IconCheck size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                      ) : (
                        <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                      )}
                      <span>{formFeedback.message}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {submitting ? (
                        <>
                          <IconLoader2 size={16} className="animate-spin" />
                          <span>Submitting for Review...</span>
                        </>
                      ) : (
                        <span>Submit Review for Approval</span>
                      )}
                    </button>
                    <p className="text-[10px] text-wbk-brown text-center mt-2">
                      All reviews are verified by our team before publishing to protect against spam.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox / Full-size photo viewer (Portaled to document.body) */}
      {mounted && selectedPhoto && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-wbk-black/35 backdrop-blur-[3px] flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white p-3 sm:p-4 max-w-2xl w-full relative shadow-2xl rounded-2xl border border-wbk-lightgrey/80 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end pb-2">
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <IconX size={20} />
              </button>
            </div>
            <img
              src={selectedPhoto}
              alt="Full size customer photo"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
