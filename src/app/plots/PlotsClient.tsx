'use client';

import React, { useState } from 'react';
import { Plot } from '@/lib/db';
import { Filter, CheckCircle, Search, Phone, Mail, User, Send, X, Shield, MapPin } from 'lucide-react';

interface PlotsClientProps {
  initialPlots: Plot[];
  isConnectedToDb: boolean;
}

export default function PlotsClient({ initialPlots, isConnectedToDb }: PlotsClientProps) {
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Booking Modal state
  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filtered Plots
  const filteredPlots = initialPlots.filter((plot) => {
    const matchesBlock = selectedBlock === 'all' || plot.block === selectedBlock;
    const matchesStatus = selectedStatus === 'all' || plot.status === selectedStatus;
    const matchesQuery =
      plot.plot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBlock && matchesStatus && matchesQuery;
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_name: applicantName,
          phone,
          email,
          plot_id: activePlot?.id || null,
          message: message || `Booking inquiry for Plot ${activePlot?.plot_number} (${activePlot?.block})`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setActivePlot(null);
          setApplicantName('');
          setPhone('');
          setEmail('');
          setMessage('');
        }, 2500);
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Info Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              Available Listings • রেট চার্ট ও প্লট সূচী
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              নবধারা আরিয়ান সোসাইটি প্লট ডিরেক্টরি
            </h1>
          </div>
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>cPanel DB Sync: {isConnectedToDb ? 'Connected (Live SQL)' : 'Sample Data'}</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="প্লট নম্বর দিয়ে সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Block Filter */}
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল ব্লক (All Blocks)</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল স্ট্যাটাস (All Status)</option>
              <option value="available">Available (খালি আছে)</option>
              <option value="booked">Booked (বুকড)</option>
              <option value="sold">Sold (বিক্রীত)</option>
            </select>
          </div>

          {/* Total Counter */}
          <div className="flex items-center justify-center md:justify-end text-sm font-semibold text-slate-400">
            <span>মোট পাওয়া গেছে: <strong className="text-emerald-400 text-base">{filteredPlots.length}</strong> টি প্লট</span>
          </div>

        </div>
      </div>

      {/* Plot Cards Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPlots.map((plot) => (
          <div
            key={plot.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Plot Card Header & Image */}
              <div className="relative h-52 bg-slate-200 overflow-hidden">
                <img
                  src={plot.image_url}
                  alt={`Plot ${plot.plot_number}`}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-md">
                  {plot.block}
                </div>
                <div
                  className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-md text-white uppercase ${
                    plot.status === 'available'
                      ? 'bg-emerald-600'
                      : plot.status === 'booked'
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}
                >
                  {plot.status === 'available' ? 'Available' : plot.status === 'booked' ? 'Booked' : 'Sold'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    প্লট {plot.plot_number}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    {plot.size_katha} কাঠা
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {plot.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">সামনের দিক:</span>
                    <span className="font-semibold text-slate-800">{plot.facing}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">সংলগ্ন রাস্তা:</span>
                    <span className="font-semibold text-slate-800">{plot.road_width_ft} ফিট</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer & Pricing */}
            <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">মোট প্রাক্কলিত মূল্য</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  ৳ {(plot.price_bdt).toLocaleString('bn-BD')}
                </span>
              </div>
              <button
                onClick={() => setActivePlot(plot)}
                disabled={plot.status === 'sold'}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm ${
                  plot.status === 'sold'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {plot.status === 'sold' ? 'বিক্রীত' : 'বুকিং আবেদন'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPlots.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-lg font-bold text-slate-800">কোনো প্লট পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500">আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
        </div>
      )}

      {/* Plot Booking & Inquiry Modal */}
      {activePlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={() => setActivePlot(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded">
                Plot Booking Form
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                প্লট নং {activePlot.plot_number} বুকিং ইনকোয়ারি
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ব্লক: {activePlot.block} | সাইজ: {activePlot.size_katha} কাঠা | মোট মূল্য: ৳{activePlot.price_bdt.toLocaleString('bn-BD')}
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-lg">আবেদন সফলভাবে গৃহীত হয়েছে!</h4>
                <p className="text-xs">
                  আপনার ইনকোয়ারিটি cPanel ডাটাবেজে সংরক্ষিত হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আবেদনকারীর নাম (Full Name) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম লিখুন"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর (Phone Number) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল (Email Address - Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অতিরিক্ত বার্তা / পেমেন্ট পরিকল্পনা
                  </label>
                  <textarea
                    rows={3}
                    placeholder="এককালীন না কিস্তিতে নিতে চান অথবা যেকোনো প্রশ্ন..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'প্রসেস করা হচ্ছে...' : 'ইনকোয়ারি সাবমিট করুন'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
