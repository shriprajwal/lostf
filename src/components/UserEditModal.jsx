import React, { useState } from 'react';
import { X, Save, Edit3, AlertCircle } from 'lucide-react';

/**
 * UserEditModal — lets the original author edit their own report.
 * Blue-themed (distinct from the amber Admin modal).
 * Props:
 *   item     — the report object being edited
 *   onClose  — fn to close the modal
 *   onSave   — async fn(originalItem, updatedData) → saves to Supabase
 */
export default function UserEditModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: item.title || '',
    category: item.category || 'Electronics',
    description: item.description || '',
    location: item.location || '',
    contact: item.contact || '',
    collegeid: item.collegeid || '',
    status: item.status || (item.reportType === 'Found' ? 'Found' : 'Lost'),
    is_resolved: item.is_resolved === true || item.status === 'Resolved'
  });
  const [saving, setSaving] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contact.length !== 10) {
      setContactError('Phone number must be exactly 10 digits.');
      return;
    }
    setContactError('');
    setSaving(true);
    try {
      await onSave(item, formData);
      onClose();
    } catch (err) {
      console.error('UserEditModal save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const campusLocations = [
    'Central Library',
    'Cafeteria / Food Court',
    'Computer Lab 3',
    'Main Auditorium',
    'Sports Complex',
    'Block A Lecture Halls',
    'Student Parking Area'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0f1322] border border-blue-500/30 rounded-3xl shadow-[0_25px_60px_-15px_rgba(59,130,246,0.25)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-transparent to-transparent flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Edit3 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-white">Edit My Report</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] font-extrabold text-blue-300 uppercase">
                  Author Access
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Report ID: {item.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Item Name / Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Status + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Report Type
              </label>
              <select
                value={formData.status === 'Resolved' ? formData.status : (formData.status === 'Found' ? 'Found' : 'Lost')}
                onChange={(e) => setFormData({
                  ...formData,
                  status: e.target.value,
                  is_resolved: e.target.value === 'Resolved'
                })}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
                <option value="Resolved">Resolved (Returned)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents / IDs</option>
                <option value="Wallets & Bags">Wallets &amp; Bags</option>
                <option value="Keys">Keys</option>
                <option value="Books">Books</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition leading-relaxed"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Campus Location <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition mb-2"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-500">Quick:</span>
              {campusLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setFormData({ ...formData, location: loc })}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] text-[10px] text-slate-300 transition"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Contact + College ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Contact Phone <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.contact}
                  onChange={(e) => {
                    setFormData({ ...formData, contact: e.target.value.replace(/\D/g, '') });
                    setContactError('');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
              {contactError && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {contactError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                College ID
              </label>
              <input
                type="text"
                value={formData.collegeid}
                onChange={(e) => setFormData({ ...formData, collegeid: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/25 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
