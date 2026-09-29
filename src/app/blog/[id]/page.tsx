'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Calendar, User, Clock, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  read_time: string;
  published_at: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/blogs?id=${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setBlog(data.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blogs & Resources
        </button>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-64 bg-slate-200 rounded mb-6"></div>
          </div>
        ) : !blog ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Blog Post Not Found</h1>
            <p className="text-slate-600 mb-6">The blog article you are looking for does not exist or has been removed.</p>
            <Link href="/" className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-800 transition">
              Return Home
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Meta */}
            <div className="p-6 sm:p-10 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-4">
                <span className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Resource Article
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-800">{blog.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{blog.read_time}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {blog.cover_image && (
              <div className="w-full h-[320px] sm:h-[450px] overflow-hidden bg-slate-100">
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 sm:p-12 text-slate-700 text-base sm:text-lg leading-relaxed space-y-6">
              <p className="text-xl font-medium text-slate-900 leading-relaxed border-l-4 border-emerald-600 pl-4 py-1 italic bg-slate-50 rounded-r-lg">
                {blog.excerpt}
              </p>

              <div className="prose prose-emerald max-w-none whitespace-pre-line text-slate-800">
                {blog.content}
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
