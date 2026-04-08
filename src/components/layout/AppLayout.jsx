import React, { useState } from 'react';
import Sidebar, { SIDEBAR_ITEMS } from './Sidebar';
import Navbar from './Navbar';
import { useAppContext } from '../../AppContext';

const AppLayout = ({ children, activeTab, setActiveTab, title }) => {
    const { currentUser } = useAppContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = currentUser?.role?.toLowerCase() || 'patient';

    // Derive page title from active tab if not provided
    const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.patient;
    const activeItem = items.find(i => i.id === activeTab);
    const pageTitle = title || activeItem?.label || 'Dashboard';

    return (
        <div className="flex h-screen page-bg overflow-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <Navbar
                    onMenuClick={() => setMobileOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-1 mb-6">
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{pageTitle}</h1>
                        <p className="text-sm text-[var(--color-text-secondary)]">Welcome back to your MedConnect portal.</p>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
