import React, { useState } from "react";
import { X, ShieldAlert, Loader2, Upload, AlertCircle } from "lucide-react";
import { useReports } from "../../hooks/useReports";
import type { ReportCategory } from "../../types/domain.types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedId: string;
  bookingId?: string;
  reportedName?: string;
}

const CATEGORIES = [
  "Fraud",
  "Fake Profile",
  "Harassment",
  "Spam",
  "Payment Issue",
  "Inappropriate Behaviour",
  "Service Quality",
  "Other",
] as const satisfies readonly ReportCategory[];

type ReportCategoryOption = (typeof CATEGORIES)[number];

function isReportCategoryOption(value: string): value is ReportCategoryOption {
  return (CATEGORIES as readonly string[]).includes(value);
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedId,
  bookingId,
  reportedName = "User"
}) => {
  const { submitReport, isSubmitting } = useReports();
  
  const [category, setCategory] = useState<ReportCategoryOption | "">("");
  const [description, setDescription] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum size is 5MB.");
        return;
      }
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleClose = () => {
    setCategory("");
    setDescription("");
    setScreenshotFile(null);
    setPreviewUrl(null);
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) {
      setError("Please select a category and provide a description.");
      return;
    }

    const success = await submitReport({
      reportedId,
      bookingId,
      category,
      description,
      screenshot: screenshotFile || undefined
    });

    if (success) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Report {reportedName}</h2>
              <p className="text-xs text-slate-500 font-medium">Please provide details about the issue.</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                const value = e.target.value;
                setCategory(isReportCategoryOption(value) ? value : "");
                if (error) setError("");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              required
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError("");
              }}
              rows={4}
              placeholder="Please provide as much detail as possible..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none placeholder:text-slate-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Screenshot (Optional)</span>
              {screenshotFile && <span className="text-rose-500">1 file attached</span>}
            </label>
            
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-600 mb-1">Click to upload image</p>
                  <p className="text-[10px] font-medium text-slate-400">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={previewUrl} alt="Screenshot Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    onClick={() => {
                      setScreenshotFile(null);
                      setPreviewUrl(null);
                    }}
                    className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-5 py-3 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !category || !description.trim()}
            className="flex-1 px-5 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {(isSubmitting) && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
