import React, { useState, useEffect, useRef } from 'react';
import { validateFile, FILE_LIMITS, validateBankField, validateHourlyRate } from '../../utils/validation';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '../../api/service.service';
import { providerApi } from '../../api/provider.service';
import toast from 'react-hot-toast';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Building2, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  MapPin, 
  HelpCircle,
  Search,
  Lock,
  Check,
  Wallet,
  X
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/useAuthStore';

type Step = 1 | 2 | 3 | 4;

const ProviderOnboarding: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [progress, setProgress] = useState(25);

  // Form State pre-filled from user data
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    radius: 25,
    latitude: null as number | null,
    longitude: null as number | null,
    hourlyRate: "",
    // Bank Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: ""
  });
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const [isLocating, setIsLocating] = useState(false);

  // â”€â”€ Inline validation errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  const setError = (key: string, msg: string) => setErrors(prev => ({ ...prev, [key]: msg }));
  const InlineError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 mt-1.5">
        <span className="w-3.5 h-3.5 bg-rose-100 rounded-full flex items-center justify-center text-[8px] shrink-0">!</span>
        {errors[name]}
      </p>
    ) : null;

  // Geolocate device using HTML5 Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude,
          longitude
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
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

  // Resolve coordinate from address text search (Nominatim)
  const handleAddressBlur = async () => {
    if (!form.address || form.address.trim().length < 5) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        toast.success("Address coordinates verified!");
      } else {
        toast.error("Address not recognized. Please type a valid address.");
      }
    } catch (err) {
      console.error("Geocoding address error:", err);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = validateFile(file, FILE_LIMITS.profilePhoto);
    if (!result.valid) {
      setError("profilePhoto", "Only JPG, JPEG, and PNG images are allowed for profile photos.");
      e.target.value = "";
      return;
    }
    
    clearError("profilePhoto");
    setProfilePhoto(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    const fileErrors: string[] = [];
    for (const file of files) {
      const result = validateFile(file, FILE_LIMITS.verificationDoc);
      if (!result.valid) {
        fileErrors.push(result.error!);
      } else {
        valid.push(file);
      }
    }
    if (fileErrors.length > 0) {
      setError("verificationDocs", fileErrors[0]);
    } else {
      clearError("verificationDocs");
    }
    if (valid.length > 0) {
      setVerificationDocs(prev => [...prev, ...valid]);
    }
    e.target.value = "";
  };
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = availableServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const [servicesRes, profileRes] = await Promise.all([
          serviceApi.getActiveServices(),
          providerApi.getProfile()
        ]);
        
        setAvailableServices(servicesRes.data || []);
        
        if (profileRes.data) {
          const profile = profileRes.data;
          
          // If already submitted or approved, go to dashboard
          if (profile.onboardingStatus !== "pending") {
            navigate("/provider");
            return;
          }

          setForm(prev => ({
            ...prev,
            radius: profile.serviceRadius || prev.radius,
            address: profile.address || "",
            latitude: profile.location?.coordinates?.[1] || null,
            longitude: profile.location?.coordinates?.[0] || null,
            hourlyRate: profile.hourlyRate || "",
            accountHolderName: profile.bankDetails?.accountHolderName || "",
            bankName: profile.bankDetails?.bankName || "",
            accountNumber: profile.bankDetails?.accountNumber || "",
            routingNumber: profile.bankDetails?.routingNumber || ""
          }));
          
          if (profile.profilePhoto) setProfilePreview(profile.profilePhoto);
          if (profile.serviceId) setSelectedService(profile.serviceId);
          
          // Set step based on current progress
          setCurrentStep(profile.onboardingStep as Step);
          setProgress(profile.onboardingStep * 25);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to initialize onboarding");
      } finally {
        setLoadingServices(false);
        setInitialLoading(false);
      }
    };
    initOnboarding();
  }, []);

  const handleNext = async () => {
    setIsSubmitting(true);
    const newErrors: Record<string, string> = {};

    try {
      if (currentStep === 1) {
        // Step 1 validation
        if (!profilePhoto && !profilePreview) newErrors.profilePhoto = "Please upload a profile photo.";
        if (!form.address.trim()) newErrors.address = "Street address is required.";
        if (form.latitude === null || form.longitude === null) newErrors.address = (newErrors.address ? newErrors.address + " " : "") + "Please verify your address or use current location.";
        // Guard: if a file was typed/dragged bypassing onChange, re-check it
        if (errors.profilePhoto && !newErrors.profilePhoto) {
          newErrors.profilePhoto = errors.profilePhoto;
        }
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsSubmitting(false); return; }
        const formData = new FormData();
        formData.append("bio", "I am a professional service provider committed to quality."); 
        formData.append("serviceRadius", form.radius.toString());
        formData.append("address", form.address);
        formData.append("latitude", form.latitude!.toString());
        formData.append("longitude", form.longitude!.toString());
        if (profilePhoto) formData.append("profilePhoto", profilePhoto);
        await providerApi.updateProfile(formData);
      } 
      else if (currentStep === 2) {
        // Step 2 validation
        if (!selectedService) newErrors.service = "Please select a service category.";
        const rateErr = validateHourlyRate(form.hourlyRate);
        if (rateErr) newErrors.hourlyRate = rateErr;
        
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsSubmitting(false); return; }
        await providerApi.updateServiceDetails({
          serviceId: selectedService._id || selectedService,
          hourlyRate: Number(form.hourlyRate)
        });
      }
      else if (currentStep === 3) {
        // Step 3 validation
        if (verificationDocs.length === 0) newErrors.verificationDocs = "Please upload at least one verification document before continuing.";
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsSubmitting(false); return; }
        const formData = new FormData();
        verificationDocs.forEach(file => { formData.append("documents", file); });
        await providerApi.uploadDocuments(formData);
      }
      else if (currentStep === 4) {
        // Step 4 validation
        const ahErr = validateBankField(form.accountHolderName, "Account holder name");
        if (ahErr) newErrors.accountHolderName = ahErr;
        
        const bnErr = validateBankField(form.bankName, "Bank name");
        if (bnErr) newErrors.bankName = bnErr;
        
        const anErr = validateBankField(form.accountNumber, "Account number", 8);
        if (anErr) newErrors.accountNumber = anErr;
        
        const rnErr = validateBankField(form.routingNumber, "IFSC / Routing code", 5);
        if (rnErr) newErrors.routingNumber = rnErr;

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsSubmitting(false); return; }
        await providerApi.updateBankDetails({
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber
        });
        toast.success("Onboarding complete! Your profile is now under review.");
        navigate("/provider");
      }

      setErrors({});
      if (currentStep < 4) {
        const next = (currentStep + 1) as Step;
        setCurrentStep(next);
        setProgress(next * 25);
        window.scrollTo(0, 0);
      } else {
        setProgress(100);
      }
    } catch (error: any) {
      // Try to parse a field-level error from the server response
      const serverMsg: string = error?.response?.data?.message || error?.message || "";
      if (serverMsg.toLowerCase().includes("photo") || serverMsg.toLowerCase().includes("image") || serverMsg.toLowerCase().includes("jpg") || serverMsg.toLowerCase().includes("png")) {
        setError("profilePhoto", "Only JPG, JPEG, and PNG images are allowed for profile photos.");
      } else if (serverMsg.toLowerCase().includes("address")) {
        setError("address", serverMsg);
      } else {
        toast.error(serverMsg || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    const prev = (currentStep - 1) as Step;
    setCurrentStep(prev);
    setProgress(prev * 25);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Checking Profile Status...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row">
      
      {/* --- SIDEBAR STEPPER --- */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 flex flex-col p-8 space-y-12">
        <div className="flex items-center gap-2">
           <img src={logo} alt="ServiceHub" className="h-8 object-contain" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 mb-8">Setup Progress</h2>
          <div className="space-y-8">
            {[
              { step: 1, label: "Personal Info", desc: "Basic details & photo", icon: User },
              { step: 2, label: "Service Selection", desc: "Categories & rates", icon: Settings },
              { step: 3, label: "Verification Docs", desc: "ID & licenses", icon: ShieldCheck },
              { step: 4, label: "Bank Details", desc: "Payout setup", icon: Building2 },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep === item.step 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : currentStep > item.step 
                        ? "bg-emerald-500 text-white" 
                        : "bg-slate-100 text-slate-400"
                  }`}>
                    {currentStep > item.step ? <Check size={18} /> : <item.icon size={18} />}
                  </div>
                  {item.step < 4 && <div className={`w-0.5 h-10 mt-2 ${currentStep > item.step ? "bg-emerald-500" : "bg-slate-100"}`} />}
                </div>
                <div>
                  <p className={`text-sm font-black ${currentStep === item.step ? "text-slate-900" : "text-slate-400"}`}>{item.label}</p>
                  <p className="text-[11px] font-bold text-slate-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <HelpCircle size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Why do we need this?</span>
          </div>
          <p className="text-[11px] font-semibold text-blue-800/70 leading-relaxed">
            Verification helps build trust with customers and ensures you get paid securely.
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion status</p>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step {currentStep} of 4</p>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50/30">
        {/* Top bar */}
        <header className="h-20 px-10 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-100">
             Draft - Setup in Progress
          </div>
          <div className="flex items-center gap-6">
             <a href="#" className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors">
                <HelpCircle size={16} /> Help
             </a>
             <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden cursor-pointer">
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=Provider" alt="" />
             </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto py-12 px-10">

          {/* â”€â”€ STEP 1: Personal Info â”€â”€ */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                <p className="text-slate-500 font-medium mt-1">Tell us a bit about yourself to get started.</p>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
                {/* Photo Upload */}
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <input type="file" ref={profileInputRef} className="hidden" onChange={handleProfilePhotoChange} />
                    <div
                      onClick={() => profileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 transition-all group-hover:border-blue-300 group-hover:bg-blue-50 cursor-pointer overflow-hidden"
                    >
                      {profilePreview ? (
                        <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={32} />
                      )}
                    </div>
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-all"
                    >
                      <Upload size={14} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">Profile Photo</h4>
                    <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Upload a clear photo of yourself. Customers like to know who they're hiring.
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 mt-0.5">JPG or PNG Â· Max 2 MB</p>
                    <InlineError name="profilePhoto" />
                    <div className="flex gap-4 mt-3">
                      <button onClick={() => profileInputRef.current?.click()} className="text-xs font-black text-blue-600 hover:underline">Upload New</button>
                      {profilePreview && (
                        <button onClick={() => { setProfilePhoto(null); setProfilePreview(null); }} className="text-xs font-black text-rose-500 hover:underline">Remove</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => { setForm({...form, name: e.target.value}); clearError("name"); }}
                      placeholder="e.g. Jane Doe"
                      className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.name ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                    />
                    <InlineError name="name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => { setForm({...form, phone: e.target.value}); clearError("phone"); }}
                      placeholder="+91 00000-00000"
                      className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.phone ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                    />
                    <InlineError name="phone" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input type="email" value={user?.email || ""} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed" />
                    <p className="text-[10px] font-bold text-slate-400 italic">Account email cannot be changed.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Street Address</label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {isLocating ? "Locating..." : "Use Current Location"}
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => { setForm({ ...form, address: e.target.value }); clearError("address"); }}
                      onBlur={handleAddressBlur}
                      placeholder="1234 Main St, City, State"
                      className={`w-full bg-slate-50/50 border rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.address ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                    />
                  </div>
                  <InlineError name="address" />
                  {!errors.address && form.latitude && (
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">
                      âœ“ Coordinates captured: {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Service Radius</label>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100">{form.radius} miles</span>
                  </div>
                  <input type="range" min="5" max="100" step="5" value={form.radius} onChange={e => setForm({ ...form, radius: Number(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="h-48 bg-blue-50 rounded-3xl border border-blue-100 relative overflow-hidden flex items-center justify-center">
                    <div className="relative w-16 h-16 bg-blue-600/10 rounded-full border-2 border-blue-600 flex items-center justify-center transition-all" style={{ transform: `scale(${1 + (form.radius / 100)})` }}>
                      <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg animate-ping absolute" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg relative z-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ STEP 2: Service Selection â”€â”€ */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Service Selection</h2>
                  <p className="text-slate-500 font-medium">Select your specialization and set your professional rates.</p>
                </div>
                <div className="relative group min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search service categories..."
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
                <div className="space-y-6">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Categories</label>
                  <InlineError name="service" />
                  {loadingServices ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />)}
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Search size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No categories found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredServices.map((service) => (
                        <div
                          key={service._id}
                          onClick={() => { setSelectedService(service); clearError("service"); }}
                          className={`relative border-2 rounded-[32px] p-6 flex items-center justify-between cursor-pointer transition-all duration-300 group ${
                            (selectedService?._id === service._id || selectedService === service._id)
                            ? "border-blue-600 bg-blue-50/30 ring-8 ring-blue-600/5"
                            : "border-slate-50 bg-slate-50/30 hover:border-blue-200 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                              (selectedService?._id === service._id || selectedService === service._id)
                              ? "bg-blue-600 text-white rotate-6 scale-110"
                              : "bg-white text-slate-400 group-hover:text-blue-600"
                            }`}>
                              <Settings size={22} />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-base">{service.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">{service.description}</p>
                            </div>
                          </div>
                          {(selectedService?._id === service._id || selectedService === service._id) && (
                            <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                              <Check size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedService && (
                  <div className="space-y-8 pt-12 border-t border-slate-100 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center shadow-sm">
                        <Wallet size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900">Set Your Hourly Rate</h4>
                        <p className="text-sm font-medium text-slate-400">Specify what you charge for <b>{selectedService.name || 'this service'}</b></p>
                      </div>
                    </div>
                    <div className="max-w-md">
                      <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">â‚¹</span>
                        <input
                          type="number"
                          value={form.hourlyRate}
                          onChange={(e) => { setForm({...form, hourlyRate: e.target.value}); clearError("hourlyRate"); }}
                          placeholder="0"
                          className={`w-full bg-slate-50/50 border-2 rounded-[32px] pl-14 pr-24 py-8 text-4xl font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-200 ${errors.hourlyRate ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase tracking-widest">Per Hour</span>
                      </div>
                      <InlineError name="hourlyRate" />
                      <div className="mt-6 flex gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                        <HelpCircle className="text-blue-500 shrink-0" size={20} />
                        <p className="text-xs font-semibold text-blue-900/60 leading-relaxed">
                          Most professionals in <b>{selectedService.name || 'this category'}</b> set their rates between â‚¹500 and â‚¹1,500 based on experience.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* â”€â”€ STEP 3: Verification Documents â”€â”€ */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verification Documents</h2>
                <p className="text-slate-500 font-medium mt-1">To ensure the safety of our community, we need to verify your identity and credentials.</p>
              </div>

              <div className="space-y-6">
                {[
                  { num: 1, title: "Government ID", desc: "Accepted formats: Passport, Driver's License, or National ID Card.", icon: Upload },
                  { num: 2, title: "Professional Certifications / Licenses", desc: "Upload documents that prove your eligibility for the services you selected.", icon: Upload }
                ].map((item) => (
                  <div key={item.num} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <input type="file" ref={docsInputRef} className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocsChange} />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-black">{item.num}</span>
                        <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                      </div>
                      {verificationDocs.length > 0 && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100">
                          {verificationDocs.length} File(s) Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-400">{item.desc}</p>
                    <div
                      onClick={() => docsInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group ${errors.verificationDocs ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                    >
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-500 transition-all">
                        <item.icon size={28} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">Upload Files</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">Drag and drop or click to browse documents</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">PNG, JPG, or PDF Â· Max 5 MB</p>
                      </div>
                      <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-xs font-black text-slate-900 hover:border-blue-600 transition-all">Select Files</button>
                    </div>
                    <InlineError name="verificationDocs" />
                    <div className="flex flex-wrap gap-2">
                      {verificationDocs.map((file, idx) => (
                        <div key={idx} className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{file.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setVerificationDocs(prev => prev.filter((_, i) => i !== idx)); }}
                            className="text-rose-400 hover:text-rose-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex gap-6">
                  <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">3</span>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-black text-slate-900">Background Check Authorization</h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-4 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 mt-1 cursor-pointer" />
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                        <span className="font-black text-slate-900 block mb-1">I authorize ServiceHub to conduct a background check</span>
                        By checking this box, you agree to our <a href="#" className="text-blue-600 hover:underline">Provider Terms</a> and authorize us to verify your criminal record and professional standing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ STEP 4: Bank Details â”€â”€ */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payout Setup</h2>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    <Lock size={12} /> Bank-level security
                  </span>
                </div>
                <p className="text-slate-500 font-medium max-w-xl">Enter your bank account details where you'd like to receive your earnings.</p>
              </div>

              <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Account Holder Name</label>
                  <input
                    type="text"
                    value={form.accountHolderName}
                    onChange={e => { setForm({...form, accountHolderName: e.target.value}); clearError("accountHolderName"); }}
                    placeholder="Full name as it appears on bank statement"
                    className={`w-full bg-slate-50/50 border rounded-xl px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.accountHolderName ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                  />
                  <InlineError name="accountHolderName" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Bank Name</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={e => { setForm({...form, bankName: e.target.value}); clearError("bankName"); }}
                    placeholder="e.g. HDFC, SBI, ICICI"
                    className={`w-full bg-slate-50/50 border rounded-xl px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.bankName ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                  />
                  <InlineError name="bankName" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Account Number</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={e => { setForm({...form, accountNumber: e.target.value}); clearError("accountNumber"); }}
                    placeholder="Your bank account number"
                    className={`w-full bg-slate-50/50 border rounded-xl px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.accountNumber ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                  />
                  <InlineError name="accountNumber" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">IFSC / Routing Code</label>
                  <input
                    type="text"
                    value={form.routingNumber}
                    onChange={e => { setForm({...form, routingNumber: e.target.value}); clearError("routingNumber"); }}
                    placeholder="Your IFSC or Routing Code"
                    className={`w-full bg-slate-50/50 border rounded-xl px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${errors.routingNumber ? "border-rose-300 bg-rose-50/30" : "border-slate-100"}`}
                  />
                  <InlineError name="routingNumber" />
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <button onClick={prevStep} className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 transition-colors">
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Completing..." : "Complete Setup"} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <p className="text-center text-xs font-medium text-slate-400">
                Need help? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a> or visit our <a href="#" className="text-blue-600 hover:underline">Provider Help Center</a>.
              </p>
            </div>
          )}

          {/* â”€â”€ BOTTOM NAV (steps 1-3) â”€â”€ */}
          {currentStep < 4 && (
            <div className="mt-12 flex items-center justify-between bg-white/50 p-6 rounded-[32px] border border-slate-100">
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-100 font-black text-sm text-slate-500 hover:bg-white transition-all">
                    <ChevronLeft size={18} /> Back
                  </button>
                )}
                <button className="px-6 py-3 font-black text-sm text-slate-400 hover:text-slate-900 transition-colors">Save as Draft</button>
              </div>
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : `Next: ${currentStep === 1 ? "Service Selection" : currentStep === 2 ? "Verification Docs" : "Bank Details"}`} <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderOnboarding;

