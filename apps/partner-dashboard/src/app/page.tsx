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

// Mock Data
const deliveryData = [
  { day: 'Mon', count: 120 },
  { day: 'Tue', count: 145 },
  { day: 'Wed', count: 135 },
  { day: 'Thu', count: 160 },
  { day: 'Fri', count: 180 },
  { day: 'Sat', count: 90 },
  { day: 'Sun', count: 85 },
];

const revenueData = [
  { period: '1-7 Jul', amount: 8400 },
  { period: '8-14 Jul', amount: 9600 },
  { period: '15-21 Jul', amount: 10400 },
  { period: '22-28 Jul', amount: 11200 },
  { period: 'Current', amount: 12800 },
];

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'settlements'>('overview');
  const [mounted, setMounted] = useState(false);

  // States for interactive menu editing
  const [meals, setMeals] = useState([
    { id: '1', name: 'Premium Veg Tiffin', category: 'Special Thali', price: 140, type: 'veg', available: true, calories: 520 },
    { id: '2', name: 'Home-style Chicken Curry', category: 'Non-Veg Thali', price: 180, type: 'non-veg', available: true, calories: 680 },
    { id: '3', name: 'Diet Special Jain Khichdi', category: 'Healthy Diet', price: 120, type: 'jain', available: false, calories: 380 },
    { id: '4', name: 'Paneer Butter Masala Combo', category: 'Special Thali', price: 160, type: 'veg', available: true, calories: 590 },
  ]);

  // States for active daily orders
  const [orders, setOrders] = useState([
    { id: 'ORD-101', name: 'Rohan Sharma', address: 'Flat 402, Oakwood Apts, Powai', type: 'Lunch', meal: 'Premium Veg Tiffin', slot: '12:30 PM - 1:30 PM', status: 'Preparing' },
    { id: 'ORD-102', name: 'Aarav Mehta', address: 'B-12, Greenfields PG, Sakinaka', type: 'Lunch', meal: 'Home-style Chicken Curry', slot: '12:30 PM - 1:30 PM', status: 'Dispatched' },
    { id: 'ORD-103', name: 'Priya Iyer', address: 'Hostel 3, IIT Bombay campus', type: 'Dinner', meal: 'Paneer Butter Combo', slot: '7:30 PM - 8:30 PM', status: 'Preparing' },
    { id: 'ORD-104', name: 'Sneha Patel', address: '405, Neptune Heights, Bhandup', type: 'Dinner', meal: 'Diet Special Jain Khichdi', slot: '7:30 PM - 8:30 PM', status: 'Delivered' },
  ]);

  // Form states for adding new meal
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', category: 'Special Thali', price: '', type: 'veg', calories: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

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

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <h4 className="text-sm font-semibold text-slate-200">Annapurna Caterers</h4>
            <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Verified Kitchen
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 p-0.5 shadow-md shadow-orange-500/10">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-200">
              AC
            </div>
          </div>
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
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">142</h3>
                      <p className="text-xs text-emerald-400 mt-2 font-medium">↑ 8% from last week</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Payout Revenue</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">₹24,850</h3>
                      <p className="text-xs text-emerald-400 mt-2 font-medium">↑ ₹3,120 this period</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Meals Handled</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">1,280</h3>
                      <p className="text-xs text-slate-400 mt-2 font-medium">All-time delivered</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 hover:border-orange-500/30 transition-all group">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kitchen Occupancy</p>
                      <h3 className="text-3xl font-bold font-outfit mt-2 text-white group-hover:text-orange-400 transition-colors">85%</h3>
                      <p className="text-xs text-amber-400 mt-2 font-medium">Close to max capacity</p>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  {mounted && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Delivery Area Chart */}
                      <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                        <div>
                          <h4 className="text-md font-bold font-outfit text-slate-200">Daily Meals Delivered</h4>
                          <p className="text-xs text-slate-400">Last 7 days performance metrics</p>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={deliveryData}>
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
                            <BarChart data={revenueData}>
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
                  )}
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
                      <p className="text-md font-bold mt-1 text-slate-200">STATE BANK OF INDIA</p>
                      <span className="text-xs text-slate-400">Account: ************4827 • IFSC: SBIN0001850</span>
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
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-semibold text-slate-200">15 Jul - 21 Jul 2026</td>
                            <td className="p-4">₹12,800.00</td>
                            <td className="p-4 text-rose-400">-₹1,920.00</td>
                            <td className="p-4 text-rose-400">-₹256.00</td>
                            <td className="p-4 text-emerald-400 font-bold">₹10,624.00</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Transferred
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-semibold text-slate-200">08 Jul - 14 Jul 2026</td>
                            <td className="p-4">₹11,200.00</td>
                            <td className="p-4 text-rose-400">-₹1,680.00</td>
                            <td className="p-4 text-rose-400">-₹224.00</td>
                            <td className="p-4 text-emerald-400 font-bold">₹9,296.00</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Transferred
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-semibold text-slate-200">01 Jul - 07 Jul 2026</td>
                            <td className="p-4">₹9,600.00</td>
                            <td className="p-4 text-rose-400">-₹1,440.00</td>
                            <td className="p-4 text-rose-400">-₹192.00</td>
                            <td className="p-4 text-emerald-400 font-bold">₹7,968.00</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Transferred
                              </span>
                            </td>
                          </tr>
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
