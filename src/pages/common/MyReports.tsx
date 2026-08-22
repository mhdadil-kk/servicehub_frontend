import React, { useEffect } from "react";
import { Flag, Loader2, MessageSquare, AlertCircle, Calendar } from "lucide-react";
import { useReports } from "../../hooks/useReports";
import { getUserName, isPopulatedUser } from "../../types/domain.types";

const MyReports: React.FC = () => {
  const { reports, loading, fetchMyReports } = useReports();

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending Review", cls: "bg-orange-50 text-orange-600 border border-orange-100", icon: <AlertCircle size={14} /> };
      case "under_review":
        return { label: "Under Review", cls: "bg-blue-50 text-blue-600 border border-blue-100", icon: <Loader2 size={14} className="animate-spin" /> };
      case "resolved":
        return { label: "Resolved", cls: "bg-emerald-50 text-emerald-600 border border-emerald-100", icon: <MessageSquare size={14} /> };
      case "rejected":
        return { label: "Rejected", cls: "bg-slate-100 text-slate-500 border border-slate-200", icon: <Flag size={14} /> };
      default:
        return { label: status, cls: "bg-slate-100 text-slate-500 border border-slate-200", icon: <Flag size={14} /> };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Reports</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Track issues and reports you've submitted</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-rose-600 animate-spin" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center max-w-sm mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100 text-slate-300">
            <Flag size={28} />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1.5">No reports yet</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            You haven't submitted any reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => {
            const statusCfg = getStatusConfig(report.status);
            const reportedUser = isPopulatedUser(report.reportedId)
              ? getUserName(report.reportedId)
              : "User";
            
            return (
              <div key={report._id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
                      Reported {reportedUser}
                    </h3>
                    <div className="flex gap-3 text-xs text-slate-400 font-bold mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0 ${statusCfg.cls}`}>
                    {statusCfg.icon} {statusCfg.label}
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{report.category}</p>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                      "{report.description}"
                    </p>
                  </div>
                </div>

                {report.adminNotes && (
                  <div className="mt-2 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                      <MessageSquare size={12} /> Support Reply
                    </span>
                    <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                      {report.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReports;
