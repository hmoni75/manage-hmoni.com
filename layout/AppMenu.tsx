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

    // Admin Menu: Full Access
    const adminMenuItems: AppMenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
        { label: 'My Profile', icon: 'pi pi-fw pi-user', to: '/profile' },
        { label: 'Members', icon: 'pi pi-fw pi-users', to: '/members' },
        { label: 'Users', icon: 'pi pi-fw pi-user-edit', to: '/users' },
        { label: 'Expenses', icon: 'pi pi-fw pi-wallet', to: '/expenses' },
        {
            label: 'Reports',
            icon: 'pi pi-fw pi-print',
            items: [
                { label: 'Overall Ledger', icon: 'pi pi-fw pi-chart-bar', to: '/reports/summary' },
                { label: 'Member Installment', icon: 'pi pi-fw pi-id-card', to: '/reports/member-sheet' },
                { label: 'Expenses Ledger', icon: 'pi pi-fw pi-file', to: '/reports/expenses' }
            ]
        }
    ];

    // Pending User Menu (Registered but role is 'user')
    const pendingMenuItems: AppMenuItem[] = [{ label: 'Account Pending Approval', icon: 'pi pi-fw pi-clock', to: '/' }];

    const getMenuItems = () => {
        if (userRole === 'admin') return adminMenuItems;
        if (userRole === 'member') return memberMenuItems;
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
