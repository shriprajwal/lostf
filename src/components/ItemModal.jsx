import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Trash2, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Lock,
  Sparkles,
  Edit3
} from 'lucide-react';

export default function ItemModal({ 
  item, 
  currentUser, 
  isSuperAdmin,
  onClose, 
  onToggleResolve, 
  onDelete, 
  onAdminEdit,
  onUserEdit,
  onShowToast,
  onRequireAuth
}) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isResolved = item.is_resolved === true || item.status === 'Resolved';
  const reportType = item.reportType || item.status || 'Lost';
  const isOwner = currentUser && item.user_id && item.user_id === currentUser.uid;
  const canManage = isOwner || isSuperAdmin;

  const copyContact = () => {
    if (item.contact) {
      navigator.clipboard.writeText(item.contact);
      setCopied(true);
      if (onShowToast) onShowToast('Contact number copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareItem = () => {
    if (navigator.share) {
      navigator.share({
        title: `Lostfusion: ${item.title}`,
        text: `Have you seen this item on campus? ${item.title} (${item.location})`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      if (onShowToast) onShowToast('Listing link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#0f131f] border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition active:scale-95"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto">
          
          {/* Top Hero Image Header */}
          <div className="relative h-72 sm:h-80 w-full bg-slate-950 overflow-hidden">
            <img 
              src={item.image_url || '/assets/placeholder.svg'} 
              alt={item.title || 'Item image'} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/assets/placeholder.svg'; }}
            />
            
            {/* Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-transparent to-black/40 pointer-events-none"></div>

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {isResolved ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                  ✓ Resolved
                </span>
              ) : reportType === 'Found' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Found Item
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40 backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                  Lost Item
                </span>
              )}

              {item.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-slate-200 border border-white/15 backdrop-blur-md">
                  {item.category}
                </span>
              )}
            </div>

            {/* Quick Share Button */}
            <div className="absolute bottom-4 right-4">
              <button 
                onClick={shareItem}
                className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
              >
                <Share2 size={13} /> Share Listing
              </button>
            </div>
          </div>

          {/* Modal Main Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Title & Metadata Row */}
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                {item.title || 'Untitled Item'}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Location</span>
                  <div className="flex items-center gap-1 text-slate-200 font-semibold truncate">
                    <MapPin size={13} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{item.location || 'Campus'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Report Date</span>
                  <div className="flex items-center gap-1 text-slate-200 font-semibold truncate">
                    <Calendar size={13} className="text-blue-400 flex-shrink-0" />
                    <span>{new Date(item.createdAt || item.time || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">College ID</span>
                  <div className="flex items-center gap-1 text-slate-200 font-semibold truncate">
                    <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />
                    <span>{item.collegeid || 'Verified'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Posted By</span>
                  <div className="text-slate-200 font-semibold truncate">
                    {item.reporter_name || 'Campus Student'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
                Detailed Description
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-2xl border border-white/[0.06]">
                {item.description || 'No detailed description provided by the reporter.'}
              </p>
            </div>

            {/* Contact & Verification Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs uppercase font-extrabold text-blue-300 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-400" /> Direct Reporter Contact
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Connect with the student to verify ownership and arrange handover.</p>
                </div>

                {(!currentUser && !isSuperAdmin) ? (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Lock size={11} /> Login Required
                  </span>
                ) : item.contact ? (
                  <button 
                    onClick={copyContact}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition active:scale-95"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                ) : null}
              </div>

              {(!currentUser && !isSuperAdmin) ? (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-2 mt-2">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <Lock size={14} className="text-blue-400" />
                    <span>Sign In Required to Contact Owner</span>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Phone numbers and direct chats are protected. Please sign in with your campus account to view contact details and connect with the owner.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onRequireAuth) onRequireAuth();
                    }}
                    className="mt-1 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white transition shadow-md shadow-blue-600/30 active:scale-95 inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Sign In to Reveal & Connect</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-white/10">
                  <div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <Phone size={16} className="text-emerald-400" />
                      <span>{item.contact || 'Phone number not provided'}</span>
                    </div>
                    {item.user_email && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} />
                        <span>{item.user_email}</span>
                      </div>
                    )}
                  </div>

                  {item.contact && (
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${item.contact}`} 
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
                      >
                        <Phone size={14} /> Call Now
                      </a>

                      <a 
                        href={`https://wa.me/91${item.contact.replace(/\D/g, '')}?text=Hi,%20I'm%20reaching%20out%20regarding%20your%20Lostfusion%20listing:%20'${encodeURIComponent(item.title || 'item')}'`}
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Anti-Fraud Guidelines */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Campus Verification Tip:</strong> Always ask the claimant to describe identifying marks not shown in the photos (e.g. wallpaper, serial numbers, case scratches, or specific contents) before handing over the item.
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/[0.08]">
              {canManage ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {isSuperAdmin && onAdminEdit && (
                    <button 
                      onClick={() => { onClose(); onAdminEdit(item); }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/25"
                    >
                      <Edit3 size={14} />
                      <span>Admin Edit</span>
                    </button>
                  )}

                  {isOwner && !isSuperAdmin && onUserEdit && (
                    <button 
                      onClick={() => { onClose(); onUserEdit(item); }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/25 active:scale-95"
                    >
                      <Edit3 size={14} />
                      <span>Edit My Report</span>
                    </button>
                  )}

                  <button 
                    onClick={() => onToggleResolve(item)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/25"
                  >
                    <CheckCircle2 size={15} />
                    {isResolved ? 'Reopen Report' : 'Mark as Resolved'}
                  </button>

                  <button 
                    onClick={() => onDelete(item)}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  Lostfusion Campus Network
                </div>
              )}

              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-bold text-white transition ml-auto"
              >
                Close
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
