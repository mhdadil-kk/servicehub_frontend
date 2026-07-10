import React, { useEffect, useState, useCallback } from "react";
import Table from "../../components/Common/Table";
import Badge from "../../components/Common/Badge";
import { Pagination } from "../../components/Common/Pagination";
import { Search, Loader2 } from "lucide-react";
import { adminService } from "../../api/admin.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminBookings: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");

  const navigate = useNavigate();

  const fetchBookings = useCallback(async (search: string, status: string, sort: string) => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings(search, status, sort, page, limit);
      setData(res.data?.bookings || []);
      setTotal(res.data?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings(searchQuery, statusFilter, sortFilter);
    }, 500)
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, sortFilter, fetchBookings]);

  const columns = [
    {
      header: "Booking Info",
      accessor: (item: any) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">ID: {item._id.slice(-6).toUpperCase()}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.serviceId?.name}</p>
        </div>
      )
    },
    {
      header: "Customer",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
             {item.userId?.profilePhoto ? (
               <img src={item.userId.profilePhoto} alt="" className="w-full h-full object-cover" />
             ) : (
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.userId?.name}`} alt="" />
             )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{item.userId?.name}</p>
          </div>
        </div>
      )
    },
    {
      header: "Provider",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
             {item.providerId?.profilePhoto || item.providerId?.userId?.profilePhoto ? (
               <img src={item.providerId.profilePhoto || item.providerId.userId.profilePhoto} alt="" className="w-full h-full object-cover" />
             ) : (
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.providerId?.userId?.name}`} alt="" />
             )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{item.providerId?.userId?.name}</p>
          </div>
        </div>
      )
    },
    {
      header: "Date & Time",
      accessor: (item: any) => (
        <div>
          <p className="font-bold text-slate-700 text-xs">{item.date}</p>
          <p className="text-[10px] text-slate-400 font-bold">{item.slot?.start} - {item.slot?.end}</p>
        </div>
      )
    },
    {
      header: "Status",
      accessor: (item: any) => {
        const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          pending: 'warning',
          awaiting_payment: 'warning',
          confirmed: 'info',
          in_progress: 'info',
          completed_pending_payment: 'info',
          completed: 'success',
          cancelled: 'danger',
          rescheduled: 'danger',
          awaiting_user_confirmation: 'warning',
        };
        return (
          <Badge type={typeMap[item.status] || 'info'}>
            {item.status}
          </Badge>
        );
      }
    },
    {
      header: "Actions",
      accessor: (item: any) => (
        <button 
          onClick={() => navigate(`/admin/bookings/${item._id}`)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-sm shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Bookings</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Monitor and manage all service appointments.</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* FILTERS */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search by ID, Customer or Provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
              />
            </div>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            >
              <option value="">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
            </select>
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  statusFilter === status 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {status || "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
           <div className="p-12 flex justify-center">
             <Loader2 size={32} className="text-blue-600 animate-spin" />
           </div>
        ) : (
          <Table columns={columns} data={data} />
        )}

        <Pagination 
          currentPage={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AdminBookings;
