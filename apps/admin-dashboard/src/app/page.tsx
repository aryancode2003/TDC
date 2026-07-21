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

// Pre-seeded Admin Providers fallback data
const preSeededAdminProviders = [
  {
    id: 'prov-north-101',
    businessName: 'North Indian Tiffin Service',
    description: 'Quality North Indian meals in Koramangala, Bangalore',
    fssaiNumber: '10019011000482',
    gstNumber: '18AABCT4827F1Z3',
    panNumber: 'AABCT4827F',
    commissionRate: 15,
    mealsDelivered: 4820,
    activeSubscribers: 142,
    verificationStatus: 'approved',
    avgRating: 4.6,
    meals: [
      { id: '1', name: 'Premium North Indian Veg Thali', category: 'Special Thali', price: 140, type: 'veg', available: true, calories: 520, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop' },
      { id: '2', name: 'Shahi Paneer Combo', category: 'Special Thali', price: 160, type: 'veg', available: true, calories: 590, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop' },
      { id: '3', name: 'Dal Makhani & Lachha Paratha', category: 'Special Thali', price: 130, type: 'veg', available: true, calories: 550, image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=200&auto=format&fit=crop' },
      { id: '4', name: 'Home-style Chicken Curry', category: 'Non-Veg Thali', price: 180, type: 'non-veg', available: true, calories: 680, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'prov-south-202',
    businessName: 'South Indian Meals Daily',
    description: 'Traditional South Indian meals in HSR Layout, Bangalore',
    fssaiNumber: '10019011000850',
    gstNumber: '18AABCT8501K2Z4',
    panNumber: 'AABCT8501K',
    commissionRate: 12,
    mealsDelivered: 3950,
    activeSubscribers: 118,
    verificationStatus: 'approved',
    avgRating: 4.4,
    meals: [
      { id: '1', name: 'Traditional Sambar Rice Combo', category: 'Special Thali', price: 110, type: 'veg', available: true, calories: 450, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop' },
      { id: '2', name: 'Special Mysore Masala Dosa', category: 'Special Thali', price: 120, type: 'veg', available: true, calories: 480, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&auto=format&fit=crop' },
      { id: '3', name: 'Idli Vadai Breakfast Platter', category: 'Special Thali', price: 90, type: 'veg', available: true, calories: 380, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'prov-healthy-303',
    businessName: 'FitFood Tiffin Service',
    description: 'High protein and calorie-counted meals in Indiranagar, Bangalore',
    fssaiNumber: '10019011000110',
    gstNumber: '18AABCT1105D3Z5',
    panNumber: 'AABCT1105D',
    commissionRate: 15,
    mealsDelivered: 6200,
    activeSubscribers: 205,
    verificationStatus: 'approved',
    avgRating: 4.8,
    meals: [
      { id: '1', name: 'High Protein Chicken Salad', category: 'Healthy Diet', price: 190, type: 'non-veg', available: true, calories: 480, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop' },
      { id: '2', name: 'Keto Paneer Salad Bowl', category: 'Healthy Diet', price: 160, type: 'veg', available: true, calories: 420, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'prov-annapurna-404',
    businessName: 'Annapurna Caterers',
    description: 'Home-style Gujarati and Jain meals in Powai, Mumbai',
    fssaiNumber: '10019011000999',
    gstNumber: '18AABCT9999F1Z9',
    panNumber: 'AABCT9999F',
    commissionRate: 15,
    mealsDelivered: 12800,
    activeSubscribers: 142,
    verificationStatus: 'pending',
    avgRating: 4.7,
    meals: [
      { id: '1', name: 'Premium Veg Tiffin', category: 'Special Thali', price: 140, type: 'veg', available: true, calories: 520, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop' },
      { id: '2', name: 'Home-style Chicken Curry', category: 'Non-Veg Thali', price: 180, type: 'non-veg', available: true, calories: 680, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop' },
      { id: '3', name: 'Diet Special Jain Khichdi', category: 'Healthy Diet', price: 120, type: 'jain', available: false, calories: 380, image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=200&auto=format&fit=crop' },
      { id: '4', name: 'Paneer Butter Masala Combo', category: 'Special Thali', price: 160, type: 'veg', available: true, calories: 590, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop' }
    ]
  }
];

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
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'settings' | 'waitlist' | 'catalog'>('overview');
  const [mounted, setMounted] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  // Live Data states from Backend
  const [analytics, setAnalytics] = useState<any>({
    totalGMV: 2485300,
    totalRevenue: 248530,
    activeProviders: 4,
    activeCustomers: 10240,
    totalSubscriptions: 7420,
    activeSubscriptions: 7420,
    totalOrders: 1000,
    waitlistCount: 280
  });
  const [providers, setProviders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Catalog management states
  const [selectedCatalogProvider, setSelectedCatalogProvider] = useState<any>(null);
  const [catalogSubTab, setCatalogSubTab] = useState<'menu' | 'broadcast' | 'logs'>('menu');
  const [globalCategories, setGlobalCategories] = useState<string[]>(['Special Thali', 'Non-Veg Thali', 'Healthy Diet', 'Breakfast']);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { timestamp: '2026-07-21 15:42:10', admin: 'System', action: 'Auto-seeded North Indian Tiffin Service menu' },
    { timestamp: '2026-07-21 16:15:33', admin: 'Admin User', action: 'Approved Annapurna Caterers verification document audit' }
  ]);

  // Form states for broadcasting segmented updates
  const [broadcastTarget, setBroadcastTarget] = useState<'all_providers' | 'all_customers' | 'specific_city' | 'specific_partner'>('all_providers');
  const [broadcastCity, setBroadcastCity] = useState('Bangalore');
  const [broadcastTitle, setBroadcastTitle] = useState('SaaS Maintenance Alert');
  const [broadcastContent, setBroadcastContent] = useState('We will perform database maintenance on July 23rd at 02:00 AM UTC. Expect minor downtime.');
  const [broadcastChannel, setBroadcastChannel] = useState<'push' | 'sms' | 'whatsapp' | 'email'>('push');
  const [broadcastType, setBroadcastType] = useState('system_update');
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([
    { id: '1', title: 'Monsoon Alert for Bengaluru Partners', type: 'weather_warning', target: 'Bangalore Providers', channel: 'SMS', sentAt: '2026-07-18 10:14:00', reach: 142, status: 'Delivered' }
  ]);

  // Modals editing meals
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [addingMealToCategory, setAddingMealToCategory] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState({ name: '', price: '', type: 'veg', calories: '', image: '' });

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
        // Set offline mock data fallbacks
        if (providers.length === 0) {
          setProviders(preSeededAdminProviders);
          setSelectedCatalogProvider(preSeededAdminProviders[0]);
        }
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
      console.warn('API login failed. Checking offline fallback credentials...', err);
      if (email === 'admin@thedabbacompany.com' && password === 'Admin@123') {
        const mockUser = {
          id: 'mock-admin-id',
          email: 'admin@thedabbacompany.com',
          firstName: 'Operations',
          lastName: 'Admin',
          userType: 'admin'
        };
        const mockToken = 'mock-admin-token';
        localStorage.setItem('admin_token', mockToken);
        localStorage.setItem('admin_user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
      } else {
        setLoginError(
          err.response?.data?.message || 
          err.message || 
          'Could not connect to server. Please verify the NestJS backend is running.'
        );
      }
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
          <button
            onClick={() => {
              setActiveTab('catalog');
              if (providers.length > 0 && !selectedCatalogProvider) {
                setSelectedCatalogProvider(providers[0]);
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🍱 CATALOG PORTAL
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

        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start text-xs">
            
            {/* Sidebar: Search & Provider Directory Selector */}
            <div className="lg:col-span-1 glass-card p-5 rounded-2xl flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200 font-outfit">SaaS Provider Tenants</h4>
                <p className="text-[10px] text-slate-400 font-sans">Select kitchen partner workspace to edit</p>
              </div>
              
              <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                {providers.map(prov => (
                  <button
                    key={prov.id}
                    onClick={() => setSelectedCatalogProvider(prov)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      selectedCatalogProvider?.id === prov.id
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                        : 'border-white/5 bg-[#080a1e]/60 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                        {prov.businessName}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        prov.verificationStatus === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}>
                        {prov.verificationStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Subs: <strong className="text-blue-400">{prov.activeSubscribers}</strong></span>
                      <span>Rating: <strong className="text-amber-400">{prov.avgRating || '4.5'}⭐</strong></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Workspace Area: Selected Provider Workspace */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {selectedCatalogProvider ? (
                <>
                  {/* Selected Brand Banner */}
                  <div className="glass-card p-5 rounded-2xl bg-gradient-to-br from-[#0e1236]/80 via-[#0d102e]/60 to-[#07091d]/80 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-2xl shadow-inner">
                        🍳
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-outfit text-slate-100 flex items-center gap-2">
                          {selectedCatalogProvider.businessName}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                            ID: {selectedCatalogProvider.id.substring(0, 8)}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedCatalogProvider.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                          <span>FSSAI: <strong className="text-slate-300">{selectedCatalogProvider.fssaiNumber}</strong></span>
                          <span>•</span>
                          <span>Commission: <strong className="text-slate-300">{selectedCatalogProvider.commissionRate}%</strong></span>
                          <span>•</span>
                          <span>Rating: <strong className="text-amber-400">★ {selectedCatalogProvider.avgRating || '4.5'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Workspace Tabs */}
                  <div className="flex border-b border-white/5 gap-6">
                    <button
                      onClick={() => setCatalogSubTab('menu')}
                      className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all relative ${
                        catalogSubTab === 'menu' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🍱 Menu Catalog Builder
                    </button>
                    <button
                      onClick={() => setCatalogSubTab('broadcast')}
                      className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all relative ${
                        catalogSubTab === 'broadcast' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📢 Broadcast Segments
                    </button>
                    <button
                      onClick={() => setCatalogSubTab('logs')}
                      className={`pb-3 text-xs font-bold tracking-widest uppercase transition-all relative ${
                        catalogSubTab === 'logs' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📋 Operational Audits
                    </button>
                  </div>

                  {/* Sub-Tab: MENU BUILDER */}
                  {catalogSubTab === 'menu' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Global Config Overview */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200 font-outfit">Catalog Offerings</h4>
                          <p className="text-[10px] text-slate-400">Toggle live status, edit ingredients, prices, or add new items</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {globalCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                setAddingMealToCategory(cat);
                                setMealForm({ name: '', price: '', type: 'veg', calories: '', image: '' });
                              }}
                              className="bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                            >
                              + Add to {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Meal Form Add Modal Overlay */}
                      {addingMealToCategory && (
                        <div className="glass-card rounded-2xl p-5 border-purple-500/30 bg-[#0c0f2a]/95 flex flex-col gap-4 shadow-xl">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                              Add New Meal to {addingMealToCategory} Catalogue
                            </h5>
                            <button type="button" onClick={() => setAddingMealToCategory(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                          </div>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!mealForm.name || !mealForm.price) return;
                              
                              const newMealObj = {
                                id: String(Date.now()),
                                name: mealForm.name,
                                category: addingMealToCategory,
                                price: Number(mealForm.price),
                                type: mealForm.type,
                                available: true,
                                calories: Number(mealForm.calories) || 450,
                                image: mealForm.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop'
                              };

                              // Update parent selected provider and main providers array
                              const updatedMeals = [...(selectedCatalogProvider.meals || []), newMealObj];
                              const updatedProv = { ...selectedCatalogProvider, meals: updatedMeals };
                              setSelectedCatalogProvider(updatedProv);
                              setProviders(prev => prev.map(p => p.id === selectedCatalogProvider.id ? updatedProv : p));
                              
                              // Log Action
                              setAuditLogs(prev => [
                                { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), admin: 'Admin User', action: `Added meal "${newMealObj.name}" to ${selectedCatalogProvider.businessName}` },
                                ...prev
                              ]);

                              setAddingMealToCategory(null);
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                          >
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dish Name</label>
                              <input
                                type="text"
                                required
                                value={mealForm.name}
                                onChange={e => setMealForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Premium Butter Paneer"
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price (₹)</label>
                              <input
                                type="number"
                                required
                                value={mealForm.price}
                                onChange={e => setMealForm(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="e.g. 150"
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calories (kcal)</label>
                              <input
                                type="number"
                                value={mealForm.calories}
                                onChange={e => setMealForm(prev => ({ ...prev, calories: e.target.value }))}
                                placeholder="e.g. 520"
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dietary Class</label>
                              <select
                                value={mealForm.type}
                                onChange={e => setMealForm(prev => ({ ...prev, type: e.target.value }))}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              >
                                <option value="veg">Veg</option>
                                <option value="non-veg">Non-Veg</option>
                                <option value="jain">Jain</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cover Image URL</label>
                              <input
                                type="text"
                                value={mealForm.image}
                                onChange={e => setMealForm(prev => ({ ...prev, image: e.target.value }))}
                                placeholder="https://images.unsplash.com/... or leave blank for preset image"
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setAddingMealToCategory(null)}
                                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold"
                              >
                                Create Meal Item
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Meal Editing Dialog */}
                      {editingMeal && (
                        <div className="glass-card rounded-2xl p-5 border-blue-500/30 bg-[#0c0f2a]/95 flex flex-col gap-4 shadow-xl">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                              Edit Meal Details: {editingMeal.name}
                            </h5>
                            <button type="button" onClick={() => setEditingMeal(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dish Name</label>
                              <input
                                type="text"
                                value={editingMeal.name}
                                onChange={e => setEditingMeal(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price (₹)</label>
                              <input
                                type="number"
                                value={editingMeal.price}
                                onChange={e => setEditingMeal(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calories (kcal)</label>
                              <input
                                type="number"
                                value={editingMeal.calories}
                                onChange={e => setEditingMeal(prev => ({ ...prev, calories: Number(e.target.value) }))}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dietary Class</label>
                              <select
                                value={editingMeal.type}
                                onChange={e => setEditingMeal(prev => ({ ...prev, type: e.target.value }))}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                              >
                                <option value="veg">Veg</option>
                                <option value="non-veg">Non-Veg</option>
                                <option value="jain">Jain</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cover Image URL</label>
                              <input
                                type="text"
                                value={editingMeal.image}
                                onChange={e => setEditingMeal(prev => ({ ...prev, image: e.target.value }))}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                              />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setEditingMeal(null)}
                                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // Save changes
                                  const updatedMeals = (selectedCatalogProvider.meals || []).map(m => m.id === editingMeal.id ? editingMeal : m);
                                  const updatedProv = { ...selectedCatalogProvider, meals: updatedMeals };
                                  setSelectedCatalogProvider(updatedProv);
                                  setProviders(prev => prev.map(p => p.id === selectedCatalogProvider.id ? updatedProv : p));
                                  
                                  // Log Action
                                  setAuditLogs(prev => [
                                    { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), admin: 'Admin User', action: `Edited meal "${editingMeal.name}" details inside ${selectedCatalogProvider.businessName}` },
                                    ...prev
                                  ]);

                                  setEditingMeal(null);
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display Meal Catalogue Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(selectedCatalogProvider.meals || []).map((meal: any) => (
                          <div key={meal.id} className="glass-card rounded-2xl p-4 flex justify-between items-center gap-4 hover:border-purple-500/20 transition-all group">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-white/5 flex-shrink-0 relative">
                                <img
                                  src={meal.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop'}
                                  alt={meal.name}
                                  className="w-full h-full object-cover"
                                />
                                <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  meal.type === 'veg' ? 'bg-emerald-600 text-white' : meal.type === 'jain' ? 'bg-purple-600 text-white' : 'bg-rose-600 text-white'
                                }`}>
                                  {meal.type}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/25">
                                  {meal.category}
                                </span>
                                <h4 className="text-sm font-bold text-slate-100 mt-1 font-outfit truncate max-w-[180px]">{meal.name}</h4>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                                  <span className="font-bold text-slate-200">₹{meal.price}</span>
                                  <span>•</span>
                                  <span>{meal.calories} kcal</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {/* Toggle availability switch */}
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-500 font-mono">Live</span>
                                <button
                                  onClick={() => {
                                    const updatedMeals = (selectedCatalogProvider.meals || []).map(m => m.id === meal.id ? { ...m, available: !m.available } : m);
                                    const updatedProv = { ...selectedCatalogProvider, meals: updatedMeals };
                                    setSelectedCatalogProvider(updatedProv);
                                    setProviders(prev => prev.map(p => p.id === selectedCatalogProvider.id ? updatedProv : p));
                                    
                                    // Log action
                                    setAuditLogs(prev => [
                                      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), admin: 'Admin User', action: `Toggled meal "${meal.name}" availability to ${!meal.available ? 'online' : 'offline'} for ${selectedCatalogProvider.businessName}` },
                                      ...prev
                                    ]);
                                  }}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none flex items-center ${
                                    meal.available ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                                  }`}
                                >
                                  <div className="w-4 h-4 rounded-full bg-white shadow" />
                                </button>
                              </div>

                              {/* Edit & Delete actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingMeal(meal)}
                                  className="p-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
                                  title="Edit meal parameters"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${meal.name}"?`)) {
                                      const updatedMeals = (selectedCatalogProvider.meals || []).filter(m => m.id !== meal.id);
                                      const updatedProv = { ...selectedCatalogProvider, meals: updatedMeals };
                                      setSelectedCatalogProvider(updatedProv);
                                      setProviders(prev => prev.map(p => p.id === selectedCatalogProvider.id ? updatedProv : p));
                                      
                                      // Log Action
                                      setAuditLogs(prev => [
                                        { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), admin: 'Admin User', action: `Deleted meal "${meal.name}" from ${selectedCatalogProvider.businessName} catalogue` },
                                        ...prev
                                      ]);
                                    }
                                  }}
                                  className="p-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-[10px] font-bold"
                                  title="Delete meal item"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* Sub-Tab: BROADCASTER */}
                  {catalogSubTab === 'broadcast' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Broadcaster Form */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200 font-outfit">New Alert Broadcaster</h4>
                          <p className="text-[10px] text-slate-400 font-sans">Broadcast notifications to SaaS segments</p>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!broadcastTitle || !broadcastContent) return;

                            const newBroadcastObj = {
                              id: String(Date.now()),
                              title: broadcastTitle,
                              type: broadcastType,
                              target: broadcastTarget === 'specific_partner' ? selectedCatalogProvider.businessName : broadcastTarget.replace('_', ' '),
                              channel: broadcastChannel.toUpperCase(),
                              sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                              reach: broadcastTarget === 'specific_partner' ? 1 : broadcastTarget === 'all_providers' ? providers.length : 530,
                              status: 'Delivered'
                            };

                            setBroadcastHistory(prev => [newBroadcastObj, ...prev]);

                            // Log action
                            setAuditLogs(prev => [
                              { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), admin: 'Admin User', action: `Broadcasted campaign "${broadcastTitle}" to ${newBroadcastObj.target} via ${newBroadcastObj.channel}` },
                              ...prev
                            ]);

                            // Reset
                            setBroadcastTitle('');
                            setBroadcastContent('');
                            alert(`Notification Campaign "${newBroadcastObj.title}" broadcasted successfully!`);
                          }}
                          className="flex flex-col gap-3.5"
                        >
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audience Segment Target</label>
                            <select
                              value={broadcastTarget}
                              onChange={e => setBroadcastTarget(e.target.value as any)}
                              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                            >
                              <option value="all_providers">All SaaS Kitchen Partners ({providers.length})</option>
                              <option value="all_customers">All Active Customers (530)</option>
                              <option value="specific_partner">Only this kitchen: {selectedCatalogProvider.businessName}</option>
                              <option value="specific_city">All Bangalore users (380)</option>
                            </select>
                          </div>

                          {broadcastTarget === 'specific_city' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filter City Target</label>
                              <input
                                type="text"
                                value={broadcastCity}
                                onChange={e => setBroadcastCity(e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery Channel</label>
                              <select
                                value={broadcastChannel}
                                onChange={e => setBroadcastChannel(e.target.value as any)}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              >
                                <option value="push">In-App Push Feed</option>
                                <option value="whatsapp">WhatsApp Message</option>
                                <option value="sms">SMS Text Alert</option>
                                <option value="email">Marketing Email</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alert Category</label>
                              <select
                                value={broadcastType}
                                onChange={e => setBroadcastType(e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                              >
                                <option value="system_update">System Update</option>
                                <option value="weather_warning">Severe Weather Alert</option>
                                <option value="holiday_notice">Holiday Operations</option>
                                <option value="promotion">Marketing Promotion</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campaign Title</label>
                            <input
                              type="text"
                              required
                              value={broadcastTitle}
                              onChange={e => setBroadcastTitle(e.target.value)}
                              placeholder="e.g. Critical Support Advisory"
                              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Message Content</label>
                            <textarea
                              rows={3}
                              required
                              value={broadcastContent}
                              onChange={e => setBroadcastContent(e.target.value)}
                              placeholder="Compose notification body payload..."
                              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
                          >
                            🚀 Trigger Broadcast Dispatch
                          </button>
                        </form>
                      </div>

                      {/* Broadcast History logs */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200 font-outfit">Sent Broadcast Registry</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Track delivery reports and engagement</p>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                          {broadcastHistory.map(b => (
                            <div key={b.id} className="p-3.5 rounded-xl border border-white/5 bg-[#0b0e26] flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                  {b.type.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{b.sentAt}</span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-200">{b.title}</h5>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/5 pt-2 mt-1">
                                <span>Target: <strong className="text-slate-300 capitalize">{b.target}</strong></span>
                                <span>Reach: <strong className="text-blue-400">{b.reach} users</strong></span>
                                <span className="text-emerald-400 font-bold">{b.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Sub-Tab: AUDIT LOGS */}
                  {catalogSubTab === 'logs' && (
                    <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 font-outfit">Change Audits Log</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Chronological history of compliance and catalog overrides</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-slate-400 font-semibold font-mono">
                              <th className="py-2.5 px-3">TIMESTAMP</th>
                              <th className="py-2.5 px-3">OPERATOR</th>
                              <th className="py-2.5 px-3">AUDIT DETAIL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
                            {auditLogs.map((log, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-all">
                                <td className="py-3 px-3 text-slate-500">{log.timestamp}</td>
                                <td className="py-3 px-3 text-purple-400 font-bold">{log.admin}</td>
                                <td className="py-3 px-3">{log.action}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="glass-card p-12 rounded-2xl text-center text-slate-500 font-semibold flex items-center justify-center">
                  Select a kitchen provider from the directory sidebar to open their operational catalog workspace.
                </div>
              )}
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
