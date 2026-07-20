"use client";

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock Data for Analytics
const monthlyStats = [
  { month: 'Jan', gmv: 420000, revenue: 42000, customers: 1200 },
  { month: 'Feb', gmv: 580000, revenue: 58000, customers: 1800 },
  { month: 'Mar', gmv: 890000, revenue: 89000, customers: 2900 },
  { month: 'Apr', gmv: 1200000, revenue: 120000, customers: 4100 },
  { month: 'May', gmv: 1750000, revenue: 175000, customers: 6200 },
  { month: 'Jun', gmv: 2100000, revenue: 210000, customers: 8500 },
  { month: 'Jul', gmv: 2485300, revenue: 248530, customers: 10240 },
];

const customerTypeData = [
  { name: 'Active Subscriptions', value: 7420, color: '#f59e0b' },
  { name: 'One-off Trial Users', value: 1820, color: '#ec4899' },
  { name: 'Inactive/Paused', value: 1000, color: '#64748b' },
];

// Initial Providers
const initialProviders = [
  {
    id: 'prov-201',
    name: 'Annapurna Kitchens',
    owner: 'Sunita Deshmukh',
    pincode: '400076',
    specialties: ['Maharashtrian', 'Pure Veg'],
    fssai: '22724001000452',
    joinedAt: '2026-06-12',
    status: 'Pending',
    commissionRate: 10,
    kitchenPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prov-202',
    name: 'Dawat Tiffin Service',
    owner: 'Mohammad Yusuf',
    pincode: '400011',
    specialties: ['North Indian', 'Biryani Special'],
    fssai: '11521009000843',
    joinedAt: '2026-05-20',
    status: 'Verified',
    commissionRate: 12,
    kitchenPhoto: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prov-203',
    name: 'Satvik Food Hub',
    owner: 'Jignesh Shah',
    pincode: '400092',
    specialties: ['Jain Friendly', 'Gujarati Thali'],
    fssai: '21523006000219',
    joinedAt: '2026-07-02',
    status: 'Pending',
    commissionRate: 10,
    kitchenPhoto: 'https://images.unsplash.com/photo-1565538810844-1e119412e847?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prov-204',
    name: 'Mom\'s Love Tiffin',
    owner: 'Gurpreet Kaur',
    pincode: '400053',
    specialties: ['Punjabi Special', 'Healthy Diets'],
    fssai: '12723003000674',
    joinedAt: '2026-04-15',
    status: 'Verified',
    commissionRate: 15,
    kitchenPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prov-205',
    name: 'Spicy Bite Meals',
    owner: 'Rahul Verma',
    pincode: '400080',
    specialties: ['Mughlai', 'Chinese Combo'],
    fssai: '11522004001092',
    joinedAt: '2026-02-10',
    status: 'Suspended',
    commissionRate: 12,
    kitchenPhoto: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80',
  }
];

// Initial Config Settings
const initialSettings = [
  { key: 'COMMISSION_RATE_DEFAULT', value: '12%', description: 'Default percentage cut applied to provider subscriptions' },
  { key: 'OTP_EXPIRY_SECONDS', value: '300', description: 'Expiration window for mobile registration OTP tokens' },
  { key: 'MAX_DAILY_DELIVERY_SLOTS', value: '3', description: 'Maximum delivery options allowed for partner service setups' },
  { key: 'REFERRAL_WALLET_CREDIT', value: '₹100', description: 'Promotional wallet cash awarded to verified referrers' },
  { key: 'VACATION_MIN_NOTICE_HOURS', value: '12', description: 'Cut-off window required to pause active orders' },
];

