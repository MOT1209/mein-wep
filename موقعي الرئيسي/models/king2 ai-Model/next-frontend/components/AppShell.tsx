'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { FloatingActions } from '@/components/FloatingActions';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const effectiveOpen = isMobile ? sidebarOpen : true;

  return (
    <div className="flex h-screen bg-surface-primary overflow-hidden">
      <Sidebar
        isOpen={effectiveOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto scroll-smooth">{children}</main>
        <FloatingActions />
      </div>
    </div>
  );
}
