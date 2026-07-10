import React, { useState, useEffect } from "react";
import { Flag, Loader2, ShieldAlert, CheckCircle2, UserX, AlertCircle, Ban, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReports } from "../../hooks/useReports";
import { type Report } from "../../api/report.service";

const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const { reports, loading, isSubmitting, total, fetchAllReports, takeAction } = useReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchAllReports(1, statusFilter || undefined);
  }, [fetchAllReports, statusFilter]);

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
  };

  const handleAction = async (action: "warn" | "block" | "reject" | "resolve") => {
    if (!selectedReport) return;
    const updated = await takeAction(selectedReport._id, { action, adminNotes });
    if (updated) {
      setSelectedReport(updated);
      fetchAllReports(1, statusFilter || undefined);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex -m-8 overflow-hidden bg-slate-50">
      {/* ── LEFT SIDEBAR: REPORT LIST ── */}
      <aside className="w-80 h-full bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-50 shrink-0 space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Reports</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Moderation Queue</p>
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 size={24} className="text-rose-600 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <ShieldAlert size={24} className="text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-bold">No reports found</p>
            </div>
          ) : (
            reports.map((report) => {
              const isSelected = selectedReport?._id === report._id;
              return (
                <div
                  key={report._id}
                  onClick={() => handleSelectReport(report)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border relative ${
                    isSelected 
                      ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100" 
                      : "bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-rose-700 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {report.category}
                    </span>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-rose-200" : "text-slate-400"}`}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-xs font-bold line-clamp-2 ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {report.description}
                  </p>
                  <div className={`mt-3 pt-3 border-t flex justify-between items-center ${isSelected ? "border-rose-500/50" : "border-slate-50"}`}>
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${isSelected ? "text-rose-100" : "text-slate-400"}`}>
                      Reported by {(report.reporterId as any)?.name || "User"}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${report.status === 'pending' ? 'bg-orange-400' : report.status === 'resolved' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* ── RIGHT PANEL: REPORT DETAILS ── */}
      <section className="flex-1 h-full flex flex-col bg-[#F9FAFB] overflow-y-auto">
        {!selectedReport ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-12">
            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm text-slate-300 mb-6">
              <Flag size={28} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">Select a report</h3>
            <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
              Choose a report from the list on the left to review details and take moderation action.
            </p>
          </div>
        ) : (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <ShieldAlert className="text-rose-600" /> Report Details
                </h2>
                <p className="text-sm text-slate-500 font-bold mt-1">Ref: #{selectedReport._id}</p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                selectedReport.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                selectedReport.status === 'rejected' ? 'bg-slate-200 text-slate-600' :
                selectedReport.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {selectedReport.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter</span>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                     <img src={(selectedReport.reporterId as any)?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${(selectedReport.reporterId as any)?.name}`} alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{(selectedReport.reporterId as any)?.name}</p>
                    <p className="text-xs text-slate-500 font-bold">Role: {(selectedReport.reporterId as any)?.role}</p>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-sm">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reported User/Provider</span>
                <div 
                  onClick={() => {
                    const reportedIdStr = (selectedReport.reportedId as any)?._id || selectedReport.reportedId;
                    const role = (selectedReport.reportedId as any)?.role;
                    if (role === 'provider') navigate(`/admin/providers/${reportedIdStr}`);
                    else navigate(`/admin/users`);
                  }}
                  className="flex items-center gap-3 mt-3 cursor-pointer hover:opacity-80 transition-opacity bg-white p-3 rounded-2xl border border-rose-100/50"
                  title="Click to view details and manage this user"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-rose-100">
                     <img src={(selectedReport.reportedId as any)?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${(selectedReport.reportedId as any)?.name}`} alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-rose-900 group-hover:text-rose-600 transition-colors">{(selectedReport.reportedId as any)?.name}</p>
                    <p className="text-xs text-rose-600 font-bold">Role: {(selectedReport.reportedId as any)?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                <p className="text-base font-black text-slate-900 mt-1">{selectedReport.category}</p>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                <p className="text-sm text-slate-700 font-medium mt-2 leading-relaxed bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
                  "{selectedReport.description}"
                </p>
              </div>

              {selectedReport.screenshot && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Attached Evidence</span>
                  <a href={selectedReport.screenshot} target="_blank" rel="noreferrer">
                    <img src={selectedReport.screenshot} alt="Evidence" className="max-w-md rounded-2xl border border-slate-200 shadow-sm hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              )}
            </div>

            {/* Moderation Actions */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl text-white space-y-6">
              <h3 className="text-lg font-black flex items-center gap-2 border-b border-slate-700 pb-4">
                <AlertCircle className="text-rose-500" /> Moderation Action Center
              </h3>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Admin Notes / Response (Visible to reporter)</label>
                <textarea 
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={3}
                  disabled={selectedReport.status === "resolved" || selectedReport.status === "rejected"}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-white placeholder:text-slate-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Explain the action taken..."
                />
              </div>

              {(selectedReport.status === "pending" || selectedReport.status === "under_review") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={isSubmitting}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <UserX size={14} /> Reject Report
                  </button>
                  <button
                    onClick={() => handleAction("resolve")}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                </div>
              )}

              {selectedReport.actionTaken && (
                <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Taken</span>
                  <span className="text-sm font-bold text-emerald-400 capitalize bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                    {selectedReport.actionTaken}
                  </span>
                </div>
              )}
            </div>

          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReports;
