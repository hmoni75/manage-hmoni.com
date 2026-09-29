/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Toast } from 'primereact/toast';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const toast = useRef<Toast>(null);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated && data.user) {
                    setUser(data.user);
                }
            })
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        try {
            toast.current?.show({
                severity: 'info',
                summary: 'Logging Out',
                detail: 'Ending session...',
                life: 1500
            });

            await fetch('/api/auth/logout', { method: 'POST' });
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 500);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Logout failed. Please try again.',
                life: 3000
            });
        }
    };

    return (
        <div className="layout-topbar">
            <Toast ref={toast} position="top-right" />

            <Link href="/" className="layout-topbar-logo">
                <img src="/logo.png" style={{ height: '35px', width: 'auto' }} alt="Nobodhara Aryan Society Logo" />
                <span className="font-bold text-xl ml-2">Nobodhara Aryan Society</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                {user && (
                    <div className="flex align-items-center px-3 text-700 font-medium">
                        <i className="pi pi-user mr-2"></i>
                        <span>{user.name}</span>
                    </div>
                )}
                <button type="button" className="p-link layout-topbar-button" onClick={handleLogout} title="Logout">
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
