import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Navigation,
  Loader2,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { addressApi } from "../../api/address.service";
import type { Address } from "../../api/address.service";

const AddressBook: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await addressApi.getAddresses();
      setAddresses(res.data || []);
    } catch (error) {
      toast.error("Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setLabel("Home");
    setCustomLabel("");
    setFullAddress("");
    setLatitude(undefined);
    setLongitude(undefined);
    setIsDefault(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: Address) => {
    setEditId(addr._id);
    if (["Home", "Work", "Other"].includes(addr.label)) {
      setLabel(addr.label);
      setCustomLabel("");
    } else {
      setLabel("Custom");
      setCustomLabel(addr.label);
    }
    setFullAddress(addr.fullAddress);
    setLatitude(addr.latitude);
    setLongitude(addr.longitude);
    setIsDefault(addr.isDefault);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleAddressBlur = async () => {
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
      console.error("Geocoding failed", e);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat);
        setLongitude(lon);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setFullAddress(data.display_name);
          }
        } catch (e) {
          toast.error("Failed to resolve address from coordinates.");
        } finally {
          setIsGeocoding(false);
        }
      },
      () => {
        toast.error("Unable to retrieve your location.");
        setIsGeocoding(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!fullAddress.trim()) {
      newErrors.address = "Address is required.";
    }

    const finalLabel = label === "Custom" ? customLabel.trim() : label;
    if (label === "Custom" && !finalLabel) {
      newErrors.customLabel = "Please provide a custom label.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        label: finalLabel,
        fullAddress,
        latitude,
        longitude,
        isDefault
      };

      if (editId) {
        await addressApi.updateAddress(editId, payload);
        toast.success("Address updated successfully!");
      } else {
        await addressApi.createAddress(payload);
        toast.success("Address added successfully!");
      }
      setIsModalOpen(false);
      fetchAddresses();
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressApi.deleteAddress(id);
      toast.success("Address deleted successfully.");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefaultAddress(id);
      toast.success("Default address updated.");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to update default address.");
    }
  };

  const getLabelIcon = (lbl: string) => {
    switch (lbl) {
      case "Home": return <Home size={18} className="text-blue-600" />;
      case "Work": return <Briefcase size={18} className="text-orange-600" />;
      default: return <MapPin size={18} className="text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage addresses where you receive services</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Address
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-blue-600 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">No addresses saved</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
            Add your home, work, or other address to book bookings instantly with service providers.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
          >
            Create Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr) => (
            <div 
              key={addr._id}
              onClick={() => !addr.isDefault && handleSetDefault(addr._id)}
              className={`bg-white p-6 rounded-[32px] border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                addr.isDefault 
                  ? "border-blue-600 shadow-md ring-2 ring-blue-600/10" 
                  : "border-slate-100 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      addr.label === 'Home' ? 'bg-blue-50' : addr.label === 'Work' ? 'bg-orange-50' : 'bg-emerald-50'
                    }`}>
                      {getLabelIcon(addr.label)}
                    </div>
                    <span className="font-black text-slate-900 text-sm">{addr.label}</span>
                  </div>

                  {addr.isDefault && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-100">
                      <Check size={10} strokeWidth={3} /> Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
                  {addr.fullAddress}
                </p>
              </div>

              <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t border-slate-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(addr);
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-950 flex items-center justify-center transition-colors"
                  title="Edit Address"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(addr._id, e)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors"
                  title="Delete Address"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Dash add box */}
          <div
            onClick={handleOpenAddModal}
            className="border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-[32px] p-6 flex flex-col justify-center items-center text-center cursor-pointer min-h-[180px] bg-slate-50/20 hover:bg-blue-50/5 transition-all group"
          >
            <div className="w-10 h-10 bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition-colors mb-3">
              <Plus size={20} />
            </div>
            <span className="text-sm font-black text-slate-500 group-hover:text-blue-600 transition-colors">Add Address</span>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT ADDRESS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editId ? "Edit Address" : "Add Address"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-950">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Labels selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label</label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other", "Custom"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => {
                        setLabel(lbl);
                        setErrors(prev => { const next = { ...prev }; delete next.customLabel; return next; });
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        label === lbl 
                          ? "bg-blue-600 text-white border-blue-600 shadow" 
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Label input */}
              {label === "Custom" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Label Name</label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => {
                      setCustomLabel(e.target.value);
                      if (errors.customLabel) {
                        setErrors(prev => { const next = { ...prev }; delete next.customLabel; return next; });
                      }
                    }}
                    placeholder="e.g. Parents' House, Cabin"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    required
                  />
                  {errors.customLabel && (
                    <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.customLabel}</p>
                  )}
                </div>
              )}

              {/* Full Address */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isGeocoding}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Navigation size={10} /> Use current location
                  </button>
                </div>
                <textarea
                  value={fullAddress}
                  onChange={(e) => {
                    setFullAddress(e.target.value);
                    if (errors.address) {
                      setErrors(prev => { const next = { ...prev }; delete next.address; return next; });
                    }
                  }}
                  onBlur={handleAddressBlur}
                  rows={3}
                  placeholder="Street name, Building number, City, State, ZIP code"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.address}</p>
                )}
              </div>

              {/* Coordinates status info */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-500">
                {isGeocoding ? (
                  <>
                    <Loader2 size={14} className="text-blue-600 animate-spin" />
                    <span>Resolving location coordinates...</span>
                  </>
                ) : latitude && longitude ? (
                  <>
                    <Check size={14} className="text-emerald-500" strokeWidth={3} />
                    <span>Coordinates resolved ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} className="text-slate-400" />
                    <span>Coordinates will be resolved on address typing</span>
                  </>
                )}
              </div>

              {/* Set default checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                  Set as default address
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isGeocoding}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
