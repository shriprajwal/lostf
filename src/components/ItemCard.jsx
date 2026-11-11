import React from 'react';
import { 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Undo2, 
  ArrowUpRight, 
  Laptop, 
  CreditCard, 
  Key, 
  BookOpen, 
  Sparkles, 
  Watch, 
  Shirt, 
  HelpCircle,
  Phone,
  MessageCircle,
  Crown,
  Edit3,
  Trash2
} from 'lucide-react';

export default function ItemCard({ 
  item, 
  currentUser, 
  isSuperAdmin,
  onSelect, 
  onToggleResolve,
  onAdminEdit,
  onAdminDelete,
  onUserEdit,
  onUserDelete
}) {
  const isResolved = item.is_resolved === true || item.status === 'Resolved';
  const reportType = item.reportType || item.status || 'Lost';
  const isOwner = currentUser && item.user_id && item.user_id === currentUser.uid;
  const canManage = isOwner || isSuperAdmin;

  // Category Icon Resolver
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Electronics': return <Laptop size={12} />;
      case 'Documents': return <CreditCard size={12} />;
      case 'Keys': return <Key size={12} />;
      case 'Books': return <BookOpen size={12} />;
      case 'Accessories': return <Watch size={12} />;
      case 'Clothing': return <Shirt size={12} />;
      default: return <HelpCircle size={12} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="group relative rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-blue-500/40 backdrop-blur-xl p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8),0_0_24px_rgba(59,130,246,0.15)] flex flex-col justify-between">
      
      {/* Top Image Box */}
      <div>
        <div 
          onClick={() => onSelect(item)}
          className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900 cursor-pointer"
        >
          <img 
            src={item.image_url || '/assets/placeholder.svg'} 
            alt={item.title || 'Item image'} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { e.target.src = '/assets/placeholder.svg'; }}
            loading="lazy"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

          {/* Status Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {isResolved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                <CheckCircle2 size={12} /> Resolved
              </span>
            ) : reportType === 'Found' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                Lost
              </span>
            )}

            {isSuperAdmin && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5" title="Super Admin Controlled">
                <Crown size={9} /> ADMIN
              </span>
            )}
          </div>

          {/* Category Pill */}
          {item.category && (
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-slate-200 border border-white/10 backdrop-blur-md">
                {getCategoryIcon(item.category)}
                <span>{item.category}</span>
              </span>
            </div>
          )}

          {/* Location Chip over image bottom */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 max-w-[80%] truncate">
              <MapPin size={11} className="text-blue-400 flex-shrink-0" />
              <span className="truncate">{item.location || 'Campus'}</span>
            </span>
            <span className="text-[11px] text-slate-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
              {formatDate(item.createdAt || item.time)}
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="pt-3.5 px-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 
              onClick={() => onSelect(item)} 
              className="font-heading font-bold text-base text-white group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer"
            >
              {item.title || 'Untitled Item'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
            {item.description || 'No detailed description provided.'}
          </p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
        <button 
          onClick={() => onSelect(item)}
          className="flex-1 py-2 px-3 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 hover:shadow-blue-600/35 active:scale-95"
        >
          <span>Details</span>
          <ArrowUpRight size={13} />
        </button>

        {/* Quick WhatsApp / Call (Restricted to logged-in users) */}
        {item.contact && !isResolved && (currentUser || isSuperAdmin) && (
          <a 
            href={`https://wa.me/91${item.contact.replace(/\D/g, '')}?text=Hi,%20I%20saw%20your%20Lostfusion%20listing%20for%20'${encodeURIComponent(item.title || 'item')}'`}
            target="_blank" 
            rel="noreferrer"
            title="Chat on WhatsApp"
            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition flex items-center justify-center active:scale-95"
          >
            <MessageCircle size={15} />
          </a>
        )}

        {/* Super Admin Direct Edit & Delete (amber) */}
        {isSuperAdmin && onAdminEdit && (
          <button 
            onClick={() => onAdminEdit(item)}
            title="Super Admin Edit"
            className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition active:scale-95"
          >
            <Edit3 size={14} />
          </button>
        )}

        {isSuperAdmin && onAdminDelete && (
          <button 
            onClick={() => onAdminDelete(item)}
            title="Super Admin Delete"
            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition active:scale-95"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Owner-only Edit & Delete (blue) — hidden from admins to avoid duplicate buttons */}
        {isOwner && !isSuperAdmin && onUserEdit && (
          <button
            onClick={() => onUserEdit(item)}
            title="Edit my report"
            className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 transition active:scale-95"
          >
            <Edit3 size={14} />
          </button>
        )}

        {isOwner && !isSuperAdmin && onUserDelete && (
          <button
            onClick={() => onUserDelete(item)}
            title="Delete my report"
            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition active:scale-95"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Author or Super Admin Resolve Toggle */}
        {canManage && onToggleResolve && !isSuperAdmin && (
          <button 
            onClick={() => onToggleResolve(item)}
            title={isResolved ? "Reopen report" : "Mark as resolved"}
            className={`p-2 rounded-xl border text-xs font-semibold transition active:scale-95 ${
              isResolved 
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            {isResolved ? <Undo2 size={15} /> : <CheckCircle2 size={15} />}
          </button>
        )}
      </div>

    </div>
  );
}
