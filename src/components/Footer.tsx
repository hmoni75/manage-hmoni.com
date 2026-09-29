import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Phone, Mail, Database, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: About & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white leading-tight">Nobodhara Aryan</h3>
                <p className="text-xs text-emerald-400 font-medium">Society Project</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              নবধারা আরিয়ান সোসাইটি - আপনার এবং আপনার পরিবারের আগামী ভবিষ্যতের জন্য একটি পরিকল্পিত ও সুরক্ষিত আবাসন প্রকল্প। আধুনিক সব নাগরিক সুযোগ-সুবিধা নিয়ে সাজানো।
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>সহজ কিস্তি ও তাৎক্ষণিক রেজিস্ট্রেশন সুবিধা</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base border-l-4 border-emerald-500 pl-3">
              দ্রুত লিঙ্ক (Quick Links)
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" /> হোম পেজ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" /> আমাদের উদ্দেশ্য ও ভিশন
                </Link>
              </li>
              <li>
                <Link href="/plots" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" /> প্লট ডিরেক্টরি ও রেট চার্ট
                </Link>
              </li>
              <li>
                <Link href="/notices" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" /> অফিশিয়াল নোটিশ বোর্ড
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" /> যোগাযোগ ও বুকিং ডেস্ক
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base border-l-4 border-emerald-500 pl-3">
              যোগাযোগের ঠিকানা
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>প্রধান কার্যালয়: হাউস-১২, রোড-০৪, ব্লক-বি, বনানী/ধানমন্ডি, ঢাকা-১২১৩।</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>+880 1700-000000, +880 1900-000000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>info@nobodharaaryan.com</span>
              </div>
            </div>
          </div>

          {/* Col 4: cPanel DB Status Info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base border-l-4 border-emerald-500 pl-3">
              cPanel Database Integration
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                  <Database className="w-4 h-4" /> cPanel MySQL
                </span>
                <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                  Ready
                </span>
              </div>
              <p className="text-slate-400 leading-normal">
                `database/schema.sql` ফাইল দিয়ে cPanel-এর phpMyAdmin-এ খুব সহজেই টেবিল তৈরি করতে পারবেন।
              </p>
              <div className="pt-1">
                <Link
                  href="/admin"
                  className="block text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-3 rounded transition"
                >
                  ডাটাবেজ ও এডমিন প্যানেল
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Nobodhara Aryan Society (নবধারা আরিয়ান সোসাইটি). All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Built with <span className="text-emerald-400 font-medium">Next.js + Tailwind + cPanel MySQL</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
