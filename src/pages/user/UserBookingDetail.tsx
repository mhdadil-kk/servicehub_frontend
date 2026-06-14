import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Check,
  X,
  Star,
  FileText
} from "lucide-react";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import { bookingApi } from "../../api/booking.service";
import type { Booking } from "../../api/booking.service";
import { paymentApi } from "../../api/payment.service";

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </span>
    <span className="text-sm font-bold text-slate-800 text-right max-w-[60%] leading-snug">
      {value}
    </span>
  </div>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5 relative overflow-hidden group hover:border-blue-100 transition-colors">
    <div className="flex items-center gap-2 relative z-10">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
        {icon}
      </div>
      <h2 className="text-sm font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

const UserBookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Actions state
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await bookingApi.getBookingDetail(bookingId);
        setBooking(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!booking) return;
    if (!cancelReason.trim()) {
      setCancelReasonError("Please provide a reason before continuing.");
      return;
    }
    setCancelReasonError("");
    setIsSubmitting(true);
    try {
      const res = await bookingApi.cancelBooking(booking._id, cancelReason);
      setBooking(res.data);
      toast.success("Booking cancelled successfully.");
      setShowCancelBox(false);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChat = () => {
    if (booking) navigate(`/user/messages?bookingId=${booking._id}`);
  };

  const handlePayInvoice = async () => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      toast.loading("Initiating payment...");
      const paymentRes: any = await paymentApi.createCheckoutSession(booking._id);
      if (paymentRes.url) {
        window.location.href = paymentRes.url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to initiate payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[32px] border border-red-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1.5">Something went wrong</h3>
          <p className="text-xs text-slate-400 font-semibold mb-6">
            {error ?? "Booking not found."}
          </p>
          <button
            onClick={() => navigate("/user/bookings")}
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
          >
            <ArrowLeft size={16} /> Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const providerInfo = typeof booking.providerId === "object" ? booking.providerId : null;
  const serviceInfo = typeof booking.serviceId === "object" ? booking.serviceId : null;
  const addressInfo = typeof booking.addressId === "object" ? booking.addressId : null;
  const providerUser = providerInfo?.userId;

  const isPending = booking.status === "pending";
  const isAwaitingPayment = booking.status === "awaiting_payment";
  const isConfirmed = booking.status === "confirmed";
  const isInProgress = booking.status === "in_progress";
  const isPendingPayment = booking.status === "completed_pending_payment";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled" || booking.status === "rescheduled";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-32">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/user/bookings")}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Booking Detail
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                Ref: {booking._id.slice(-6)}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  isConfirmed ? "bg-blue-100 text-blue-600" :
                  isInProgress ? "bg-purple-100 text-purple-600" :
                  isPendingPayment ? "bg-indigo-100 text-indigo-600" :
                  isAwaitingPayment ? "bg-indigo-100 text-indigo-600" :
                  isCompleted ? "bg-emerald-100 text-emerald-600" :
                  isCancelled ? "bg-rose-100 text-rose-600" :
                  "bg-amber-100 text-amber-600"
                }`}
              >
                {booking.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Provider Info ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm shrink-0">
            <img
              src={providerUser?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${providerUser?.name || "Provider"}`}
              alt={providerUser?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Service Provider</p>
            <h3 className="text-lg font-black text-slate-900">{providerUser?.name || "Provider"}</h3>
            <p className="text-xs font-bold text-blue-600 mt-0.5">{serviceInfo?.name}</p>
          </div>
        </div>
        <button
          onClick={handleChat}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <MessageSquare size={15} /> Message
        </button>
      </div>

      {/* ── Invoice details (For completed bookings) ── */}
      {isCompleted && booking.finalInvoice && (
        <Section title="Final Invoice" icon={<FileText size={15} />}>
          <div className="space-y-3">
            <InfoRow label="Base Labor Charge" value={`₹${booking.finalInvoice.baseCharge}`} />
            {booking.finalInvoice.extraCharges?.map((charge, idx) => (
              <InfoRow key={idx} label={`Extra: ${charge.description}`} value={`₹${charge.amount}`} />
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center bg-emerald-50 p-4 rounded-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Total Paid Amount</span>
              <span className="text-2xl font-black text-emerald-700">₹{booking.totalAmount}</span>
            </div>
          </div>
        </Section>
      )}

      {/* ── Appointment details ──────────────────────────────────────────── */}
      <Section title="Appointment Details" icon={<Calendar size={15} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">{booking.date}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Time Slot</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {booking.slot.start} – {booking.slot.end}
              </p>
            </div>
          </div>
        </div>

        {addressInfo && (
          <div className="space-y-3 pt-6 border-t border-slate-50">
            {addressInfo.label && (
              <InfoRow label="Address Label" value={addressInfo.label} />
            )}
            {addressInfo.fullAddress && (
              <InfoRow label="Full Address" value={addressInfo.fullAddress} />
            )}
            {addressInfo.latitude != null && addressInfo.longitude != null && (
              <div className="h-[200px] w-full rounded-2xl overflow-hidden border border-slate-100 mt-4 relative z-0 shadow-inner">
                <MapContainer
                  center={[addressInfo.latitude, addressInfo.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[addressInfo.latitude, addressInfo.longitude]} />
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      {!isCancelled && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Actions</p>

          {showCancelBox && (
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (e.target.value.trim()) setCancelReasonError("");
                }}
                rows={3}
                placeholder="Why do you need to cancel this booking?"
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600 resize-none transition-colors ${
                  cancelReasonError ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {cancelReasonError && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {cancelReasonError}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {/* ── Booking Fee ── */}
            {isAwaitingPayment && (
              <div className="w-full flex flex-col gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3 w-full">
                  <h4 className="text-sm font-black text-blue-900 mb-1">Provider Accepted! 🎉</h4>
                  <p className="text-xs text-blue-700 font-medium">Please pay the platform booking fee to confirm your slot. This guarantees your booking.</p>
                </div>
                <button
                  onClick={handlePayInvoice}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Pay Booking Fee (₹100)
                </button>
              </div>
            )}

            {/* ── Final Invoice ── */}
            {isPendingPayment && (
              <div className="w-full flex flex-col gap-4">
                {/* ── Invoice Breakdown above Pay Button ── */}
                {booking.finalInvoice && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 w-full">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Final Invoice Breakdown</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">Base Labor Charge</span>
                      <span className="text-sm font-black text-slate-900">₹{booking.finalInvoice.baseCharge}</span>
                    </div>
                    {booking.finalInvoice.extraCharges?.map((charge, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Extra: {charge.description}</span>
                        <span className="text-sm font-black text-slate-900">₹{charge.amount}</span>
                      </div>
                    ))}
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-black text-slate-900">Total Amount to Pay</span>
                      <span className="text-xl font-black text-indigo-700">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handlePayInvoice}
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Pay Final Invoice (₹{booking.totalAmount})
                </button>
              </div>
            )}

            {isPending && (
              <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                <p className="text-sm font-bold text-amber-700 flex items-center justify-center gap-2">
                  <Clock size={18} /> Awaiting Provider Acceptance
                </p>
                <p className="text-xs text-amber-600/80 font-medium mt-1">We'll notify you as soon as the provider confirms availability.</p>
              </div>
            )}

            {(isPending || isAwaitingPayment || isConfirmed) && !showCancelBox && (
              <button
                onClick={() => setShowCancelBox(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-red-100 w-full justify-center"
              >
                <X size={15} /> Cancel Booking
              </button>
            )}

            {(isPending || isAwaitingPayment || isConfirmed) && showCancelBox && (
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-100 transition-all disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setShowCancelBox(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl transition-all border border-slate-100"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCancelled && booking.cancellationReason && (
        <div className="bg-red-50/60 rounded-[32px] border border-red-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-500 border border-red-100">
              <AlertCircle size={15} />
            </div>
            <p className="text-xs font-black text-red-400 uppercase tracking-widest">Cancelled</p>
          </div>
          <p className="text-sm font-semibold text-slate-700">Reason: "{booking.cancellationReason}"</p>
        </div>
      )}
    </div>
  );
};

export default UserBookingDetail;
