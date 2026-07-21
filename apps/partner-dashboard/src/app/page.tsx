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
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Backend API URL helper
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return (window as any).env?.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

// Pre-seeded Restaurant/Provider Profiles for offline fallback
const preSeededProviders = [
  {
    email: 'providernorthindiantiffinservice@thedabbacompany.com',
    businessName: 'North Indian Tiffin Service',
    logoInitials: 'NI',
    activeSubscribers: 142,
    totalRevenue: 24850,
    capacity: 85,
    meals: [
      { id: '1', name: 'Premium North Indian Veg Thali', category: 'Special Thali', price: 140, type: 'veg', available: true, calories: 520 },
      { id: '2', name: 'Shahi Paneer Combo', category: 'Special Thali', price: 160, type: 'veg', available: true, calories: 590 },
      { id: '3', name: 'Dal Makhani & Lachha Paratha', category: 'Special Thali', price: 130, type: 'veg', available: true, calories: 550 },
      { id: '4', name: 'Home-style Chicken Curry', category: 'Non-Veg Thali', price: 180, type: 'non-veg', available: true, calories: 680 },
      { id: '5', name: 'Diet Special Jain Khichdi', category: 'Healthy Diet', price: 120, type: 'jain', available: false, calories: 380 },
    ],
    orders: [
      { id: 'ORD-101', name: 'Rohan Sharma', address: 'Flat 402, Oakwood Apts, Powai', type: 'Lunch', meal: 'Premium North Indian Veg Thali', slot: '12:30 PM - 1:30 PM', status: 'Preparing' },
      { id: 'ORD-102', name: 'Aarav Mehta', address: 'B-12, Greenfields PG, Sakinaka', type: 'Lunch', meal: 'Home-style Chicken Curry', slot: '12:30 PM - 1:30 PM', status: 'Dispatched' },
      { id: 'ORD-103', name: 'Priya Iyer', address: 'Hostel 3, IIT Bombay campus', type: 'Dinner', meal: 'Shahi Paneer Combo', slot: '7:30 PM - 8:30 PM', status: 'Preparing' },
      { id: 'ORD-104', name: 'Sneha Patel', address: '405, Neptune Heights, Bhandup', type: 'Dinner', meal: 'Diet Special Jain Khichdi', slot: '7:30 PM - 8:30 PM', status: 'Delivered' },
    ],
    deliveryData: [
      { day: 'Mon', count: 120 },
      { day: 'Tue', count: 145 },
      { day: 'Wed', count: 135 },
      { day: 'Thu', count: 160 },
      { day: 'Fri', count: 180 },
      { day: 'Sat', count: 90 },
      { day: 'Sun', count: 85 },
    ],
    revenueData: [
      { period: '1-7 Jul', amount: 8400 },
      { period: '8-14 Jul', amount: 9600 },
      { period: '15-21 Jul', amount: 10400 },
      { period: '22-28 Jul', amount: 11200 },
      { period: 'Current', amount: 24850 },
    ],
    bankDetails: {
      bank: 'STATE BANK OF INDIA',
      accountNumber: '************4827',
      ifsc: 'SBIN0001850',
      accountHolder: 'North Indian Tiffin Service',
    },
    settlements: [
      { period: '15 Jul - 21 Jul 2026', total: 12800, commission: 1920, gateway: 256, net: 10624, status: 'Transferred' },
      { period: '08 Jul - 14 Jul 2026', total: 11200, commission: 1680, gateway: 224, net: 9296, status: 'Transferred' },
      { period: '01 Jul - 07 Jul 2026', total: 9600, commission: 1440, gateway: 192, net: 7968, status: 'Transferred' },
    ]
  },
  {
    email: 'providersouthindianmeals@thedabbacompany.com',
    businessName: 'South Indian Meals Daily',
    logoInitials: 'SI',
    activeSubscribers: 118,
    totalRevenue: 19420,
    capacity: 78,
    meals: [
      { id: '1', name: 'Traditional Sambar Rice Combo', category: 'Special Thali', price: 110, type: 'veg', available: true, calories: 450 },
      { id: '2', name: 'Special Mysore Masala Dosa', category: 'Special Thali', price: 120, type: 'veg', available: true, calories: 480 },
      { id: '3', name: 'Idli Vadai Breakfast Platter', category: 'Special Thali', price: 90, type: 'veg', available: true, calories: 380 },
      { id: '4', name: 'Andhra Spicy Chicken Thali', category: 'Non-Veg Thali', price: 170, type: 'non-veg', available: true, calories: 620 },
      { id: '5', name: 'Healthy Ragi Mudde Meal', category: 'Healthy Diet', price: 130, type: 'veg', available: true, calories: 410 },
    ],
    orders: [
      { id: 'ORD-201', name: 'Rohan Sharma', address: 'Flat 402, Oakwood Apts, Powai', type: 'Lunch', meal: 'Traditional Sambar Rice Combo', slot: '12:30 PM - 1:30 PM', status: 'Preparing' },
      { id: 'ORD-202', name: 'Aarav Mehta', address: 'B-12, Greenfields PG, Sakinaka', type: 'Lunch', meal: 'Andhra Spicy Chicken Thali', slot: '12:30 PM - 1:30 PM', status: 'Dispatched' },
      { id: 'ORD-203', name: 'Priya Iyer', address: 'Hostel 3, IIT Bombay campus', type: 'Dinner', meal: 'Special Mysore Masala Dosa', slot: '7:30 PM - 8:30 PM', status: 'Preparing' },
      { id: 'ORD-204', name: 'Sneha Patel', address: '405, Neptune Heights, Bhandup', type: 'Dinner', meal: 'Healthy Ragi Mudde Meal', slot: '7:30 PM - 8:30 PM', status: 'Delivered' },
    ],
    deliveryData: [
      { day: 'Mon', count: 95 },
      { day: 'Tue', count: 110 },
      { day: 'Wed', count: 105 },
      { day: 'Thu', count: 125 },
      { day: 'Fri', count: 130 },
      { day: 'Sat', count: 70 },
      { day: 'Sun', count: 65 },
    ],
    revenueData: [
      { period: '1-7 Jul', amount: 6500 },
      { period: '8-14 Jul', amount: 7200 },
      { period: '15-21 Jul', amount: 8100 },
      { period: '22-28 Jul', amount: 9200 },
      { period: 'Current', amount: 19420 },
    ],
    bankDetails: {
      bank: 'STATE BANK OF INDIA',
      accountNumber: '************1234',
      ifsc: 'SBIN0001234',
      accountHolder: 'South Indian Meals Daily',
    },
    settlements: [
      { period: '15 Jul - 21 Jul 2026', total: 9800, commission: 1470, gateway: 196, net: 8134, status: 'Transferred' },
      { period: '08 Jul - 14 Jul 2026', total: 8500, commission: 1275, gateway: 170, net: 7055, status: 'Transferred' },
      { period: '01 Jul - 07 Jul 2026', total: 7200, commission: 1080, gateway: 144, net: 5976, status: 'Transferred' },
    ]
  },
  {
    email: 'providerhealthygymmeals@thedabbacompany.com',
    businessName: 'FitFood Tiffin Service',
    logoInitials: 'FF',
    activeSubscribers: 205,
    totalRevenue: 36900,
    capacity: 92,
    meals: [
      { id: '1', name: 'High Protein Chicken Salad', category: 'Healthy Diet', price: 190, type: 'non-veg', available: true, calories: 480 },
      { id: '2', name: 'Keto Paneer Salad Bowl', category: 'Healthy Diet', price: 160, type: 'veg', available: true, calories: 420 },
      { id: '3', name: 'Brown Rice & Grilled Chicken', category: 'Healthy Diet', price: 210, type: 'non-veg', available: true, calories: 550 },
      { id: '4', name: 'Oats Porridge & Fruit Bowl', category: 'Healthy Diet', price: 110, type: 'veg', available: true, calories: 310 },
      { id: '5', name: 'Egg Whites & Quinoa Pilaf', category: 'Healthy Diet', price: 140, type: 'non-veg', available: false, calories: 380 },
    ],
    orders: [
      { id: 'ORD-301', name: 'Rohan Sharma', address: 'Flat 402, Oakwood Apts, Powai', type: 'Lunch', meal: 'Keto Paneer Salad Bowl', slot: '12:30 PM - 1:30 PM', status: 'Preparing' },
      { id: 'ORD-302', name: 'Aarav Mehta', address: 'B-12, Greenfields PG, Sakinaka', type: 'Lunch', meal: 'High Protein Chicken Salad', slot: '12:30 PM - 1:30 PM', status: 'Dispatched' },
      { id: 'ORD-303', name: 'Priya Iyer', address: 'Hostel 3, IIT Bombay campus', type: 'Dinner', meal: 'Brown Rice & Grilled Chicken', slot: '7:30 PM - 8:30 PM', status: 'Preparing' },
      { id: 'ORD-304', name: 'Sneha Patel', address: '405, Neptune Heights, Bhandup', type: 'Dinner', meal: 'Oats Porridge & Fruit Bowl', slot: '7:30 PM - 8:30 PM', status: 'Delivered' },
    ],
    deliveryData: [
      { day: 'Mon', count: 180 },
      { day: 'Tue', count: 195 },
      { day: 'Wed', count: 190 },
      { day: 'Thu', count: 210 },
      { day: 'Fri', count: 230 },
      { day: 'Sat', count: 120 },
      { day: 'Sun', count: 110 },
    ],
    revenueData: [
      { period: '1-7 Jul', amount: 12000 },
      { period: '8-14 Jul', amount: 14500 },
      { period: '15-21 Jul', amount: 16800 },
      { period: '22-28 Jul', amount: 19500 },
      { period: 'Current', amount: 36900 },
    ],
    bankDetails: {
      bank: 'HDFC BANK',
      accountNumber: '************1105',
      ifsc: 'HDFC0000240',
      accountHolder: 'FitFood Tiffin Service',
    },
    settlements: [
      { period: '15 Jul - 21 Jul 2026', total: 18500, commission: 2775, gateway: 370, net: 15355, status: 'Transferred' },
      { period: '08 Jul - 14 Jul 2026', total: 16200, commission: 2430, gateway: 324, net: 13446, status: 'Transferred' },
      { period: '01 Jul - 07 Jul 2026', total: 14800, commission: 2220, gateway: 296, net: 12284, status: 'Transferred' },
    ]
  },
  {
    email: 'admin@thedabbacompany.com',
    businessName: 'Annapurna Caterers',
    logoInitials: 'AC',
    activeSubscribers: 142,
    totalRevenue: 24850,
    capacity: 85,
    meals: [
      { id: '1', name: 'Premium Veg Tiffin', category: 'Special Thali', price: 140, type: 'veg', available: true, calories: 520 },
      { id: '2', name: 'Home-style Chicken Curry', category: 'Non-Veg Thali', price: 180, type: 'non-veg', available: true, calories: 680 },
      { id: '3', name: 'Diet Special Jain Khichdi', category: 'Healthy Diet', price: 120, type: 'jain', available: false, calories: 380 },
      { id: '4', name: 'Paneer Butter Masala Combo', category: 'Special Thali', price: 160, type: 'veg', available: true, calories: 590 },
    ],
    orders: [
      { id: 'ORD-101', name: 'Rohan Sharma', address: 'Flat 402, Oakwood Apts, Powai', type: 'Lunch', meal: 'Premium Veg Tiffin', slot: '12:30 PM - 1:30 PM', status: 'Preparing' },
      { id: 'ORD-102', name: 'Aarav Mehta', address: 'B-12, Greenfields PG, Sakinaka', type: 'Lunch', meal: 'Home-style Chicken Curry', slot: '12:30 PM - 1:30 PM', status: 'Dispatched' },
      { id: 'ORD-103', name: 'Priya Iyer', address: 'Hostel 3, IIT Bombay campus', type: 'Dinner', meal: 'Paneer Butter Combo', slot: '7:30 PM - 8:30 PM', status: 'Preparing' },
      { id: 'ORD-104', name: 'Sneha Patel', address: '405, Neptune Heights, Bhandup', type: 'Dinner', meal: 'Diet Special Jain Khichdi', slot: '7:30 PM - 8:30 PM', status: 'Delivered' },
    ],
    deliveryData: [
      { day: 'Mon', count: 120 },
      { day: 'Tue', count: 145 },
      { day: 'Wed', count: 135 },
      { day: 'Thu', count: 160 },
      { day: 'Fri', count: 180 },
      { day: 'Sat', count: 90 },
      { day: 'Sun', count: 85 },
    ],
    revenueData: [
      { period: '1-7 Jul', amount: 8400 },
      { period: '8-14 Jul', amount: 9600 },
      { period: '15-21 Jul', amount: 10400 },
      { period: '22-28 Jul', amount: 11200 },
      { period: 'Current', amount: 12800 },
    ],
    bankDetails: {
      bank: 'STATE BANK OF INDIA',
      accountNumber: '************4827',
      ifsc: 'SBIN0001850',
      accountHolder: 'Annapurna Caterers',
    },
    settlements: [
      { period: '15 Jul - 21 Jul 2026', total: 12800, commission: 1920, gateway: 256, net: 10624, status: 'Transferred' },
      { period: '08 Jul - 14 Jul 2026', total: 11200, commission: 1680, gateway: 224, net: 9296, status: 'Transferred' },
      { period: '01 Jul - 07 Jul 2026', total: 9600, commission: 1440, gateway: 192, net: 7968, status: 'Transferred' },
    ]
  }
];

