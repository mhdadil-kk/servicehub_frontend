import React, { useState, useEffect } from "react";
import {
  MapPin, Star, Check, Phone, Mail, Award, ArrowLeft, ShieldCheck, Briefcase, MessageCircle, Loader2, Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Provider } from "../../types/provider.types";
import { getSimulated } from "../../types/provider.types";
import { chatApi } from "../../api/chat.service";
import { reviewService } from "../../api/review.service";
import type { Review } from "../../types/provider.types";
import toast from "react-hot-toast";

interface ProviderProfileDetailProps {
  provider: Provider;
  userCoords: [number, number] | null;
  onBack: () => void;
  onBook: () => void;
}

const Stars: React.FC<{ count: number; size?: number }> = ({ count, size = 14 }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        className={i <= count ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}
      />
    ))}
  </span>
);

const ProviderProfileDetail: React.FC<ProviderProfileDetailProps> = ({
  provider,
  userCoords,
  onBack,
  onBook,
}) => {
  const navigate = useNavigate();
  const sim = getSimulated(provider, userCoords);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewService.getProviderReviews(provider._id);
        setReviews(res.data?.reviews || []);
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [provider._id]);

  const handleChat = async () => {
    if (isChatLoading) return;  
    setIsChatLoading(true);
    try {
      const res = await chatApi.getOrCreateDirectConversation(provider.userId._id);
      const conversation = res.data;
      if (conversation?._id) {
        navigate(`/user/messages?conversationId=${conversation._id}`);
      }
    } catch {
      toast.error("Could not start a conversation. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -m-8">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors border border-slate-100">
            <ArrowLeft size={16} />
          </div>
          Back to Results
        </button>
        <div className="w-px h-5 bg-slate-100" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Provider Profile</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* ── Hero Card ── */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-start gap-7">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-[28px] overflow-hidden border-2 border-slate-100 shadow-md bg-slate-50">
                <img
                  src={provider.profilePhoto || provider.userId?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${provider.userId.name}`}
                  alt={provider.userId.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-white shadow-sm">
                <ShieldCheck size={14} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {provider.userId.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-blue-600 font-black text-sm">
                    {provider.serviceId?.name || "Independent Professional"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-sm font-semibold flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    Licensed &amp; Background Checked
                  </span>
                </div>
                {provider.address && (
                  <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1">
                    <MapPin size={12} />
                    {provider.address}
                  </p>
                )}
              </div>

              {/* Stat bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-slate-900">{provider.averageRating || 0}</span>
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">({provider.totalReviews || 0})</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                  <p className="text-xl font-black text-emerald-600">₹{provider.hourlyRate || 350}</p>
                  <p className="text-[10px] text-slate-400 font-bold">per hour</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Area</p>
                  <p className="text-xl font-black text-slate-900">{provider.serviceRadius || 25}</p>
                  <p className="text-[10px] text-slate-400 font-bold">km radius</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-black text-emerald-600">Open Today</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">Response &lt; 1 hr</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-4 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleChat}
                  disabled={isChatLoading}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isChatLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <MessageCircle size={15} />
                  )}
                  {isChatLoading ? "Opening..." : "Chat"}
                </button>
                <button
                  type="button"
                  onClick={onBook}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-100 hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── About ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            About {provider.userId.name.split(" ")[0]}
          </h2>
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-8 space-y-5">
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {provider.bio ||
                `${provider.userId.name} is a verified service professional specializing in ${provider.serviceId?.name || "home services"}. Committed to delivering top-quality work with a focus on efficiency, reliability, and clear communication.`}
            </p>
            {provider.serviceId?.description && (
              <p className="text-sm font-medium text-slate-500 leading-relaxed border-t border-slate-50 pt-5">
                {provider.serviceId.description}
              </p>
            )}
            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
              {sim.tags.map((t, i) => (
                <span
                  key={i}
                  className="bg-slate-50 text-slate-600 border border-slate-100 text-xs font-black px-3 py-1.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Contact & Location ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Contact Information</h2>
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-slate-700">{provider.userId.email}</p>
              </div>
            </div>
            {provider.userId.phone && (
              <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold text-slate-700">{provider.userId.phone}</p>
                </div>
              </div>
            )}
            {provider.address && (
              <div className="flex items-start gap-4 p-4 bg-slate-50/60 rounded-2xl">
                <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Area</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{provider.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Verification Status ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Verification</h2>
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 space-y-3">
            {[
              { icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600", label: "Identity Verified", sub: "Government-issued ID checked and approved" },
              { icon: Award, color: "bg-blue-50 text-blue-600", label: "Professional License", sub: "Trade licenses and certifications validated" },
              { icon: Briefcase, color: "bg-violet-50 text-violet-600", label: "Background Checked", sub: "Full background screening completed" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-400">{item.sub}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Reviews</h2>
            <span className="text-xs font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              {provider.totalReviews || 0} total
            </span>
          </div>

          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 size={24} className="animate-spin text-blue-600" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-bold text-sm">No reviews yet.</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-7 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-100 overflow-hidden">
                        {rev.userId.profilePhoto ? (
                          <img src={rev.userId.profilePhoto} alt={rev.userId.name} className="w-full h-full object-cover" />
                        ) : (
                          rev.userId.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{rev.userId.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Stars count={rev.rating} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                  {rev.likedByProvider && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2 py-1 rounded-md">
                      <Heart size={12} className="fill-rose-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Liked by Provider</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileDetail;
