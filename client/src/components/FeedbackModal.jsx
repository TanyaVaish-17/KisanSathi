import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import StarRating from "./StarRating";
import api from "../services/api";

const MAX_COMMENT = 500;

export default function FeedbackModal({ token, isHindi, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();

    if (rating === 0) {
      setError(isHindi ? "कृपया रेटिंग चुनें" : "Please choose a rating");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/feedback", {
        token: token._id,
        rating,
        comment: comment.trim() || undefined,
      });
      onSubmitted();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isHindi ? "फीडबैक भेजा नहीं जा सका" : "Could not send feedback")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const serviceName =
    (isHindi && token.service?.nameHi ? token.service.nameHi : token.service?.name) || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-card bg-white p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="feedback-title" className="text-xl font-bold text-forest-950">
              {isHindi ? "अपनी यात्रा को रेट करें" : "Rate your visit"}
            </h2>
            <p className="mt-1 text-xs text-slate-muted">
              #{token.tokenCode} · {token.center?.name} · {serviceName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isHindi ? "बंद करें" : "Close"}
            className="cursor-pointer rounded-btn p-1 text-slate-muted hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6">
          <div className="flex justify-center">
            <StarRating
              value={rating}
              onChange={setRating}
              label={isHindi ? "रेटिंग" : "Rating"}
            />
          </div>

          <label
            htmlFor="feedback-comment"
            className="mt-6 block font-mono text-xs font-semibold uppercase tracking-wider text-forest-950"
          >
            {isHindi ? "टिप्पणी (वैकल्पिक)" : "Comment (optional)"}
          </label>
          <textarea
            id="feedback-comment"
            rows={4}
            maxLength={MAX_COMMENT}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="mt-2 w-full rounded-btn border border-line-soft p-3 text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-950"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-slate-muted">
            {comment.length}/{MAX_COMMENT}
          </p>

          {error && (
            <p role="alert" className="mt-3 rounded-btn bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-btn border border-line-soft text-sm font-medium text-forest-950 hover:bg-surface"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-btn bg-forest-950 text-sm font-medium text-lime-300 hover:bg-forest-800 disabled:opacity-60"
            >
              {submitting ? (isHindi ? "भेजा जा रहा है..." : "Sending...") : isHindi ? "भेजें" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}