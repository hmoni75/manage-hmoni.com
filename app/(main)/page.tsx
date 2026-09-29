/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import Link from 'next/link';

interface SectionCard {
    title: string;
    route: string;
    icon: string;
    color: string;
    bg: string;
    api: string;
    description: string;
}

const sections: SectionCard[] = [
    { title: 'Hero Carousel', route: '/hero', icon: 'pi-images', color: 'text-indigo-600', bg: 'bg-indigo-100', api: '/api/hero', description: 'Homepage banner slides and calls to action' },
    { title: 'Projects', route: '/projects', icon: 'pi-briefcase', color: 'text-blue-600', bg: 'bg-blue-100', api: '/api/projects', description: 'Portfolio project showcases & highlighted works' },
    { title: 'Services', route: '/services', icon: 'pi-cog', color: 'text-teal-600', bg: 'bg-teal-100', api: '/api/services', description: 'Offered services & solution categories' },
    { title: 'Process Philosophy', route: '/process', icon: 'pi-compass', color: 'text-cyan-600', bg: 'bg-cyan-100', api: '/api/process', description: 'Project workflow and development process' },
    { title: 'Testimonials', route: '/testimonials', icon: 'pi-star', color: 'text-yellow-600', bg: 'bg-yellow-100', api: '/api/testimonials', description: 'Client feedback, reviews, and ratings' },
    { title: 'FAQs', route: '/faqs', icon: 'pi-question-circle', color: 'text-green-600', bg: 'bg-green-100', api: '/api/faqs', description: 'Frequently asked questions & answers' },
    { title: 'Experience', route: '/experiences', icon: 'pi-id-card', color: 'text-purple-600', bg: 'bg-purple-100', api: '/api/experiences', description: 'Work history, positions, and company roles' },
    { title: 'Tech Stack', route: '/techstack', icon: 'pi-wrench', color: 'text-pink-600', bg: 'bg-pink-100', api: '/api/techstack', description: 'Frameworks, technologies, and proficiency' },
    { title: 'Blog & Resources', route: '/blogs', icon: 'pi-book', color: 'text-orange-600', bg: 'bg-orange-100', api: '/api/blogs', description: 'Articles, published blogs, and resources' },
    { title: 'Social Media', route: '/socials', icon: 'pi-share-alt', color: 'text-blue-500', bg: 'bg-blue-50', api: '/api/socials', description: 'Social profiles on GitHub, LinkedIn, Facebook' },
    { title: 'Contact Messages', route: '/contacts', icon: 'pi-envelope', color: 'text-red-600', bg: 'bg-red-100', api: '/api/contacts', description: 'Messages and inquiries sent by visitors' },
    { title: 'Stats & Counters', route: '/stats', icon: 'pi-chart-bar', color: 'text-emerald-600', bg: 'bg-emerald-100', api: '/api/stats', description: 'Happy clients, completed projects, and counters' },
    { title: 'Site Settings', route: '/settings', icon: 'pi-sliders-h', color: 'text-slate-600', bg: 'bg-slate-100', api: '/api/settings', description: 'Global brand name, contacts, meta keywords' }
];

export default function DashboardPage() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const loadCounts = async () => {
        setLoading(true);
        const newCounts: Record<string, number> = {};
        await Promise.all(
            sections.map(async (sec) => {
                try {
                    const res = await fetch(sec.api, { cache: 'no-store' });
                    const json = await res.json();
                    if (json.success && Array.isArray(json.data)) {
                        newCounts[sec.title] = json.data.length;
                    } else {
                        newCounts[sec.title] = 0;
                    }
                } catch {
                    newCounts[sec.title] = 0;
                }
            })
        );
        setCounts(newCounts);
        setLoading(false);
    };

    useEffect(() => {
        loadCounts();
    }, []);

    return (
        <div>
            {/* Header Banner */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 flex flex-column md:flex-row justify-content-between align-items-center gap-3">
                <div>
                    <h2 className="text-3xl font-bold text-900 m-0">HMoni CMS & Portfolio Dashboard</h2>
                    <p className="text-600 font-medium m-0 mt-1">Directly manage each section via dedicated routes with full add, edit, and delete controls.</p>
                </div>
                <Button label="Refresh Overview" icon="pi pi-refresh" severity="secondary" outlined onClick={loadCounts} loading={loading} />
            </div>

            {/* Quick Section Cards Grid */}
            <div className="grid">
                {sections.map((sec) => (
                    <div key={sec.title} className="col-12 sm:col-6 lg:col-4 xl:col-3">
                        <Link href={sec.route} className="no-underline">
                            <div className="card mb-0 shadow-2 border-round-xl surface-card hover:surface-hover transition-all transition-duration-200 cursor-pointer h-full flex flex-column justify-content-between">
                                <div>
                                    <div className="flex justify-content-between align-items-center mb-3">
                                        <span className="block text-900 font-bold text-lg">{sec.title}</span>
                                        <div className={`flex align-items-center justify-content-center ${sec.bg} border-round-circle`} style={{ width: '2.8rem', height: '2.8rem' }}>
                                            <i className={`pi ${sec.icon} ${sec.color} text-xl`} />
                                        </div>
                                    </div>
                                    <p className="text-500 text-sm m-0 line-height-3">{sec.description}</p>
                                </div>
                                <div className="flex justify-content-between align-items-center mt-3 pt-3 border-top-1 surface-border">
                                    <span className="text-700 font-semibold text-xs">Total Records</span>
                                    <span className={`font-bold text-xl ${sec.color}`}>{counts[sec.title] ?? '-'}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
