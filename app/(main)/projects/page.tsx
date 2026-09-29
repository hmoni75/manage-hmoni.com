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
import { InputNumber } from 'primereact/inputnumber';
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
                            {value.startsWith('data:') ? '✅ Uploaded (Base64)' : value}
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
                    <i className="pi pi-cloud-upload text-3xl text-primary mb-1" />
                    <span className="font-medium text-xs text-800">{uploading ? 'Compressing...' : 'Click to Upload or Drag File'}</span>
                    <span className="text-xs text-400 mt-1">{helperText || 'PNG, JPG, WEBP (up to 12MB)'}</span>
                </div>
            )}

            {showUrlInput && (
                <div className="mt-2">
                    <InputText className="w-full text-xs p-inputtext-sm" placeholder="e.g. /assets/imgs/... or https://..." value={value || ''} onChange={(e) => onChange(e.target.value)} />
                </div>
            )}
        </div>
    );
}

export default function ProjectsPage() {
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
            const res = await fetch('/api/projects', { cache: 'no-store' });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setData(json.data);
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
        setFormData({
            title: '',
            category: 'Fashion Brand Identity Design',
            client: '',
            release_date: new Date().getFullYear().toString(),
            role: 'UI/UX Designer',
            duration: '6 Weeks',
            project_url: '',
            link: '/portfolio-details-1',
            is_highlighted: 1,
            sort_order: (data.length || 0) + 1,
            description: '',
            challenge: '',
            solution: '',
            key_features: '',
            outcome: '',
            testimonial_quote: '',
            testimonial_author: '',
            testimonial_role: '',
            image_url: '',
            detail_image_1: '',
            detail_image_2: '',
            detail_image_3: '',
            detail_image_4: ''
        });
        setActiveTab(0);
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({
            ...item,
            image_url: item.image_url || item.img || ''
        });
        setActiveTab(0);
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Project deleted' });
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
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Project Title is required' });
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const payload = editingItem ? { ...formData, id: editingItem.id } : formData;

        try {
            const res = await fetch('/api/projects', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Project saved successfully' });
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
        const img = row.image_url || row.img;
        if (!img) return <span className="text-400 italic text-xs">No image</span>;
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
            </div>
        );
    };

    const detailsThumbnailsTemplate = (row: any) => {
        const details = [row.detail_image_1, row.detail_image_2, row.detail_image_3, row.detail_image_4].filter(Boolean);
        if (details.length === 0) return <span className="text-400 text-xs italic">0 / 4</span>;
        return (
            <div className="flex gap-1 align-items-center">
                {details.map((src: string, idx: number) => (
                    <img
                        key={idx}
                        src={src}
                        alt={`Detail ${idx + 1}`}
                        className="border-round border-1 surface-border"
                        style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                        onError={(e: any) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ))}
                <span className="text-xs text-500 font-semibold ml-1">({details.length}/4)</span>
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Project" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Project" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Projects & Highlighted Projects</h3>
                    <p className="text-600 m-0 mt-1">Live portfolio showcase projects with 1 Main Image & 4 Detail Images</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Project" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No projects found in database.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column header="Cover" body={imageTemplate} style={{ width: '8%' }} />
                <Column
                    header="Project & Client"
                    body={(r) => (
                        <div>
                            <div className="font-bold text-900">{r.title}</div>
                            <div className="text-xs text-500">{r.client ? `${r.client} • ${r.release_date || ''}` : r.category}</div>
                        </div>
                    )}
                    style={{ width: '25%' }}
                />
                <Column field="category" header="Category" style={{ width: '18%' }} />
                <Column header="Detail Images" body={detailsThumbnailsTemplate} style={{ width: '16%' }} />
                <Column
                    field="is_highlighted"
                    header="Status"
                    body={(r) => (r.is_highlighted || r.featured ? <Tag severity="success" value="Highlighted" icon="pi pi-star-fill" /> : <Tag severity="info" value="Standard" />)}
                    style={{ width: '13%' }}
                />
                <Column body={actionBody} header="Actions" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '880px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit Project' : 'Add New Project'}: ${formData.title || 'Untitled'}`}
                modal
                className="p-fluid"
                footer={
                    <div className="flex justify-content-between align-items-center w-full">
                        <div className="text-xs text-500 font-italic">* All changes are saved directly to MySQL database</div>
                        <div className="flex gap-2">
                            <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                            <Button label="Save Project" icon="pi pi-check" onClick={saveItem} />
                        </div>
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)} className="mt-2">
                    {/* TAB 1: BASIC & META INFO */}
                    <TabPanel header="Basic & Meta Info" leftIcon="pi pi-info-circle mr-2">
                        <div className="flex flex-column gap-3 pt-2">
                            <div className="grid">
                                <div className="col-12 md:col-8">
                                    <label className="font-bold block mb-1">Project Title *</label>
                                    <InputText className="w-full" placeholder="e.g. Nebula®" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="col-12 md:col-4">
                                    <label className="font-bold block mb-1">Category</label>
                                    <InputText className="w-full" placeholder="e.g. Fashion Brand Identity Design" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-3">
                                    <label className="font-bold block mb-1">Client</label>
                                    <InputText className="w-full" placeholder="e.g. Nebula Labs" value={formData.client || ''} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="font-bold block mb-1">Release Date</label>
                                    <InputText className="w-full" placeholder="e.g. 2024" value={formData.release_date || ''} onChange={(e) => setFormData({ ...formData, release_date: e.target.value })} />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="font-bold block mb-1">Role</label>
                                    <InputText className="w-full" placeholder="e.g. UI/UX Designer" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="font-bold block mb-1">Duration</label>
                                    <InputText className="w-full" placeholder="e.g. 6 Weeks" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">Live Demo URL</label>
                                    <InputText
                                        className="w-full"
                                        placeholder="e.g. http://localhost:5173/portfolio-details-1"
                                        value={formData.project_url || ''}
                                        onChange={(e) => setFormData({ ...formData, project_url: e.target.value, link: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">GitHub / Code URL</label>
                                    <InputText className="w-full" placeholder="e.g. https://github.com/..." value={formData.github_url || ''} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-8">
                                    <label className="font-bold block mb-1">Technologies / Tags</label>
                                    <InputText className="w-full" placeholder="e.g. Fashion, Branding, UI/UX, Identity" value={formData.tech_used || ''} onChange={(e) => setFormData({ ...formData, tech_used: e.target.value })} />
                                </div>
                                <div className="col-12 md:col-4">
                                    <label className="font-bold block mb-1">Sort Order</label>
                                    <InputNumber className="w-full" value={formData.sort_order || 0} onValueChange={(e) => setFormData({ ...formData, sort_order: e.value })} />
                                </div>
                            </div>

                            <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border mt-1">
                                <InputSwitch checked={!!formData.is_highlighted} onChange={(e) => setFormData({ ...formData, is_highlighted: e.value ? 1 : 0, featured: e.value ? 1 : 0 })} />
                                <div>
                                    <div className="font-bold text-900">Highlight on Home Page</div>
                                    <div className="text-xs text-600">Feature this project in the Highlighted Projects / Home portfolio showcase</div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* TAB 2: IMAGES (1 MAIN + 4 DETAILS) */}
                    <TabPanel header="Project Images (1 Main + 4 Details)" leftIcon="pi pi-images mr-2">
                        <div className="flex flex-column gap-3 pt-2">
                            {/* Main Image */}
                            <div>
                                <h4 className="m-0 mb-1 font-bold text-900">1. Main Showcase / Cover Image *</h4>
                                <p className="text-xs text-500 m-0 mb-2">This is the hero/cover image shown on the portfolio list and top banner</p>
                                <ImageUploadBox
                                    label="Main Cover Image"
                                    value={formData.image_url || ''}
                                    onChange={(val) => setFormData({ ...formData, image_url: val, img: val })}
                                    height="200px"
                                    helperText="Recommended: 1200x800 or 1920x1080 (auto-compressed)"
                                />
                            </div>

                            {/* 4 Detail Images */}
                            <div className="mt-2">
                                <h4 className="m-0 mb-1 font-bold text-900">2. Portfolio Detail Images (4 Images)</h4>
                                <p className="text-xs text-500 m-0 mb-3">Upload the 4 gallery / detail images for the full case study presentation</p>

                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <ImageUploadBox label="Detail Image 1 (Lookbook / Art)" value={formData.detail_image_1 || ''} onChange={(val) => setFormData({ ...formData, detail_image_1: val })} height="140px" />
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <ImageUploadBox label="Detail Image 2 (System / Typography)" value={formData.detail_image_2 || ''} onChange={(val) => setFormData({ ...formData, detail_image_2: val })} height="140px" />
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <ImageUploadBox label="Detail Image 3 (Packaging / Touchpoint)" value={formData.detail_image_3 || ''} onChange={(val) => setFormData({ ...formData, detail_image_3: val })} height="140px" />
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <ImageUploadBox label="Detail Image 4 (Digital UI / Platform)" value={formData.detail_image_4 || ''} onChange={(val) => setFormData({ ...formData, detail_image_4: val })} height="140px" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* TAB 3: CASE STUDY & CONTENT */}
                    <TabPanel header="Case Study & Content" leftIcon="pi pi-file-edit mr-2">
                        <div className="flex flex-column gap-3 pt-2">
                            <div>
                                <label className="font-bold block mb-1">Introduction / Overview</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={3}
                                    placeholder="Comprehensive introduction describing the project..."
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1">Challenge & Approach</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={4}
                                    placeholder="The challenge was to create... bullet points of user flows, IA, modular UI..."
                                    value={formData.challenge || ''}
                                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1">The Solution</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={3}
                                    placeholder="The final identity system features a clean logotype..."
                                    value={formData.solution || ''}
                                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1">Key Features</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={3}
                                    placeholder="• Distinctive logotype...&#10;• Curated color palette...&#10;• Custom typography..."
                                    value={formData.key_features || ''}
                                    onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1">Outcome</label>
                                <InputTextarea className="w-full" rows={3} placeholder="The project successfully demonstrates..." value={formData.outcome || ''} onChange={(e) => setFormData({ ...formData, outcome: e.target.value })} />
                            </div>
                        </div>
                    </TabPanel>

                    {/* TAB 4: CLIENT TESTIMONIAL */}
                    <TabPanel header="Client Testimonial" leftIcon="pi pi-comments mr-2">
                        <div className="flex flex-column gap-3 pt-2">
                            <div>
                                <label className="font-bold block mb-1">Testimonial Quote</label>
                                <InputTextarea
                                    className="w-full"
                                    rows={4}
                                    placeholder="e.g. 'H Moni completely transformed how we present our brand online...'"
                                    value={formData.testimonial_quote || ''}
                                    onChange={(e) => setFormData({ ...formData, testimonial_quote: e.target.value })}
                                />
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">Author Name</label>
                                    <InputText className="w-full" placeholder="e.g. Elena Morrison" value={formData.testimonial_author || ''} onChange={(e) => setFormData({ ...formData, testimonial_author: e.target.value })} />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label className="font-bold block mb-1">Author Role & Company</label>
                                    <InputText className="w-full" placeholder="e.g. Creative Director, Nebula Labs" value={formData.testimonial_role || ''} onChange={(e) => setFormData({ ...formData, testimonial_role: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Dialog>
        </div>
    );
}
