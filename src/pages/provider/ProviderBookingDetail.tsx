import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Check,
  X,
  Loader2,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Trash2,
  User,
  Briefcase,
  FileText,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingApi } from "../../api/booking.service";
import type { Booking } from "../../api/booking.service";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
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

// ─── Status badge ────────────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  awaiting_payment: {
    label: "Awaiting final confirmation",
    className: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border border-red-100",
  },
  rescheduled: {
    label: "Rescheduled",
    className: "bg-red-50 text-red-600 border border-red-100",
  },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-600 border border-slate-100",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

// ─── Section card wrapper ─────────────────────────────────────────────────────
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8">
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-slate-800 leading-snug">{value}</span>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProviderBookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline decline / cancel states
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP States
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [arrivalOtp, setArrivalOtp] = useState("");
  
  // Invoice & Completion States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceBaseCharge, setInvoiceBaseCharge] = useState("");
  const [extraCharges, setExtraCharges] = useState<{description: string, amount: string}[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionOtp, setCompletionOtp] = useState("");

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        setIsLoading(true);
        const res = await bookingApi.getBookingDetail(bookingId);
        setBooking(res.data);
      } catch {
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      const providerInfo: any = typeof booking.providerId === "object" ? booking.providerId : null;
      if (providerInfo && providerInfo.hourlyRate) {
        setInvoiceBaseCharge(providerInfo.hourlyRate.toString());
      } else if (booking.serviceId && typeof booking.serviceId === "object" && (booking.serviceId as any).basePrice) {
        setInvoiceBaseCharge((booking.serviceId as any).basePrice.toString());
      }
    }
  }, [booking]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!booking) return;
    try {
      const res = await bookingApi.acceptBooking(booking._id);
      setBooking(res.data);
      toast.success("Booking accepted! Waiting for customer to pay fee.");
    } catch {
      toast.error("Failed to accept booking.");
    }
  };

  const handleComplete = async () => {
    if (!booking) return;
    try {
      const res = await bookingApi.completeBooking(booking._id);
      setBooking(res.data);
      toast.success("Booking marked as completed!");
    } catch {
      toast.error("Failed to complete booking.");
    }
  };

  // --- OTP Handlers ---
  const handleGenerateArrivalOtp = async () => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      const res = await bookingApi.generateArrivalOtp(booking._id);
      setBooking(res.data);
      setShowArrivalModal(true);
      toast.success("Arrival marked. Customer can see the OTP now.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark arrival");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyArrivalOtp = async () => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      const res = await bookingApi.verifyArrivalOtp(booking._id, arrivalOtp);
      setBooking(res.data);
      setShowArrivalModal(false);
      setArrivalOtp("");
      toast.success("Arrival verified. Job is now in progress.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCompletionOtp = async () => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      const res = await bookingApi.generateCompletionOtp(booking._id, {
        baseCharge: Number(invoiceBaseCharge),
        extraCharges: extraCharges.map(c => ({ description: c.description, amount: Number(c.amount) }))
      });
      setBooking(res.data);
      setShowInvoiceModal(false);
      setShowCompletionModal(true);
      toast.success("Invoice saved. Customer can see the Completion OTP.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCompletionOtp = async () => {
    if (!booking) return;
    try {
      setIsSubmitting(true);
      const res = await bookingApi.verifyCompletionOtp(booking._id, completionOtp);
      setBooking(res.data);
      setShowCompletionModal(false);
      setCompletionOtp("");
      toast.success("Job completed successfully! Pending payment.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineOrCancel = async () => {
    if (!booking) return;
    if (!reason.trim()) {
      setReasonError("Please provide a reason before continuing.");
      return;
    }
    setReasonError("");
    setIsSubmitting(true);
    try {
      const res = await bookingApi.cancelBooking(booking._id, reason);
      setBooking(res.data);
      toast.success(
        booking.status === "pending"
          ? "Booking declined successfully."
          : "Appointment cancelled successfully."
      );
      setShowReasonBox(false);
      setReason("");
    } catch {
      toast.error("Failed to process request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReasonBox = () => {
    setShowReasonBox(true);
    setReason("");
    setReasonError("");
  };

  const handleChat = () => {
    if (booking) navigate(`/provider/messages?bookingId=${booking._id}`);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
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
            onClick={() => navigate("/provider/bookings")}
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
          >
            <ArrowLeft size={16} /> Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const customer = typeof booking.userId === "object" ? booking.userId : null;
  const serviceInfo = typeof booking.serviceId === "object" ? booking.serviceId : null;
  const addressInfo = typeof booking.addressId === "object" ? booking.addressId : null;

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
            onClick={() => navigate("/provider/bookings")}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Booking Detail
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Hash size={10} /> {booking._id}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* ── Customer section ─────────────────────────────────────────────── */}
      <Section title="Customer" icon={<User size={15} />}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer?.name ?? "C"}`}
              alt={customer?.name ?? "Customer"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {customer?.name ?? "Customer"}
            </h3>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              {customer?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {customer.email}
                </span>
              )}
              {customer?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400" />
                  {customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Service section ──────────────────────────────────────────────── */}
      <Section title="Service" icon={<Briefcase size={15} />}>
        <div className="space-y-3">
          <InfoRow label="Service Name" value={serviceInfo?.name ?? "—"} />
          {serviceInfo?.description && (
            <InfoRow label="Description" value={serviceInfo.description} />
          )}
        </div>
      </Section>

      {/* ── Appointment section ──────────────────────────────────────────── */}
      <Section title="Appointment" icon={<Calendar size={15} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Booked On</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Location section ─────────────────────────────────────────────── */}
      {addressInfo && (
        <Section title="Location" icon={<MapPin size={15} />}>
          <div className="space-y-3">
            {addressInfo.label && (
              <InfoRow label="Address Label" value={addressInfo.label} />
            )}
            {addressInfo.fullAddress && (
              <InfoRow label="Full Address" value={addressInfo.fullAddress} />
            )}
            {addressInfo.latitude != null && addressInfo.longitude != null && (
              <>
                <div className="flex gap-6">
                  <InfoRow label="Latitude" value={String(addressInfo.latitude)} />
                  <InfoRow label="Longitude" value={String(addressInfo.longitude)} />
                </div>
                <div className="h-[260px] w-full rounded-2xl overflow-hidden border border-slate-100 mt-4 relative z-0 shadow-inner">
                  <MapContainer
                    center={[addressInfo.latitude, addressInfo.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[addressInfo.latitude, addressInfo.longitude]} />
                  </MapContainer>
                </div>
              </>
            )}
          </div>
        </Section>
      )}

      {/* ── Notes section ────────────────────────────────────────────────── */}
      {booking.notes && (
        <Section title="Customer Notes" icon={<FileText size={15} />}>
          <blockquote className="border-l-4 border-blue-200 bg-blue-50/50 rounded-r-2xl pl-5 pr-4 py-4">
            <p className="text-sm font-semibold text-slate-700 italic leading-relaxed">
              "{booking.notes}"
            </p>
          </blockquote>
        </Section>
      )}

      {/* ── Cancellation section ─────────────────────────────────────────── */}
      {isCancelled && booking.cancellationReason && (
        <div className="bg-red-50/60 rounded-[32px] border border-red-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-500 border border-red-100">
              <AlertCircle size={15} />
            </div>
            <p className="text-xs font-black text-red-400 uppercase tracking-widest">Cancellation Details</p>
          </div>
          <div className="space-y-3">
            <InfoRow
              label="Cancelled By"
              value={
                <span className={booking.cancelledBy === "user" ? "text-amber-700" : "text-red-700"}>
                  {booking.cancelledBy === "user" ? "Customer" : "You (Provider)"}
                </span>
              }
            />
            <InfoRow
              label="Reason"
              value={
                <span className="italic text-red-700">"{booking.cancellationReason}"</span>
              }
            />
          </div>
        </div>
      )}

      {/* ── Action section ───────────────────────────────────────────────── */}
      {!isCancelled && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Actions</p>

          {/* Reason textarea (inline) */}
          {showReasonBox && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isPending ? "Decline Reason" : "Cancellation Reason"}
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setReasonError("");
                }}
                rows={3}
                placeholder="e.g. Schedule conflict, service unavailable, out of station..."
                className={`w-full border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition-colors ${
                  reasonError ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {reasonError && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {reasonError}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {/* PENDING state */}
            {isPending && !showReasonBox && (
              <>
                <button
                  onClick={handleAccept}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-100 transition-all hover:scale-[1.02]"
                >
                  <Check size={15} /> Accept Request
                </button>
                <button
                  onClick={openReasonBox}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-red-100"
                >
                  <X size={15} /> Decline
                </button>
              </>
            )}

            {/* AWAITING PAYMENT state */}
            {isAwaitingPayment && (
              <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
                <p className="text-sm font-bold text-indigo-700 flex items-center justify-center gap-2">
                  <Clock size={18} /> Awaiting final confirmation
                </p>
                <p className="text-xs text-indigo-600/80 font-medium mt-1">
                  You accepted this request. Waiting for the customer to pay the platform booking fee.
                </p>
              </div>
            )}

            {/* PENDING + reason box shown */}
            {isPending && showReasonBox && (
              <>
                <button
                  onClick={handleDeclineOrCancel}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-red-100 transition-all disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <X size={15} /> Confirm Decline
                </button>
                <button
                  onClick={() => setShowReasonBox(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl transition-all border border-slate-100"
                >
                  Back
                </button>
              </>
            )}

            {/* CONFIRMED state (Job not started yet) */}
            {isConfirmed && !showReasonBox && (
              <>
                {!booking.arrivalOtp ? (
                  <button
                    onClick={handleGenerateArrivalOtp}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-blue-100 transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                    I've Arrived
                  </button>
                ) : (
                  <button
                    onClick={() => setShowArrivalModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-amber-100 transition-all hover:scale-[1.02]"
                  >
                    <Check size={15} /> Enter Arrival OTP
                  </button>
                )}
                
                <button
                  onClick={openReasonBox}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-red-100"
                >
                  <Trash2 size={15} /> Cancel Appointment
                </button>
                <button
                  onClick={handleChat}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <MessageSquare size={15} /> Chat
                </button>
              </>
            )}

            {/* IN PROGRESS state (Job started) */}
            {isInProgress && (
              <>
                {!booking.completionOtp ? (
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-100 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle2 size={15} /> Complete Job
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-amber-100 transition-all hover:scale-[1.02]"
                  >
                    <Check size={15} /> Enter Completion OTP
                  </button>
                )}
                <button
                  onClick={handleChat}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <MessageSquare size={15} /> Chat
                </button>
              </>
            )}
            {/* CONFIRMED + reason box shown */}
            {isConfirmed && showReasonBox && (
              <>
                <button
                  onClick={handleDeclineOrCancel}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-red-100 transition-all disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <Trash2 size={15} /> Confirm Cancellation
                </button>
                <button
                  onClick={() => setShowReasonBox(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl transition-all border border-slate-100"
                >
                  Back
                </button>
              </>
            )}

            {/* COMPLETED or PENDING PAYMENT state */}
            {(isCompleted || isPendingPayment) && (
              <button
                onClick={handleChat}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-blue-100 transition-all hover:scale-[1.02]"
              >
                <MessageSquare size={15} /> Chat with Customer
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-xl space-y-5 animate-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black text-slate-900">Verify Arrival OTP</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              The customer can see the Arrival OTP on their booking page. Enter it here to start the job.
            </p>
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              value={arrivalOtp}
              onChange={(e) => setArrivalOtp(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600"
              maxLength={4}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowArrivalModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl">Cancel</button>
              <button onClick={handleVerifyArrivalOtp} disabled={isSubmitting || arrivalOtp.length < 4} className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl disabled:opacity-50">
                {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-xl space-y-5 animate-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black text-slate-900">Verify Completion OTP</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              The customer has been sent the Completion OTP along with the final invoice. Enter it to complete the job.
            </p>
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              value={completionOtp}
              onChange={(e) => setCompletionOtp(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600"
              maxLength={4}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCompletionModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl">Cancel</button>
              <button onClick={handleVerifyCompletionOtp} disabled={isSubmitting || completionOtp.length < 4} className="flex-1 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl disabled:opacity-50">
                {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Complete Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">Generate Final Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Base Labor Charge (₹)</label>
                <input
                  type="number"
                  value={invoiceBaseCharge}
                  disabled
                  className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-3 cursor-not-allowed font-bold"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extra Materials / Charges</label>
                  <button
                    onClick={() => setExtraCharges([...extraCharges, { description: "", amount: "" }])}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                
                {extraCharges.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => {
                        const newExt = [...extraCharges];
                        newExt[idx].description = e.target.value;
                        setExtraCharges(newExt);
                      }}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={item.amount}
                      onChange={(e) => {
                        const newExt = [...extraCharges];
                        newExt[idx].amount = e.target.value;
                        setExtraCharges(newExt);
                      }}
                      className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={() => setExtraCharges(extraCharges.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 px-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {extraCharges.length === 0 && <p className="text-xs text-slate-400 italic">No extra charges added.</p>}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="text-sm font-bold text-slate-600">Total Invoice Amount</span>
                <span className="text-lg font-black text-slate-900">
                  ₹{(Number(invoiceBaseCharge) || 0) + extraCharges.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
                </span>
              </div>
            </div>

            <button 
              onClick={handleGenerateCompletionOtp} 
              disabled={isSubmitting || !invoiceBaseCharge} 
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Invoice & Generate OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookingDetail;
