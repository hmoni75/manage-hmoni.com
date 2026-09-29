import React from 'react';
import Link from 'next/link';
import { getPlots, getNotices } from '@/lib/db';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Trees,
  Car,
  Bell,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Calendar
} from 'lucide-react';

export const revalidate = 0; // Fresh DB fetching

export default async function HomePage() {
  const { plots, isConnectedToDb } = await getPlots();
  const { notices } = await getNotices();

  const featuredPlots = plots.slice(0, 3);
  const urgentNotices = notices.slice(0, 2);

  return (
    <div className="space-y-16 pb-16">
      
      {/* DB Connection Status Toast / Banner */}
      {!isConnectedToDb && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 text-xs py-2 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              cPanel MySQL Setup Ready
            </span>
            <span>
              বর্তমানে স্যাম্পল ডাটা প্রদর্শিত হচ্ছে। আসল cPanel DB লিঙ্ক করতে `.env.local` ফাইলে আপনার MySQL ক্রেডেনশিয়াল সেট করুন।
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-20 lg:py-28">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/80 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transform transition duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600')` }}
        />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>নবধারা আরিয়ান সোসাইটি • নিচ্ছিন্ত আবাসনের নাম</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              আপনার স্বপ্নের পরিকল্পিত <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                আবাসন প্রকল্প
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              আধুনিক জীবনযাত্রার সকল সুবিধা, প্রশস্ত সড়ক, বিদ্যুৎ, সুপরিকল্পিত ড্রেনেজ এবং নিরবচ্ছিন্ন নিরাপত্তাসহ ঢাকায় আপনার স্থায়ী ঠিকানা গড়ে তুলুন।
            </p>

            {/* Feature Pills */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> রাজুক গেটওয়ে সংলগ্ন
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ৩০-৬০ ফুট প্রশস্ত রাস্তা
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> তাৎক্ষণিক রেজিস্ট্রি ও নামজারি
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/plots"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 text-center transition flex items-center justify-center gap-2"
              >
                <span>উপলব্ধ প্লটসমূহ দেখুন</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="bg-slate-800/90 hover:bg-slate-800 text-slate-100 font-semibold px-8 py-3.5 rounded-xl border border-slate-700 text-center transition flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <span>বুকিং ও ফিজিক্যাল ভিজিট</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1 text-center md:text-left border-r border-slate-100 last:border-0 pr-4">
            <p className="text-3xl font-extrabold text-emerald-700">৫০+ একর</p>
            <p className="text-xs text-slate-500 font-medium">মোট প্রকল্প এলাকা</p>
          </div>
          <div className="space-y-1 text-center md:text-left border-r border-slate-100 last:border-0 pr-4">
            <p className="text-3xl font-extrabold text-emerald-700">৩, ৫ ও ১০</p>
            <p className="text-xs text-slate-500 font-medium">কাঠার আবাসিক ও বাণিজ্যিক প্লট</p>
          </div>
          <div className="space-y-1 text-center md:text-left border-r border-slate-100 last:border-0 pr-4">
            <p className="text-3xl font-extrabold text-emerald-700">৬০ ফুট</p>
            <p className="text-xs text-slate-500 font-medium">প্রধান প্রবেশ পথ ও অ্যাভিনিউ</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-3xl font-extrabold text-emerald-700">১০০%</p>
            <p className="text-xs text-slate-500 font-medium">নিরাপদ বুকিং ও রেজিস্ট্রি</p>
          </div>
        </div>
      </section>

      {/* Featured Plots Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Project Plots
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              প্রাইম লোকেশনের নির্বাচিত প্লটসমূহ
            </h2>
          </div>
          <Link
            href="/plots"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 group"
          >
            <span>সকল প্লট চার্ট দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPlots.map((plot) => (
            <div
              key={plot.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-200/80 transition duration-300 flex flex-col"
            >
              <div className="relative h-48 bg-slate-200 overflow-hidden">
                <img
                  src={plot.image_url}
                  alt={`Plot ${plot.plot_number}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-md">
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

              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-xl text-slate-900">
                      প্লট নং: {plot.plot_number}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {plot.size_katha} কাঠা
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {plot.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400">ফেস:</span> {plot.facing}
                  </div>
                  <div>
                    <span className="text-slate-400">রাস্তা:</span> {plot.road_width_ft} ফিট
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-medium">মূল্য (প্রতি কাঠা)</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      ৳ {(plot.price_bdt / plot.size_katha).toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <Link
                    href={`/plots?selected=${plot.id}`}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    ইনকোয়ারি
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Urgent Notice Board Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">
                  নোটিশ বোর্ড ও সর্বশেষ সংবাদ
                </h2>
              </div>
              <Link
                href="/notices"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white"
              >
                <span>সকল নোটিশ দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {urgentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-1 rounded">
                      {notice.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.published_at ? new Date(notice.published_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Amenities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Key Features
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            নবধারা আরিয়ান সোসাইটির নাগরিক সুবিধাসমূহ
          </h2>
          <p className="text-slate-600 text-sm">
            একটি পূর্ণাঙ্গ ও আধুনিক আবাসন প্রকল্পের সমস্ত নাগরিক সুবিধা আমরা নিশ্চিত করছি।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">প্রশস্ত সড়ক ব্যবস্থা</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              প্রকল্পের অভ্যন্তরে ৩০, ৪০ ও ৬০ ফুট প্রশস্ত পিচঢালা অভ্যন্তরীণ সড়ক।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">ইউটিলিটি ও ড্রেনেজ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              বিদ্যুৎ সংযোগ, ভূগর্ভস্থ পানি নিষ্কাশন ও পরিকল্পিত ড্রেনেজ নেটওয়ার্ক।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">২৪/৭ সার্বক্ষণিক নিরাপত্তা</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              সিকিউরিটি গার্ড, সিসিটিভি ক্যামেরা ও মেইন গেট নিরাপত্তা ব্যবস্থা।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Trees className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">পার্ক ও খেলার মাঠ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              কেন্দ্রীয় জামে মসজিদ, শিশু পার্ক, খেলার মাঠ ও পরিবেশবান্ধব সবুজ চত্বর।
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-700 rounded-3xl p-8 lg:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-3xl font-extrabold">
            আজই বুকিং নিশ্চিত করুন এবং বেছে নিন সেরা লোকেশন
          </h2>
          <p className="max-w-2xl mx-auto text-emerald-100 text-sm leading-relaxed">
            নবধারা আরিয়ান সোসাইটিতে আপনার সুবিধাজনক প্লটটি বেছে নিতে আমাদের প্রতিনিধি দলের সাথে যোগাযোগ করুন অথবা প্রজেক্ট ফিল্ড ভিজিটের জন্য সময় নির্ধারণ করুন।
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-emerald-800 font-bold px-8 py-3.5 rounded-xl shadow hover:bg-emerald-50 transition"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
