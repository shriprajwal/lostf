import React, { useState } from 'react';
import { ShieldCheck, User, CreditCard, Sparkles, AlertCircle, LogOut } from 'lucide-react';

/**
 * GoogleOnboardingModal
 * Modal shown when a new student signs in with Google and needs to complete
 * their registration by providing their Student Name and College ID.
 */
export default function GoogleOnboardingModal({ 
  googleUser, 
  onComplete, 
  onCancel 
}) {
  const [studentName, setStudentName] = useState(googleUser?.defaultName || '');
  const [collegeId, setCollegeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = studentName.trim();
    const cleanCollegeId = collegeId.trim().toUpperCase();

    if (!trimmedName) {
      setError('Please enter your full student name.');
      return;
    }

    if (!cleanCollegeId) {
      setError('Please enter your College ID / Student Roll Number.');
      return;
    }

    if (!/^[A-Z0-9-]+$/.test(cleanCollegeId)) {
      setError('College ID must contain only letters (A-Z) and numbers (0-9).');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onComplete({
        username: trimmedName,
        collegeId: cleanCollegeId
      });
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f1322] border border-blue-500/40 rounded-3xl shadow-[0_25px_60px_-15px_rgba(59,130,246,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow ambient header */}
        <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg shadow-white/10 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-white">Complete Profile</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] font-extrabold text-blue-300 uppercase">
                  1 Final Step
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Link your campus student details to finish registering
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Verified Google Email Display */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                @
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Google Account</span>
                <span className="text-xs text-slate-200 font-semibold truncate block">
                  {googleUser?.email || ''}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex-shrink-0">
              <ShieldCheck size={13} /> Verified
            </span>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Student Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                required
                value={studentName}
                onChange={(e) => { setStudentName(e.target.value); setError(''); }}
                placeholder="e.g. Alex Johnson"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Your name as it appears on campus records.
            </p>
          </div>

          {/* College ID */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              College ID / Roll No. / USN <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                required
                value={collegeId}
                onChange={(e) => { setCollegeId(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. 21IT102 / 4SO21CS042"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition uppercase tracking-wider font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Required to verify ownership when reporting or claiming items.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
