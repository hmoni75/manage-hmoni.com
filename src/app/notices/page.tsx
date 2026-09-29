import React from 'react';
import { getNotices } from '@/lib/db';
import { Bell, Calendar, Tag, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function NoticesPage() {
  const { notices, isConnectedToDb } = await getNotices();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Official Announcements
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              নবধারা আরিয়ান সোসাইটি নোটিশ বোর্ড
            </h1>
          </div>
          <div className="text-xs text-slate-400">
            cPanel DB: <span className="text-emerald-400 font-semibold">{isConnectedToDb ? 'Live Sync' : 'Offline / Sample'}</span>
          </div>
        </div>
        <p className="text-slate-300 text-sm max-w-2xl">
          সোসাইটির সকল শেয়ারহোল্ডার, প্লট মালিক ও শুভাকাঙ্ক্ষীদের জন্য গুরুত্বপূর্ণ অফিশিয়াল নোটিশ, এজিএম সংক্রান্ত তথ্য ও প্রজেক্ট ডেভেলপমেন্ট আপডেট।
        </p>
      </div>

      {/* Notices List */}
      <div className="space-y-6">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`bg-white rounded-2xl p-6 sm:p-8 border shadow-sm transition hover:shadow-md ${
              notice.is_urgent ? 'border-amber-400/80 bg-amber-50/30' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    notice.is_urgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {notice.is_urgent ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    {notice.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <Tag className="w-3.5 h-3.5" /> {notice.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.published_at ? new Date(notice.published_at).toLocaleDateString('bn-BD') : 'সাম্প্রতিক'}
                    </span>
                  </div>
                </div>
              </div>

              {notice.is_urgent && (
                <span className="bg-amber-500 text-white font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
                  জরুরি নোটিশ
                </span>
              )}
            </div>

            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {notice.content}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