export default function PartnerDashboard() {
  // Authentication states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [providerProfile, setProviderProfile] = useState<any | null>(null);

  // Login inputs
  const [email, setEmail] = useState('providernorthindiantiffinservice@thedabbacompany.com');
  const [password, setPassword] = useState('Provider@123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'settlements'>('overview');
  const [mounted, setMounted] = useState(false);

  // Interactive dashboard states (dynamically loaded or fallbacked)
  const [meals, setMeals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>({
    bank: 'STATE BANK OF INDIA',
    accountNumber: '************4827',
    ifsc: 'SBIN0001850',
    accountHolder: 'Annapurna Caterers',
  });
  const [activeSubscribers, setActiveSubscribers] = useState(142);
  const [totalRevenue, setTotalRevenue] = useState(24850);
  const [capacity, setCapacity] = useState(85);
  const [deliveryChartData, setDeliveryChartData] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);

  // Form states for adding new meal
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', category: 'Special Thali', price: '', type: 'veg', calories: '' });

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('partner_token');
    const storedUser = localStorage.getItem('partner_user');
    const storedProfile = localStorage.getItem('partner_profile');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedProfile) {
        setProviderProfile(JSON.parse(storedProfile));
      }
    }
  }, []);

  // Fetch or resolve dashboard state when user changes
  useEffect(() => {
    if (token && user) {
      loadDashboardData();
    }
  }, [token, user]);

  const loadDashboardData = async () => {
    const apiBase = getApiUrl() + '/api/v1';
    const headers = { Authorization: `Bearer ${token}` };

    let loadedProfile = null;

    // 1. Try to fetch provider profile from NestJS API
    try {
      if (token && !token.startsWith('mock-')) {
        const res = await axios.get(`${apiBase}/providers/profile`, { headers });
        loadedProfile = res.data;
        setProviderProfile(loadedProfile);
        localStorage.setItem('partner_profile', JSON.stringify(loadedProfile));
      }
    } catch (err) {
      console.warn('Could not fetch real profile, falling back to mock databases:', err);
    }

    // 2. Resolve matching profile/data from the seeded list or use defaults
    const currentEmail = user.email || '';
    const matchedSeed = preSeededProviders.find(p => p.email.toLowerCase() === currentEmail.toLowerCase()) 
      || preSeededProviders[0]; // fallback to North Indian

    // Update States
    setProviderProfile({
      businessName: loadedProfile?.businessName || matchedSeed.businessName,
      logoInitials: matchedSeed.logoInitials,
    });
    setMeals(matchedSeed.meals);
    setOrders(matchedSeed.orders);
    setBankDetails(loadedProfile?.bankDetails || matchedSeed.bankDetails);
    setActiveSubscribers(loadedProfile?.activeSubscribers || matchedSeed.activeSubscribers);
    setTotalRevenue(matchedSeed.totalRevenue);
    setCapacity(matchedSeed.capacity);
    setDeliveryChartData(matchedSeed.deliveryData);
    setRevenueChartData(matchedSeed.revenueData);
    setSettlements(matchedSeed.settlements);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    setIsOfflineMode(false);

    const apiBase = getApiUrl() + '/api/v1';

    try {
      // 1. Attempt login with NestJS backend
      const res = await axios.post(`${apiBase}/auth/login`, { email, password });
      const authData = res.data;

      // Validate provider/partner access role
      if (authData.user.userType !== 'provider' && authData.user.userType !== 'partner') {
        throw new Error('Access denied. Logged in user is not registered as a partner/provider.');
      }

      localStorage.setItem('partner_token', authData.accessToken);
      localStorage.setItem('partner_user', JSON.stringify(authData.user));
      
      setToken(authData.accessToken);
      setUser(authData.user);
    } catch (err: any) {
      console.warn('API login failed. Checking offline fallback credentials...', err);
      
      // 2. Offline Mode Validation Fallback
      const matched = preSeededProviders.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (matched && password === 'Provider@123') {
        const mockUser = {
          id: 'mock-user-id',
          email: matched.email,
          firstName: matched.businessName.split(' ')[0],
          lastName: 'Partner',
          userType: 'provider',
        };
        const mockToken = 'mock-jwt-token-for-' + matched.email;

        localStorage.setItem('partner_token', mockToken);
        localStorage.setItem('partner_user', JSON.stringify(mockUser));
        
        setIsOfflineMode(true);
        setToken(mockToken);
        setUser(mockUser);
      } else {
        setLoginError(
          err.response?.data?.message || 
          err.message || 
          'Invalid credentials. Please verify your email and password.'
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_user');
    localStorage.removeItem('partner_profile');
    setToken(null);
    setUser(null);
    setProviderProfile(null);
    setIsOfflineMode(false);
  };

  const handleToggleMeal = (id: string) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
  };

  const handleUpdateOrderStatus = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleAddMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.price) return;
    setMeals(prev => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: newMeal.name,
        category: newMeal.category,
        price: Number(newMeal.price),
        type: newMeal.type,
        available: true,
        calories: Number(newMeal.calories) || 450,
      }
    ]);
    setNewMeal({ name: '', category: 'Special Thali', price: '', type: 'veg', calories: '' });
    setShowAddMeal(false);
  };

  // Hydration state check
  if (!mounted) {
    return <div className="min-h-screen bg-[#060813] text-white flex items-center justify-center">Loading...</div>;
  }

  // --- RENDER LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050712] relative overflow-hidden font-outfit px-4">
        {/* Decorative backdrop glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full p-8 rounded-3xl bg-[#090d22]/80 border border-white/5 shadow-2xl backdrop-blur-md relative z-10 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white text-3xl shadow-xl shadow-orange-500/20">
              🍛
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 bg-clip-text text-transparent">
                THE DABBA COMPANY
              </h1>
              <p className="text-xs text-orange-400 font-semibold uppercase tracking-widest mt-1">Partner Portal Dashboard</p>
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
                className="bg-[#0f1430] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                placeholder="provider@thedabbacompany.com"
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
                className="bg-[#0f1430] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans"
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
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm tracking-wider transition-all duration-300 shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Partner Portal</span>
              )}
            </button>
          </form>

          {/* Quick-Select Seeded Accounts */}
          <div className="border-t border-white/5 pt-5 flex flex-col gap-3">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">
              Quick-Select Pre-seeded Partner Accounts
            </p>
            <div className="flex flex-col gap-2">
              {preSeededProviders.map((prov) => (
                <button
                  key={prov.email}
                  onClick={() => {
                    setEmail(prov.email);
                    setPassword('Provider@123');
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-orange-500/10 hover:border-orange-500/20 text-left transition-all text-xs flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">
                      {prov.businessName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{prov.email}</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-white/5 font-semibold group-hover:bg-orange-500/20 group-hover:text-orange-300">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen flex flex-col bg-[#060813]">
      {/* Top Navigation Header */}
      <header className="glass-card sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a0d1e]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/20">
            🍛
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 bg-clip-text text-transparent font-outfit">
              THE DABBA COMPANY
            </h1>
            <p className="text-xs text-slate-400">Partner Dashboard</p>
          </div>
        </div>

        {/* Dynamic Partner Header Display */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <h4 className="text-sm font-bold text-slate-200">{providerProfile?.businessName || 'Kitchen Partner'}</h4>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              {isOfflineMode && (
                <span className="text-[9px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 mr-1">
                  Offline Mode
                </span>
              )}
              <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Verified Kitchen
              </span>
            </div>
          </div>

          {/* Profile Avatar / Logged in initials */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 p-0.5 shadow-md shadow-orange-500/10">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-200">
              {providerProfile?.logoInitials || 'AC'}
            </div>
          </div>

          {/* Beautiful Logout Action */}
          <button
            onClick={handleLogout}
            title="Log Out of Partner Portal"
            className="p-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>🚪</span>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Profile Card Banner */}
        <section className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950/80">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
              🍳
            </div>
            <div>
              <h2 className="text-2xl font-bold font-outfit text-white">Welcome back, Chef!</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-md">
                Your kitchen capacity is filling up. Prepare pending lunch slots before 11:30 AM to assure timely delivery.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('orders')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-600/20 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              View Active Deliveries
            </button>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex border-b border-white/5 gap-6">
          {(['overview', 'menu', 'orders', 'settlements'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-sm font-semibold capitalize transition-all relative ${
                activeTab === tab ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" 
                />
              )}
            </button>
          ))}
        </nav>

        {/* Tab Contents */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  {/* Summary Metric Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subscribers</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">{activeSubscribers}</h3>
                      <p className="text-xs text-emerald-400 mt-2 font-medium">↑ 8% from last week</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Payout Revenue</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">₹{totalRevenue.toLocaleString()}</h3>
                      <p className="text-xs text-emerald-400 mt-2 font-medium">↑ ₹3,120 this period</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Meals Handled</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">1,280</h3>
                      <p className="text-xs text-slate-400 mt-2 font-medium">All-time delivered</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kitchen Occupancy</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">{capacity}%</h3>
                      <p className="text-xs text-amber-400 mt-2 font-medium">Close to max capacity</p>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Area Chart */}
                    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                      <div>
                        <h4 className="text-md font-bold font-outfit text-slate-200">Daily Meals Delivered</h4>
                        <p className="text-xs text-slate-400">Last 7 days performance metrics</p>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={deliveryChartData}>
                            <defs>
                              <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                            <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivery)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Revenue Bar Chart */}
                    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                      <div>
                        <h4 className="text-md font-bold font-outfit text-slate-200">Weekly Payout Revenue (₹)</h4>
                        <p className="text-xs text-slate-400">Aggregated provider payouts history</p>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="period" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                            <Bar dataKey="amount" fill="#e11d48" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MENU BUILDER */}
              {activeTab === 'menu' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-outfit text-slate-200">Meal Catalogue</h3>
                      <p className="text-xs text-slate-400">Publish or disable subscription dishes and prices</p>
                    </div>
                    <button
                      onClick={() => setShowAddMeal(true)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md transition-all"
                    >
                      + Add New Meal
                    </button>
                  </div>

                  {/* Add Meal Dialog Modal */}
                  {showAddMeal && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-2xl p-6 border-orange-500/40 bg-[#0d1024] flex flex-col gap-4"
                    >
                      <h4 className="text-sm font-bold font-outfit text-slate-100">Add Meal Item Details</h4>
                      <form onSubmit={handleAddMealSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate-400">Meal Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Special Punjabi Paneer Thali"
                            value={newMeal.name}
                            onChange={e => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate-400">Category</label>
                          <select
                            value={newMeal.category}
                            onChange={e => setNewMeal(prev => ({ ...prev, category: e.target.value }))}
                            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
                          >
                            <option value="Special Thali">Special Thali</option>
                            <option value="Non-Veg Thali">Non-Veg Thali</option>
                            <option value="Healthy Diet">Healthy Diet</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate-400">Price (₹)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 150"
                            value={newMeal.price}
                            onChange={e => setNewMeal(prev => ({ ...prev, price: e.target.value }))}
                            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate-400">Calorie Estimate</label>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={newMeal.calories}
                            onChange={e => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-xs text-slate-400">Dietary Tag</label>
                          <div className="flex gap-4">
                            {['veg', 'non-veg', 'jain'].map(type => (
                              <label key={type} className="flex items-center gap-2 text-sm text-slate-300 capitalize cursor-pointer">
                                <input
                                  type="radio"
                                  name="dietary"
                                  checked={newMeal.type === type}
                                  onChange={() => setNewMeal(prev => ({ ...prev, type }))}
                                  className="accent-orange-500"
                                />
                                {type}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddMeal(false)}
                            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
                          >
                            Create Item
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Meal Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {meals.map(meal => (
                      <div key={meal.id} className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
                            🍛
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                              {meal.category}
                            </span>
                            <h4 className="text-md font-bold mt-1 text-slate-100 font-outfit">{meal.name}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>₹{meal.price}</span>
                              <span>•</span>
                              <span>{meal.calories} kcal</span>
                              <span>•</span>
                              <span className={`capitalize font-semibold ${
                                meal.type === 'veg' ? 'text-emerald-400' : meal.type === 'jain' ? 'text-purple-400' : 'text-rose-400'
                              }`}>
                                {meal.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Availability Toggler Switch */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] text-slate-500">Available</span>
                          <button
                            onClick={() => handleToggleMeal(meal.id)}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex items-center ${
                              meal.available ? 'bg-orange-600 justify-end' : 'bg-slate-800 justify-start'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: ORDER MANAGER */}
              {activeTab === 'orders' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-200">Daily Deliveries</h3>
                    <p className="text-xs text-slate-400">Track and dispatch active lunch and dinner subscription packages</p>
                  </div>

                  <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-semibold">
                            <th className="p-4">Subscriber</th>
                            <th className="p-4">Meal & Type</th>
                            <th className="p-4">Address</th>
                            <th className="p-4">Delivery Window</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <p className="font-semibold text-slate-200">{order.name}</p>
                                <span className="text-xs text-slate-500">{order.id}</span>
                              </td>
                              <td className="p-4">
                                <p className="text-slate-200">{order.meal}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 ${
                                  order.type === 'Lunch' ? 'text-amber-300' : 'text-indigo-300'
                                }`}>
                                  {order.type}
                                </span>
                              </td>
                              <td className="p-4 max-w-xs truncate text-slate-400" title={order.address}>
                                {order.address}
                              </td>
                              <td className="p-4 text-xs text-slate-400">
                                {order.slot}
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'Preparing' 
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                    : order.status === 'Dispatched' 
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {order.status !== 'Delivered' ? (
                                  <div className="inline-flex gap-2">
                                    {order.status === 'Preparing' && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'Dispatched')}
                                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                                      >
                                        Dispatch
                                      </button>
                                    )}
                                    {order.status === 'Dispatched' && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                                      >
                                        Delivered
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-500 font-semibold">Done</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SETTLEMENTS */}
              {activeTab === 'settlements' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-200">Revenues & Payouts</h3>
                    <p className="text-xs text-slate-400">Review platform weekly settlement receipts and bank transfer status</p>
                  </div>

                  {/* Bank Details Banner */}
                  <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-orange-950/20 to-slate-900 flex flex-col sm:flex-row justify-between gap-4 border-orange-500/10">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase">Payout Bank Account</h4>
                      <p className="text-md font-bold mt-1 text-slate-200">{bankDetails.bank}</p>
                      <span className="text-xs text-slate-400">Account: {bankDetails.accountNumber} • IFSC: {bankDetails.ifsc}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:self-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-semibold">Direct Transfers Active</span>
                    </div>
                  </div>

                  {/* Settlement History Table */}
                  <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-semibold">
                            <th className="p-4">Payout Period</th>
                            <th className="p-4">Total Revenue</th>
                            <th className="p-4">Commission Fee (15%)</th>
                            <th className="p-4">Gateway Deductions (2%)</th>
                            <th className="p-4">Net Payout Transferred</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settlements.map((setl, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-semibold text-slate-200">{setl.period}</td>
                              <td className="p-4">₹{setl.total.toLocaleString()}</td>
                              <td className="p-4 text-rose-400">-₹{setl.commission.toLocaleString()}</td>
                              <td className="p-4 text-rose-400">-₹{setl.gateway.toLocaleString()}</td>
                              <td className="p-4 text-emerald-400 font-bold">₹{setl.net.toLocaleString()}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {setl.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="glass-card border-t border-white/5 py-6 text-center text-xs text-slate-500 mt-auto bg-[#04060d]">
        <p>© 2026 The DABBA Company. All rights reserved. Proprietary and Confidential.</p>
      </footer>
    </div>
  );
}

