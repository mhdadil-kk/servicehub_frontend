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

type Step = 1 | 2 | 3 | 4;

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

const ProviderOnboardingModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const { user, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [progress, setProgress] = useState(25);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [form, setForm] = useState({
    radius: 25,
    hourlyRate: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: ""
  });
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [identityDocs, setIdentityDocs] = useState<File[]>([]);
  const [licenseDocs, setLicenseDocs] = useState<File[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loadingServices, setLoadingServices] = useState(true);

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

          // If already submitted or approved, don't show modal
          if (profile.onboardingStatus !== "pending") {
            if (user) {
              setUser({ ...user, status: profile.onboardingStatus });
            }
            onComplete();
            return;
          }

          setForm(prev => ({
            ...prev,
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
          setProgress(profile.onboardingStep * 25);
        }
      } catch (error: any) {
        toast.error("Initialization failed");
      } finally {
        setInitialLoading(false);
        setLoadingServices(false);
      }
    };
    initOnboarding();
  }, [isOpen]);

  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        if (!profilePhoto && !profilePreview) {
          toast.error("Please upload a profile photo");
          return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("bio", "Professional service provider.");
        formData.append("serviceRadius", form.radius.toString());
        if (profilePhoto) formData.append("profilePhoto", profilePhoto);
        await providerApi.updateProfile(formData);
      } else if (currentStep === 2) {
        if (!selectedService) {
          toast.error("Please select a service category");
          return;
        }
        if (!form.hourlyRate || Number(form.hourlyRate) <= 0) {
          toast.error("Please set a valid hourly rate");
          return;
        }
        setIsSubmitting(true);
        await providerApi.updateServiceDetails({
          serviceId: selectedService._id || selectedService,
          hourlyRate: Number(form.hourlyRate)
        });
      } else if (currentStep === 3) {
        if (identityDocs.length === 0) {
          toast.error("Identity proof is missing");
          return;
        }
        if (licenseDocs.length === 0) {
          toast.error("Professional license/cert is missing");
          return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        identityDocs.forEach(file => formData.append("identity", file));
        licenseDocs.forEach(file => formData.append("license", file));
        await providerApi.uploadDocuments(formData);
      } else if (currentStep === 4) {
        const missing = [];
        if (!form.accountHolderName) missing.push("Account Holder Name");
        if (!form.bankName) missing.push("Bank Name");
        if (!form.accountNumber) missing.push("Account Number");
        if (!form.routingNumber) missing.push("IFSC/Routing Code");

        if (missing.length > 0) {
          toast.error(`Missing: ${missing.join(", ")}`);
          return;
        }

        setIsSubmitting(true);
        await providerApi.updateBankDetails({
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber
        });

        // Update local store so we don't loop
        if (user) {
          setUser({ ...user, status: "in_review" });
        }

        toast.success("Setup complete! Your profile is now under review.");
        onComplete();
        return;
      }
      const next = (currentStep + 1) as Step;
      setCurrentStep(next);
      setProgress(next * 25);
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || initialLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-[1280px] h-full max-h-[95vh] bg-[#F9FAFB] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* --- SIDEBAR STEPPER --- */}
        <aside className="hidden md:flex w-80 bg-white border-r border-slate-100 flex-col p-10 space-y-12 shrink-0">
          <img src={logo} alt="ServiceHub" className="h-8 w-fit object-contain" />
          
          <div className="space-y-8">
            {[
              { step: 1, label: "Personal Info", desc: "Basic details & photo", icon: User },
              { step: 2, label: "Service Selection", desc: "Categories & rates", icon: Settings },
              { step: 3, label: "Verification Docs", desc: "ID & licenses", icon: ShieldCheck },
              { step: 4, label: "Bank Details", desc: "Payout setup", icon: Building2 },
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
                  {item.step < 4 && <div className={`w-0.5 h-10 mt-2 ${currentStep > item.step ? "bg-emerald-500" : "bg-slate-100"}`} />}
                </div>
                <div>
                  <p className={`text-sm font-black ${currentStep === item.step ? "text-slate-900" : "text-slate-400"}`}>{item.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
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
                 Step {currentStep} of 4: Setup Required
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
                                <div className="w-28 h-28 rounded-[36px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden">
                                   {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <Camera size={36} />}
                                </div>
                                <button onClick={() => profileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-[14px] border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                                   <Upload size={16} />
                                </button>
                                <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) { setProfilePhoto(f); setProfilePreview(URL.createObjectURL(f)); }
                                }} />
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900">Profile Photo</h4>
                                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] leading-relaxed">Upload a clear photo. Customers prefer providers with professional photos.</p>
                             </div>
                          </div>
                          <div className="space-y-6">
                             <div className="flex justify-between items-center"><label className="text-xs font-black text-slate-500 uppercase tracking-widest">Service Radius</label><span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full">{form.radius} km</span></div>
                             <input type="range" value={form.radius} onChange={e => setForm({...form, radius: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-blue-600 cursor-pointer" />
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 2: Service Selection */}
                 {currentStep === 2 && (
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
                                <div key={s._id} onClick={() => setSelectedService(s)} className={`border-2 rounded-[32px] p-6 flex items-center justify-between cursor-pointer transition-all duration-300 ${selectedService?._id === s._id || selectedService === s._id ? "border-blue-600 bg-blue-50/30 ring-8 ring-blue-600/5" : "border-slate-50 bg-slate-50/50 hover:border-blue-200"}`}>
                                   <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedService?._id === s._id || selectedService === s._id ? "bg-blue-600 text-white rotate-6" : "bg-white text-slate-400"}`}><Settings size={22} /></div>
                                      <div><p className="font-black text-slate-900">{s.name}</p></div>
                                   </div>
                                   {(selectedService?._id === s._id || selectedService === s._id) && <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg"><Check size={14} /></div>}
                                </div>
                             ))}
                          </div>
                          {selectedService && (
                             <div className="pt-10 border-t border-slate-50 space-y-8 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Wallet size={24} /></div><div><h4 className="text-xl font-black text-slate-900">Set Hourly Rate</h4><p className="text-sm font-medium text-slate-400">Specify your charge for {selectedService.name}</p></div></div>
                                <div className="relative group max-w-md">
                                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-200 group-focus-within:text-blue-600 transition-colors">₹</span>
                                   <input type="number" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})} placeholder="0" className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-[32px] pl-14 pr-24 py-8 text-4xl font-black text-slate-900 focus:outline-none focus:border-blue-600 transition-all" />
                                   <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">per hour</span>
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                 )}

                 {/* Step 3: Documents */}
                 {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="grid grid-cols-1 gap-10">
                          {/* Identity Section */}
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

                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Upload Button Slot */}
                                <div 
                                  onClick={() => docsInputRef.current?.click()}
                                  className="aspect-square rounded-[32px] border-2 border-dashed border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                                >
                                   <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <Upload size={20} />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add ID</p>
                                   <input type="file" ref={docsInputRef} className="hidden" multiple onChange={(e) => setIdentityDocs(prev => [...prev, ...Array.from(e.target.files || [])])} />
                                </div>

                                {/* Previews */}
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
                          </div>

                          {/* Professional Section */}
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
                                {/* Upload Button Slot */}
                                <div 
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.onchange = (e: any) => setLicenseDocs(prev => [...prev, ...Array.from(e.target.files || [])]);
                                    input.click();
                                  }}
                                  className="aspect-square rounded-[32px] border-2 border-dashed border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                                >
                                   <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                      <Upload size={20} />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add License</p>
                                </div>

                                {/* Previews */}
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
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 4: Bank Details */}
                 {currentStep === 4 && (
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
                               <input type="text" value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-[24px] px-6 py-5 text-base font-black focus:outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 transition-all" />
                            </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* Navigation */}
                 <div className="mt-12 flex items-center justify-between sticky bottom-0 bg-[#F9FAFB]/80 backdrop-blur-md py-4">
                    <button disabled={currentStep === 1} onClick={() => setCurrentStep(prev => (prev-1) as Step)} className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-100 font-black text-sm text-slate-400 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-0"><ChevronLeft size={20} /> Previous</button>
                    <button onClick={handleNext} disabled={isSubmitting} className="bg-blue-600 text-white px-12 py-5 rounded-[28px] font-black text-sm shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-3">
                       {isSubmitting ? "Processing..." : currentStep === 4 ? "Complete Setup" : "Continue"} <ChevronRight size={20} />
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
