import React, { useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated && data.user) {
                    setUserRole(data.user.role || 'user');
                } else {
                    setUserRole('');
                }
            })
            .catch(() => setUserRole(''));
    }, []);

    // Member Menu (Approved Members): Dashboard & My Profile
    const memberMenuItems: AppMenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
        { label: 'My Profile', icon: 'pi pi-fw pi-user', to: '/profile' }
    ];

    // Admin Menu: Full Access to dedicated CMS routes
    const adminMenuItems: AppMenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
        { label: 'Hero Carousel', icon: 'pi pi-fw pi-images', to: '/hero' },
        { label: 'Projects & Highlighted', icon: 'pi pi-fw pi-briefcase', to: '/projects' },
        { label: 'Services', icon: 'pi pi-fw pi-cog', to: '/services' },
        { label: 'Pricing Plans', icon: 'pi pi-fw pi-dollar', to: '/pricing' },
        { label: 'Process Philosophy', icon: 'pi pi-fw pi-compass', to: '/process' },
        { label: 'Testimonials / Customers', icon: 'pi pi-fw pi-star', to: '/testimonials' },
        { label: 'FAQ', icon: 'pi pi-fw pi-question-circle', to: '/faqs' },
        { label: 'Experience', icon: 'pi pi-fw pi-id-card', to: '/experiences' },
        { label: 'Tech Stack / Tools', icon: 'pi pi-fw pi-wrench', to: '/techstack' },
        { label: 'Blog & Resources', icon: 'pi pi-fw pi-book', to: '/blogs' },
        { label: 'Social Media', icon: 'pi pi-fw pi-share-alt', to: '/socials' },
        { label: 'Stats / Happy Customers', icon: 'pi pi-fw pi-chart-bar', to: '/stats' },
        { label: 'Site Settings', icon: 'pi pi-fw pi-sliders-h', to: '/settings' },
        { label: 'User Management', icon: 'pi pi-fw pi-users', to: '/users' }
    ];

    // Pending User Menu (Registered but role is 'user')
    const pendingMenuItems: AppMenuItem[] = [{ label: 'Account Pending Approval', icon: 'pi pi-fw pi-clock', to: '/' }];

    const getMenuItems = () => {
        if (userRole === 'admin' || userRole === 'super_admin') return adminMenuItems;
        if (userRole === 'member') return adminMenuItems;
        return pendingMenuItems;
    };

    const model: AppMenuItem[] = [
        {
            label: 'Main Menu',
            items: getMenuItems()
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
