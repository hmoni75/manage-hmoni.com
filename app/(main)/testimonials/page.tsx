/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';

export default function TestimonialsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    // Direct image upload states
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/testimonials', { cache: 'no-store' });
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

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.current?.show({ severity: 'error', summary: 'Invalid File', detail: 'Please select an image file (PNG, JPG, WEBP, SVG, etc.)' });
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            toast.current?.show({ severity: 'error', summary: 'File Too Large', detail: 'Image must be less than 12MB' });
            return;
        }

        setUploadingImage(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (!result) {
                setUploadingImage(false);
                return;
            }

            // SVG / GIF: preserve vector/animation
            if (file.type.includes('svg') || file.type.includes('gif')) {
                setFormData((prev: any) => ({ ...prev, image_url: result, avatar: result }));
                setUploadingImage(false);
                toast.current?.show({ severity: 'success', summary: 'Photo Ready', detail: `${file.name} uploaded` });
                return;
            }

            // For JPG, PNG, WEBP: optimize via canvas for fast loading
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
                    setFormData((prev: any) => ({ ...prev, image_url: optimized, avatar: optimized }));
                    toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `${file.name} uploaded and optimized` });
                } else {
                    setFormData((prev: any) => ({ ...prev, image_url: result, avatar: result }));
                }
                setUploadingImage(false);
            };
            img.onerror = () => {
                setFormData((prev: any) => ({ ...prev, image_url: result, avatar: result }));
                setUploadingImage(false);
            };
            img.src = result;
        };
        reader.onerror = () => {
            setUploadingImage(false);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not read image file' });
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({ rating: 5, stars: 5, image_url: '', avatar: '', project: '', company: '', client_title: '', role: '' });
        setShowUrlInput(false);
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        const currentImg = item.image_url || item.avatar || '';
        setFormData({
            ...item,
            client_name: item.client_name || item.author || '',
            project: item.project || item.company || '',
            company: item.project || item.company || '',
            client_title: item.client_title || item.role || '',
            rating: item.rating || item.stars || 5,
            image_url: currentImg,
            avatar: currentImg
        });
        setShowUrlInput(Boolean(currentImg && !currentImg.startsWith('data:')));
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Testimonial deleted' });
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const saveItem = async () => {
        const clientName = formData.client_name?.trim() || formData.author?.trim();
        if (!clientName) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Client / Author Name is required' });
            return;
        }

        if (!formData.content || !formData.content.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Testimonial quote / feedback is required' });
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const payload = editingItem ? { ...formData, id: editingItem.id } : formData;

        try {
            const res = await fetch('/api/testimonials', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Testimonial saved' });
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
        const img = row.image_url || row.avatar;
        if (!img) return <span className="text-400 italic text-sm">No photo</span>;
        const isDataUrl = img.startsWith('data:');
        return (
            <div className="flex align-items-center gap-2">
                <img
                    src={img}
                    alt={row.client_name || row.author}
                    className="border-round shadow-1"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    onError={(e: any) => {
                        e.target.style.display = 'none';
                    }}
                />
                <span className="text-xs text-500 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '80px' }}>
                    {isDataUrl ? '[Photo Ready]' : img}
                </span>
            </div>
        );
    };

    const ratingTemplate = (row: any) => {
        const starCount = Math.min(Math.max(Number(row.rating || row.stars) || 5, 1), 5);
        return (
            <div className="flex align-items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <i
                        key={i}
                        className={`pi ${i < starCount ? 'pi-star-fill text-yellow-500' : 'pi-star text-300'}`}
                        style={{ fontSize: '0.85rem' }}
                    />
                ))}
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Testimonial" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Testimonial" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Testimonials & Client Reviews</h3>
                    <p className="text-600 m-0 mt-1">Manage partner reviews, quotes, client photos, and project ratings</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Testimonial" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No testimonials found.">
                <Column header="Photo" body={imageTemplate} style={{ width: '12%' }} />
                <Column
                    field="client_name"
                    header="Client / Author"
                    body={(r) => (
                        <div>
                            <span className="font-bold text-900 block">{r.client_name || r.author}</span>
                            <span className="text-xs text-500">{r.client_title || r.role || '-'}</span>
                        </div>
                    )}
                    style={{ width: '18%' }}
                />
                <Column
                    field="project"
                    header="Project / Company"
                    body={(r) => <span className="font-semibold text-primary">{r.project || r.company || '-'}</span>}
                    style={{ width: '18%' }}
                />
                <Column header="Rating" body={ratingTemplate} style={{ width: '14%' }} />
                <Column
                    field="content"
                    header="Quote / Feedback"
                    body={(r) => (
                        <p className="text-sm text-700 m-0 line-height-3 text-overflow-ellipsis overflow-hidden" style={{ maxHeight: '60px' }}>
                            &ldquo;{r.content}&rdquo;
                        </p>
                    )}
                    style={{ width: '28%' }}
                />
                <Column body={actionBody} header="Actions" style={{ width: '10%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '600px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Testimonial`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Changes" icon="pi pi-check" onClick={saveItem} loading={uploadingImage} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3 pt-2">
                    {/* Direct Image / Photo Upload Box */}
                    <div>
                        <div className="flex justify-content-between align-items-center mb-1">
                            <label className="font-bold">Client / Partner Photo</label>
                            <Button
                                type="button"
                                label={showUrlInput ? 'Switch to File Upload' : 'Enter URL / Path'}
                                icon={showUrlInput ? 'pi pi-upload' : 'pi pi-link'}
                                text
                                size="small"
                                className="p-0 text-xs"
                                onClick={() => setShowUrlInput(!showUrlInput)}
                            />
                        </div>

                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml" onChange={handleFileChange} />

                        {formData.image_url || formData.avatar ? (
                            <div className="border-1 border-round surface-border p-3 surface-50">
                                <div className="relative border-round overflow-hidden shadow-1 mb-2 bg-black-alpha-10 flex align-items-center justify-content-center" style={{ maxHeight: '180px' }}>
                                    <img
                                        src={formData.image_url || formData.avatar}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                                        onError={(e: any) => {
                                            e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL';
                                        }}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center gap-2">
                                    <span className="text-xs text-600 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '320px' }}>
                                        {(formData.image_url || formData.avatar || '').startsWith('data:') ? '✅ Uploaded Photo (Ready)' : (formData.image_url || formData.avatar)}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button type="button" icon="pi pi-upload" label="Change" size="small" outlined onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} />
                                        <Button
                                            type="button"
                                            icon="pi pi-trash"
                                            severity="danger"
                                            size="small"
                                            text
                                            onClick={() => setFormData({ ...formData, image_url: '', avatar: '' })}
                                            tooltip="Remove Photo"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`border-2 border-dashed border-round p-4 text-center cursor-pointer transition-all transition-duration-200 ${isDragging ? 'border-primary surface-100' : 'surface-border surface-50 hover:surface-100'}`}
                            >
                                <i className="pi pi-cloud-upload text-4xl text-primary mb-2 block" />
                                <div className="font-semibold text-900 mb-1">{uploadingImage ? 'Processing Photo...' : 'Click to Upload Photo or Drag & Drop'}</div>
                                <p className="text-xs text-500 m-0">PNG, JPG, WEBP, GIF, SVG (up to 12MB, auto-optimized)</p>
                            </div>
                        )}

                        {showUrlInput && (
                            <div className="mt-2">
                                <InputText
                                    className="w-full text-sm"
                                    placeholder="Or paste photo URL (e.g. /assets/imgs/... or https://...)"
                                    value={formData.image_url || formData.avatar || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value, avatar: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Client / Author Name *</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Julian Thorne"
                                value={formData.client_name || formData.author || ''}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value, author: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Project / Company *</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. The Obsidian Villa"
                                value={formData.project || formData.company || ''}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value, company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Role / Designation (Optional)</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Owner, Founder, CEO"
                                value={formData.client_title || formData.role || ''}
                                onChange={(e) => setFormData({ ...formData, client_title: e.target.value, role: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Rating (Stars 1 to 5)</label>
                            <div className="flex align-items-center gap-3">
                                <InputNumber
                                    className="w-full"
                                    min={1}
                                    max={5}
                                    value={formData.rating || formData.stars || 5}
                                    onValueChange={(e) => setFormData({ ...formData, rating: e.value, stars: e.value })}
                                />
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <i
                                            key={s}
                                            onClick={() => setFormData({ ...formData, rating: s, stars: s })}
                                            className={`pi cursor-pointer ${s <= (formData.rating || formData.stars || 5) ? 'pi-star-fill text-yellow-500' : 'pi-star text-300'}`}
                                            style={{ fontSize: '1.25rem' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Testimonial Quote / Feedback *</label>
                        <InputTextarea
                            className="w-full"
                            rows={4}
                            placeholder="The team didn't just design a house; they sculpted a sanctuary of light..."
                            value={formData.content || ''}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