// Initial Waitlists
const initialWaitlists = [
  { pincode: '400076', location: 'Powai, Mumbai', count: 182, status: 'Active' },
  { pincode: '400092', location: 'Borivali, Mumbai', count: 145, status: 'Active' },
  { pincode: '400013', location: 'Lower Parel, Mumbai', count: 290, status: 'Active' },
  { pincode: '400053', location: 'Andheri West, Mumbai', count: 98, status: 'Notified' },
  { pincode: '400080', location: 'Mulund, Mumbai', count: 54, status: 'Notified' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'settings' | 'waitlist'>('overview');
  const [mounted, setMounted] = useState(false);
  const [providers, setProviders] = useState(initialProviders);
  const [settings, setSettings] = useState(initialSettings);
  const [waitlist, setWaitlist] = useState(initialWaitlists);
  
  // States for verification modal
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [auditCommission, setAuditCommission] = useState<string>('12');

  // States for editing setting
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: 'Verified' | 'Suspended' | 'Pending', rate?: number) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: newStatus,
          commissionRate: rate !== undefined ? rate : p.commissionRate
        };
      }
      return p;
    }));
    setSelectedProvider(null);
  };

  const handleSaveSetting = () => {
    if (!editingSetting) return;
    setSettings(prev => prev.map(s => {
      if (s.key === editingSetting.key) {
        return { ...s, value: editingValue };
      }
      return s;
    }));
    setEditingSetting(null);
  };

  const handleNotifyWaitlist = (pincode: string) => {
    setWaitlist(prev => prev.map(w => {
      if (w.pincode === pincode) {
        return { ...w, status: 'Notified' };
      }
      return w;
    }));
    alert(`Successfully launched service in ${pincode}! Sent notifications to all waitlisted customers.`);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#060813] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060813]">
      {/* Top Header */}
      <header className="glass-card sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a0d1e]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/20">
            🍛
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent font-outfit">
              The DABBA Company
            </h1>
            <p className="text-xs text-purple-400 font-medium">SUPER ADMIN CONTROL PORTAL</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#101430] border border-white/5 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 tracking-wider">LIVE SYSTEM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              SA
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200">System Admin</p>
              <p className="text-[10px] text-slate-400">Level 4 Operations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#0b0e26] border border-white/5 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'providers'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✅ PROVIDERS AUDIT
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔧 SYSTEM CONFIG
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'waitlist'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📍 WAITLIST REGIONS
          </button>
        </div>

        {/* Dynamic Panel Content */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-blue-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Total GMV</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">₹24,85,300</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-400">
                  <span>+14.2%</span>
                  <span className="text-slate-400 font-normal">vs last month</span>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-purple-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Platform Commission</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">₹2,98,236</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-purple-400">
                  <span>12.0%</span>
                  <span className="text-slate-400 font-normal">effective commission</span>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Total Subscriptions</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">7,420</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-amber-400">
                  <span>88.2%</span>
                  <span className="text-slate-400 font-normal">active completion rate</span>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-pink-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Verified Kitchens</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">1,420</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-pink-400">
                  <span>+28</span>
                  <span className="text-slate-400 font-normal">pending verification</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gross Volume Area Chart */}
              <div className="glass-card p-5 rounded-2xl lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">GROSS MERCHANDISE VALUE (GMV)</h4>
                    <p className="text-xs text-slate-400">Monthly subscription transactions</p>
                  </div>
                  <span className="text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400 font-bold">ANNUAL VIEW</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0d1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                        labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="gmv" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gmvGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Customer Types Pie Chart */}
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">CUSTOMER BREAKDOWN</h4>
                  <p className="text-xs text-slate-400">Subscription activity distribution</p>
                </div>
                <div className="h-44 relative my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {customerTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-lg font-bold text-white">10.2k</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Total Users</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {customerTypeData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-100">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Platform Revenue Commission Trends */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">PLATFORM REVENUE GROWTH</h4>
                  <p className="text-xs text-slate-400">Net platform income (10-15% commission base)</p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0d1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'providers' && (
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Tiffin Provider Verification Audits</h4>
              <p className="text-xs text-slate-400">Review, approve, suspend, or configure commission rates for partners</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold">
                    <th className="py-3 px-4">PROVIDER ID</th>
                    <th className="py-3 px-4">BRAND & OWNER</th>
                    <th className="py-3 px-4">PINCODE</th>
                    <th className="py-3 px-4">SPECIALTIES</th>
                    <th className="py-3 px-4">FSSAI REGISTER</th>
                    <th className="py-3 px-4">COMMISSION</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                  {providers.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3.5 px-4 text-slate-400 font-semibold">{p.id}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.owner}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{p.pincode}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.specialties.map((s, idx) => (
                            <span key={idx} className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{p.fssai}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{p.commissionRate}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          p.status === 'Suspended' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProvider(p);
                            setAuditCommission(String(p.commissionRate));
                          }}
                          className="bg-blue-600/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
                        >
                          AUDIT & EDIT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Global SaaS System Configurations</h4>
              <p className="text-xs text-slate-400">Modify run-time rules, wallet limits, and OTP timings platform-wide</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-2">
              {settings.map(s => (
                <div key={s.key} className="flex items-center justify-between p-4 bg-[#0a0d1e]/80 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                  <div className="flex flex-col gap-1 max-w-lg">
                    <span className="text-xs font-mono font-bold text-blue-400 tracking-wide">{s.key}</span>
                    <span className="text-xs text-slate-400">{s.description}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm bg-slate-800 px-3 py-1 rounded text-white font-bold">{s.value}</span>
                    <button
                      onClick={() => {
                        setEditingSetting(s);
                        setEditingValue(s.value);
                      }}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      EDIT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'waitlist' && (
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Waitlist Regions & Pincodes</h4>
              <p className="text-xs text-slate-400">Identify demand spikes and launch operations in new service zones</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold">
                    <th className="py-3 px-4">PINCODE</th>
                    <th className="py-3 px-4">AREA NAME</th>
                    <th className="py-3 px-4">WAITLISTED CUSTOMERS</th>
                    <th className="py-3 px-4">LAUNCH STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                  {waitlist.map(w => (
                    <tr key={w.pincode} className="hover:bg-white/5 transition-all">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{w.pincode}</td>
                      <td className="py-3.5 px-4 text-slate-300">{w.location}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{w.count}</span>
                          <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (w.count / 300) * 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          w.status === 'Notified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {w.status === 'Active' ? (
                          <button
                            onClick={() => handleNotifyWaitlist(w.pincode)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1 rounded text-[10px] font-bold shadow-md shadow-emerald-500/10"
                          >
                            LAUNCH & NOTIFY
                          </button>
                        ) : (
                          <span className="text-slate-500 font-semibold italic text-[10px]">Service Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Audit & Edit Verification Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0d1026]">
            
            <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${selectedProvider.kitchenPhoto})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1026] via-[#0d1026]/40 to-transparent"></div>
              <button 
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 bg-black/40 text-white hover:bg-black/60 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">FSSAI AUDIT PENDING</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedProvider.name}</h3>
                <p className="text-xs text-slate-300 font-medium">Owner: {selectedProvider.owner}</p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Pincode Zone:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedProvider.pincode}</p>
                </div>
                <div>
                  <span className="text-slate-400">License FSSAI:</span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedProvider.fssai}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Set Audit Commission Rate (%)</label>
                <input
                  type="number"
                  value={auditCommission}
                  onChange={(e) => setAuditCommission(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 12"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'Verified', Number(auditCommission))}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                >
                  VERIFY & ACTIVATE
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'Suspended')}
                  className="bg-rose-950/20 border border-rose-500/30 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  SUSPEND
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit System Config Modal */}
      {editingSetting && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-white/10 bg-[#0d1026] flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Modify Parameter</h3>
              <p className="text-xs text-blue-400 font-mono mt-1 font-bold">{editingSetting.key}</p>
            </div>
            
            <p className="text-xs text-slate-400">{editingSetting.description}</p>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Parameter Value</label>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSaveSetting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10"
              >
                SAVE PARAMETER
              </button>
              <button
                onClick={() => setEditingSetting(null)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
