import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="flex min-h-screen flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-[#CE412B] selection:text-white transition-colors duration-200">
          {/* Top Application Header */}
          <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

          {/* Main Layout Area: Sidebar + Main Content */}
          <div className="flex flex-1">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="flex flex-1 flex-col overflow-hidden">
              <Breadcrumbs />

              <main className="flex-1 pb-20 lg:pb-8">
                <Outlet />
              </main>

              <Footer />
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
};
