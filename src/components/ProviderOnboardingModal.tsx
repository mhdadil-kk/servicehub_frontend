import React, { useState, useEffect, useRef } from 'react';
import { serviceApi } from '../api/service.service';
import { providerApi } from '../api/provider.service';
import toast from 'react-hot-toast';
import { 
  User, Settings, ShieldCheck, Building2, Upload, ChevronRight, ChevronLeft, 
  Camera, MapPin, HelpCircle, Search, Lock, Check, Wallet, X 
} from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuthStore } from '../store/useAuthStore';
import { 
  validateFile, FILE_LIMITS, validateBio, validateBankField, 
  validateHourlyRate, validateRequired 
} from '../utils/validation';

import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition, setAddress }: any) => {
  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};
// ----------------------

type Step = 1 | 2 | 3 | 4 | 5;

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

const ProviderOnboardingModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const { user, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [progress, setProgress] = useState(20);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  
  const [form, setForm] = useState({
    bio: "",
    address: "",
    radius: 25,
    latitude: null as number | null,
    longitude: null as number | null,
    hourlyRate: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: ""
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({ ...prev, latitude, longitude }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setForm(prev => ({ ...prev, address: data.display_name }));
          }
        } catch (err) {
          console.error("Failed to reverse geocode coordinate:", err);
        }
        setIsLocating(false);
        toast.success("Location locked!");
      },
      () => {
        setIsLocating(false);
        toast.error("Failed to get location. Please input address manually.");
      }
    );
  };

  const geocodeAddress = async (showLoading = false) => {
    if (!form.address || form.address.trim().length < 5) return;
    if (showLoading) setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
        clearError('location');
        toast.success("Address coordinates verified!");
      } else {
        setErrors(prev => ({ ...prev, location: "Address not recognized. Please type a valid address or click the map." }));
      }
    } catch (err) {
      console.error("Geocoding address error:", err);
    } finally {
      if (showLoading) setIsSearching(false);
    }
  };

  const handleAddressBlur = () => geocodeAddress(false);
  const handleAddressSearch = () => geocodeAddress(true);
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [identityDocs, setIdentityDocs] = useState<File[]>([]);
  const [licenseDocs, setLicenseDocs] = useState<File[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const filteredServices = availableServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;
    const initOnboarding = async () => {
      try {
        const [servicesRes, profileRes] = await Promise.all([
          serviceApi.getActiveServices(),
          providerApi.getProfile()
        ]);
        setAvailableServices(servicesRes.data || []);
        if (profileRes.data) {
          const profile = profileRes.data;

          if (profile.onboardingStatus === "approved" || profile.onboardingStatus === "in_review") {
            if (user) {
              setUser({ ...user, status: profile.onboardingStatus as any });
            }
            onComplete();
            return;
          }

          setForm(prev => ({
            ...prev,
            bio: profile.bio || "",
            address: profile.address || "",
            latitude: profile.location?.coordinates?.[1] || null,
            longitude: profile.location?.coordinates?.[0] || null,
            radius: profile.serviceRadius || prev.radius,
            hourlyRate: profile.hourlyRate || "",
            accountHolderName: profile.bankDetails?.accountHolderName || "",
            bankName: profile.bankDetails?.bankName || "",
            accountNumber: profile.bankDetails?.accountNumber || "",
            routingNumber: profile.bankDetails?.routingNumber || ""
          }));
          if (profile.profilePhoto) setProfilePreview(profile.profilePhoto);
          if (profile.serviceId) setSelectedService(profile.serviceId);
          setCurrentStep(profile.onboardingStep as Step);
          setProgress(profile.onboardingStep * 20);
        }
      } catch (error: any) {
        toast.error("Initialization failed");
      } finally {
        setInitialLoading(false);
      }
    };
    initOnboarding();
  }, [isOpen]);

  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        // Step 1: Personal Info
        const newErrors: Record<string, string> = {};
        if (!profilePhoto && !profilePreview) {
          newErrors.profilePhoto = "Please upload a profile photo.";
        }
        const bioErr = validateBio(form.bio);
        if (bioErr) newErrors.bio = bioErr;

        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("bio", form.bio.trim());
        if (profilePhoto) formData.append("profilePhoto", profilePhoto);
        await providerApi.updateProfile(formData);
      } else if (currentStep === 2) {
        // Step 2: Location
        const newErrors: Record<string, string> = {};
        if (!form.address) {
          newErrors.address = "Please enter your address.";
        }
        if (form.latitude === null || form.longitude === null) {
          newErrors.location = "Location not verified. Search your address or click \"Use Current Location\".";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        setIsSubmitting(true);
        await providerApi.updateLocation({
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
          serviceRadius: form.radius
        });
      } else if (currentStep === 3) {
        // Step 3: Service Selection
        const newErrors: Record<string, string> = {};
        if (!selectedService) {
          newErrors.service = "Please select a service category.";
        }
        const rateErr = validateHourlyRate(form.hourlyRate);
        if (rateErr) newErrors.hourlyRate = rateErr;
        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        setIsSubmitting(true);
        await providerApi.updateServiceDetails({
          serviceId: selectedService._id || selectedService,
          hourlyRate: Number(form.hourlyRate)
        });
      } else if (currentStep === 4) {
        // Step 4: Verification Docs
        const newErrors: Record<string, string> = {};
        if (identityDocs.length === 0) {
          newErrors.identityDocs = "Please upload at least one identity document.";
        }
        if (licenseDocs.length === 0) {
          newErrors.licenseDocs = "Please upload at least one professional license or certificate.";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        identityDocs.forEach(file => formData.append("identity", file));
        licenseDocs.forEach(file => formData.append("license", file));
        await providerApi.uploadDocuments(formData);
      } else if (currentStep === 5) {
        // Step 5: Bank Details
        const newErrors: Record<string, string> = {};
        const ahErr = validateBankField(form.accountHolderName, "Account holder name");
        if (ahErr) newErrors.accountHolderName = ahErr;
        
        const bnErr = validateBankField(form.bankName, "Bank name");
        if (bnErr) newErrors.bankName = bnErr;
        
        const anErr = validateBankField(form.accountNumber, "Account number", 8);
        if (anErr) newErrors.accountNumber = anErr;
        
        const rnErr = validateBankField(form.routingNumber, "IFSC / Routing code", 5);
        if (rnErr) newErrors.routingNumber = rnErr;

        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }

        setIsSubmitting(true);
        await providerApi.updateBankDetails({
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber
        });

        if (user) {
          setUser({ ...user, status: "in_review" as any });
        }

        toast.success("Setup complete! Your profile is now under review.");
        onComplete();
        return;
      }
      
      const next = (currentStep + 1) as Step;
      setCurrentStep(next);
      setProgress(next * 20);
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || initialLoading) return null;

  const defaultPosition = form.latitude && form.longitude 
    ? { lat: form.latitude, lng: form.longitude } 
    : { lat: 51.505, lng: -0.09 }; // Default arbitrary fallback

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-[1280px] h-full max-h-[95vh] bg-[#F9FAFB] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* --- SIDEBAR STEPPER --- */}
        <aside className="hidden md:flex w-80 bg-white border-r border-slate-100 flex-col p-10 space-y-12 shrink-0 overflow-y-auto">
          <img src={logo} alt="ServiceHub" className="h-8 w-fit object-contain" />
          
          <div className="space-y-8">
            {[
              { step: 1, label: "Personal Info", desc: "Basic details & photo", icon: User },
              { step: 2, label: "Location Setup", desc: "Map & service radius", icon: MapPin },
              { step: 3, label: "Service Selection", desc: "Categories & rates", icon: Settings },
              { step: 4, label: "Verification Docs", desc: "ID & licenses", icon: ShieldCheck },
              { step: 5, label: "Bank Details", desc: "Payout setup", icon: Building2 },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all ${
                    currentStep === item.step 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                      : currentStep > item.step ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300"
                  }`}>
                    {currentStep > item.step ? <Check size={18} /> : <item.icon size={18} />}
                  </div>
                  {item.step < 5 && <div className={`w-0.5 h-10 mt-2 ${currentStep > item.step ? "bg-emerald-500" : "bg-slate-100"}`} />}
                </div>
                <div>
                  <p className={`text-sm font-black ${currentStep === item.step ? "text-slate-900" : "text-slate-400"}`}>{item.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8">
             <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setup Progress</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{progress}%</p>
             </div>
             <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${progress}%` }} />
             </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 overflow-hidden">
           <header className="h-20 px-10 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
              <div className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-100">
                 Step {currentStep} of 5: Setup Required
              </div>
              <div className="flex items-center gap-4 text-xs font-black text-slate-400">
                 <HelpCircle size={16} /> Help Center
              </div>
           </header>

           <div className="flex-1 overflow-y-auto p-10">
              <div className="max-w-3xl mx-auto pb-10">
                 
                 {/* Step 1: Personal Info */}
                 {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <h2 className="text-3xl font-black text-slate-900">Personal Information</h2>
                       <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
                          <div className="flex items-center gap-8">
                             <div className="relative">
                                <div className={`w-28 h-28 rounded-[36px] bg-slate-50 border-2 border-dashed flex items-center justify-center text-slate-300 overflow-hidden ${errors.profilePhoto ? 'border-red-400' : 'border-slate-200'}`}>
                                   {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <Camera size={36} />}
                                </div>
                                <button onClick={() => { profileInputRef.current?.click(); clearError('profilePhoto'); }} className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-[14px] border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                                   <Upload size={16} />
                                </button>
                                <input type="file" ref={profileInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) { 
                                    const result = validateFile(f, FILE_LIMITS.profilePhoto);
                                    if (!result.valid) {
                                      setErrors({...errors, profilePhoto: result.error});
                                      e.target.value = "";
                                      return;
                                    }
                                    setProfilePhoto(f); 
                                    setProfilePreview(URL.createObjectURL(f)); 
                                    clearError('profilePhoto'); 
                                  }
                                }} />
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900">Profile Photo</h4>
                                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] leading-relaxed">Upload a clear photo. Customers prefer providers with professional photos.</p>
                                {errors.profilePhoto && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.profilePhoto}</p>}
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">About You (Bio)</label>
                             <textarea 
                                value={form.bio}
                                onChange={e => { setForm({...form, bio: e.target.value}); clearError('bio'); }}
                                placeholder="Tell customers a little bit about yourself and your experience..."
                                className={`w-full h-32 bg-slate-50/50 border rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all resize-none ${errors.bio ? 'border-red-400' : 'border-slate-100'}`}
                             />
                             {errors.bio && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.bio}</p>}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 2: Location Setup */}
                 {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="flex justify-between items-end">
                         <div>
                            <h2 className="text-3xl font-black text-slate-900">Location Setup</h2>
                            <p className="text-slate-500 font-medium mt-1">Set your operating base and service range.</p>
                         </div>
                       </div>

                       <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                          <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Base Address</label>
                                <button type="button" onClick={handleUseCurrentLocation} disabled={isLocating} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                                   {isLocating ? "Locating..." : <><MapPin size={12}/> Use Current Location</>}
                                </button>
                             </div>
                             <div className="flex gap-2">
                                <div className="relative flex-1">
                                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                   <input type="text" value={form.address} onChange={e => { setForm({ ...form, address: e.target.value }); clearError('address'); }} onBlur={handleAddressBlur} placeholder="Search for your street address..." className={`w-full bg-slate-50/50 border rounded-xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.address ? 'border-red-300' : 'border-slate-100'}`} />
                                </div>
                                <button type="button" onClick={handleAddressSearch} disabled={isSearching || !form.address} className="px-5 py-4 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
                                   <Search size={14} /> {isSearching ? "Searching..." : "Search"}
                                </button>
                             </div>
                             {errors.address && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.address}</p>}
                             {form.latitude ? (
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">
                                   ✓ Coordinates Secured: {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                                </p>
                             ) : (
                                errors.location && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.location}</p>
                             )}
                          </div>
                          
                          <div className="space-y-6 pt-6 border-t border-slate-100">
                             <div className="flex justify-between items-center">
                               <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Service Radius Overlay</label>
                               <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100">{form.radius} miles</span>
                             </div>
                             <input type="range" min="5" max="100" step="5" value={form.radius} onChange={e => setForm({...form, radius: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" />
                             
                             <div className="h-[300px] w-full rounded-3xl overflow-hidden border-4 border-slate-50 relative z-0 shadow-inner">
                               <MapContainer 
                                  center={defaultPosition as any} 
                                  zoom={12} 
                                  scrollWheelZoom={false} 
                                  style={{ height: '100%', width: '100%' }}
                               >
                                  <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  />
                                  <LocationMarker 
                                    position={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
                                    setPosition={(latlng: any) => setForm(prev => ({...prev, latitude: latlng.lat, longitude: latlng.lng}))}
                                    setAddress={(address: string) => setForm(prev => ({...prev, address}))}
                                  />
                                  {form.latitude && form.longitude && (
                                    <Circle 
                                      center={[form.latitude, form.longitude]} 
                                      pathOptions={{ fillColor: '#2563eb', color: '#2563eb', weight: 1, fillOpacity: 0.15 }}
                                      radius={form.radius * 1609.34}
                                    />
                                  )}
                               </MapContainer>
                               {(!form.latitude || !form.longitude) && (
                                 <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] z-[400] flex items-center justify-center pointer-events-none">
                                    <span className="bg-white px-4 py-2 rounded-xl text-xs font-black text-slate-400 shadow-sm">Click map to set location</span>
                                 </div>
                               )}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 3: Service Selection */}
                 {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Service Selection</h2>
                          <div className="relative min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search categories..." className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all" />
                          </div>
                       </div>
                       <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {filteredServices.map(s => (
                                <div key={s._id} onClick={() => { setSelectedService(s); clearError('service'); }} className={`border-2 rounded-[32px] p-6 flex items-center justify-between cursor-pointer transition-all duration-300 ${selectedService?._id === s._id || selectedService === s._id ? "border-blue-600 bg-blue-50/30 ring-8 ring-blue-600/5" : "border-slate-50 bg-slate-50/50 hover:border-blue-200"}`}>
                                   <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedService?._id === s._id || selectedService === s._id ? "bg-blue-600 text-white rotate-6" : "bg-white text-slate-400"}`}><Settings size={22} /></div>
                                      <div><p className="font-black text-slate-900">{s.name}</p></div>
                                   </div>
                                   {(selectedService?._id === s._id || selectedService === s._id) && <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg"><Check size={14} /></div>}
                                </div>
                             ))}
                          </div>
                          {errors.service && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.service}</p>}
                          {selectedService && (
                             <div className="pt-10 border-t border-slate-50 space-y-8 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Wallet size={24} /></div><div><h4 className="text-xl font-black text-slate-900">Set Hourly Rate</h4><p className="text-sm font-medium text-slate-400">Specify your charge for {selectedService.name}</p></div></div>
                                <div className="relative group max-w-md">
                                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-200 group-focus-within:text-blue-600 transition-colors">₹</span>
                                   <input type="number" value={form.hourlyRate} onChange={e => { setForm({...form, hourlyRate: e.target.value}); clearError('hourlyRate'); }} placeholder="0" className={`w-full bg-slate-50/50 border-2 rounded-[32px] pl-14 pr-24 py-8 text-4xl font-black text-slate-900 focus:outline-none focus:border-blue-600 transition-all ${errors.hourlyRate ? 'border-red-300' : 'border-slate-100'}`} />
                                   <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">per hour</span>
                                </div>
                                {errors.hourlyRate && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.hourlyRate}</p>}
                             </div>
                          )}
                       </div>
                    </div>
                 )}

                 {/* Step 4: Documents */}
                 {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="grid grid-cols-1 gap-10">
                          <div className="space-y-6">
                             <div className="flex justify-between items-center px-2">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                      <User size={20} />
                                   </div>
                                   <div>
                                      <h3 className="text-xl font-black text-slate-900">Identity Proof</h3>
                                      <p className="text-xs font-medium text-slate-400">Government issued ID card or Passport</p>
                                   </div>
                                </div>
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-200">{identityDocs.length}/5 Files</span>
                             </div>

                             <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 rounded-[32px] ${errors.identityDocs ? 'ring-2 ring-red-300 ring-offset-2' : ''}`}>
                                <div 
                                  onClick={() => { docsInputRef.current?.click(); clearError('identityDocs'); }}
                                  className="aspect-square rounded-[32px] border-2 border-dashed border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                                >
                                   <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <Upload size={20} />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add ID</p>
                                   <input type="file" ref={docsInputRef} className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => { 
                                      const files = Array.from(e.target.files || []);
                                      const invalid = files.filter(f => !validateFile(f, FILE_LIMITS.verificationDoc).valid);
                                      if (invalid.length > 0) {
                                        setErrors({...errors, identityDocs: invalid.map(f => validateFile(f, FILE_LIMITS.verificationDoc).error).join(" ")});
                                        e.target.value = "";
                                        return;
                                      }
                                      setIdentityDocs(prev => [...prev, ...files]); 
                                      clearError('identityDocs'); 
                                   }} />
                                </div>
                                {identityDocs.map((f, i) => (
                                   <div key={i} className="group relative aspect-square rounded-[32px] overflow-hidden border border-slate-100 shadow-sm animate-in zoom-in-95">
                                      {f.type.startsWith("image/") ? (
                                         <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="preview" />
                                      ) : (
                                         <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                                            <ShieldCheck size={32} />
                                         </div>
                                      )}
                                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                         <button onClick={() => setIdentityDocs(prev => prev.filter((_, idx) => idx !== i))} className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                            <X size={18} />
                                         </button>
                                         <p className="text-[9px] font-black text-white uppercase tracking-widest">Remove</p>
                                      </div>
                                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-2 px-3">
                                         <p className="text-[9px] font-black text-slate-900 truncate">{f.name}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                             {errors.identityDocs && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.identityDocs}</p>}
                          </div>

                          <div className="space-y-6">
                             <div className="flex justify-between items-center px-2">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                      <ShieldCheck size={20} />
                                   </div>
                                   <div>
                                      <h3 className="text-xl font-black text-slate-900">Trade License</h3>
                                      <p className="text-xs font-medium text-slate-400">Professional certifications or licenses</p>
                                   </div>
                                </div>
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-200">{licenseDocs.length}/5 Files</span>
                             </div>

                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                <div 
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.onchange = (e: any) => { setLicenseDocs(prev => [...prev, ...Array.from(e.target.files as FileList)]); clearError('licenseDocs'); };
                                    input.click();
                                  }}
                                  className="aspect-square rounded-[32px] border-2 border-dashed border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                                >
                                   <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                      <Upload size={20} />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add License</p>
                                </div>
                                {licenseDocs.map((f, i) => (
                                   <div key={i} className="group relative aspect-square rounded-[32px] overflow-hidden border border-slate-100 shadow-sm animate-in zoom-in-95">
                                      {f.type.startsWith("image/") ? (
                                         <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="preview" />
                                      ) : (
                                         <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                                            <ShieldCheck size={32} />
                                         </div>
                                      )}
                                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                         <button onClick={() => setLicenseDocs(prev => prev.filter((_, idx) => idx !== i))} className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                            <X size={18} />
                                         </button>
                                         <p className="text-[9px] font-black text-white uppercase tracking-widest">Remove</p>
                                      </div>
                                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-2 px-3">
                                         <p className="text-[9px] font-black text-slate-900 truncate">{f.name}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                             {errors.licenseDocs && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.licenseDocs}</p>}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 5: Bank Details */}
                 {currentStep === 5 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="flex justify-between items-center">
                          <h2 className="text-3xl font-black text-slate-900">Payout Setup</h2>
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full"><Lock size={12} /> Secure</span>
                       </div>
                       <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
                          {[
                            { label: "Account Holder Name", key: "accountHolderName", placeholder: "Full Name" },
                            { label: "Bank Name", key: "bankName", placeholder: "e.g. HDFC, ICICI" },
                            { label: "Account Number", key: "accountNumber", placeholder: "Bank Account No." },
                            { label: "IFSC Code", key: "routingNumber", placeholder: "IFSC / Routing Code" },
                          ].map(f => (
                            <div key={f.key} className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{f.label}</label>
                               <input type="text" value={(form as any)[f.key]} onChange={e => { setForm({...form, [f.key]: e.target.value}); clearError(f.key); }} placeholder={f.placeholder} className={`w-full bg-slate-50/50 border-2 rounded-[24px] px-6 py-5 text-base font-black focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${(errors as any)[f.key] ? 'border-red-300' : 'border-slate-50'}`} />
                               {(errors as any)[f.key] && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{(errors as any)[f.key]}</p>}
                            </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* Navigation */}
                 <div className="mt-12 flex items-center justify-between sticky bottom-0 bg-[#F9FAFB]/80 backdrop-blur-md py-4">
                    <button disabled={currentStep === 1} onClick={() => setCurrentStep(prev => (prev-1) as Step)} className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-100 font-black text-sm text-slate-400 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-0"><ChevronLeft size={20} /> Previous</button>
                    <button onClick={handleNext} disabled={isSubmitting} className="bg-blue-600 text-white px-12 py-5 rounded-[28px] font-black text-sm shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-3">
                       {isSubmitting ? "Processing..." : currentStep === 5 ? "Complete Setup" : "Continue"} <ChevronRight size={20} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboardingModal;
