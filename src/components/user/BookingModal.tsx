import React, { useState, useEffect } from "react";
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Check, 
  Loader2, 
  AlertCircle,
  Plus,
  Navigation
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingApi } from "../../api/booking.service";
import type { AvailableSlot } from "../../api/booking.service";
import { addressApi } from "../../api/address.service";
import type { Address } from "../../api/address.service";
import type { Provider } from "../../types/provider.types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  onSuccess?: () => void;
  rescheduleBookingId?: string;
  initialAddressId?: string;
  initialNotes?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSuccess,
  rescheduleBookingId,
  initialAddressId,
  initialNotes
}) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  
  // Quick Add Address Form inside Modal
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [notes, setNotes] = useState(initialNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate("");
      setSelectedSlot(null);
      setNotes(initialNotes || "");
      setShowAddAddressForm(false);
      fetchAddresses();
    }
  }, [isOpen, initialNotes]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      const res = await bookingApi.getAvailableSlots(provider._id, selectedDate);
      setSlots(res.data || []);
    } catch (error) {
      toast.error("Failed to load availability slots.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await addressApi.getAddresses();
      const addrList = res.data || [];
      setAddresses(addrList);
      
      // Auto select default address
      const defaultAddr = addrList.find(a => a.isDefault);
      if (initialAddressId) {
        setSelectedAddressId(initialAddressId);
      } else if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0]._id);
      }
    } catch (error) {
      toast.error("Failed to load addresses.");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleResolveCoords = async () => {
    if (!fullAddress || fullAddress.trim().length < 5) return;
    try {
      setIsGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleQuickAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress.trim()) {
      toast.error("Address is required");
      return;
    }
    const finalLabel = addressLabel === "Custom" ? customLabel.trim() : addressLabel;
    if (!finalLabel) {
      toast.error("Label is required");
      return;
    }

    try {
      setIsGeocoding(true);
      const payload = {
        label: finalLabel,
        fullAddress,
        latitude,
        longitude,
        isDefault: addresses.length === 0
      };

      const res = await addressApi.createAddress(payload);
      toast.success("Address added successfully!");
      setShowAddAddressForm(false);
      setFullAddress("");
      setCustomLabel("");
      
      // Refresh addresses and auto select the newly added address
      const updatedRes = await addressApi.getAddresses();
      const updatedList = updatedRes.data || [];
      setAddresses(updatedList);
      
      const newAddr = updatedList.find(a => a.fullAddress === payload.fullAddress) || res.data;
      if (newAddr) {
        setSelectedAddressId(newAddr._id);
      }
    } catch (error) {
      toast.error("Failed to save address.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedAddressId) return;

    setIsSubmitting(true);
    try {
      if (rescheduleBookingId) {
        // Reschedule
        await bookingApi.rescheduleBooking(rescheduleBookingId, {
          date: selectedDate,
          slot: { start: selectedSlot.start, end: selectedSlot.end },
          addressId: selectedAddressId,
          notes
        });
        toast.success("Booking rescheduled successfully!");
      } else {
        // Create Booking
        await bookingApi.createBooking({
          providerId: provider._id,
          serviceId: provider.serviceId?._id || "",
          addressId: selectedAddressId,
          date: selectedDate,
          slot: { start: selectedSlot.start, end: selectedSlot.end },
          notes
        });
        toast.success("Booking request submitted!");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentAddressObj = addresses.find(a => a._id === selectedAddressId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {rescheduleBookingId ? "Reschedule Booking" : "Book Service"}
            </h3>
            <p className="text-xs font-bold text-blue-600 mt-0.5">with {provider.userId.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-950 p-1 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Stepper progress */}
        <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-400">
          <span className={step >= 1 ? "text-blue-600" : ""}>1. Date</span>
          <span className="text-slate-200">/</span>
          <span className={step >= 2 ? "text-blue-600" : ""}>2. Time Slot</span>
          <span className="text-slate-200">/</span>
          <span className={step >= 3 ? "text-blue-600" : ""}>3. Address</span>
          <span className="text-slate-200">/</span>
          <span className={step >= 4 ? "text-blue-600" : ""}>4. Review</span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* STEP 1: DATE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <CalendarIcon size={32} className="text-blue-600 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Select Date</h4>
                <p className="text-xs text-slate-400 font-medium">When do you need the service?</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-700"
                />
              </div>
            </div>
          )}

          {/* STEP 2: TIME SLOTS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                <CalendarIcon size={18} className="text-blue-600" />
                <div className="text-xs">
                  <p className="text-slate-400 font-bold">Selected Date</p>
                  <p className="font-black text-slate-800">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Available Time Slots</label>

              {isLoadingSlots ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <span className="text-xs text-slate-400 font-bold">Loading slots...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 bg-red-50/50 rounded-2xl border border-red-50 text-red-500 space-y-2">
                  <AlertCircle size={24} className="mx-auto" />
                  <p className="text-xs font-black">No availability slots open</p>
                  <p className="text-[10px] text-slate-400">The provider has no slots configured on this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={s.isBooked}
                      onClick={() => setSelectedSlot(s)}
                      className={`py-3.5 px-4 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col justify-center items-center gap-1 ${
                        s.isBooked
                          ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                          : selectedSlot?.id === s.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <Clock size={14} />
                      <span>{s.start} - {s.end}</span>
                      {s.isBooked && <span className="text-[9px] text-red-500 uppercase tracking-wider font-black">Booked</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ADDRESS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {!showAddAddressForm ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Address</label>
                    <button
                      type="button"
                      onClick={() => setShowAddAddressForm(true)}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add New Address
                    </button>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <MapPin size={24} className="text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 font-bold">You don't have any saved addresses</p>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Create New Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddressId(addr._id)}
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3 items-start transition-all ${
                            selectedAddressId === addr._id
                              ? "border-blue-600 bg-blue-50/10 shadow-sm"
                              : "border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedAddressId === addr._id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                          }`}>
                            <MapPin size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex gap-2 items-center mb-0.5">
                              <p className="text-xs font-black text-slate-900">{addr.label}</p>
                              {addr.isDefault && (
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed truncate">{addr.fullAddress}</p>
                          </div>
                          {selectedAddressId === addr._id && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleQuickAddAddress} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-slate-800">Add New Address</h4>
                    <button type="button" onClick={() => setShowAddAddressForm(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                      Select Saved Address
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Label</label>
                    <div className="flex gap-1.5">
                      {["Home", "Work", "Other", "Custom"].map(lbl => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setAddressLabel(lbl)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            addressLabel === lbl ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {addressLabel === "Custom" && (
                    <input
                      type="text"
                      placeholder="Label Name (e.g. Parents' House)"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Address</label>
                    <textarea
                      rows={2}
                      placeholder="Street name, City, ZIP code"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      onBlur={handleResolveCoords}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold text-slate-500">
                    {isGeocoding ? (
                      <>
                        <Loader2 size={12} className="text-blue-600 animate-spin" />
                        <span>Resolving coordinates...</span>
                      </>
                    ) : latitude && longitude ? (
                      <>
                        <Check size={12} className="text-emerald-500" strokeWidth={3} />
                        <span>Coordinates resolved ({latitude.toFixed(3)}, {longitude.toFixed(3)})</span>
                      </>
                    ) : (
                      <span>Coordinates will resolve as you type</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isGeocoding || !fullAddress.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Save &amp; Use Address
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-[24px] border border-slate-100 p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Booking Summary</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold">Service</p>
                    <p className="font-black text-slate-800 mt-0.5">{provider.serviceId?.name || "Independent Service"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">Provider</p>
                    <p className="font-black text-slate-800 mt-0.5">{provider.userId.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">Date</p>
                    <p className="font-black text-slate-800 mt-0.5">{selectedDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">Time Slot</p>
                    <p className="font-black text-slate-800 mt-0.5">{selectedSlot?.start} - {selectedSlot?.end}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-xs">
                  <p className="text-slate-400 font-bold mb-1">Service Location</p>
                  <div className="flex gap-1.5 items-start">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="font-bold text-slate-700 leading-relaxed">{currentAddressObj?.fullAddress}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Share instructions for the professional (e.g., parking, landmark, entry instructions)..."
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-8 py-6 border-t border-slate-100 shrink-0 flex gap-3 bg-slate-50/50">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                if (step === 3 && showAddAddressForm) {
                  setShowAddAddressForm(false);
                } else {
                  setStep(s => s - 1);
                }
              }}
              className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-2xl text-xs font-bold transition-all"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={
                (step === 1 && !selectedDate) ||
                (step === 2 && !selectedSlot) ||
                (step === 3 && (!selectedAddressId || showAddAddressForm))
              }
              onClick={() => setStep(s => s + 1)}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl text-xs font-bold transition-all disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>{rescheduleBookingId ? "Confirm Reschedule" : "Confirm Booking"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
