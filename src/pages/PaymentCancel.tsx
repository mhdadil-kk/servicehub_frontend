import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "../components/Common";

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <XCircle size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Payment Cancelled</h1>
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
          You cancelled the checkout process. Your booking is pending payment. You can retry payment from your bookings dashboard.
        </p>

        <div className="w-full space-y-3">
          <Link to="/user/bookings" className="block w-full">
            <Button variant="primary" className="w-full h-12 text-sm bg-rose-600 hover:bg-rose-700 shadow-rose-200">
              Go to My Bookings
            </Button>
          </Link>
          <Link to="/user/dashboard" className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors py-2">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
