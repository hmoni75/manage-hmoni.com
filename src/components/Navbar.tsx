'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Phone, Menu, X, ShieldCheck, MapPin, Bell } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-emerald-200">
              <MapPin className="w-3.5 h-3.5" /> রাজুক অনুমোদিত প্রকল্প এলাকা (Dhaka Gateway)
            </span>
            <span className="hidden md:inline-block text-emerald-400">|</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> রেজিঃ নং- NAS/DH-2024
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="tel:+8801700000000" className="flex items-center gap-1 hover:text-white transition">
              <Phone className="w-3.5 h-3.5" /> +880 1700-000000
            </a>
            <Link href="/admin" className="bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition">
              cPanel DB Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="block font-bold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                Nobodhara Aryan
              </span>
              <span className="block text-xs font-semibold tracking-widest text-emerald-600 uppercase mt-1">
                Society • নবধারা আরিয়ান সোসাইটি
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-emerald-700 transition-colors py-2 border-b-2 border-transparent hover:border-emerald-600">
              হোম (Home)
            </Link>
            <Link href="/about" className="hover:text-emerald-700 transition-colors py-2 border-b-2 border-transparent hover:border-emerald-600">
              আমাদের কথা (About)
            </Link>
            <Link href="/plots" className="hover:text-emerald-700 transition-colors py-2 border-b-2 border-transparent hover:border-emerald-600 flex items-center gap-1.5">
              <span>প্লটসমূহ (Plots)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">New</span>
            </Link>
            <Link href="/notices" className="hover:text-emerald-700 transition-colors py-2 border-b-2 border-transparent hover:border-emerald-600 flex items-center gap-1">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>নোটিশ (Notices)</span>
            </Link>
            <Link href="/contact" className="hover:text-emerald-700 transition-colors py-2 border-b-2 border-transparent hover:border-emerald-600">
              যোগাযোগ (Contact)
            </Link>
          </nav>

          {/* Call to Action Button */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/plots"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-300"
            >
              বুকিং ইনকোয়ারি
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-emerald-700 focus:outline-none p-2"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
          >
            হোম (Home)
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
          >
            আমাদের কথা (About)
          </Link>
          <Link
            href="/plots"
            onClick={() => setIsOpen(false)}
            className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
          >
            প্লটসমূহ (Plots)
          </Link>
          <Link
            href="/notices"
            onClick={() => setIsOpen(false)}
            className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
          >
            নোটিশ বোর্ড (Notices)
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
          >
            যোগাযোগ (Contact)
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
          >
            cPanel DB Admin Dashboard
          </Link>
          <div className="pt-2">
            <Link
              href="/plots"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow"
            >
              বুকিং ইনকোয়ারি
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
