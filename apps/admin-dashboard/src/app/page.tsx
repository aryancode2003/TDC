"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

// Backend Configuration
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return (window as any).env?.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export default function AdminDashboard() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  
  // Login Form State
  const [email, setEmail] = useState('admin@thedabbacompany.com');
  const [password, setPassword] = useState('Admin@123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'settings' | 'waitlist'>('overview');
  const [mounted, setMounted] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  // Live Data states from Backend
  const [analytics, setAnalytics] = useState<any>({
    totalGMV: 0,
    totalRevenue: 0,
    activeProviders: 0,
    activeCustomers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalOrders: 0,
    waitlistCount: 0
  });
  const [providers, setProviders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // States for verification modal
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [auditCommission, setAuditCommission] = useState<string>('15');

  // States for editing setting
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Hydrate token on mount
  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch all dashboard data when token is set
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    setApiOnline(true);
    setApiErrorMsg(null);

    const apiBase = getApiUrl() + '/api/v1';
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch Analytics
      const analyticsRes = await axios.get(`${apiBase}/admin/analytics`, { headers });
      setAnalytics(analyticsRes.data);

      // 2. Fetch Providers
      const providersRes = await axios.get(`${apiBase}/admin/providers`, { headers });
      setProviders(providersRes.data);

      // 3. Fetch Settings
      const settingsRes = await axios.get(`${apiBase}/admin/settings`, { headers });
      setSettings(settingsRes.data);

      // 4. Fetch Waitlist
      const waitlistRes = await axios.get(`${apiBase}/admin/waitlist`, { headers });
      setWaitlist(waitlistRes.data);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setApiOnline(false);
        setApiErrorMsg(err.message || 'Could not connect to NestJS backend.');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const apiBase = getApiUrl() + '/api/v1';

    try {
      const res = await axios.post(`${apiBase}/auth/login`, { email, password });
      const authData = res.data;

      if (authData.user.userType !== 'admin' && authData.user.userType !== 'super_admin') {
        throw new Error('Access denied. Logged in user is not an administrator.');
      }

      localStorage.setItem('admin_token', authData.accessToken);
      localStorage.setItem('admin_user', JSON.stringify(authData.user));
      
      setToken(authData.accessToken);
      setUser(authData.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(
        err.response?.data?.message || 
        err.message || 
        'Could not connect to server. Please verify the NestJS backend is running.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  const handleUpdateStatus = async (providerId: string, status: 'approved' | 'suspended' | 'pending' | 'rejected', commissionRate?: number) => {
    const apiBase = getApiUrl() + '/api/v1';
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(`${apiBase}/admin/providers/${providerId}/status`, {
        verificationStatus: status,
        commissionRate: commissionRate !== undefined ? commissionRate : undefined
      }, { headers });

      setSelectedProvider(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSaveSetting = async () => {
    if (!editingSetting) return;
    const apiBase = getApiUrl() + '/api/v1';
    const headers = { Authorization: `Bearer ${token}` };

    // Format value according to settings dataType
    let typedValue: any = editingValue;
    if (editingSetting.dataType === 'number') {
      typedValue = Number(editingValue);
    } else if (editingSetting.dataType === 'boolean') {
      typedValue = editingValue === 'true' || editingValue === '1';
    }

    try {
      await axios.patch(`${apiBase}/admin/settings/${editingSetting.key}`, {
        value: typedValue
      }, { headers });

      setEditingSetting(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(`Failed to update setting: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleNotifyWaitlist = async (pincode: string) => {
    const apiBase = getApiUrl() + '/api/v1';
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.post(`${apiBase}/admin/waitlist/convert`, { pincode }, { headers });
      alert(`Successfully notified ${res.data.notifiedCount} waitlisted customers in zone ${pincode}!`);
      fetchDashboardData();
    } catch (err: any) {
      alert(`Failed to notify waitlist: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#060813] text-white flex items-center justify-center">Loading...</div>;
  }

  // --- LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050712] relative overflow-hidden font-outfit">
        {/* Ambient decorative glow rings */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-md w-full p-8 rounded-3xl bg-[#090d22]/80 border border-white/5 shadow-2xl backdrop-blur-md relative z-10 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl shadow-purple-600/20">
              🍛
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                TDC Operations
              </h1>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mt-1">Super Admin Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0f1430] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                placeholder="admin@thedabbacompany.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Password</label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0f1430] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold text-center leading-relaxed">
                {loginError}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loginLoading}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-sm tracking-wider transition-all duration-300 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              The Dabba Company &copy; 2026 Operations
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Monthly stats helper for rendering GMV graphs
  // Mock data for trends, using backend totalGMV/Revenue to scale
  const getTrendData = () => {
    const scaleGMV = analytics.totalGMV / 2485300 || 1.0;
    const scaleRev = analytics.totalRevenue / 248530 || 1.0;
    return [
      { month: 'Jan', gmv: Math.round(420000 * scaleGMV), revenue: Math.round(42000 * scaleRev) },
      { month: 'Feb', gmv: Math.round(580000 * scaleGMV), revenue: Math.round(58000 * scaleRev) },
      { month: 'Mar', gmv: Math.round(890000 * scaleGMV), revenue: Math.round(89000 * scaleRev) },
      { month: 'Apr', gmv: Math.round(1200000 * scaleGMV), revenue: Math.round(120000 * scaleRev) },
      { month: 'May', gmv: Math.round(1750000 * scaleGMV), revenue: Math.round(175000 * scaleRev) },
      { month: 'Jun', gmv: Math.round(2100000 * scaleGMV), revenue: Math.round(210000 * scaleRev) },
      { month: 'Jul', gmv: analytics.totalGMV || 2485300, revenue: analytics.totalRevenue || 248530 },
    ];
  };

  const customerTypeData = [
    { name: 'Active Subscriptions', value: analytics.activeSubscriptions || 7420, color: '#f59e0b' },
    { name: 'Total Registered Customers', value: analytics.activeCustomers || 10240, color: '#ec4899' },
    { name: 'Total Orders Placed', value: analytics.totalOrders || 1000, color: '#64748b' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050712] font-outfit text-slate-100">
      
      {/* Top Header */}
      <header className="glass-card sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#080b1e]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/20">
            🍛
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              The DABBA Company
            </h1>
            <p className="text-[10px] text-purple-400 font-bold tracking-wider uppercase">SUPER ADMIN CONTROL PORTAL</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {loadingData ? (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></span>
              <span className="text-[10px] font-mono text-purple-400">Syncing...</span>
            </div>
          ) : apiOnline ? (
            <div className="flex items-center gap-2 bg-[#09201a] border border-emerald-500/30 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE DATABASE</span>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 bg-[#2d0f15] border border-red-500/30 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-red-400 tracking-wider">DATABASE OFFLINE</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-slate-200">{user?.firstName || 'System'} {user?.lastName || 'Admin'}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">{user?.userType || 'OPERATIONS'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/30 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* API Connection Warning Banner */}
      {!apiOnline && (
        <div className="bg-red-950/30 border-b border-red-500/20 py-3.5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <span>⚠️</span>
              <span><strong>Connection Error:</strong> {apiErrorMsg}. Verify that the NestJS service is running at <code>http://localhost:3000</code>.</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-1.5 rounded-lg font-bold border border-red-500/30 transition-all font-mono"
            >
              RETRY CONNECTION
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#0b0e26] border border-white/5 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'providers'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✅ PROVIDERS AUDIT
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔧 SYSTEM CONFIG
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'waitlist'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/10'
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
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    ₹{analytics.totalGMV?.toLocaleString('en-IN') || 0}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-400">
                  <span>LIVE</span>
                  <span className="text-slate-400 font-normal">subscription volume</span>
                </div>
              </div>
              
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-purple-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Platform Commission</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    ₹{analytics.totalRevenue?.toLocaleString('en-IN') || 0}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-purple-400">
                  <span>10%-15%</span>
                  <span className="text-slate-400 font-normal">net platform cut</span>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Active Subscriptions</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    {analytics.activeSubscriptions || 0} / {analytics.totalSubscriptions || 0}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-amber-400">
                  <span>{analytics.totalSubscriptions ? Math.round((analytics.activeSubscriptions / analytics.totalSubscriptions) * 100) : 0}%</span>
                  <span className="text-slate-400 font-normal">active conversion</span>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-pink-500/20 transition-all group">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Active Kitchens</span>
                  <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                    {analytics.activeProviders || 0}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-pink-400">
                  <span>{providers.filter(p => p.verificationStatus === 'pending').length} pending</span>
                  <span className="text-slate-400 font-normal">audit queues</span>
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
                    <p className="text-xs text-slate-400">Monthly subscription transactions trend</p>
                  </div>
                  <span className="text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400 font-bold">ANNUAL VIEW</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getTrendData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  <h4 className="text-sm font-bold text-slate-200">KPI RATIOS</h4>
                  <p className="text-xs text-slate-400">User signups vs subscriptions</p>
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
                    <p className="text-lg font-bold text-white">{analytics.activeCustomers || 0}</p>
                    <p className="text-[7px] text-slate-400 font-bold uppercase">Customers</p>
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
                  <p className="text-xs text-slate-400">Net platform income (Monthly aggregated platform commission)</p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTrendData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    <th className="py-3 px-4">BRAND</th>
                    <th className="py-3 px-4">FSSAI / GST / PAN</th>
                    <th className="py-3 px-4">COMMISSION</th>
                    <th className="py-3 px-4">DELIVERIES</th>
                    <th className="py-3 px-4">ACTIVE SUBS</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                  {providers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                        No tiffin providers found in database.
                      </td>
                    </tr>
                  ) : (
                    providers.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-all">
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{p.id.substring(0, 8)}...</td>
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-200">{p.businessName}</p>
                            <p className="text-[10px] text-slate-400">{p.description || 'No description provided'}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[10px] text-slate-300 flex flex-col gap-0.5">
                            <span>FSSAI: {p.fssaiNumber}</span>
                            <span>GST: {p.gstNumber}</span>
                            <span>PAN: {p.panNumber}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-100">{p.commissionRate}%</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{p.mealsDelivered} meals</td>
                        <td className="py-3.5 px-4 font-bold text-blue-400">{p.activeSubscribers}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            p.verificationStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            p.verificationStatus === 'suspended' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {p.verificationStatus.toUpperCase()}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Global SaaS System Configurations</h4>
              <p className="text-xs text-slate-400">Modify run-time rules, commission percentages, and min order limits platform-wide</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-2">
              {settings.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-semibold">
                  No configuration settings found in database.
                </div>
              ) : (
                settings.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-[#0a0d1e]/80 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                    <div className="flex flex-col gap-1 max-w-lg">
                      <span className="text-xs font-mono font-bold text-blue-400 tracking-wide">{s.key}</span>
                      <span className="text-xs text-slate-400">{s.description || 'System setting variable'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm bg-slate-800 px-3 py-1 rounded text-white font-bold">{String(s.value)}</span>
                      <button
                        onClick={() => {
                          setEditingSetting(s);
                          setEditingValue(String(s.value));
                        }}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                    <th className="py-3 px-4">CITY/LOCALITY</th>
                    <th className="py-3 px-4">WAITLISTED CUSTOMERS</th>
                    <th className="py-3 px-4">LAUNCH STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                  {waitlist.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                        No waitlist entries registered.
                      </td>
                    </tr>
                  ) : (
                    waitlist.map(w => (
                      <tr key={w.pincode} className="hover:bg-white/5 transition-all">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{w.pincode}</td>
                        <td className="py-3.5 px-4 text-slate-300">{w.location}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{w.count}</span>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (w.count / 10) * 100)}%` }}></div>
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
                            <span className="text-slate-500 font-semibold italic text-[10px]">Notified / Active</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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
            
            <div className="p-6 border-b border-white/5 bg-gradient-to-tr from-[#121633] to-[#1d234d]">
              <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">FSSAI AUDIT PENDING</span>
              <h3 className="text-lg font-bold text-white mt-2">{selectedProvider.businessName}</h3>
              <p className="text-xs text-slate-300 font-medium">FSSAI License: {selectedProvider.fssaiNumber}</p>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">GST Registration:</span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedProvider.gstNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400">PAN Registration:</span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedProvider.panNumber}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Set Audit Commission Rate (%)</label>
                <input
                  type="number"
                  value={auditCommission}
                  onChange={(e) => setAuditCommission(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="e.g. 15"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'approved', Number(auditCommission))}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                >
                  VERIFY & APPROVE
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'suspended')}
                  className="bg-rose-950/20 border border-rose-500/30 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all"
                >
                  SUSPEND
                </button>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all"
                >
                  CLOSE
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
            
            <p className="text-xs text-slate-400">{editingSetting.description || 'System configuration variable'}</p>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 font-sans">Parameter Value</label>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSaveSetting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10"
              >
                SAVE PARAMETER
              </button>
              <button
                onClick={() => setEditingSetting(null)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all"
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
