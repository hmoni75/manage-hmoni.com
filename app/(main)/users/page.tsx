'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { formatDate } from '@/lib/date';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    member_id?: number;
    member_sl?: number;
    member_name?: string;
    created_at?: string;
}

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    // User Add/Edit Dialog
    const [userDialog, setUserDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string }>({
        name: '',
        email: '',
        role: 'user',
        password: ''
    });

    const roleOptions = [
        { label: 'User (Pending Approval)', value: 'user' },
        { label: 'Member (Member Access)', value: 'member' },
        { label: 'Admin (Full Access)', value: 'admin' }
    ];

    const checkAdminAndFetchUsers = async () => {
        setLoading(true);
        try {
            const authRes = await fetch('/api/auth/me');
            const authData = await authRes.json();

            if (!authData.authenticated || authData.user?.role !== 'admin') {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            setIsAdmin(true);

            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users list' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAdminAndFetchUsers();
    }, []);

    const saveUser = async () => {
        if (!editingUser.name?.trim() || !editingUser.email?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Name and Email are required.' });
            return;
        }

        try {
            const isEdit = !!editingUser.id;
            const res = await fetch('/api/users', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });
            const data = await res.json();

            if (data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEdit ? 'User updated successfully' : 'User created successfully'
                });
                setUserDialog(false);
                checkAdminAndFetchUsers();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save user' });
        }
    };

    const resetPasswordToDefault = (user: User) => {
        confirmDialog({
            message: `Are you sure you want to reset password for "${user.name}" to default "123456"?`,
            header: 'Reset User Password',
            icon: 'pi pi-key text-yellow-500',
            acceptClassName: 'p-button-warning',
            acceptLabel: 'Yes, Reset',
            rejectLabel: 'Cancel',
            accept: async () => {
                try {
                    const res = await fetch('/api/users', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...user, password: '123456' })
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Password Reset',
                            detail: `Password for ${user.name} reset to "123456"`
                        });
                        checkAdminAndFetchUsers();
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
                    }
                } catch {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to reset password' });
                }
            }
        });
    };

    const deleteUser = (user: User) => {
        confirmDialog({
            message: `Are you sure you want to delete user account "${user.name}" (${user.email})? This action cannot be undone.`,
            header: 'Delete User Account',
            icon: 'pi pi-exclamation-triangle text-red-500',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Yes, Delete Account',
            rejectLabel: 'Cancel',
            accept: async () => {
                try {
                    const res = await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User account deleted' });
                        checkAdminAndFetchUsers();
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
                    }
                } catch {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
                }
            }
        });
    };

    const renderRoleBadge = (role: string) => {
        if (role === 'admin') {
            return <span className="px-3 py-1 font-bold border-round text-xs uppercase bg-purple-100 text-purple-800">admin</span>;
        }
        if (role === 'member') {
            return <span className="px-3 py-1 font-bold border-round text-xs uppercase bg-blue-100 text-blue-800">member</span>;
        }
        return <span className="px-3 py-1 font-bold border-round text-xs uppercase bg-yellow-100 text-yellow-800">user (pending)</span>;
    };

    // Null-safe users search filtering
    const filteredUsersList = users.filter((u) => {
        if (!globalFilter || !globalFilter.trim()) return true;
        const query = globalFilter.trim().toLowerCase();
        return (
            String(u.id || '')
                .toLowerCase()
                .includes(query) ||
            (u.name ? u.name.toLowerCase().includes(query) : false) ||
            (u.email ? u.email.toLowerCase().includes(query) : false) ||
            (u.role ? u.role.toLowerCase().includes(query) : false) ||
            (u.member_name ? u.member_name.toLowerCase().includes(query) : false)
        );
    });

    if (!loading && !isAdmin) {
        return (
            <div className="surface-card p-6 shadow-2 border-round-xl text-center">
                <i className="pi pi-lock text-6xl text-red-500 mb-3 block" />
                <h3 className="text-2xl font-bold text-900 mb-2">Access Denied</h3>
                <p className="text-600 mb-0">Only administrators are authorized to access the Users Management page.</p>
            </div>
        );
    }

    return (
        <div className="surface-card p-4 shadow-2 border-round-xl">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            {/* Header & Search */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="text-2xl font-bold text-900 m-0">Users Management</h3>
                    <span className="text-600">Overview of all registered accounts, role promotion, and login management</span>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <span className="p-input-icon-left w-full md:w-auto">
                        <i className="pi pi-search" />
                        <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search users..." className="w-full md:w-auto" />
                    </span>
                    <Button
                        label="Add New User"
                        icon="pi pi-user-plus"
                        className="p-button-primary font-semibold"
                        onClick={() => {
                            setEditingUser({ name: '', email: '', role: 'user', password: '123456' });
                            setUserDialog(true);
                        }}
                    />
                </div>
            </div>

            {/* Users DataTable */}
            <DataTable value={filteredUsersList} loading={loading} paginator rows={15} responsiveLayout="scroll" emptyMessage="No user accounts found." className="p-datatable-gridlines">
                <Column field="id" header="User ID" sortable style={{ width: '8%' }} className="text-center font-bold" />
                <Column field="name" header="User Name" sortable style={{ width: '20%' }} className="font-semibold" />
                <Column field="email" header="Email Address" sortable style={{ width: '22%' }} />
                <Column field="role" header="Role Status" sortable style={{ width: '15%' }} body={(u: User) => renderRoleBadge(u.role || 'user')} />
                <Column
                    header="Linked Member"
                    style={{ width: '15%' }}
                    body={(u: User) =>
                        u.member_name ? (
                            <span className="text-green-700 font-semibold flex align-items-center gap-1">
                                <i className="pi pi-check-circle text-xs" /> #{u.member_sl || u.member_id}: {u.member_name}
                            </span>
                        ) : (
                            <span className="text-400 text-xs italic">Unlinked</span>
                        )
                    }
                />
                <Column field="created_at" header="Registered Date" sortable body={(u: User) => formatDate(u.created_at)} style={{ width: '12%' }} />
                <Column
                    header="Actions"
                    style={{ width: '12%' }}
                    body={(user: User) => (
                        <div className="flex gap-1">
                            <Button
                                icon="pi pi-user-edit"
                                className="p-button-sm p-button-warning p-button-text"
                                tooltip="Edit User Details & Change Role"
                                onClick={() => {
                                    setEditingUser({ ...user, role: user.role || 'user', password: '' });
                                    setUserDialog(true);
                                }}
                            />
                            <Button icon="pi pi-key" className="p-button-sm p-button-secondary p-button-text" tooltip="Reset Password to 123456" onClick={() => resetPasswordToDefault(user)} />
                            <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" tooltip="Delete User Account" onClick={() => deleteUser(user)} />
                        </div>
                    )}
                />
            </DataTable>

            {/* Add / Edit User Dialog */}
            <Dialog visible={userDialog} style={{ width: '450px' }} header={editingUser.id ? 'Edit User Account & Role' : 'Add New User Account'} modal onHide={() => setUserDialog(false)}>
                <div className="p-fluid">
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Full Name</label>
                        <InputText value={editingUser.name || ''} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} placeholder="e.g. Bipon Biswas" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Email Address</label>
                        <InputText type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} placeholder="user@example.com" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Role Permission Status</label>
                        <Dropdown value={editingUser.role || 'user'} options={roleOptions} onChange={(e) => setEditingUser({ ...editingUser, role: e.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">{editingUser.id ? 'New Password (leave empty to keep current)' : 'Password (default: 123456)'}</label>
                        <InputText type="text" value={editingUser.password || ''} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} placeholder={editingUser.id ? 'Enter new password...' : '123456'} />
                    </div>
                    <Button label="Save User Account" icon="pi pi-check" onClick={saveUser} className="mt-2 p-button-primary" />
                </div>
            </Dialog>
        </div>
    );
};

export default UsersPage;
