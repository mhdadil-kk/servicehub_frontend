import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Check, 
  X, 
  Loader2, 
  User, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bookingApi } from "../../api/booking.service";
import type { Booking } from "../../api/booking.service";

const ProviderBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "completed" | "cancelled">("pending");

  // Decline/Cancel Modal States
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingApi.getProviderBookings();
      setBookings(res.data || []);
    } catch (error) {
      toast.error("Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await bookingApi.confirmBooking(id);
      toast.success("Booking accepted and confirmed!");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to accept booking.");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await bookingApi.completeBooking(id);
      toast.success("Booking marked as completed!");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to complete booking.");
    }
  };

  const handleDeclineClick = (id: string) => {
    setActionBookingId(id);
    setCancelReason("");
  };

  const handleConfirmDecline = async () => {
    if (!actionBookingId) return;
    setIsSubmittingAction(true);
    try {
      await bookingApi.cancelBooking(actionBookingId, cancelReason);
      toast.success("Booking declined successfully.");
      setActionBookingId(null);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to decline booking.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenChat = (bookingId: string) => {
    navigate(`/provider/messages?bookingId=${bookingId}`);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "confirmed") return b.status === "confirmed";
    if (activeTab === "completed") return b.status === "completed";
    return b.status === "cancelled" || b.status === "rescheduled";
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Requests</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage and track customer service appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {(["pending", "confirmed", "completed", "cancelled"] as const).map((tab) => {
          const count = bookings.filter(b => {
            if (tab === "pending") return b.status === "pending";
            if (tab === "confirmed") return b.status === "confirmed";
            if (tab === "completed") return b.status === "completed";
            return b.status === "cancelled" || b.status === "rescheduled";
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-xs font-black capitalize transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab === 'pending' ? 'New Requests' : tab}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  activeTab === tab ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-blue-600 animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Calendar size={30} />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1.5">No bookings here</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            You don't have any {activeTab === 'pending' ? 'new' : activeTab} booking requests.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => {
            const customer = typeof booking.userId === "object" ? booking.userId : null;
            const serviceInfo = typeof booking.serviceId === "object" ? booking.serviceId : null;
            const addressInfo = typeof booking.addressId === "object" ? booking.addressId : null;

            return (
              <div 
                key={booking._id}
                onClick={() => navigate(`/provider/bookings/${booking._id}`)}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6 hover:shadow-md hover:border-slate-200 transition-all relative overflow-hidden cursor-pointer group"
              >
                {/* Header Row: Customer Profile & Job Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer?.name || "C"}`}
                        alt=""
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{customer?.name || "Customer"}</h3>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-0.5">{serviceInfo?.name || "Requested Service"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>{booking.slot.start} - {booking.slot.end}</span>
                    </div>
                  </div>
                </div>

                {/* Info block: Address, Phone, Email & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-slate-700">Service Location ({addressInfo?.label})</p>
                        <p className="text-slate-500 font-semibold mt-0.5">{addressInfo?.fullAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Contacts info */}
                    <div className="flex gap-4 text-[11px] font-bold text-slate-500">
                      {customer?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <span>{customer?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes section */}
                {booking.notes && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-500">
                    <p className="font-bold text-slate-700 mb-1">User Instruction Notes:</p>
                    <p className="italic">"{booking.notes}"</p>
                  </div>
                )}

                {/* Cancel logs */}
                {booking.status === "cancelled" && booking.cancellationReason && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-xs font-semibold text-rose-600">
                    <p className="font-black mb-1 flex items-center gap-1"><AlertCircle size={14} /> Cancellation Details:</p>
                    <p className="font-bold">Cancelled by: {booking.cancelledBy === 'user' ? 'Customer' : 'You'}</p>
                    <p className="mt-1">Reason: "{booking.cancellationReason}"</p>
                  </div>
                )}

                {/* CTA Action Panel */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-wrap gap-3 pt-4 border-t border-slate-50 justify-between items-center"
                >
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Created on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    {/* Chat button for confirmed or completed bookings */}
                    {(booking.status === "confirmed" || booking.status === "completed") && (
                      <button
                        onClick={() => handleOpenChat(booking._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-100 transition-all hover:scale-[1.02]"
                      >
                        <MessageSquare size={14} />
                        <span>Chat Client</span>
                      </button>
                    )}

                    {/* Decline / Accept triggers for pending requests */}
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleConfirm(booking._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-100 transition-all hover:scale-[1.02]"
                        >
                          <Check size={14} />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleDeclineClick(booking._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 transition-all"
                        >
                          <X size={14} />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {/* Complete/Cancel triggers for confirmed schedule */}
                    {booking.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => handleComplete(booking._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-100 transition-all hover:scale-[1.02]"
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Completed</span>
                        </button>
                        <button
                          onClick={() => handleDeclineClick(booking._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 transition-all"
                        >
                          <Trash2 size={14} />
                          <span>Cancel Appointment</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- DECLINE/CANCEL DIALOG --- */}
      {actionBookingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-8 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Trash2 size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {activeTab === "pending" ? "Decline Request" : "Cancel Appointment"}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Please provide a reason to notify the customer about this action.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}  
                placeholder="e.g. Schedule conflict, out of station, service unavailable..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActionBookingId(null)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={isSubmittingAction || !cancelReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmittingAction && <Loader2 size={12} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;
