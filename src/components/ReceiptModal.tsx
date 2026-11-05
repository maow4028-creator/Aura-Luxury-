import React, { useEffect, useState } from 'react';
import { ReceiptData } from '../types';
import { Printer, X, Dumbbell, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ReceiptModalProps {
  receiptNumber: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receiptNumber, onClose }) => {
  const { token } = useAuth();
  const [data, setData] = useState<{ receipt: ReceiptData; gym: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const res = await fetch(`/api/memberships/receipt/${receiptNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load receipt details');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error loading receipt');
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [receiptNumber, token]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F5F7F9] border-b border-[#DCE5EB] print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#55B9E8]" />
            <span className="text-sm font-bold text-[#123B5D]">Official Tax Invoice & Membership Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#718596] hover:text-[#183247] hover:bg-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-8 sm:p-10 bg-white">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-[#55B9E8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#718596]">Loading official receipt...</p>
            </div>
          ) : error || !data ? (
            <div className="py-16 text-center text-red-500">
              <p className="font-semibold">{error || 'Receipt not found.'}</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#DCE5EB] gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#123B5D] flex items-center justify-center text-white shadow-md">
                    <Dumbbell className="w-6 h-6 text-[#55B9E8]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#123B5D] uppercase tracking-wide font-['Outfit']">
                      Aura
                    </h2>
                    <span className="text-xs font-bold tracking-[0.2em] text-[#55B9E8] uppercase block">
                      Luxury Fitness Club
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-[#718596] space-y-0.5">
                  <p className="font-bold text-[#183247]">{data.gym.name}</p>
                  <p>{data.gym.address}</p>
                  <p>GSTIN: 27AABCA1234F1Z8</p>
                  <p>Phone: {data.gym.phone}</p>
                  <p>Email: {data.gym.email}</p>
                </div>
              </div>

              {/* Receipt Info Pill */}
              <div className="my-6 p-4 rounded-2xl bg-[#EAF6FC] border border-[#55B9E8]/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block">
                    Receipt Number
                  </span>
                  <span className="text-lg font-black text-[#123B5D] font-mono">
                    {data.receipt.receipt_number}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block">
                    Issued Date & Time
                  </span>
                  <span className="text-sm font-semibold text-[#183247]">
                    {new Date(data.receipt.payment_date).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PAID & VERIFIED</span>
                </div>
              </div>

              {/* Member & Plan Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-sm">
                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#55B9E8] mb-3 font-['Outfit']">
                    Billed To Member
                  </h4>
                  <p className="font-bold text-base text-[#123B5D]">{data.receipt.member_name}</p>
                  <p className="text-xs text-[#718596] mt-0.5">{data.receipt.member_email}</p>
                  {data.receipt.member_phone && (
                    <p className="text-xs text-[#718596] mt-0.5">{data.receipt.member_phone}</p>
                  )}
                  <p className="text-xs text-[#123B5D] font-mono mt-2 pt-2 border-t border-[#DCE5EB]">
                    Booking Code: <span className="font-bold">{data.receipt.booking_code}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#55B9E8] mb-3 font-['Outfit']">
                    Membership Details
                  </h4>
                  <p className="font-bold text-base text-[#123B5D]">{data.receipt.plan_name}</p>
                  <p className="text-xs text-[#718596] mt-0.5">
                    Member Code: <span className="font-bold text-[#183247] font-mono">{data.receipt.membership_code || 'Pending'}</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-[#DCE5EB] flex justify-between text-xs text-[#183247]">
                    <span>Valid From: <strong>{data.receipt.start_date}</strong></span>
                    <span>Valid Till: <strong>{data.receipt.expiry_date}</strong></span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#DCE5EB] rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#123B5D] text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5 text-center">Duration</th>
                      <th className="p-3.5 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5EB]">
                    <tr className="bg-white">
                      <td className="p-3.5">
                        <p className="font-bold text-[#183247]">{data.receipt.plan_name}</p>
                        <p className="text-xs text-[#718596]">Unlimited Club floor, luxury lockers, steam, and assessment access</p>
                      </td>
                      <td className="p-3.5 text-center font-medium text-[#718596]">
                        {data.receipt.start_date} to {data.receipt.expiry_date}
                      </td>
                      <td className="p-3.5 text-right font-bold text-[#123B5D]">
                        ₹{data.receipt.amount_inr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#F5F7F9] font-bold">
                    <tr>
                      <td colSpan={2} className="p-3.5 text-right text-xs uppercase tracking-wider text-[#718596]">
                        Total Amount Paid (Inclusive of all taxes)
                      </td>
                      <td className="p-3.5 text-right text-lg text-[#123B5D] font-black">
                        ₹{data.receipt.amount_inr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Details */}
              <div className="text-xs text-[#718596] p-4 rounded-xl bg-[#F5F7F9] border border-[#DCE5EB] flex flex-wrap justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#183247]">Payment Mode:</span> {data.receipt.payment_gateway}
                </div>
                {data.receipt.gateway_payment_id && (
                  <div>
                    <span className="font-semibold text-[#183247]">Transaction Reference:</span> {data.receipt.gateway_payment_id}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-[#183247]">Status:</span> Completed & Authenticated
                </div>
              </div>

              {/* Signatory */}
              <div className="mt-8 pt-6 border-t border-[#DCE5EB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#718596] gap-4">
                <p>This is a computer-generated tax invoice. No physical signature is required.</p>
                <div className="text-center sm:text-right">
                  <div className="font-bold text-sm text-[#123B5D] tracking-wide">Aura Luxury Fitness Club</div>
                  <div className="text-[10px] text-[#55B9E8] font-semibold">Authorized Signatory</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
