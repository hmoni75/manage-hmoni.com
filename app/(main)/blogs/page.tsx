/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';

interface ImageUploadBoxProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    helperText?: string;
    height?: string;
}

function ImageUploadBox({ label, value, onChange, helperText, height = '150px' }: ImageUploadBoxProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, WEBP, SVG, etc.)');
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            alert('Image must be less than 12MB');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (!result) {
                setUploading(false);
                return;
            }

            if (file.type.includes('svg') || file.type.includes('gif')) {
                onChange(result);
                setUploading(false);
                return;
            }

            const img = new Image();
            img.onload = () => {
                const maxDim = 1920;
                let width = img.width;
                let height = img.height;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    let optimized = canvas.toDataURL('image/webp', 0.85);
                    if (!optimized.startsWith('data:image/webp')) {
                        optimized = canvas.toDataURL('image/jpeg', 0.85);
                    }
                    onChange(optimized);
                } else {
                    onChange(result);
                }
                setUploading(false);
            };
            img.onerror = () => {
                onChange(result);
                setUploading(false);
            };
            img.src = result;
        };
        reader.onerror = () => setUploading(false);
        reader.readAsDataURL(file);
    };

    return (
        <div className="surface-card border-1 surface-border border-round p-3 flex flex-column h-full">
            <div className="flex justify-content-between align-items-center mb-2">
                <label className="font-semibold text-sm text-900">{label}</label>
                <button type="button" className="p-link text-xs text-primary font-medium" onClick={() => setShowUrlInput(!showUrlInput)}>
                    {showUrlInput ? 'Upload File' : 'Enter URL'}
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
            />

            {value ? (
                <div className="flex flex-column gap-2 flex-1">
                    <div className="relative border-round overflow-hidden bg-black-alpha-10 flex align-items-center justify-content-center shadow-1" style={{ height, width: '100%' }}>
                        <img
                            src={value}
                            alt={label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => {
                                e.target.src = 'https://via.placeholder.com/400x250?text=Invalid+Image';
                            }}
                        />
                    </div>
                    <div className="flex justify-content-between align-items-center gap-2">
                        <span className="text-xs text-500 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '160px' }}>
                            {value.startsWith('data:') ? '✅ Uploaded (Ready)' : value}
                        </span>
                        <div className="flex gap-1">
                            <Button type="button" icon="pi pi-upload" size="small" outlined tooltip="Change Image" onClick={() => fileInputRef.current?.click()} disabled={uploading} />
                            <Button type="button" icon="pi pi-trash" severity="danger" size="small" text tooltip="Remove Image" onClick={() => onChange('')} />
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processFile(file);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed border-round p-3 text-center cursor-pointer transition-all flex flex-column align-items-center justify-content-center flex-1 ${
                        isDragging ? 'border-primary surface-100' : 'surface-border surface-50 hover:surface-100'
                    }`}
                    style={{ minHeight: height }}
                >
                    <i className="pi pi-cloud-upload text-3xl text-primary mb-2 block" />
                    <span className="font-semibold text-xs text-900 mb-1">{uploading ? 'Compressing...' : 'Click to Upload'}</span>
                    <span className="text-xs text-500">Drag & drop image (PNG, JPG, WEBP)</span>
                </div>
            )}

            {showUrlInput && (
                <div className="mt-2">
                    <InputText className="w-full text-xs" placeholder="e.g. /assets/imgs/pages/img-212.webp or https://..." value={value} onChange={(e) => onChange(e.target.value)} />
                </div>
            )}

            {helperText && <small className="text-500 block mt-2 text-xs">{helperText}</small>}
        </div>
    );
}

export default function BlogsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [activeTab, setActiveTab] = useState(0);
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blogs', { cache: 'no-store' });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setData(json.data);
            } else {
                setData([]);
            }
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openNew = () => {
        setEditingItem(null);
        setActiveTab(0);
        setFormData({
            title: '',
            slug: '',
            category: 'The World is Changing',
            author: 'Amelia Courtney',
            author_avatar: '',
            date_str: 'Just now',
            tags: 'UI / UX Design, Photography, Digital Marketing',
            is_published: 1,
            image_url: '',
            cover_image: '',
            gallery_img1: '',
            gallery_img2: '',
            banner_img: '',
            banner_caption: '',
            excerpt: '',
            content: '',
            section1_title: '',
            section1_desc: '',
            section2_title: '',
            section2_desc: ''
        });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setActiveTab(0);

        let details: any = {};
        if (item.details_json) {
            try {
                details = typeof item.details_json === 'string' ? JSON.parse(item.details_json) : item.details_json;
            } catch {
                details = {};
            }
        }

        const cover = item.cover_image || item.image_url || item.img || '';

        setFormData({
            ...item,
            title: item.title || '',
            slug: item.slug || '',
            category: item.category || 'The World is Changing',
            author: item.author || item.author_name || 'Amelia Courtney',
            author_avatar: item.author_avatar || details.author_avatar || '',
            date_str: item.date_str || '25 minutes ago',
            tags: item.tags || (Array.isArray(details.tags_list) ? details.tags_list.join(', ') : ''),
            is_published: item.is_published ?? 1,
            cover_image: cover,
            image_url: cover,
            gallery_img1: item.gallery_img1 || details.gallery_img1 || '',
            gallery_img2: item.gallery_img2 || details.gallery_img2 || '',
            banner_img: item.banner_img || details.banner_img || '',
            banner_caption: item.banner_caption || details.banner_caption || '',
            excerpt: item.excerpt || '',
            content: item.content || '',
            section1_title: item.section1_title || details.section1_title || '',
            section1_desc: item.section1_desc || details.section1_desc || '',
            section2_title: item.section2_title || details.section2_title || '',
            section2_desc: item.section2_desc || details.section2_desc || ''
        });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Blog deleted' });
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const saveItem = async () => {
        if (!formData.title || !formData.title.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Blog Title is required' });
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const cover = formData.cover_image || formData.image_url || '';

        const payload = {
            ...formData,
            cover_image: cover,
            image_url: cover,
            img: cover,
            id: editingItem ? editingItem.id : undefined
        };

        try {
            const res = await fetch('/api/blogs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Blog post saved' });
                setDialogOpen(false);
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const imageTemplate = (row: any) => {
        const img = row.cover_image || row.image_url || row.img;
        if (!img) return <span className="text-400 italic text-sm">No cover</span>;
        const isDataUrl = img.startsWith('data:');
        return (
            <div className="flex align-items-center gap-2">
                <img
                    src={img}
                    alt={row.title}
                    className="border-round shadow-1"
                    style={{ width: '56px', height: '40px', objectFit: 'cover' }}
                    onError={(e: any) => {
                        e.target.style.display = 'none';
                    }}
                />
                <span className="text-xs text-500 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '70px' }}>
                    {isDataUrl ? '[Photo Ready]' : img}
                </span>
            </div>
        );
    };

    const authorTemplate = (row: any) => {
        return (
            <div className="flex align-items-center gap-2">
                {row.author_avatar ? (
                    <img src={row.author_avatar} alt="Avatar" className="border-circle" style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
                ) : (
                    <i className="pi pi-user text-primary" />
                )}
                <div>
                    <span className="font-semibold text-900 block text-xs">{row.author || row.author_name || 'HMoni'}</span>
                    <span className="text-500 text-xs">{row.date_str || 'Recent'}</span>
                </div>
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Blog" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Blog" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Blog Articles & Detailed Insights</h3>
                    <p className="text-600 m-0 mt-1">Manage articles, authors, cover photos, gallery images, and full deep-dive case studies</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Article" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No blog articles found.">
                <Column header="Cover" body={imageTemplate} style={{ width: '12%' }} />
                <Column
                    field="title"
                    header="Article Title & Slug"
                    body={(r) => (
                        <div>
                            <span className="font-bold text-900 block text-base">{r.title}</span>
                            <span className="text-xs text-500 font-mono">/{r.slug}</span>
                        </div>
                    )}
                    style={{ width: '32%' }}
                />
                <Column
                    field="category"
                    header="Category"
                    body={(r) => <Tag value={r.category || 'General'} severity="info" className="text-xs" />}
                    style={{ width: '16%' }}
                />
                <Column header="Author & Date" body={authorTemplate} style={{ width: '18%' }} />
                <Column
                    field="is_published"
                    header="Status"
                    body={(r) => (r.is_published ? <Tag severity="success" value="Published" /> : <Tag severity="warning" value="Draft" />)}
                    style={{ width: '10%' }}
                />
                <Column body={actionBody} header="Actions" style={{ width: '12%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '850px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Blog Article: ${formData.title || 'New Post'}`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Article" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)} className="mt-2">
                    {/* TAB 1: OVERVIEW & META */}
                    <TabPanel header="1. Overview & Meta" leftIcon="pi pi-info-circle mr-2">
                        <div className="flex flex-column gap-3 pt-2">
                            <div>
                                <label className="font-bold block mb-1">Article Title *</label>
                                <InputText
                                    className="w-full text-base font-semibold"
                                    placeholder="e.g. Creating Digital Experiences That Stand the Test of Time"
                                    value={formData.title || ''}
                                    onChange={(e) => {
                                        const newTitle = e.target.value;
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            title: newTitle,
                                            slug: prev.slug ? prev.slug : newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                        }));
                                    }}
                                />
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">URL Slug</label>
                                    <InputText
                                        className="w-full font-mono text-sm"
                                        placeholder="creating-digital-experiences-that-stand-the-test-of-time"
                                        value={formData.slug || ''}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">Category</label>
                                    <InputText
                                        className="w-full"
                                        placeholder="e.g. The World is Changing"
                                        value={formData.category || ''}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">Author Name</label>
                                    <InputText
                                        className="w-full"
                                        placeholder="e.g. Amelia Courtney"
                                        value={formData.author || ''}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">Publish Time / Date Display</label>
                                    <InputText
                                        className="w-full"
                                        placeholder="e.g. 25 minutes ago or May 2024"
                                        value={formData.date_str || ''}
                                        onChange={(e) => setFormData({ ...formData, date_str: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold block mb-1">Tags (Comma-separated)</label>
                                <InputText
                                    className="w-full"
                                    placeholder="e.g. UI / UX Design, Photography, Digital Marketing"
                                    value={formData.tags || ''}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                                <small className="text-500 block mt-1">These appear as pill badges at the bottom of the article.</small>
                            </div>

                            <div className="grid align-items-center">
                                <div className="col-12 md:col-6">
                                    <ImageUploadBox
                                        label="Author Avatar / Photo"
                                        value={formData.author_avatar || ''}
                                        onChange={(val) => setFormData({ ...formData, author_avatar: val })}
                                        helperText="Small profile photo (e.g. /assets/imgs/template/avatar/avatar-21.webp)"
                                        height="100px"
                                    />
                                </div>
                                <div className="col-12 md:col-6 pl-md-4">
                                    <label className="font-bold block mb-2">Publish Status</label>
                                    <div className="flex align-items-center gap-3">
                                        <InputSwitch
                                            checked={Boolean(formData.is_published)}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.value ? 1 : 0 })}
                                        />
                                        <span className="font-semibold text-sm">
                                            {formData.is_published ? 'Published (Live)' : 'Draft (Hidden)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* TAB 2: ARTICLE PHOTOS & GALLERY */}
                    <TabPanel header="2. Cover & Article Photos" leftIcon="pi pi-images mr-2">
                        <div className="flex flex-column gap-4 pt-2">
                            <div>
                                <ImageUploadBox
                                    label="Main Cover Image (Hero Banner)"
                                    value={formData.cover_image || formData.image_url || ''}
                                    onChange={(val) => setFormData({ ...formData, cover_image: val, image_url: val, img: val })}
                                    helperText="The primary full-width image displayed at the top of the article (e.g. img-212.webp)"
                                    height="200px"
                                />
                            </div>

                            <div>
                                <h6 className="font-bold mb-2">Mid-Article Side-by-Side Photos (Gallery)</h6>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <ImageUploadBox
                                            label="Gallery Image 1 (Left)"
                                            value={formData.gallery_img1 || ''}
                                            onChange={(val) => setFormData({ ...formData, gallery_img1: val })}
                                            helperText="e.g. /assets/imgs/pages/img-213.webp"
                                            height="150px"
                                        />
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <ImageUploadBox
                                            label="Gallery Image 2 (Right)"
                                            value={formData.gallery_img2 || ''}
                                            onChange={(val) => setFormData({ ...formData, gallery_img2: val })}
                                            helperText="e.g. /assets/imgs/pages/img-214.webp"
                                            height="150px"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h6 className="font-bold mb-2">Mid-Article Wide Banner Image</h6>
                                <ImageUploadBox
                                    label="Wide Architecture / Landscape Banner"
                                    value={formData.banner_img || ''}
                                    onChange={(val) => setFormData({ ...formData, banner_img: val })}
                                    helperText="Large landscape break image (e.g. /assets/imgs/pages/img-215.webp)"
                                    height="160px"
                                />
                                <div className="mt-2">
                                    <label className="font-semibold block mb-1 text-sm">Banner Image Caption</label>
                                    <InputText
                                        className="w-full text-sm"
                                        placeholder="e.g. Image by Ali Studio"
                                        value={formData.banner_caption || ''}
                                        onChange={(e) => setFormData({ ...formData, banner_caption: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* TAB 3: CONTENT & DEEP-DIVE PRINCIPLES */}
                    <TabPanel header="3. Content & Principles" leftIcon="pi pi-file-edit mr-2">
                        <div className="flex flex-column gap-3 pt-2">
                            <div>
                                <label className="font-bold block mb-1">Lead / Intro Paragraph (Large Text)</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={3}
                                    placeholder="In a digital landscape that evolves at an unprecedented pace, designing experiences that remain relevant over time..."
                                    value={formData.excerpt || ''}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1">Main Article Body (Markdown or Paragraphs)</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={6}
                                    placeholder="Visual trends can spark attention, but longevity comes from purpose-driven design..."
                                    value={formData.content || ''}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div className="surface-100 border-round p-3 mt-2">
                                <h6 className="font-bold mb-3">Key Design Principle Blocks (Side-by-Side Sections)</h6>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <label className="font-semibold block mb-1 text-sm">Principle 1 Title</label>
                                        <InputText
                                            className="w-full mb-2 font-semibold"
                                            placeholder="e.g. Clarity as a Design Principle"
                                            value={formData.section1_title || ''}
                                            onChange={(e) => setFormData({ ...formData, section1_title: e.target.value })}
                                        />
                                        <label className="font-semibold block mb-1 text-xs text-600">Principle 1 Content</label>
                                        <InputTextarea
                                            className="w-full text-sm"
                                            rows={4}
                                            placeholder="As digital products become more complex, clarity becomes increasingly valuable..."
                                            value={formData.section1_desc || ''}
                                            onChange={(e) => setFormData({ ...formData, section1_desc: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <label className="font-semibold block mb-1 text-sm">Principle 2 Title</label>
                                        <InputText
                                            className="w-full mb-2 font-semibold"
                                            placeholder="e.g. Aligning Design with Strategy"
                                            value={formData.section2_title || ''}
                                            onChange={(e) => setFormData({ ...formData, section2_title: e.target.value })}
                                        />
                                        <label className="font-semibold block mb-1 text-xs text-600">Principle 2 Content</label>
                                        <InputTextarea
                                            className="w-full text-sm"
                                            rows={4}
                                            placeholder="Enduring digital experiences are not created in isolation. They are the result of close alignment..."
                                            value={formData.section2_desc || ''}
                                            onChange={(e) => setFormData({ ...formData, section2_desc: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Dialog>
        </div>
    );
}
