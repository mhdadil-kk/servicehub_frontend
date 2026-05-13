import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../components/Common/Table";
import Badge from "../../components/Common/Badge";
import type { IUser } from "../../types/api.types";
import { Pagination } from "../../components/Common/Pagination";
import { Search, ShieldCheck, Clock, Ban } from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin";

const AdminProviders: React.FC = () => {
  const {
    data,
    total,
    page,
    limit,
    loading,
    fetchProviders,
    blockUser,
    unblockUser,
    updateProviderStatus,
    setPage
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProviders(searchQuery, statusFilter, sortBy);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, sortBy, fetchProviders]);


  const handleUpdateStatus = async (id: string, status: string) => {
    const success = await updateProviderStatus(id, status);
    if (success) fetchProviders();
  };

  const handleBlockAction = async (id: string) => {
    const success = await blockUser(id, "provider");
    if (success) fetchProviders();
  };

  const handleUnblockAction = async (id: string) => {
    const success = await unblockUser(id, "provider");
    if (success) fetchProviders();
  };

  const columns = [
    {
      header: "Provider Details",
      accessor: (item: IUser) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} alt="" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">{item.name}</p>
            <p className="text-[11px] text-slate-400 font-bold">{item.email}</p>
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessor: (item: IUser) => {
        if (item.isDeleted) return <Badge type="danger">Blocked</Badge>;
        if (item.status === 'approved') return <Badge type="success">Verified</Badge>;
        if (item.status === 'pending') return <Badge type="warning">Pending</Badge>;
        if (item.status === 'rejected') return <Badge type="danger">Rejected</Badge>;
        return <Badge type="neutral">{item.status}</Badge>;
      }
    },
    {
      header: "Joined Date",
      accessor: (item: IUser) => (
        <span className="text-slate-500 font-bold text-xs uppercase">
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (item: IUser) => (
        <div className="flex gap-3">
          {item.status === 'pending' && !item.isDeleted && (
            <>
              <button
                onClick={() => handleUpdateStatus(item.id, 'approved')}
                className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all text-[11px] font-bold"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition-all text-[11px] font-bold"
              >
                Reject
              </button>
            </>
          )}

          {item.status === 'approved' && (
            <button
              onClick={() => item.isDeleted ? handleUnblockAction(item.id) : handleBlockAction(item.id)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${item.isDeleted
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                : 'bg-slate-50 text-rose-600 border-rose-100 hover:bg-rose-50'
                }`}
            >
              {item.isDeleted ? 'Unlock Account' : 'Block Access'}
            </button>
          )}

          <Link 
            to={`/admin/providers/${item.id}`}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-sm shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center"
          >
            View
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Provider Management</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Manage, verify and monitor all service providers on the platform.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by provider name, email or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-300"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="blocked">Blocked Only</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 focus:outline-none focus:border-blue-600"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <Table data={data} columns={columns} isLoading={loading} emptyMessage="No providers found." />
        <Pagination 
          total={total} 
          limit={limit} 
          currentPage={page} 
          onPageChange={(newPage) => setPage(newPage)} 
        />
      </div>

      {/* FOOTER SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><ShieldCheck /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Verified</p>
            <h4 className="text-2xl font-black text-slate-900">842</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Clock /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pending Approval</p>
            <h4 className="text-2xl font-black text-slate-900">18</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center group"><Ban /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Blocked Accounts</p>
            <h4 className="text-2xl font-black text-slate-900">12</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProviders;
