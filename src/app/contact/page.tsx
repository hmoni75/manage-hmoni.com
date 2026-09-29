'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Building2 } from 'lucide-react';

export default function ContactPage() {
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setApplicantName('');
        setPhone('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 space-y-4 shadow-xl">
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
          যোগাযোগ ও প্রজেক্ট ভিজিট বুকিং
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl">
          আমাদের প্রতিনিধি দলের সাথে কথা বলুন, অফিসিয়াল ভিজিট বুক করুন অথবা সরাসরি মেসেজ পাঠান।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Contact Information */}
        <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            প্রধান অফিশিয়াল তথ্য
          </h3>

          <div className="space-y-6 text-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">প্রধান কার্যালয়</h4>
                <p className="text-xs text-slate-600 mt-1">
                  হাউস-১২, রোড-০৪, ব্লক-বি, ধানমন্ডি/বনানী, ঢাকা-১২১৩।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">হটলাইন & হোয়াটসঅ্যাপ</h4>
                <p className="text-xs text-slate-600 mt-1">
                  +880 1700-000000<br />
                  +880 1900-000000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">ইমেইল ঠিকানা</h4>
                <p className="text-xs text-slate-600 mt-1">
                  info@nobodharaaryan.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">অফিস খোলা থাকার সময়</h4>
                <p className="text-xs text-slate-600 mt-1">
                  শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - সন্ধ্যা ৬:০০
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (Connected to cPanel DB) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              ইনকোয়ারি ও মেসেজ পাঠান
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              আপনার তথ্য প্রদান করুন, আমাদের প্রতিনিধি আপনাকে cPanel DB সিস্টেমে এন্ট্রি নিয়ে যোগাযোগ করবেন।
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-xl">মেসেজ সফলভাবে পাঠানো হয়েছে!</h4>
              <p className="text-xs">
                ধন্যবাদ। আপনার বার্তাটি আমাদের cPanel MySQL ডাটাবেজে সংরক্ষণ করা হয়েছে। খুব শীঘ্রই আমাদের সেলস প্রতিনিধি কল করবেন।
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-800 transition"
              >
                আরেকটি বার্তা পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার নাম (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="নাম লিখুন"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর (Phone) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইমেইল (Email - Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার মন্তব্য বা ইনকোয়ারি বার্তা
                </label>
                <textarea
                  rows={4}
                  placeholder="আপনার কোনো জানার বিষয় বা প্রজেক্ট ভিজিটের সময় জানাতে পারেন..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'মেসেজ ইনপুট দিন (cPanel DB)'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
