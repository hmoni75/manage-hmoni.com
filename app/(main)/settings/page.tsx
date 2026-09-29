'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

export default function SettingsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [settingValue, setSettingValue] = useState('');
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
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

    const editItem = (item: any) => {
        setEditingItem(item);
        setSettingValue(item.setting_value || '');
        setDialogOpen(true);
    };

    const saveItem = async () => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting_key: editingItem.setting_key, setting_value: settingValue })
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Setting saved successfully' });
                setDialogOpen(false);
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const actionBody = (row: any) => <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Setting" />;

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Site Settings & Global Config</h3>
                    <p className="text-600 m-0 mt-1">Manage brand title, contact emails, addresses, and working hours</p>
                </div>
                <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
            </div>

            <DataTable value={data} loading={loading} responsiveLayout="scroll" emptyMessage="No site settings found.">
                <Column field="setting_key" header="Setting Key" style={{ width: '30%', fontWeight: 'bold' }} />
                <Column field="setting_value" header="Value" style={{ width: '55%' }} />
                <Column body={actionBody} header="Edit" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header={`Edit Setting: ${editingItem?.setting_key || ''}`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Changes" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="font-bold block mb-1">Value</label>
                        <InputTextarea className="w-full" rows={4} value={settingValue} onChange={(e) => setSettingValue(e.target.value)} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
