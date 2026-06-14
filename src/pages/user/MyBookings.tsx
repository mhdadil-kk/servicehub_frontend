import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  LayoutList,
  Hourglass,
  Ban,
  Star,
} from "lucide-react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bookingApi } from "../../api/booking.service";
import type { Booking } from "../../api/booking.service";
import { paymentApi } from "../../api/payment.service";
import BookingModal from "../../components/user/BookingModal";
import type { Provider } from "../../types/provider.types";
const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  // Cancellation Modal States
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Rescheduling States
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingApi.getUserBookings();
      setBookings(res.data || []);
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (b: Booking) => {
    const bookingDateTime = new Date(`${b.date}T${b.slot.start}:00`);
    const diffHours = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      toast.error("Bookings cannot be cancelled within 2 hours of the scheduled time.");
      return;
    }
    setCancelBookingId(b._id);
    setCancelReason("");
    setCancelReasonError("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    if (!cancelReason.trim()) {
      setCancelReasonError("Please provide a reason for cancellation.");
      return;
    }
    setIsCancelling(true);
    try {
      await bookingApi.cancelBooking(cancelBookingId, cancelReason);
      toast.success("Booking cancelled successfully.");
      setCancelBookingId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRescheduleClick = (b: Booking) => {
    const bookingDateTime = new Date(`${b.date}T${b.slot.start}:00`);
    const diffHours = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      toast.error("Bookings cannot be rescheduled within 2 hours of the scheduled time.");
      return;
    }
    setRescheduleBooking(b);
  };

  const handleOpenChat = (bookingId: string) => {
    navigate(`/user/messages?bookingId=${bookingId}`);
  };

  const handlePayInvoice = async (bookingId: string) => {
    try {
      toast.loading("Initiating payment...");
      const paymentRes: any = await paymentApi.createCheckoutSession(bookingId);
      if (paymentRes.url) {
        window.location.href = paymentRes.url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to initiate payment");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "upcoming") return ["pending", "awaiting_payment", "confirmed", "in_progress", "completed_pending_payment"].includes(b.status);
    if (activeTab === "past") return ["completed"].includes(b.status);
    return ["cancelled", "rescheduled"].includes(b.status);
  });

  // Summary counts
  const upcomingCount = bookings.filter((b) => ["pending", "awaiting_payment", "confirmed", "in_progress", "completed_pending_payment"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => ["cancelled", "rescheduled"].includes(b.status)).length;

  const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
    awaiting_payment: { label: "Awaiting Payment", cls: "bg-indigo-50 text-indigo-600 border-indigo-100", dot: "bg-indigo-500" },
    confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500" },
    in_progress: { label: "In Progress", cls: "bg-purple-50 text-purple-600 border-purple-100", dot: "bg-purple-500" },
    completed_pending_payment: { label: "Pending Payment", cls: "bg-indigo-50 text-indigo-600 border-indigo-100", dot: "bg-indigo-500" },
    completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
    cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-500" },
    rescheduled: { label: "Rescheduled", cls: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
    pending: { label: "Pending", cls: "bg-orange-50 text-orange-600 border-orange-100", dot: "bg-orange-400" },
  };

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount, Icon: Hourglass },
    { key: "past", label: "Completed", count: completedCount, Icon: CheckCircle2 },
    { key: "cancelled", label: "Cancelled", count: cancelledCount, Icon: Ban },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your appointments and service history</p>
        </div>
        <button
          onClick={() => navigate("/user/browse")}
          className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md shadow-blue-100 transition-all hover:scale-[1.02]"
        >
          <Calendar size={14} /> Book a Service
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Upcoming", value: upcomingCount, color: "blue", Icon: Hourglass },
          { label: "Completed", value: completedCount, color: "emerald", Icon: CheckCircle2 },
          { label: "Cancelled", value: cancelledCount, color: "rose", Icon: XCircle },
        ].map(({ label, value, color, Icon }) => (
          <div
            key={label}
            className={`bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-${color}-50 text-${color}-500`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── TAB BAR ── */}
      <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl w-fit border border-slate-100">
        {tabs.map(({ key, label, count, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === key
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            <Icon size={13} />
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === key ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 size={36} className="text-blue-600 animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm max-w-sm mx-auto">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100 text-slate-300">
            <LayoutList size={28} />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1.5">No bookings here</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-6">
            You don't have any {activeTab} bookings yet.
          </p>
          {activeTab === "upcoming" && (
            <button
              onClick={() => navigate("/user/browse")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Browse &amp; Book Now
            </button>
          )}
        </div>
      ) : (
        /* ── TABLE CONTAINER ── */
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm">

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.4fr_1.6fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50/60">
            {["Provider & Service", "Date & Time", "Address", "Status", "Actions"].map((h) => (
              <p key={h} className="text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</p>
            ))}
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-50">
            {filteredBookings.map((booking, idx) => {
              const providerInfo = typeof booking.providerId === "object" ? booking.providerId : null;
              const serviceInfo = typeof booking.serviceId === "object" ? booking.serviceId : null;
              const addressInfo = typeof booking.addressId === "object" ? booking.addressId : null;
              const providerUser = providerInfo?.userId;
              const sc = statusConfig[booking.status] ?? statusConfig["pending"];
              const canAct = ["pending", "awaiting_payment", "confirmed"].includes(booking.status);

              return (
                <div
                  key={booking._id}
                  className={`grid grid-cols-[2fr_1.4fr_1.6fr_1fr_auto] gap-4 items-center px-6 py-5 transition-colors hover:bg-slate-50/70 ${idx % 2 === 0 ? "" : "bg-slate-50/30"
                    }`}
                >
                  {/* ── Col 1: Provider & Service ── */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <img
                          src={
                            providerUser?.profilePhoto ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${providerUser?.name || "P"}`
                          }
                          alt={providerUser?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Completed star badge */}
                      {booking.status === "completed" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center shadow-sm">
                          <Star size={8} className="text-white fill-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {providerUser?.name || "Professional"}
                      </p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate mt-0.5">
                        {serviceInfo?.name || "Service"}
                      </p>
                    </div>
                  </div>

                  {/* ── Col 2: Date & Time ── */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                      <Clock size={11} className="text-slate-400 shrink-0" />
                      {booking.slot.start} – {booking.slot.end}
                    </div>
                  </div>

                  {/* ── Col 3: Address ── */}
                  <div className="flex items-start gap-1.5 min-w-0">
                    <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      {addressInfo ? (
                        <>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                            {addressInfo.label}
                          </p>
                          <p
                            className="text-[10px] font-medium text-slate-400 truncate"
                            title={addressInfo.fullAddress}
                          >
                            {addressInfo.fullAddress}
                          </p>
                        </>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">—</p>
                      )}
                    </div>
                  </div>

                  {/* ── Col 4: Status pill & OTP ── */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border whitespace-nowrap ${sc.cls}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                    {booking.arrivalOtp && booking.status === "confirmed" && (
                      <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 flex flex-col w-fit">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 mb-0.5">Arrival OTP</span>
                        <span className="text-base font-black text-blue-700 tracking-[0.2em]">{booking.arrivalOtp}</span>
                      </div>
                    )}
                    {booking.completionOtp && booking.status === "in_progress" && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex flex-col w-fit">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Completion OTP</span>
                        <span className="text-base font-black text-emerald-700 tracking-[0.2em]">{booking.completionOtp}</span>
                      </div>
                    )}
                    {booking.cancellationReason && (
                      <p
                        className="text-[9px] text-rose-400 font-medium mt-1 truncate max-w-[120px]"
                        title={booking.cancellationReason}
                      >
                        {booking.cancellationReason}
                      </p>
                    )}
                  </div>

                  {/* ── Col 5: Actions ── */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === booking._id ? null : booking._id)
                      }
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === booking._id && (
                      <div className="absolute right-0 top-10 z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">

                        {(booking.status === "confirmed" ||
                          booking.status === "in_progress" ||
                          booking.status === "completed_pending_payment" ||
                          booking.status === "completed") && (
                            <button
                              onClick={() => {
                                handleOpenChat(booking._id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                            >
                              <MessageSquare size={15} />
                              Chat
                            </button>
                          )}

                        {canAct && (
                          <>
                            <button
                              onClick={() => {
                                handleRescheduleClick(booking);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                            >
                              <RefreshCw size={15} />
                              Reschedule
                            </button>

                            <button
                              onClick={() => {
                                handleCancelClick(booking);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Cancel Booking
                            </button>
                          </>
                        )}
                        
                        {booking.status === "completed_pending_payment" && (
                          <button
                            onClick={() => {
                              handlePayInvoice(booking._id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 font-bold"
                          >
                            <CheckCircle2 size={15} />
                            Pay ₹{booking.totalAmount}
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/user/bookings/${booking._id}`)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                        >
                          <ChevronRight size={15} />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table footer */}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/40 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredBookings.length} {activeTab} {filteredBookings.length === 1 ? "booking" : "bookings"}
            </p>
          </div>
        </div>
      )}

      {/* ── CANCELLATION MODAL ── */}
      {cancelBookingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 p-8 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Trash2 size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">Cancel Booking</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelReasonError) setCancelReasonError("");
                }}
                rows={3}
                placeholder="Please state the reason (e.g. conflict, double booking, no longer required)..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
              {cancelReasonError && (
                <p className="text-red-500 text-[10px] font-semibold mt-1 ml-1">{cancelReasonError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCancelBookingId(null)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {isCancelling && <Loader2 size={12} className="animate-spin" />}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESCHEDULE MODAL ── */}
      {rescheduleBooking && (
        <BookingModal
          isOpen={!!rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          provider={
            typeof rescheduleBooking.providerId === "object"
              ? (rescheduleBooking.providerId as unknown as Provider)
              : ({} as Provider)
          }
          rescheduleBookingId={rescheduleBooking._id}
          initialAddressId={
            typeof rescheduleBooking.addressId === "object"
              ? rescheduleBooking.addressId._id
              : rescheduleBooking.addressId
          }
          initialNotes={rescheduleBooking.notes}
          onSuccess={() => {
            setRescheduleBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
