import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../api/admin.service';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, 
  CheckCircle2, XCircle, ChevronLeft, Building2, Wallet, 
  ExternalLink, FileText 
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
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

const AdminProviderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    try {
      const res = await adminService.getProviderDetail(id!);
      setProvider(res.data);
    } catch (error: unknown) {
      const err = error as any;
      toast.error("Failed to fetch details");
      navigate('/admin/providers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsVerifying(true);
    try {
      await adminService.verifyProvider(id!, status, rejectionReason);
      toast.success(`Provider ${status} successfully`);
      fetchProviderDetails();
      setShowRejectModal(false);
    } catch (error: unknown) {
      const err = error as any;
      toast.error(error.message || "Action failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Review Application</h1>
            <p className="text-sm font-medium text-slate-400">Review provider credentials and verify account</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          provider.onboardingStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          provider.onboardingStatus === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
          'bg-orange-50 text-orange-600 border-orange-100'
        }`}>
          Status: {provider.onboardingStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start">
             <div className="w-32 h-32 rounded-[36px] bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                {provider.profilePhoto ? (
                  <img src={provider.profilePhoto} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={48} /></div>
                )}
             </div>
             <div className="flex-1 space-y-4">
                <div>
                   <h2 className="text-2xl font-black text-slate-900">{provider.userId?.name}</h2>
                   <p className="text-sm font-bold text-blue-600">ID: {provider.userId?._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={14} /></div>
                      <span className="text-xs font-bold">{provider.userId?.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={14} /></div>
                      <span className="text-xs font-bold">{provider.userId?.phone || 'No phone'}</span>
                   </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">About / Bio</p>
                   <p className="text-sm font-medium text-slate-600 italic leading-relaxed">{provider.bio || 'No bio provided'}</p>
                </div>
             </div>
          </div>

          {/* Service Details Card */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <ShieldCheck className="text-blue-600" size={20} /> Service Offering
                </h3>
             </div>
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Category</p>
                      <h4 className="text-xl font-black text-slate-900">{provider.serviceId?.name || 'Unassigned'}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">{provider.serviceId?.description}</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Wallet size={18} /></div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hourly Rate</p>
                            <p className="text-lg font-black text-slate-900">₹{provider.hourlyRate}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Location & Operating Base Card */}
          {provider.location?.coordinates && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                     <MapPin className="text-blue-600" size={20} /> Operating Base & Service Area
                  </h3>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Radius</p>
                     <p className="text-sm font-black text-blue-600">{provider.serviceRadius} miles</p>
                  </div>
               </div>
               <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Address</p>
                        <p className="text-sm font-bold text-slate-900">{provider.address || "No address provided"}</p>
                     </div>
                  </div>
                  
                  <div className="h-[300px] w-full rounded-3xl overflow-hidden border-4 border-slate-50 relative z-0 shadow-inner">
                     <MapContainer 
                        center={{ lat: provider.location.coordinates[1], lng: provider.location.coordinates[0] }} 
                        zoom={12} 
                        scrollWheelZoom={false} 
                        style={{ height: '100%', width: '100%' }}
                     >
                        <TileLayer
                           attribution='&copy; OpenStreetMap contributors'
                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={{ lat: provider.location.coordinates[1], lng: provider.location.coordinates[0] }} />
                        <Circle 
                           center={[provider.location.coordinates[1], provider.location.coordinates[0]]} 
                           pathOptions={{ fillColor: '#2563eb', color: '#2563eb', weight: 1, fillOpacity: 0.15 }}
                           radius={(provider.serviceRadius || 25) * 1609.34} 
                        />
                     </MapContainer>
                  </div>
               </div>
            </div>
          )}

          {/* Verification Documents */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <FileText className="text-blue-600" size={20} /> Identity & Verification Documents
                </h3>
             </div>
             <div className="p-8 space-y-10">
                {/* Identity Proofs */}
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">1. Government Identity Proofs</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {provider.documents?.filter((d: any) => {
                       
                         const isIdentity = d.docType === 'identity' || typeof d === 'string' || (typeof d === 'object' && !d.docType);
                         return isIdentity;
                      }).map((doc: any, idx: number) => {
                         const url = typeof doc === 'string' ? doc : doc.url;
                         return (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-[24px] overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                               {url?.toLowerCase().endsWith('.pdf') ? (
                                 <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <FileText size={24} />
                                    <p className="text-[8px] font-black uppercase">PDF</p>
                                 </div>
                               ) : (
                                 <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                               )}
                               <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl"><ExternalLink size={14} /></div>
                               </div>
                            </a>
                         );
                      })}
                      {provider.documents?.filter((d: any) => d.docType === 'identity' || typeof d === 'string' || (typeof d === 'object' && !d.docType)).length === 0 && (
                        <div className="col-span-full py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                           <p className="text-xs font-bold text-slate-400">No identity documents uploaded</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Professional Licenses */}
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">2. Professional Certifications & Licenses</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {provider.documents?.filter((d: any) => d.docType === 'license').map((doc: any, idx: number) => {
                         const url = doc.url;
                         return (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-[24px] overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                               {url?.toLowerCase().endsWith('.pdf') ? (
                                 <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <FileText size={24} />
                                    <p className="text-[8px] font-black uppercase">PDF</p>
                                 </div>
                               ) : (
                                 <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                               )}
                               <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl"><ExternalLink size={14} /></div>
                               </div>
                            </a>
                         );
                      })}
                      {provider.documents?.filter((d: any) => d.docType === 'license').length === 0 && (
                        <div className="col-span-full py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                           <p className="text-xs font-bold text-slate-400">No professional licenses uploaded</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Actions & Bank */}
        <div className="space-y-8">
           
           {/* Actions Card */}
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-lg p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-900">Verification Actions</h3>
              
              {provider.onboardingStatus === 'in_review' ? (
                <div className="space-y-4">
                   <button 
                     onClick={() => handleVerify('approved')}
                     disabled={isVerifying}
                     className="w-full bg-emerald-500 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                   >
                      <CheckCircle2 size={18} /> Approve Application
                   </button>
                   <button 
                     onClick={() => setShowRejectModal(true)}
                     disabled={isVerifying}
                     className="w-full bg-white border-2 border-rose-100 text-rose-500 py-5 rounded-[24px] font-black text-sm hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
                   >
                      <XCircle size={18} /> Reject Application
                   </button>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-3xl text-center space-y-2">
                   <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                     provider.onboardingStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                   }`}>
                      {provider.onboardingStatus === 'approved' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                   </div>
                   <p className="text-sm font-black text-slate-900">
                      Application {provider.onboardingStatus}
                   </p>
                   {provider.rejectionReason && (
                     <p className="text-[10px] font-bold text-rose-500 italic mt-2">Reason: {provider.rejectionReason}</p>
                   )}
                </div>
              )}
           </div>

           {/* Bank Details Card */}
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="text-blue-600" size={20} /> Bank Information
                 </h3>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                    <p className="text-sm font-bold text-slate-900">{provider.bankDetails?.accountHolderName || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                    <p className="text-sm font-bold text-slate-900">{provider.bankDetails?.bankName || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-sm font-bold text-slate-900">{provider.bankDetails?.accountNumber || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IFSC / Routing</p>
                    <p className="text-sm font-bold text-slate-900">{provider.bankDetails?.routingNumber || 'N/A'}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowRejectModal(false)} />
           <div className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Reject Application</h3>
              <p className="text-sm font-medium text-slate-400 mb-8">Please specify why you are rejecting this application. This will be shown to the provider.</p>
              
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Verification documents are blurry or invalid."
                className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:border-rose-500 focus:ring-8 focus:ring-rose-500/5 transition-all resize-none mb-8"
              />

              <div className="flex gap-4">
                 <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
                 <button 
                   onClick={() => handleVerify('rejected')}
                   disabled={isVerifying || !rejectionReason}
                   className="flex-1 bg-rose-500 text-white py-4 rounded-[20px] font-black shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50"
                 >
                    Confirm Rejection
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviderDetail;
