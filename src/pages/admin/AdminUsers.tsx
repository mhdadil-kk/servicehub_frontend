import React, { useEffect, useState } from "react";
import Table from "../../components/Common/Table";
import Badge from "../../components/Common/Badge";
import type { IUser } from "../../types/api.types";
import { Search } from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin";

const AdminUsers: React.FC = () => {
  const {
    data,
    loading,
    fetchUsers,
    blockUser,
    unblockUser
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery, statusFilter, sortBy);
    }, 500)
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, sortBy, fetchUsers]);

  const handleBlockAction = async (id: string) => {
    const success = await blockUser(id, "customer");
    if (success) fetchUsers();
  };

  const handleUnblockAction = async (id: string) => {
    const success = await unblockUser(id, "customer");
    if (success) fetchUsers();
  };

  const columns = [
    {
      header: "User Details",
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
      accessor: (item: IUser) => (
        <Badge type={item.isDeleted ? "danger" : "success"}>
          {item.isDeleted ? "Inactive" : "Active"}
        </Badge>
      )
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
          <button
            onClick={() => item.isDeleted ? handleUnblockAction(item.id) : handleBlockAction(item.id)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${item.isDeleted
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
              : 'bg-slate-50 text-rose-600 border-rose-100 hover:bg-rose-50'
              }`}
          >
            {item.isDeleted ? 'Unlock Account' : 'Block Access'}
          </button>

          <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-sm shadow-blue-100 hover:bg-blue-700 transition-all">
            View
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Manage, filter, and monitor all registered accounts within the platform.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-500 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all uppercase tracking-widest">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
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
      </div>

      <Table data={data} columns={columns} isLoading={loading} emptyMessage="No customers found." />
    </div>
  );
};

export default AdminUsers;
