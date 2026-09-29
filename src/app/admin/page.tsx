'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Trash2, Edit3, RefreshCw, Layout, Layers, Code, Compass, Star, HelpCircle, Briefcase, BookOpen, Share2, Mail, CheckCircle, Database } from 'lucide-react';

type TabType = 'hero' | 'projects' | 'services' | 'process' | 'testimonials' | 'faqs' | 'experiences' | 'techstack' | 'blogs' | 'socials' | 'contacts';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabType>('hero');
    const [loading, setLoading] = useState(true);

    // Section Data States
    const [heroSlides, setHeroSlides] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [processSteps, setProcessSteps] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [techStack, setTechStack] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [socials, setSocials] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});

    const fetchTabContent = async () => {
        setLoading(true);
        try {
            if (activeTab === 'hero') {
                const res = await fetch('/api/hero');
                const data = await res.json();
                if (data.success) setHeroSlides(data.data);
            } else if (activeTab === 'projects') {
                const res = await fetch('/api/projects');
                const data = await res.json();
                if (data.success) setProjects(data.data);
            } else if (activeTab === 'services') {
                const res = await fetch('/api/services');
                const data = await res.json();
                if (data.success) setServices(data.data);
            } else if (activeTab === 'process') {
                const res = await fetch('/api/process');
                const data = await res.json();
                if (data.success) setProcessSteps(data.data);
            } else if (activeTab === 'testimonials') {
                const res = await fetch('/api/testimonials');
                const data = await res.json();
                if (data.success) setTestimonials(data.data);
            } else if (activeTab === 'faqs') {
                const res = await fetch('/api/faqs');
                const data = await res.json();
                if (data.success) setFaqs(data.data);
            } else if (activeTab === 'experiences') {
                const res = await fetch('/api/experiences');
                const data = await res.json();
                if (data.success) setExperiences(data.data);
            } else if (activeTab === 'techstack') {
                const res = await fetch('/api/techstack');
                const data = await res.json();
                if (data.success) setTechStack(data.data);
            } else if (activeTab === 'blogs') {
                const res = await fetch('/api/blogs');
                const data = await res.json();
                if (data.success) setBlogs(data.data);
            } else if (activeTab === 'socials') {
                const res = await fetch('/api/socials');
                const data = await res.json();
                if (data.success) setSocials(data.data);
            } else if (activeTab === 'contacts') {
                const res = await fetch('/api/contacts');
                const data = await res.json();
                if (data.success) setContacts(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTabContent();
    }, [activeTab]);

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`/api/${activeTab}?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchTabContent();
            } else {
                alert(data.error || 'Failed to delete');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingItem ? 'PUT' : 'POST';
        const payload = editingItem ? { ...formData, id: editingItem.id } : formData;

        try {
            const res = await fetch(`/api/${activeTab}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchTabContent();
            } else {
                alert(data.error || 'Save failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Database className="w-6 h-6 text-emerald-400" />
                            <h1 className="text-2xl font-bold">HMoni Content Management System (CMS)</h1>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">Add, Edit, and Manage all website dynamic sections in real time.</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button onClick={fetchTabContent} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                        </button>
                        {activeTab !== 'contacts' && (
                            <button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition">
                                <Plus className="w-4 h-4" /> Add New Item
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 scrollbar-none">
                    {[
                        { id: 'hero', label: 'Hero Carousel', icon: Layout },
                        { id: 'projects', label: 'Projects', icon: Layers },
                        { id: 'services', label: 'Services', icon: Code },
                        { id: 'process', label: 'Process', icon: Compass },
                        { id: 'experiences', label: 'Experience', icon: Briefcase },
                        { id: 'techstack', label: 'Tech Stack', icon: Layers },
                        { id: 'testimonials', label: 'Testimonials', icon: Star },
                        { id: 'faqs', label: 'FAQ', icon: HelpCircle },
                        { id: 'blogs', label: 'Blog & Resources', icon: BookOpen },
                        { id: 'socials', label: 'Social Links', icon: Share2 },
                        { id: 'contacts', label: 'Contact Messages', icon: Mail }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                                    isActive ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Display */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500 flex justify-center items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                            <span>Loading {activeTab} data...</span>
                        </div>
                    ) : (
                        <div>
                            {/* 1. HERO SLIDES */}
                            {activeTab === 'hero' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Hero Carousel Slides ({heroSlides.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {heroSlides.map((slide) => (
                                            <div key={slide.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between">
                                                <img src={slide.image_url} alt={slide.title} className="w-full h-40 object-cover" />
                                                <div className="p-4">
                                                    <h3 className="font-bold text-slate-900">{slide.title}</h3>
                                                    <p className="text-slate-600 text-xs mt-1">{slide.subtitle}</p>
                                                    <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-3">
                                                        <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">Btn: {slide.button_text}</span>
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => openEditModal(slide)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(slide.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. PROJECTS */}
                            {activeTab === 'projects' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Projects & Portfolio ({projects.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {projects.map((p) => (
                                            <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between">
                                                <img src={p.image_url} alt={p.title} className="w-full h-36 object-cover" />
                                                <div className="p-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{p.category}</span>
                                                        {p.is_highlighted ? <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold">★ Highlighted</span> : null}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 mt-2">{p.title}</h3>
                                                    <p className="text-slate-600 text-xs mt-1 line-clamp-2">{p.description}</p>
                                                    <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-3">
                                                        <a href={p.project_url} target="_blank" className="text-xs text-emerald-700 hover:underline">
                                                            Link
                                                        </a>
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => openEditModal(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. SERVICES */}
                            {activeTab === 'services' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Services ({services.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {services.map((s) => (
                                            <div key={s.id} className="border border-slate-200 p-5 rounded-xl bg-slate-50 flex flex-col justify-between">
                                                <div>
                                                    <div className="font-bold text-xs text-emerald-700 uppercase mb-1">{s.icon}</div>
                                                    <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
                                                    <p className="text-slate-600 text-xs mt-2">{s.short_description}</p>
                                                </div>
                                                <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-3">
                                                    <span className="text-xs font-bold text-slate-700">{s.price_starting || 'N/A'}</span>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => openEditModal(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. PROCESS */}
                            {activeTab === 'process' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Process Philosophy ({processSteps.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {processSteps.map((ps) => (
                                            <div key={ps.id} className="border border-slate-200 p-5 rounded-xl bg-slate-50 flex justify-between items-center">
                                                <div>
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Step 0{ps.step_number}</span>
                                                    <h3 className="font-bold text-slate-900 text-base mt-2">{ps.title}</h3>
                                                    <p className="text-slate-600 text-xs mt-1">{ps.description}</p>
                                                </div>
                                                <div className="flex space-x-2 shrink-0 ml-4">
                                                    <button onClick={() => openEditModal(ps)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(ps.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. EXPERIENCES */}
                            {activeTab === 'experiences' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Work Experiences ({experiences.length})</h2>
                                    <div className="space-y-3">
                                        {experiences.map((exp) => (
                                            <div key={exp.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">
                                                        {exp.designation} <span className="text-emerald-700 font-normal">at {exp.company_name}</span>
                                                    </h3>
                                                    <p className="text-slate-500 text-xs">
                                                        {exp.duration} • {exp.location}
                                                    </p>
                                                    <p className="text-slate-600 text-xs mt-1">{exp.description}</p>
                                                </div>
                                                <div className="flex space-x-2 shrink-0">
                                                    <button onClick={() => openEditModal(exp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 6. TECH STACK */}
                            {activeTab === 'techstack' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Tech Stack & Tools ({techStack.length})</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {techStack.map((t) => (
                                            <div key={t.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                                                    <span className="text-[10px] text-slate-500 block">{t.category}</span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button onClick={() => openEditModal(t)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 7. TESTIMONIALS */}
                            {activeTab === 'testimonials' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Client Testimonials ({testimonials.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {testimonials.map((t) => (
                                            <div key={t.id} className="border border-slate-200 p-5 rounded-xl bg-slate-50 flex flex-col justify-between">
                                                <p className="text-slate-700 text-xs italic">&quot;{t.comment}&quot;</p>
                                                <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-3">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm">{t.client_name}</h4>
                                                        <span className="text-[10px] text-slate-500">
                                                            {t.designation} {t.company && `at ${t.company}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => openEditModal(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 8. FAQS */}
                            {activeTab === 'faqs' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">FAQs ({faqs.length})</h2>
                                    <div className="space-y-3">
                                        {faqs.map((f) => (
                                            <div key={f.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">Q: {f.question}</h3>
                                                    <p className="text-slate-600 text-xs mt-1">A: {f.answer}</p>
                                                </div>
                                                <div className="flex space-x-2 shrink-0 ml-4">
                                                    <button onClick={() => openEditModal(f)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 9. BLOGS */}
                            {activeTab === 'blogs' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Blog Articles & Resources ({blogs.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {blogs.map((b) => (
                                            <div key={b.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between">
                                                {b.cover_image && <img src={b.cover_image} alt={b.title} className="w-full h-36 object-cover" />}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-slate-900">{b.title}</h3>
                                                    <p className="text-slate-600 text-xs mt-1 line-clamp-2">{b.excerpt}</p>
                                                    <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-3">
                                                        <span className="text-[10px] text-slate-500">{b.read_time}</span>
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => openEditModal(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 10. SOCIALS */}
                            {activeTab === 'socials' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Social Media Links ({socials.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {socials.map((s) => (
                                            <div key={s.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">{s.platform}</h3>
                                                    <a href={s.url} target="_blank" className="text-xs text-emerald-700 hover:underline">
                                                        {s.url}
                                                    </a>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => openEditModal(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 11. CONTACTS */}
                            {activeTab === 'contacts' && (
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg text-slate-900 mb-4">Contact Form Submissions ({contacts.length})</h2>
                                    <div className="space-y-3">
                                        {contacts.map((c) => (
                                            <div key={c.id} className="border border-slate-200 p-5 rounded-xl bg-slate-50 flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900">{c.name}</h3>
                                                        <span className="text-xs text-slate-500">({c.email})</span>
                                                        {c.phone && <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">{c.phone}</span>}
                                                    </div>
                                                    <h4 className="font-semibold text-emerald-800 text-xs mt-1">Subject: {c.subject}</h4>
                                                    <p className="text-slate-700 text-sm mt-2 whitespace-pre-line">{c.message}</p>
                                                    <span className="text-[10px] text-slate-400 block mt-2">{new Date(c.created_at).toLocaleString()}</span>
                                                </div>
                                                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0 ml-4">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Dynamic Modal for Adding / Editing Items */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">{editingItem ? `Edit ${activeTab} item` : `Add new ${activeTab} item`}</h3>

                            <form onSubmit={handleSaveItem} className="space-y-4">
                                {/* Hero Slide Form */}
                                {activeTab === 'hero' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Title *</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Subtitle</label>
                                            <textarea value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Image URL *</label>
                                            <input type="text" required value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Button Text</label>
                                                <input type="text" value={formData.button_text || ''} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Button Link</label>
                                                <input type="text" value={formData.button_link || ''} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Projects Form */}
                                {activeTab === 'projects' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Project Title *</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Category</label>
                                            <input type="text" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Description *</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Image URL *</label>
                                            <input type="text" required value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Project URL</label>
                                            <input type="text" value={formData.project_url || ''} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="is_highlighted" checked={Boolean(formData.is_highlighted)} onChange={(e) => setFormData({ ...formData, is_highlighted: e.target.checked })} />
                                            <label htmlFor="is_highlighted" className="text-xs font-bold uppercase">
                                                Highlight on Home Page
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* Services Form */}
                                {activeTab === 'services' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Service Title *</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Icon (Code, Server, Layout, Globe)</label>
                                            <input type="text" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Short Description *</label>
                                            <textarea required value={formData.short_description || ''} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Starting Price</label>
                                            <input type="text" value={formData.price_starting || ''} onChange={(e) => setFormData({ ...formData, price_starting: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* Process Form */}
                                {activeTab === 'process' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Step Number *</label>
                                                <input type="number" required value={formData.step_number || 1} onChange={(e) => setFormData({ ...formData, step_number: Number(e.target.value) })} className="w-full p-2.5 border rounded-xl" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Icon Name</label>
                                                <input type="text" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Title *</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Description *</label>
                                            <textarea required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* Experience Form */}
                                {activeTab === 'experiences' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Designation *</label>
                                            <input type="text" required value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Company Name *</label>
                                            <input type="text" required value={formData.company_name || ''} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Duration *</label>
                                            <input type="text" required value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Description</label>
                                            <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* Tech Stack Form */}
                                {activeTab === 'techstack' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Tool Name *</label>
                                            <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Category</label>
                                            <input type="text" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Icon URL</label>
                                            <input type="text" value={formData.icon_url || ''} onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* Testimonials Form */}
                                {activeTab === 'testimonials' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Client Name *</label>
                                            <input type="text" required value={formData.client_name || ''} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Designation</label>
                                                <input type="text" value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Company</label>
                                                <input type="text" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Comment *</label>
                                            <textarea required value={formData.comment || ''} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Avatar Image URL</label>
                                            <input type="text" value={formData.avatar_url || ''} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* FAQ Form */}
                                {activeTab === 'faqs' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Question *</label>
                                            <input type="text" required value={formData.question || ''} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Answer *</label>
                                            <textarea required value={formData.answer || ''} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* Blog Form */}
                                {activeTab === 'blogs' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Title *</label>
                                            <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Excerpt *</label>
                                            <textarea required value={formData.excerpt || ''} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Full Content *</label>
                                            <textarea rows={6} required value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Cover Image URL</label>
                                            <input type="text" value={formData.cover_image || ''} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                {/* Social Links Form */}
                                {activeTab === 'socials' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Platform Name (Facebook, LinkedIn, GitHub, Twitter) *</label>
                                            <input type="text" required value={formData.platform || ''} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">URL *</label>
                                            <input type="text" required value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full p-2.5 border rounded-xl" />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
