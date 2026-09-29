'use client';

import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Layers, Bell, Inbox, Check, Server, ShieldCheck, FileCode } from 'lucide-react';
import { Plot, Notice, Inquiry } from '@/lib/db';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'plots' | 'notices' | 'cpanel'>('inquiries');
  
  const [plots, setPlots] = useState<Plot[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isConnectedToDb, setIsConnectedToDb] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Plot Form state
  const [newPlotNum, setNewPlotNum] = useState('');
  const [newBlock, setNewBlock] = useState('Block A');
  const [newSize, setNewSize] = useState('3.0');
  const [newPrice, setNewPrice] = useState('4500000');
  const [newFacing, setNewFacing] = useState('North');
  const [newRoad, setNewRoad] = useState('30');
  const [newDesc, setNewDesc] = useState('');
  const [plotSubmitting, setPlotSubmitting] = useState(false);

  // New Notice Form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeCat, setNewNoticeCat] = useState('General');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [plotsRes, noticesRes, inquiriesRes] = await Promise.all([
        fetch('/api/plots').then((res) => res.json()),
        fetch('/api/notices').then((res) => res.json()),
        fetch('/api/inquiries').then((res) => res.json()),
      ]);

      if (plotsRes.plots) setPlots(plotsRes.plots);
      if (noticesRes.notices) setNotices(noticesRes.notices);
      if (inquiriesRes.inquiries) setInquiries(inquiriesRes.inquiries);
      setIsConnectedToDb(plotsRes.isConnectedToDb);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotNum || !newPrice) return;

    setPlotSubmitting(true);
    try {
      const res = await fetch('/api/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_number: newPlotNum,
          block: newBlock,
          size_katha: Number(newSize),
          price_bdt: Number(newPrice),
          facing: newFacing,
          road_width_ft: Number(newRoad),
          description: newDesc || `Prime plot in ${newBlock}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPlotNum('');
        setNewDesc('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlotSubmitting(false);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    setNoticeSubmitting(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoticeTitle,
          content: newNoticeContent,
          category: newNoticeCat,
          is_urgent: newNoticeUrgent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewNoticeTitle('');
        setNewNoticeContent('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNoticeSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-10 space-y-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Management Portal
            </span>
            <span className="text-xs text-slate-400">cPanel MySQL Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            নবধারা আরিয়ান সোসাইটি এডমিন প্যানেল
          </h1>
        </div>

        <button
          onClick={fetchAllData}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ তথ্য</span>
        </button>
      </div>

      {/* Database Connection Status Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnectedToDb ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              cPanel MySQL Database Connection: {isConnectedToDb ? 'অনলাইন (Connected)' : 'স্যাম্পল ডাটা মোড (Offline)'}
            </h4>
            <p className="text-xs text-slate-500">
              {isConnectedToDb ? 'সরাসরি cPanel MySQL ডাটাবেজে রিড ও রাইট করা হচ্ছে।' : '`.env.local` ফাইলে cPanel MySQL ক্রেডেনশিয়াল দিলে ডাটাবেজ কানেক্ট হবে।'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('cpanel')}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-4 py-2 rounded-xl transition border border-emerald-200 flex-shrink-0"
        >
          cPanel SQL স্ক্রিপ্ট ডোকস
        </button>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>আবেদন ও বুকিং ইনকোয়ারি ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plots')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'plots'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>নতুন প্লট যুক্ত ও তালিকা ({plots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'notices'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>নোটিশ পোস্ট করুন ({notices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cpanel')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'cpanel'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>cPanel DB গাইড (phpMyAdmin)</span>
        </button>
      </div>

      {/* TAB 1: Inquiries List */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-extrabold text-slate-900">
            গ্রাহকদের বুকিং ও যোগাযোগের তালিকা
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="p-3 font-bold">আইডি</th>
                  <th className="p-3 font-bold">আবেদনকারীর নাম</th>
                  <th className="p-3 font-bold">মোবাইল</th>
                  <th className="p-3 font-bold">ইমেইল</th>
                  <th className="p-3 font-bold">প্লট আইডি</th>
                  <th className="p-3 font-bold">বার্তা / নোট</th>
                  <th className="p-3 font-bold">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-500">#{inq.id}</td>
                    <td className="p-3 font-bold text-slate-900">{inq.applicant_name}</td>
                    <td className="p-3 text-emerald-700 font-semibold">{inq.phone}</td>
                    <td className="p-3 text-slate-600">{inq.email || '-'}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {inq.plot_id ? `Plot ID: ${inq.plot_id}` : 'General Inquiry'}
                    </td>
                    <td className="p-3 text-xs text-slate-600 max-w-xs">{inq.message || '-'}</td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-800 font-bold text-[11px] px-2.5 py-1 rounded">
                        {inq.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Add & Manage Plots */}
      {activeTab === 'plots' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Plot Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              নতুন প্লট ইনপুট দিন
            </h3>

            <form onSubmit={handleAddPlot} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্লট নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-108"
                  value={newPlotNum}
                  onChange={(e) => setNewPlotNum(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ব্লক</label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সাইজ (কাঠা)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোট দাম (BDT) *</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">দিক (Facing)</label>
                  <input
                    type="text"
                    value={newFacing}
                    onChange={(e) => setNewFacing(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">রাস্তা (ft)</label>
                  <input
                    type="number"
                    value={newRoad}
                    onChange={(e) => setNewRoad(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="প্লট এর সুবিধা লিখুন..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={plotSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{plotSubmitting ? 'সেভ হচ্ছে...' : 'প্লট যুক্ত করুন (cPanel DB)'}</span>
              </button>
            </form>
          </div>

          {/* Plot List Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">
              বর্তমান প্লটের তালিকা
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-bold">নম্বর</th>
                    <th className="p-3 font-bold">ব্লক</th>
                    <th className="p-3 font-bold">সাইজ</th>
                    <th className="p-3 font-bold">মূল্য</th>
                    <th className="p-3 font-bold">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plots.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-slate-900">{p.plot_number}</td>
                      <td className="p-3 text-slate-600">{p.block}</td>
                      <td className="p-3 font-semibold">{p.size_katha} কাঠা</td>
                      <td className="p-3 text-emerald-700 font-bold">৳ {p.price_bdt.toLocaleString('bn-BD')}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                          {p.status}
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

      {/* TAB 3: Post Notices */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              নতুন নোটিশ প্রকাশ করুন
            </h3>

            <form onSubmit={handleAddNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. এজিএম সংক্রান্ত জরুরি নোটিশ"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={newNoticeCat}
                  onChange={(e) => setNewNoticeCat(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="General">General</option>
                  <option value="AGM">AGM</option>
                  <option value="Development">Development</option>
                  <option value="Notice">Notice</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={newNoticeUrgent}
                  onChange={(e) => setNewNoticeUrgent(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="urgentCheck" className="text-xs font-bold text-slate-800">
                  জরুরি (Urgent Notice mark)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নোটিশের বিস্তারিত *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="বিস্তারিত বিষয়াবলি..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={noticeSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{noticeSubmitting ? 'প্রকাশ হচ্ছে...' : 'নোটিশ প্রকাশ করুন (cPanel DB)'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">
              প্রকাশিত নোটিশসমূহ
            </h3>

            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-base">{n.title}</h4>
                    <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: cPanel DB Guide & SQL */}
      {activeTab === 'cpanel' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-md">
              <FileCode className="w-4 h-4" /> cPanel Database Setup Documentation
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              cPanel (phpMyAdmin) এ কিভাবে ডাটাবেজ ইন্টিগ্রেশন করবেন?
            </h3>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-800">ধাপ ১: cPanel এ MySQL Database তৈরি</h4>
              <p className="text-xs">
                ১. cPanel ড্যাশবোর্ডে ঢুকে <strong>MySQL® Database Wizard</strong> অপশনে যান।<br />
                ২. একটি নতুন ডাটাবেজ তৈরি করুন (যেমন: <code>nobodhara_aryan_db</code>)।<br />
                ৩. ডাটাবেজের ইউজারনেম ও পাসওয়ার্ড তৈরি করুন এবং সকল পারমিশন (ALL PRIVILEGES) সিলেক্ট করুন।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-800">ধাপ ২: phpMyAdmin এ schema.sql ইমপোর্ট</h4>
              <p className="text-xs">
                ১. cPanel থেকে <strong>phpMyAdmin</strong> ওপেন করুন।<br />
                ২. নতুন তৈরি করা ডাটাবেজটি ক্লিক করুন এবং উপরে <strong>Import</strong> ট্যাবে যান।<br />
                ৩. প্রজেক্টের <code>database/schema.sql</code> ফাইলটি সিলেক্ট করে <strong>Go</strong> বাটনে ক্লিক করুন।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-800">ধাপ ৩: Next.js `.env.local` কনফিগারেশন</h4>
              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs overflow-x-auto">
{`DB_HOST=localhost (অথবা cPanel DB Server IP)
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
DB_NAME=your_cpanel_db_name
DB_PORT=3306`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
