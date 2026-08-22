import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, MapPin,
  ChevronLeft, Building2, Calendar, Clock, Loader2
} from 'lucide-react';
import { adminService } from '../../api/admin.service';
import type { AdminBookingListItem } from '../../types/domain.types';

const AdminBookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<AdminBookingListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await adminService.getBookingById(id!);
        setBooking(res.data);
      } catch {
        toast.error("Booking not found");
        navigate('/admin/bookings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h1>
            <p className="text-sm font-medium text-slate-400">ID: {booking._id}</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
          {booking.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Details */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <User size={14} /> Customer Information
            </h3>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-1 shrink-0 shadow-sm">
                {booking.user?.profilePhoto ? (
                  <img src={booking.user.profilePhoto} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.user?.name}`} alt="" className="w-full h-full rounded-xl" />
                )}
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{booking.user?.name || "—"}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <Mail size={16} className="text-slate-400" />
                    {booking.user?.email || "—"}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <Phone size={16} className="text-slate-400" />
                    Not provided
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Details */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <Building2 size={14} /> Provider Information
            </h3>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-1 shrink-0 shadow-sm">
                {booking.providerId?.profilePhoto || booking.providerId?.userId?.profilePhoto ? (
                  <img src={booking.providerId.profilePhoto || booking.providerId.userId.profilePhoto} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.providerId?.userId?.name}`} alt="" className="w-full h-full rounded-xl" />
                )}
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{booking.providerId?.userId?.name}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <Mail size={16} className="text-slate-400" />
                    {booking.providerId?.userId?.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <Phone size={16} className="text-slate-400" />
                    {booking.providerId?.userId?.phone || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <Clock size={14} /> Service Details
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-slate-900">{booking.serviceId?.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{booking.serviceId?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <Calendar size={18} className="text-blue-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Date</p>
                    <p className="text-xs font-bold text-slate-900">{booking.date}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <Clock size={18} className="text-purple-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Time Slot</p>
                    <p className="text-xs font-bold text-slate-900">{booking.slot?.start} - {booking.slot?.end}</p>
                  </div>
                </div>
              </div>

              {booking.addressId && (
                <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                  <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Service Location</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{booking.addressId.street}, {booking.addressId.city}, {booking.addressId.state} {booking.addressId.zipCode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-sm font-black tracking-wide mb-6">Payment Summary</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-slate-300">
                <span>Base Price</span>
                <span className="text-white">₹{booking.totalAmount?.toLocaleString()}</span>
              </div>

              {booking.completionInvoice && (
                <>
                  <div className="flex justify-between text-slate-300">
                    <span>Additional Charges</span>
                    <span className="text-white">₹{booking.completionInvoice.additionalCharges?.toLocaleString() || 0}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-700/50 flex justify-between font-black text-lg">
                    <span className="text-blue-400">Total</span>
                    <span>₹{booking.completionInvoice.finalAmount?.toLocaleString()}</span>
                  </div>
                </>
              )}
              {!booking.completionInvoice && (
                <div className="pt-4 border-t border-slate-700/50 flex justify-between font-black text-lg">
                  <span className="text-blue-400">Total</span>
                  <span>₹{booking.totalAmount?.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetail;
