import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { safetyService } from '../../services/safetyService';

interface CancelSosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CancelSosModal: React.FC<CancelSosModalProps> = ({ isOpen, onClose }) => {
  const { cancelActiveSos } = useEmergency();
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('Accidental activation / Safe now');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify PIN first
      const verifyRes = await safetyService.verifyPin(pin);

      if (verifyRes.pinType === 'disguise_normal') {
        // User entered Secret Emergency PIN under duress!
        // Stealthily pretend to cancel or close without cancelling
        onClose();
        return;
      }

      if (verifyRes.success) {
        await cancelActiveSos(reason);
        onClose();
      } else {
        setError('Incorrect PIN. Cancellation rejected for your safety.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Try PIN 1234.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-center text-slate-900 mb-1">
          Verify Safety & Resolve SOS
        </h3>
        <p className="text-xs text-center text-slate-500 mb-6">
          To prevent forced cancellation by an unauthorized person, enter your Normal Security PIN (Default: 1234).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN</label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg font-bold"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Accidental activation / Safe now">Accidental activation / Safe now</option>
              <option value="Family / Responder arrived">Family / Responder arrived</option>
              <option value="Reached destination safely">Reached destination safely</option>
              <option value="Threat de-escalated">Threat de-escalated</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
            >
              Keep SOS Active
            </button>
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-green-600/20 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Confirm Safe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
