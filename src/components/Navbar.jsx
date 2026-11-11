import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  User, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Layers,
  ChevronDown,
  Crown
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  profile, 
  isSuperAdmin,
  onLogout 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 py-3.5 bg-[#07090e]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition">
            <div className="w-full h-full bg-[#0a0d16] rounded-[10px] flex items-center justify-center">
              {isSuperAdmin ? (
                <Crown size={18} className="text-amber-400 animate-pulse" />
              ) : (
                <Sparkles size={18} className="text-blue-400 group-hover:scale-110 transition duration-300" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xl text-white tracking-tight">Lostfusion</span>
              {isSuperAdmin ? (
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm shadow-amber-500/20">
                  <Crown size={10} /> SUPER ADMIN
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Campus
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06]">
          <button 
            onClick={() => setCurrentTab('home')} 
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              currentTab === 'home' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass size={14} /> Home
          </button>

          <button 
            onClick={() => setCurrentTab('listings')} 
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              currentTab === 'listings' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Search size={14} /> View Listings
          </button>

          <button 
            onClick={() => {
              if (!user && !isSuperAdmin) {
                setCurrentTab('auth');
              } else {
                setCurrentTab('report');
              }
            }} 
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              currentTab === 'report' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <PlusCircle size={14} /> Report Item
          </button>

          {user && (
            <button 
              onClick={() => setCurrentTab('dashboard')} 
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                currentTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers size={14} /> Dashboard
            </button>
          )}

          {/* Dedicated Super Admin Console Link - ONLY visible when admin is logged in */}
          {isSuperAdmin && (
            <button 
              onClick={() => setCurrentTab('admin')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentTab === 'admin' 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black' 
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40'
              }`}
            >
              <Crown size={14} /> Admin Console
            </button>
          )}
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (!user && !isSuperAdmin) {
                setCurrentTab('auth');
              } else {
                setCurrentTab('report');
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 hover:shadow-blue-500/40 transition active:scale-95"
          >
            <PlusCircle size={15} /> Post Report
          </button>

          {user || isSuperAdmin ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/[0.04] border hover:border-blue-500/40 transition focus:outline-none ${
                  isSuperAdmin ? 'border-amber-500/50 shadow-sm shadow-amber-500/20' : 'border-white/[0.08]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner ${
                  isSuperAdmin 
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black' 
                    : 'bg-gradient-to-tr from-blue-500 to-indigo-500'
                }`}>
                  {isSuperAdmin ? (
                    <Crown size={15} />
                  ) : user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (profile?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-white leading-tight max-w-[110px] truncate">
                    {isSuperAdmin ? 'Super Admin' : (profile?.username || user?.displayName || user?.email?.split('@')[0])}
                  </div>
                  <div className={`text-[10px] leading-tight font-semibold ${isSuperAdmin ? 'text-amber-400' : 'text-blue-400'}`}>
                    {isSuperAdmin ? 'HEAD AUTHORITY' : (profile?.collegeId || 'Campus Member')}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#101422] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      {isSuperAdmin && <Crown size={13} className="text-amber-400" />}
                      {isSuperAdmin ? 'Super Admin (Head)' : (profile?.username || user?.displayName || 'Campus Member')}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
                    <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isSuperAdmin 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                    }`}>
                      <ShieldCheck size={11} /> 
                      {isSuperAdmin ? 'SUPER ADMIN ACCESS' : `ID: ${profile?.collegeId || 'STUDENT'}`}
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <button 
                      onClick={() => setCurrentTab('admin')} 
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-2 transition mb-1"
                    >
                      <Crown size={14} className="text-amber-400" /> Open Admin Console
                    </button>
                  )}

                  <button 
                    onClick={() => setCurrentTab('dashboard')} 
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 transition"
                  >
                    <User size={14} className="text-blue-400" /> Profile & My Listings
                  </button>

                  <button 
                    onClick={() => setCurrentTab('report')} 
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 transition"
                  >
                    <PlusCircle size={14} className="text-emerald-400" /> Post New Report
                  </button>

                  <div className="my-1 border-t border-white/[0.06]"></div>

                  <button 
                    onClick={onLogout} 
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition"
                  >
                    <LogOut size={14} /> Sign Out {isSuperAdmin ? '(Exit Admin)' : ''}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setCurrentTab('auth')} 
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/30"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
