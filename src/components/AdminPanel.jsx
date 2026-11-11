import React, { useState } from 'react';
import { 
  Crown, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Undo2, 
  Download, 
  RefreshCw, 
  PlusCircle, 
  Filter, 
  ExternalLink,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function AdminPanel({ 
  reports, 
  onRefresh, 
  onEdit, 
  onDelete, 
  onToggleResolve, 
  onAddNew,
  onShowToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'lost', 'found'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'resolved'
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'

  // Filter logic
  const filtered = reports.filter(item => {
    if (filterType !== 'all') {
      const type = (item.reportType || item.status || '').toLowerCase();
      if (filterType === 'lost' && type !== 'lost') return false;
      if (filterType === 'found' && type !== 'found') return false;
    }

    if (filterCategory !== 'all' && item.category !== filterCategory) return false;

    const isResolved = item.is_resolved === true || item.status === 'Resolved';
    if (filterStatus === 'active' && isResolved) return false;
    if (filterStatus === 'resolved' && !isResolved) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = 
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.contact || '').toLowerCase().includes(q) ||
        (item.collegeid || '').toLowerCase().includes(q) ||
        (item.user_email || '').toLowerCase().includes(q) ||
        (item.reporter_name || '').toLowerCase().includes(q) ||
        String(item.id || '').includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.createdAt || a.time || 0).getTime();
    const db = new Date(b.createdAt || b.time || 0).getTime();
    return sortOrder === 'newest' ? db - da : da - db;
  });

  // CSV Export helper
  const exportToCSV = () => {
    if (sorted.length === 0) {
      if (onShowToast) onShowToast('No reports to export', 'error');
      return;
    }

    const headers = ['ID', 'Title', 'Type', 'Category', 'Status', 'Location', 'Date', 'Contact', 'College ID', 'Reporter Email'];
    const rows = sorted.map(item => [
      `"${item.id || ''}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${item.reportType || item.status || 'Lost'}"`,
      `"${item.category || ''}"`,
      `"${item.is_resolved || item.status === 'Resolved' ? 'Resolved' : 'Active'}"`,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      `"${item.createdAt || item.time || ''}"`,
      `"${item.contact || ''}"`,
      `"${item.collegeid || ''}"`,
      `"${item.user_email || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lostfusion-campus-reports-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (onShowToast) onShowToast('Reports exported to CSV successfully! 📊', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Super Admin Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 border border-amber-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Crown size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">Super Admin Command Center</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                  HEAD PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full authority: inspect, edit, resolve, and delete any report across the Lostfusion network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-2 active:scale-95"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              onClick={onRefresh}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-2 active:scale-95"
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
            <button 
              onClick={onAddNew}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <PlusCircle size={15} /> Add Official Report
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total System Listings</span>
          <div className="font-heading text-3xl font-black text-white mt-1">{reports.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Active Lost Items</span>
          <div className="font-heading text-3xl font-black text-rose-400 mt-1">
            {reports.filter(r => (r.reportType === 'Lost' || r.status === 'Lost') && !r.is_resolved).length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Found Items</span>
          <div className="font-heading text-3xl font-black text-emerald-400 mt-1">
            {reports.filter(r => (r.reportType === 'Found' || r.status === 'Found') && !r.is_resolved).length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Total Resolved / Returned</span>
          <div className="font-heading text-3xl font-black text-cyan-400 mt-1">
            {reports.filter(r => r.is_resolved || r.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Admin Filters & Search Bar */}
      <div className="p-5 rounded-3xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, title, email, phone, location, college ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Type */}
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost Reports</option>
              <option value="found">Found Reports</option>
            </select>

            {/* Filter by Status */}
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="resolved">Resolved Only</option>
            </select>

            {/* Filter by Category */}
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents / IDs</option>
              <option value="Wallets & Bags">Wallets & Bags</option>
              <option value="Keys">Keys</option>
              <option value="Books">Books</option>
              <option value="Accessories">Accessories</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>

            {/* Sort */}
            <button 
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 hover:text-white transition"
              title="Toggle sort order"
            >
              <ArrowUpDown size={13} />
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
          <span>Displaying <strong>{sorted.length}</strong> of {reports.length} total database records</span>
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterCategory !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterStatus('all'); setFilterCategory('all'); }}
              className="text-amber-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Full Admin Data Management Table */}
      <div className="rounded-3xl bg-[#0f1322]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Item & Info</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Reporter</th>
                <th className="py-3.5 px-3">Location & Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching reports found in database.
                  </td>
                </tr>
              ) : (
                sorted.map((item) => {
                  const isResolved = item.is_resolved === true || item.status === 'Resolved';
                  const reportType = item.reportType || item.status || 'Lost';

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      
                      {/* Item Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image_url || '/assets/placeholder.svg'} 
                            alt="thumb"
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/10 flex-shrink-0"
                            onError={(e) => { e.target.src = '/assets/placeholder.svg'; }}
                          />
                          <div className="max-w-[220px]">
                            <div className="font-bold text-white truncate text-xs">{item.title || 'Untitled'}</div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.description || 'No description'}</div>
                            <span className="text-[9px] text-slate-500 font-mono">ID: {item.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          reportType === 'Found' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {reportType}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-300 font-medium">
                        {item.category || 'General'}
                      </td>

                      {/* Reporter Info */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">{item.reporter_name || 'Anonymous'}</div>
                        <div className="text-[10px] text-slate-400">{item.contact || 'No phone'}</div>
                        {item.collegeid && (
                          <div className="text-[10px] text-blue-400 font-mono">ID: {item.collegeid}</div>
                        )}
                      </td>

                      {/* Location & Date */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-300 truncate max-w-[140px]">{item.location || 'Campus'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(item.createdAt || item.time || Date.now()).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isResolved ? 'Resolved' : 'Active'}
                        </span>
                      </td>

                      {/* Super Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* Toggle Resolved */}
                          <button 
                            onClick={() => onToggleResolve(item)}
                            title={isResolved ? "Reopen report" : "Mark as resolved"}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 ${
                              isResolved 
                                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                                : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30'
                            }`}
                          >
                            {isResolved ? <Undo2 size={13} /> : <CheckCircle2 size={13} />}
                          </button>

                          {/* Edit Report */}
                          <button 
                            onClick={() => onEdit(item)}
                            title="Edit report details (Super Admin Overwrite)"
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition active:scale-95"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Delete Report */}
                          <button 
                            onClick={() => onDelete(item)}
                            title="Permanently delete from database"
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition active:scale-95"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
