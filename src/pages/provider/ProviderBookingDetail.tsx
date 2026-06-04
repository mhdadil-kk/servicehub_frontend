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

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!booking) return;
    try {
      const res = await bookingApi.confirmBooking(booking._id);
      setBooking(res.data);
      toast.success("Booking accepted and confirmed!");
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
  const isConfirmed = booking.status === "confirmed";
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
                  onClick={handleConfirm}
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

            {/* CONFIRMED state */}
            {isConfirmed && !showReasonBox && (
              <>
                <button
                  onClick={handleComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-100 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 size={15} /> Mark Complete
                </button>
                <button
                  onClick={openReasonBox}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-red-100"
                >
                  <Trash2 size={15} /> Cancel Appointment
                </button>
                <button
                  onClick={handleChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-blue-100 transition-all hover:scale-[1.02]"
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

            {/* COMPLETED state */}
            {isCompleted && (
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
    </div>
  );
};

export default ProviderBookingDetail;
