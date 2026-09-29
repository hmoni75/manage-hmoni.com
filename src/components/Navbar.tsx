'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Phone, Menu, X, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Projects', href: '#projects' },
        { name: 'Services', href: '#services' },
        { name: 'Process', href: '#process' },
        { name: 'Experience', href: '#experience' },
        { name: 'Tech Stack', href: '#techstack' },
        { name: 'Testimonials', href: '#testimonials' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Blog & Resources', href: '#blogs' },
        { name: 'Contact', href: '#contact' }
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
            {/* Top Bar */}
            <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Sparkles className="w-3.5 h-3.5" /> Dynamic Portfolio & Management CMS
                        </span>
                        <span className="hidden md:inline-block text-slate-700">|</span>
                        <span className="hidden md:flex items-center gap-1 text-slate-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HMoni Digital Solutions
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a href="tel:+8801700000000" className="flex items-center gap-1 hover:text-white transition">
                            <Phone className="w-3.5 h-3.5" /> +880 1700-000000
                        </a>
                        <Link href="/admin" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[11px] font-semibold transition">
                            Admin CMS Panel
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo & Brand Name */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">HMoni</span>
                            <span className="block text-[11px] font-bold tracking-widest text-emerald-600 uppercase mt-1">Digital Portfolio & Platform</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden xl:flex items-center space-x-6 text-sm font-medium text-slate-700">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} className="hover:text-emerald-700 transition-colors py-2 border-b-2 border-transparent hover:border-emerald-600">
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Call to Action Button */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <Link href="/admin" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-300">
                            CMS Admin
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="xl:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 hover:text-emerald-700 focus:outline-none p-2" aria-label="Toggle Navigation">
                            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl">
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="block text-slate-800 font-medium py-2 px-3 rounded-md hover:bg-emerald-50 hover:text-emerald-700">
                            {link.name}
                        </a>
                    ))}
                    <div className="pt-2">
                        <Link href="/admin" onClick={() => setIsOpen(false)} className="block w-full text-center bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow">
                            Admin CMS Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
