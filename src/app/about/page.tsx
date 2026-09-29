import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="space-y-16 py-12">
            {/* Header */}
            <section className="bg-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">About Nobodhara Aryan Society</span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold">আমাদের পরিচিতি ও লক্ষ্য</h1>
                    <p className="max-w-2xl mx-auto text-slate-300 text-sm leading-relaxed">নবধারা আরিয়ান সোসাইটি (Nobodhara Aryan Society) একটি বিশ্বস্ত ও পরিকল্পিত মডেল টাউন আবাসন প্রকল্প।</p>
                </div>
            </section>

            {/* Main Content & Mission */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">নিরাপদ বিনিয়োগ ও আধুনিক নাগরিক জীবনের নিশ্চয়তা</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            নবধারা আরিয়ান সোসাইটি ঢাকা শহরের সন্নিকটে একটি পরিবেশবান্ধব, সুপরিকল্পিত ও আধুনিক সুবিধা সম্বলিত আবাসন প্রকল্প। আমরা শুধুমাত্র জমি বিক্রি করি না, বরং একটি আদর্শ নাগরিক সমাজ ও পরিবার বান্ধব পরিবেশ নির্মাণে প্রতিশ্রুতিবদ্ধ।
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">১০০% নির্ভেজাল জমি ও রাজুক অনুমোদিত এলাকা</h4>
                                    <p className="text-xs text-slate-500">মামলামুক্ত, সিএস, এসএ, আরএস ও বিএস খতিয়ান অনুযায়ী নিষ্কন্টক মালিকানা।</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">তাৎক্ষণিক সাফ-কবলা রেজিস্ট্রি ও হস্তান্তরের সুবিধা</h4>
                                    <p className="text-xs text-slate-500">এককালীন মূল্য পরিশোধে সাথে সাথেই রেজিস্ট্রি ও প্লট আইডি বুঝিয়ে দেওয়া হয়।</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">সহজ সুদমুক্ত দীর্ঘমেয়াদী কিস্তি</h4>
                                    <p className="text-xs text-slate-500">স্বল্প ও মধ্যম আয়ের ক্রেতাদের সুবিধার্থে ৩৬ থেকে ৬০ মাসের কিস্তি সুবিধা।</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link href="/plots" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl transition shadow">
                                <span>প্লটসমূহ ব্রাউজ করুন</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                        <img src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1000" alt="Nobodhara Aryan Society Area" className="w-full h-[420px] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-8">
                            <div className="text-white space-y-1">
                                <p className="font-bold text-lg">নবধারা আরিয়ান সোসাইটি মাস্টারপ্ল্যান</p>
                                <p className="text-xs text-slate-300">ঢাকা শহরের অতি নিকটে অবস্থিত নিষ্কন্টক প্লটসমূহ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership & Project Values */}
            <section className="bg-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Core Principles</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">আমাদের মূলনীতি ও মূল্যবোধ</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">স্বচ্ছতা ও সত্যতা</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">জমির কাগজপত্র, সিএস/আরএস খতিয়ান ও মূল্য নির্ধারণে পূর্ণাঙ্গ স্বচ্ছতা বজায় রাখা হয়। কোনো গোপন চার্জ নেই।</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">সময়মতো হস্তান্তর</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">নির্ধারিত সময়ের মধ্যে সড়ক উন্নয়ন, ইউটিলিটি লাইন স্থাপন এবং প্লট হস্তান্তর নিশ্চিত করা হয়।</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">আধুনিক মডেল টাউন</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">প্রতিটি ব্লকে পার্ক, খেলার মাঠ, ওয়াটার বডি এবং কমিউনিটি সেন্টারের জন্য বিশেষ জায়গা সংরক্ষিত।</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
