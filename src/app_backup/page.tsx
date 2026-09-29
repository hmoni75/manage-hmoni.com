'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Code, Compass, Rocket, Search, Star, HelpCircle, Briefcase, Layers, BookOpen, Send, CheckCircle, ArrowRight, Globe, Server, Layout } from 'lucide-react';

interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
    image_url: string;
}

interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    image_url: string;
    project_url: string;
    is_highlighted: boolean | number;
}

interface Service {
    id: number;
    title: string;
    icon: string;
    short_description: string;
    full_description?: string;
    price_starting?: string;
}

interface ProcessStep {
    id: number;
    step_number: number;
    title: string;
    description: string;
    icon: string;
}

interface Testimonial {
    id: number;
    client_name: string;
    designation: string;
    company: string;
    comment: string;
    rating: number;
    avatar_url: string;
}

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category: string;
}

interface ExperienceItem {
    id: number;
    designation: string;
    company_name: string;
    duration: string;
    description: string;
    location: string;
}

interface TechStackItem {
    id: number;
    name: string;
    category: string;
    icon_url: string;
    proficiency_level: number;
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    author_name: string;
    read_time: string;
    published_at: string;
}

export default function HomePage() {
    // States for all dynamic sections
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [projects, setProjects] = useState<Project[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);
    const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
    const [techStack, setTechStack] = useState<TechStackItem[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);

    // Contact Form State
    const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        // Fetch all data in parallel
        fetch('/api/hero')
            .then((res) => res.json())
            .then((d) => d.success && setHeroSlides(d.data))
            .catch(() => {});
        fetch('/api/projects')
            .then((res) => res.json())
            .then((d) => d.success && setProjects(d.data))
            .catch(() => {});
        fetch('/api/services')
            .then((res) => res.json())
            .then((d) => d.success && setServices(d.data))
            .catch(() => {});
        fetch('/api/process')
            .then((res) => res.json())
            .then((d) => d.success && setProcessSteps(d.data))
            .catch(() => {});
        fetch('/api/testimonials')
            .then((res) => res.json())
            .then((d) => d.success && setTestimonials(d.data))
            .catch(() => {});
        fetch('/api/faqs')
            .then((res) => res.json())
            .then((d) => d.success && setFaqs(d.data))
            .catch(() => {});
        fetch('/api/experiences')
            .then((res) => res.json())
            .then((d) => d.success && setExperiences(d.data))
            .catch(() => {});
        fetch('/api/techstack')
            .then((res) => res.json())
            .then((d) => d.success && setTechStack(d.data))
            .catch(() => {});
        fetch('/api/blogs')
            .then((res) => res.json())
            .then((d) => d.success && setBlogs(d.data))
            .catch(() => {});
    }, []);

    // Auto-advance hero slides
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroSlides]);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactSubmitting(true);
        setContactStatus(null);
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactForm)
            });
            const data = await res.json();
            if (data.success) {
                setContactStatus({ type: 'success', message: data.message });
                setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setContactStatus({ type: 'error', message: data.error || 'Failed to send message.' });
            }
        } catch {
            setContactStatus({ type: 'error', message: 'An error occurred. Please try again.' });
        } finally {
            setContactSubmitting(false);
        }
    };

    const getServiceIcon = (iconName: string) => {
        switch (iconName?.toLowerCase()) {
            case 'server':
                return <Server className="w-7 h-7 text-emerald-600" />;
            case 'layout':
                return <Layout className="w-7 h-7 text-emerald-600" />;
            case 'globe':
                return <Globe className="w-7 h-7 text-emerald-600" />;
            default:
                return <Code className="w-7 h-7 text-emerald-600" />;
        }
    };

    const getProcessIcon = (iconName: string) => {
        switch (iconName?.toLowerCase()) {
            case 'search':
                return <Search className="w-6 h-6 text-emerald-600" />;
            case 'code':
                return <Code className="w-6 h-6 text-emerald-600" />;
            case 'rocket':
                return <Rocket className="w-6 h-6 text-emerald-600" />;
            default:
                return <Compass className="w-6 h-6 text-emerald-600" />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Navbar />

            <main className="flex-grow">
                {/* ============================================================ */}
                {/* 1. HERO CAROUSEL */}
                {/* ============================================================ */}
                <section id="hero" className="relative bg-slate-900 text-white overflow-hidden">
                    {heroSlides.length > 0 ? (
                        <div className="relative min-h-[520px] sm:min-h-[620px] flex items-center">
                            {heroSlides.map((slide, index) => (
                                <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                                    {/* Slide Background Image */}
                                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover opacity-30 scale-105 transition-transform duration-10000" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent flex items-center">
                                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
                                            <div className="max-w-2xl space-y-6">
                                                <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
                                                    <Sparkles className="w-4 h-4 text-emerald-400" /> Featured Highlight
                                                </span>
                                                <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">{slide.title}</h1>
                                                <p className="text-base sm:text-xl text-slate-300 leading-relaxed">{slide.subtitle}</p>
                                                <div className="pt-2">
                                                    <a
                                                        href={slide.button_link || '#projects'}
                                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-900/50 hover:shadow-emerald-600/30 transition-all duration-300"
                                                    >
                                                        <span>{slide.button_text || 'Explore More'}</span>
                                                        <ArrowRight className="w-5 h-5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Navigation Controls */}
                            {heroSlides.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentSlideIndex((currentSlideIndex - 1 + heroSlides.length) % heroSlides.length)}
                                        className="absolute left-4 z-20 p-3 rounded-full bg-slate-950/50 hover:bg-emerald-600 text-white transition backdrop-blur-sm"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentSlideIndex((currentSlideIndex + 1) % heroSlides.length)}
                                        className="absolute right-4 z-20 p-3 rounded-full bg-slate-950/50 hover:bg-emerald-600 text-white transition backdrop-blur-sm"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
                                        {heroSlides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentSlideIndex(idx)}
                                                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-8 bg-emerald-500' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="py-24 text-center max-w-7xl mx-auto px-4">
                            <h1 className="text-4xl font-extrabold mb-4">HMoni Portfolio & Digital Platform</h1>
                            <p className="text-slate-400">Loading hero slider...</p>
                        </div>
                    )}
                </section>

                {/* ============================================================ */}
                {/* 2. HIGHLIGHTED PROJECTS & PROJECTS */}
                {/* ============================================================ */}
                <section id="projects" className="py-20 bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Portfolio Showcase</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Highlighted Projects & Recent Work</h2>
                            <p className="text-slate-600 text-base mt-3">Explore our featured web applications, software tools, and digital solutions.</p>
                        </div>

                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.map((project) => (
                                    <div key={project.id} className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                                        <div className="relative h-56 overflow-hidden bg-slate-200">
                                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {project.is_highlighted ? <span className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow">★ Highlighted</span> : null}
                                            <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-emerald-400 text-[11px] font-medium px-2.5 py-1 rounded">{project.category}</span>
                                        </div>

                                        <div className="p-6 flex-grow flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">{project.title}</h3>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-4">{project.description}</p>
                                            </div>

                                            {project.project_url && (
                                                <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-sm hover:text-emerald-800 transition">
                                                    <span>Visit Project</span>
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">No projects added yet. Add projects from Admin panel.</div>
                        )}
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 3. SERVICES */}
                {/* ============================================================ */}
                <section id="services" className="py-20 bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-800">Services & Capabilities</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">Professional Engineering & Solutions</h2>
                            <p className="text-slate-400 text-base mt-3">Custom web development, database architecture, UI design, and cloud hosting services.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {services.map((service) => (
                                <div key={service.id} className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300">
                                    <div className="w-14 h-14 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center mb-6">{getServiceIcon(service.icon)}</div>
                                    <h3 className="font-bold text-xl text-white mb-3">{service.title}</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">{service.short_description}</p>
                                    {service.price_starting && (
                                        <div className="text-xs font-semibold text-emerald-400 border-t border-slate-700/60 pt-4 flex justify-between items-center">
                                            <span>Starting at:</span>
                                            <span className="text-base font-bold text-white">{service.price_starting}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 4. PROCESS PHILOSOPHY / MY PROCESS */}
                {/* ============================================================ */}
                <section id="process" className="py-20 bg-slate-50 border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Workflow & Strategy</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Process Philosophy & Execution</h2>
                            <p className="text-slate-600 text-base mt-3">How we take projects from initial concept to high quality production delivery.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {processSteps.map((step) => (
                                <div key={step.id} className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mb-5">0{step.step_number}</div>
                                    <div className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-2">
                                        {getProcessIcon(step.icon)}
                                        <h3>{step.title}</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 5. EXPERIENCE */}
                {/* ============================================================ */}
                <section id="experience" className="py-20 bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Track Record</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Professional Experience & Background</h2>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {experiences.map((exp) => (
                                <div key={exp.id} className="p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-emerald-600" />
                                            <h3 className="font-bold text-xl text-slate-900">{exp.designation}</h3>
                                        </div>
                                        <p className="text-emerald-700 font-semibold text-sm mt-1">
                                            {exp.company_name} {exp.location && `• ${exp.location}`}
                                        </p>
                                        <p className="text-slate-600 text-sm mt-3 leading-relaxed">{exp.description}</p>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full shrink-0">{exp.duration}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 6. TECH STACK / TOOLS */}
                {/* ============================================================ */}
                <section id="techstack" className="py-20 bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-800">Skills & Stack</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">Tech Stack & Development Tools</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                            {techStack.map((tech) => (
                                <div key={tech.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center hover:border-emerald-500 transition">
                                    {tech.icon_url ? <img src={tech.icon_url} alt={tech.name} className="w-12 h-12 mx-auto mb-3 object-contain" /> : <Layers className="w-10 h-10 text-emerald-400 mx-auto mb-3" />}
                                    <h4 className="font-bold text-white text-base">{tech.name}</h4>
                                    <span className="text-xs text-slate-400 block mt-1">{tech.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 7. TESTIMONIALS / HAPPY CUSTOMERS */}
                {/* ============================================================ */}
                <section id="testimonials" className="py-20 bg-slate-50 border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Happy Customers</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Client Testimonials & Feedback</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {testimonials.map((t) => (
                                <div key={t.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex text-amber-400 space-x-1 mb-4">
                                            {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-slate-700 text-base italic leading-relaxed mb-6">&quot;{t.comment}&quot;</p>
                                    </div>

                                    <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                                        {t.avatar_url ? (
                                            <img src={t.avatar_url} alt={t.client_name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">{t.client_name.charAt(0)}</div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-900">{t.client_name}</h4>
                                            <p className="text-xs text-slate-500">
                                                {t.designation} {t.company && `at ${t.company}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 8. FAQ */}
                {/* ============================================================ */}
                <section id="faq" className="py-20 bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Questions & Answers</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Frequently Asked Questions</h2>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq) => (
                                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <button onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)} className="w-full text-left p-5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-900 flex justify-between items-center transition">
                                        <span className="flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                            {faq.question}
                                        </span>
                                        <span className="text-xl">{openFaqId === faq.id ? '−' : '+'}</span>
                                    </button>

                                    {openFaqId === faq.id && <div className="p-5 bg-white text-slate-600 text-sm leading-relaxed border-t border-slate-200">{faq.answer}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 9. BLOG & RESOURCES */}
                {/* ============================================================ */}
                <section id="blogs" className="py-20 bg-slate-50 border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Latest Articles</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Blog & Resources</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {blogs.map((b) => (
                                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                                    <div>
                                        {b.cover_image && (
                                            <div className="h-48 overflow-hidden bg-slate-100">
                                                <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-2">{b.read_time}</span>
                                            <h3 className="font-bold text-lg text-slate-900 mb-2 hover:text-emerald-700 transition">{b.title}</h3>
                                            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">{b.excerpt}</p>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 pt-0">
                                        <Link href={`/blog/${b.id}`} className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm hover:text-emerald-800 transition">
                                            <span>Read Article</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 10. CONTACT */}
                {/* ============================================================ */}
                <section id="contact" className="py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">Get In Touch</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Contact Us & Inquiries</h2>
                            <p className="text-slate-600 text-base mt-3">Have a project or question? Send us a message and we will respond promptly.</p>
                        </div>

                        <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
                            {contactStatus && (
                                <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${contactStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                    <span>{contactStatus.message}</span>
                                </div>
                            )}

                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={contactForm.email}
                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            value={contactForm.phone}
                                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                            placeholder="+880 1700-000000"
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject</label>
                                        <input
                                            type="text"
                                            value={contactForm.subject}
                                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                            placeholder="Project Inquiry"
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                        placeholder="Tell us about your project requirements..."
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={contactSubmitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" />
                                    <span>{contactSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
