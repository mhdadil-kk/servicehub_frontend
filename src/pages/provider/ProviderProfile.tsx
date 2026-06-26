import React, { useEffect, useState } from "react";
import { validateFile, FILE_LIMITS, validateBio, validateHourlyRate, validateBankField } from "../../utils/validation";
import { providerApi } from "../../api/provider.service";
import { serviceApi } from "../../api/service.service";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { 
  Camera, RefreshCw, CheckCircle, UploadCloud, ChevronRight, Briefcase, 
  User, MapPin, DollarSign, FileText, ExternalLink, Shield, CreditCard, Lock,
  Mail, Phone, AlertTriangle, Clock, Star, Heart, Loader2
} from "lucide-react";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";
import { reviewService } from "../../api/review.service";
import type { Review } from "../../types/provider.types";

const ProviderProfile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState("personal");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState(25);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [identityFiles, setIdentityFiles] = useState<FileList | null>(null);
  const [licenseFiles, setLicenseFiles] = useState<FileList | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoError, setPhotoError] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [licenseError, setLicenseError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, servicesRes] = await Promise.all([
        providerApi.getProfile(),
        serviceApi.getActiveServices()
      ]);

      const prof = profileRes.data;
      setProfile(prof);
      setServices(servicesRes.data || []);

      if (prof) {
        if (user && user.status !== prof.onboardingStatus) {
          setUser({ ...user, status: prof.onboardingStatus });
        }

        const userObj = prof.userId || {};
        setName(userObj.name || "");
        setPhone(userObj.phone || "");
        setBio(prof.bio || "");
        setAddress(prof.address || "");
        setServiceRadius(prof.serviceRadius || 25);
        
        const svcId = prof.serviceId?._id || prof.serviceId || "";
        setSelectedServiceId(svcId);
        setHourlyRate(prof.hourlyRate || 0);

        const bank = prof.bankDetails || {};
        setAccountHolderName(bank.accountHolderName || "");
        setBankName(bank.bankName || "");
        setAccountNumber(bank.accountNumber || "");
        setRoutingNumber(bank.routingNumber || "");
        
        if (prof.profilePhoto) {
          const photoUrl = prof.profilePhoto.startsWith("http") 
            ? prof.profilePhoto 
            : `http://localhost:5000/${prof.profilePhoto.replace(/\\/g, "/")}`;
          setProfilePhotoUrl(photoUrl);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = validateFile(file, FILE_LIMITS.profilePhoto);
      if (!result.valid) {
        setPhotoError(result.error!);
        e.target.value = "";
        return;
      }
      setPhotoError("");
      setNewPhoto(file);
      setProfilePhotoUrl(URL.createObjectURL(file));
      toast.success(`Photo ready: ${file.name}`);
    }
  };

  const handleIdentityFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const invalid = files.filter(f => !validateFile(f, FILE_LIMITS.verificationDoc).valid);
    if (invalid.length > 0) {
      setIdentityError(invalid.map(f => validateFile(f, FILE_LIMITS.verificationDoc).error).join(" "));
      e.target.value = "";
      return;
    }
    setIdentityError("");
    setIdentityFiles(e.target.files);
    toast.success(`${files.length} identity document(s) ready.`);
  };

  const handleLicenseFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const invalid = files.filter(f => !validateFile(f, FILE_LIMITS.verificationDoc).valid);
    if (invalid.length > 0) {
      setLicenseError(invalid.map(f => validateFile(f, FILE_LIMITS.verificationDoc).error).join(" "));
      e.target.value = "";
      return;
    }
    setLicenseError("");
    setLicenseFiles(e.target.files);
    toast.success(`${files.length} license document(s) ready.`);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const newErrors: Record<string, string> = {};
    const bioErr = validateBio(bio);
    if (bioErr) newErrors.bio = bioErr;
    
    const rateErr = validateHourlyRate(hourlyRate);
    if (rateErr) newErrors.hourlyRate = rateErr;
    
    const ahErr = validateBankField(accountHolderName, "Account holder name");
    if (ahErr) newErrors.accountHolderName = ahErr;
    
    const anErr = validateBankField(accountNumber, "Account number", 8);
    if (anErr) newErrors.accountNumber = anErr;
    
    const rnErr = validateBankField(ifscCode, "IFSC code", 5);
    if (rnErr) newErrors.ifscCode = rnErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the validation errors in the form.");
      return;
    }
    
    setErrors({});
    setSaving(true);

    try {
      const personalData = new FormData();
      personalData.append("name", name);
      personalData.append("phone", phone);
      personalData.append("bio", bio);
      if (newPhoto) {
        personalData.append("profilePhoto", newPhoto);
      }
      await providerApi.updateProfile(personalData);

      const lat = profile?.location?.coordinates?.[1] || 30.2672; // fallback to Austin or default
      const lng = profile?.location?.coordinates?.[0] || -97.7431;
      await providerApi.updateLocation({
        address,
        latitude: lat,
        longitude: lng,
        serviceRadius
      });

      if (selectedServiceId) {
        await providerApi.updateServiceDetails({
          serviceId: selectedServiceId,
          hourlyRate
        });
      }

      await providerApi.updateBankDetails({
        accountHolderName,
        bankName,
        accountNumber,
        routingNumber: ifscCode
      });

      if ((identityFiles && identityFiles.length > 0) || (licenseFiles && licenseFiles.length > 0)) {
        const docData = new FormData();
        if (identityFiles) {
          for (let i = 0; i < identityFiles.length; i++) {
            docData.append("identity", identityFiles[i]);
          }
        }
        if (licenseFiles) {
          for (let i = 0; i < licenseFiles.length; i++) {
            docData.append("license", licenseFiles[i]);
          }
        }
        await providerApi.uploadDocuments(docData);
      }

      toast.success("Profile saved successfully");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      approved: <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100"><CheckCircle size={14} /> Approved</span>,
      in_review: <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-amber-100"><Clock size={14} /> In Review</span>,
      pending: <span className="bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-sky-100"><Clock size={14} /> Pending Onboarding</span>,
      rejected: <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-rose-100"><AlertTriangle size={14} /> Rejected</span>
    };
    return badges[status] || <span className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
        <p className="text-slate-400 font-bold text-sm">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-16">

      {/* --- HERO PROFILE HEADER --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative group">
            <div className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-xl">
              <div className="w-full h-full rounded-[32px] overflow-hidden bg-white flex items-center justify-center">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${name || 'Provider'}`} alt={name} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            <label className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer border-2 border-white hover:scale-105 transition-all">
              <Camera size={16} />
              <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhotoChange} title="JPG or PNG · Max 2 MB" />
            </label>
            {photoError && (
              <p className="text-red-500 text-[10px] font-semibold mt-2 text-center max-w-[112px]">{photoError}</p>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h1>
              {getStatusBadge(profile?.onboardingStatus || "pending")}
            </div>
            <p className="text-slate-400 text-sm font-semibold mt-1 flex items-center justify-center md:justify-start gap-1">
              <Briefcase size={14} /> {profile?.serviceId?.name || "Professional"} Provider
            </p>
            <p className="text-slate-500 text-xs font-semibold mt-1 flex items-center justify-center md:justify-start gap-1">
              <MapPin size={14} /> {address || "No address set"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* --- DETAILS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: "personal", label: "Personal Info", icon: User },
            { id: "security", label: "Security", icon: Lock },
            { id: "service", label: "Service & Location", icon: Briefcase },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "bank", label: "Bank Account", icon: CreditCard },
            { id: "reviews", label: "Reviews", icon: Star }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left font-black text-sm uppercase tracking-wider transition-all ${
                  isSelected 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-400 hover:text-slate-900 border border-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} />
                  {tab.label}
                </div>
                <ChevronRight size={16} className={isSelected ? "text-white" : "text-slate-300"} />
              </button>
            );
          })}
        </div>

        {/* Form Details Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* === TAB 1: PERSONAL INFO === */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Personal Details</h3>
                    <p className="text-slate-400 text-xs font-semibold">Manage your name, contact phone, and professional bio.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><User size={12} /> Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Mail size={12} /> Email Address</label>
                      <input
                        type="email"
                        value={profile?.userId?.email || ""}
                        disabled
                        className="w-full bg-slate-100/50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Phone size={12} /> Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">Professional Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => { setBio(e.target.value); setErrors(prev => ({...prev, bio: ""})); }}
                        rows={4}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800 resize-none ${errors.bio ? 'border-red-400' : 'border-slate-100'}`}
                        placeholder="Tell clients about your skills, experience, and background..."
                      />
                      {errors.bio && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.bio}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB: SECURITY === */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Account Security</h3>
                    <p className="text-slate-400 text-xs font-semibold">Update your account password regularly to keep it secure.</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Change Password</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              {/* === TAB 2: SERVICE & LOCATION === */}
              {activeTab === "service" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Service & Location Details</h3>
                    <p className="text-slate-400 text-xs font-semibold">Update your professional category, hourly rates, and your service delivery area.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Briefcase size={12} /> Service Category</label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800"
                        required
                      >
                        <option value="">Select Service Category</option>
                        {services.map((svc) => (
                          <option key={svc._id} value={svc._id}>{svc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><DollarSign size={12} /> Hourly Rate (₹)</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => { setHourlyRate(Number(e.target.value)); setErrors(prev => ({...prev, hourlyRate: ""})); }}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800 ${errors.hourlyRate ? 'border-red-400' : 'border-slate-100'}`}
                        placeholder="500"
                        min="1"
                        required
                      />
                      {errors.hourlyRate && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.hourlyRate}</p>}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><MapPin size={12} /> Base Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800"
                        placeholder="Enter your street address, city, state"
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        <span>Service Radius (km)</span>
                        <span className="text-blue-600 font-bold">{serviceRadius} km</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={serviceRadius}
                        onChange={(e) => setServiceRadius(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>5 km</span>
                        <span>50 km</span>
                        <span>100 km</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: VERIFICATION DOCUMENTS === */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Verification Documents</h3>
                    <p className="text-slate-400 text-xs font-semibold">Upload required ID proof and professional certificates for verification.</p>
                  </div>

                  {/* List of uploaded documents */}
                  {profile?.documents && profile.documents.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Shield size={12} /> Existing Documents</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.documents.map((doc: any, idx: number) => {
                          const docUrl = doc.url.startsWith("http") 
                            ? doc.url 
                            : `http://localhost:5000/${doc.url.replace(/\\/g, "/")}`;
                          return (
                            <a 
                              key={idx}
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-100 transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <FileText size={18} />
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold text-slate-700 capitalize">{doc.docType}</p>
                                  <p className="text-[10px] font-bold text-slate-400">View document</p>
                                </div>
                              </div>
                              <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* File Upload Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Identity Proof */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Identity Proof</label>
                      <div className={`border-2 border-dashed rounded-2xl p-6 text-center hover:border-blue-600 transition-colors cursor-pointer relative bg-slate-50 ${
                        identityFiles && identityFiles.length > 0 ? "border-blue-400" : "border-slate-200"
                      }`}>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleIdentityFilesChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileText size={24} className={`mx-auto mb-2 ${identityFiles && identityFiles.length > 0 ? "text-blue-500" : "text-slate-400"}`} />
                        <span className="block text-xs font-bold text-slate-600">
                          {identityFiles && identityFiles.length > 0
                            ? `✓ ${identityFiles.length} file(s) selected`
                            : "Click to browse Identity Proof"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">Aadhar Card, Passport, etc.</span>
                        <span className="text-[10px] text-slate-300 mt-0.5 block">JPG, PNG or PDF · Max 5 MB each</span>
                      </div>
                      {identityError && (
                        <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{identityError}</p>
                      )}
                    </div>

                    {/* Professional License */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Professional License</label>
                      <div className={`border-2 border-dashed rounded-2xl p-6 text-center hover:border-blue-600 transition-colors cursor-pointer relative bg-slate-50 ${
                        licenseFiles && licenseFiles.length > 0 ? "border-blue-400" : "border-slate-200"
                      }`}>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleLicenseFilesChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileText size={24} className={`mx-auto mb-2 ${licenseFiles && licenseFiles.length > 0 ? "text-blue-500" : "text-slate-400"}`} />
                        <span className="block text-xs font-bold text-slate-600">
                          {licenseFiles && licenseFiles.length > 0
                            ? `✓ ${licenseFiles.length} file(s) selected`
                            : "Click to browse License Proof"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">Trade license, degree certificate, etc.</span>
                        <span className="text-[10px] text-slate-300 mt-0.5 block">JPG, PNG or PDF · Max 5 MB each</span>
                      </div>
                      {licenseError && (
                        <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{licenseError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 4: BANK ACCOUNT === */}
              {activeTab === "bank" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Bank Details</h3>
                    <p className="text-slate-400 text-xs font-semibold">Where should we send your earnings?</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Account Holder Name</label>
                      <input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => { setAccountHolderName(e.target.value); setErrors(prev => ({...prev, accountHolderName: ""})); }}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800 ${errors.accountHolderName ? 'border-red-400' : 'border-slate-200'}`}
                        placeholder="John Doe"
                      />
                      {errors.accountHolderName && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.accountHolderName}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '')); setErrors(prev => ({...prev, accountNumber: ""})); }}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800 ${errors.accountNumber ? 'border-red-400' : 'border-slate-200'}`}
                        placeholder="000000000000"
                        maxLength={18}
                      />
                      {errors.accountNumber && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.accountNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">IFSC Code</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => { setIfscCode(e.target.value.toUpperCase()); setErrors(prev => ({...prev, ifscCode: ""})); }}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all focus:outline-none text-slate-800 ${errors.ifscCode ? 'border-red-400' : 'border-slate-200'}`}
                        placeholder="ABCD0123456"
                        maxLength={11}
                      />
                      {errors.ifscCode && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.ifscCode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 5: REVIEWS === */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Customer Reviews</h3>
                    <p className="text-slate-400 text-xs font-semibold">See what customers are saying about your service.</p>
                  </div>

                  <div className="space-y-4">
                    {reviewsLoading ? (
                      <div className="py-8 flex justify-center">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-500 font-bold text-sm">You have no reviews yet.</p>
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev._id} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-black text-slate-900">{rev.userId.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={12} className={i <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                                  ))}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(rev.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); handleLikeReview(rev._id); }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                rev.likedByProvider 
                                  ? "bg-rose-50 border-rose-100 text-rose-600" 
                                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              <Heart size={14} className={rev.likedByProvider ? "fill-rose-600" : ""} />
                              {rev.likedByProvider ? "Liked" : "Like"}
                            </button>
                          </div>
                          <p className="text-sm font-medium text-slate-600 italic">"{rev.reviewText}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default ProviderProfile;
