import React, { useState, useEffect } from "react";
import { adminService } from "../../api/admin.service";
import { 
  Plus, 
  Trash2, 
  Search, 
  Briefcase, 
  AlertCircle,
  X,
  CheckCircle,
  IndianRupee,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  isActive: boolean;
}

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await adminService.getServices();
      setServices(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.addService(form);
      toast.success("Service category added successfully");
      setServices([...(services || []), response.data]);
      setShowModal(false);
      setForm({ name: "", description: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add service");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await adminService.deleteService(id);
        setServices((services || []).filter(s => s && s._id !== id));
        toast.success("Service deleted");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete service");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Service Categories</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Manage the master list of services offered on the platform.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse"></div>
          ))}
        </div>
      ) : !services || services.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Briefcase size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-900">No Services Found</h3>
           <p className="text-slate-400 font-medium mt-2">Start by adding your first service category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
             service && (
               <div key={service._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Briefcase size={28} />
                     </div>
                     <button 
                       onClick={() => handleDelete(service._id)}
                       className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                     >
                       <Trash2 size={18} />
                     </button>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2">{service?.name}</h3>
                  <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-6">{service?.description}</p>
                  
                  <div className="pt-6 border-t border-slate-50 flex justify-end items-center">
                     <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Activity size={12} /> Active
                     </div>
                  </div>
               </div>
             )
           ))}
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h2 className="text-2xl font-black text-slate-900">Add Category</h2>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-all">
                    <X size={20} className="text-slate-400" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Plumbing, Home Cleaning"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Briefly describe what this service category covers..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all" 
                    />
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                    >
                      Create Category
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
