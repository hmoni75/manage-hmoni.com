'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Globe, Facebook, Linkedin, Github, Twitter } from 'lucide-react';

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  is_active: boolean | number;
}

export default function Footer() {
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/socials')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSocials(data.data.filter((s: SocialLink) => s.is_active));
        }
      })
      .catch(() => {});
  }, []);

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
    if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (p.includes('github')) return <Github className="w-5 h-5" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-2xl text-white tracking-tight">HMoni</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering web experiences with modern full-stack development, dynamic content management, and scalable cloud architecture.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Follow Us / Social Media</h4>
              <div className="flex items-center space-x-3">
                {socials.length > 0 ? (
                  socials.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 flex items-center justify-center transition-all duration-300"
                      title={s.platform}
                    >
                      {getSocialIcon(s.platform)}
                    </a>
                  ))
                ) : (
                  <>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 flex items-center justify-center transition">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 flex items-center justify-center transition">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 flex items-center justify-center transition">
                      <Github className="w-5 h-5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 border-l-2 border-emerald-500 pl-3">Navigation</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#projects" className="hover:text-emerald-400 transition">Projects & Portfolio</a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition">Services & Capabilities</a></li>
              <li><a href="#process" className="hover:text-emerald-400 transition">Process Philosophy</a></li>
              <li><a href="#experience" className="hover:text-emerald-400 transition">Work Experience</a></li>
              <li><a href="#techstack" className="hover:text-emerald-400 transition">Tech Stack & Tools</a></li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 border-l-2 border-emerald-500 pl-3">Resources</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#testimonials" className="hover:text-emerald-400 transition">Client Testimonials</a></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition">Frequently Asked Questions</a></li>
              <li><a href="#blogs" className="hover:text-emerald-400 transition">Blog & Articles</a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition">Get In Touch</a></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition">Admin CMS Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 border-l-2 border-emerald-500 pl-3">Contact Info</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>info@hmoni.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HMoni Digital Solutions. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <Link href="/admin" className="hover:text-slate-400 transition">Admin CMS</Link>
            <a href="#contact" className="hover:text-slate-400 transition">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
