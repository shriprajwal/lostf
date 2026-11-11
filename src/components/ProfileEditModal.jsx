import React, { useState } from 'react';
import { X, Save, User, AlertCircle } from 'lucide-react';

/**
 * ProfileEditModal — lets a logged-in user edit their display name and college ID in Firestore.
 * Props:
 *   profile  — current Firestore user profile object { username, collegeId, email, ... }
 *   onClose  — fn to close modal
 *   onSave   — async fn({ username, collegeId }) → updates Firestore and local state
 */
export default function ProfileEditModal({ profile, onClose, onSave }) {
  const [username, setUsername] = useState(profile?.username || '');
  const [collegeId, setCollegeId] = useState(profile?.collegeId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Display name cannot be empty.');
      return;
    }
    const cleanId = collegeId.trim().toUpperCase();
    if (cleanId && !/^[A-Z0-9-]+$/.test(cleanId)) {
      setError('College ID must contain only letters (A-Z) and numbers (0-9).');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({ username: username.trim(), collegeId: cleanId });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0f1322] border border-indigo-500/30 rounded-3xl shadow-[0_25px_60px_-15px_rgba(99,102,241,0.25)] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">Edit Profile</h3>
              <p className="text-[11px] text-slate-400">{profile?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Display Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Your campus name"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              College / Student ID
            </label>
            <input
              type="text"
              value={collegeId}
              onChange={(e) => { setCollegeId(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. 21IT102"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition uppercase tracking-wider font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">Your College ID is shown on your reports to verify ownership.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
