import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/Common";
import { paymentApi } from "../api/payment.service";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");

  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [alreadyProcessed, setAlreadyProcessed] = useState(false);

  useEffect(() => {
    if (!sessionId || !bookingId) {
      setStatus("done");
      return;
    }

    (async () => {
      try {
        await paymentApi.verifyPayment(sessionId, bookingId);
        setStatus("done");
      } catch (err: any) {
        const msg: string = err?.message || "";
        if (msg.toLowerCase().includes("already")) {
          setAlreadyProcessed(true);
          setStatus("done");
        } else {
          setStatus("error");
        }
      }
    })();
  }, [sessionId, bookingId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-bold text-slate-500">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Received</h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
            We received your payment but had a small issue updating the booking status. Please check your bookings — it may already be updated.
          </p>
          <Link to="/user/bookings" className="block w-full">
            <Button variant="primary" className="w-full h-12 text-sm">View My Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
          <CheckCircle size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Payment Successful!</h1>
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
          {alreadyProcessed
            ? "Your booking status has already been updated."
            : "Your booking status has been updated. Check your notifications for details."}
        </p>

        {bookingId && (
          <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-8 text-left flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Booking Ref</span>
            <span className="text-sm font-black text-slate-800">{bookingId.slice(-6).toUpperCase()}</span>
          </div>
        )}

        <div className="w-full space-y-3">
          {bookingId ? (
            <Link to={`/user/bookings/${bookingId}`} className="block w-full">
              <Button variant="primary" className="w-full h-12 text-sm">View Booking Details</Button>
            </Link>
          ) : (
            <Link to="/user/bookings" className="block w-full">
              <Button variant="primary" className="w-full h-12 text-sm">View My Bookings</Button>
            </Link>
          )}
          <Link to="/user/dashboard" className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors py-2">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
