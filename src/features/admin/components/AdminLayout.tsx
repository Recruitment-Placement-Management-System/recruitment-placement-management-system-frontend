import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CircleHelp, UserCog } from 'lucide-react';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { logout } from '../../../api/auth.api';
import useAuthStore from '../../../store/auth.store';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ title, activePage, children }: { title: string; activePage: string; children: ReactNode }) {
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logout);
  const email = useAuthStore((state) => state.user?.email);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const onNavigate = (page: string) => {
    const routes: Record<string, string> = {
      Dashboard: '/admin/dashboard', Users: '/admin/users', Candidates: '/admin/candidates',
      Recruiters: '/admin/recruiters', Companies: '/admin/companies', 'Verification Queue': '/admin/verifications',
    };
    if (routes[page]) navigate(routes[page]);
  };
  const handleLogout = async () => {
    try { await logout(); } catch (error) { console.error('Logout failed:', error); }
    finally { logoutUser(); navigate('/admin/login', { replace: true }); }
  };
  return <div className="min-h-screen bg-[#FBF7F4] text-[#302D2B]">
    <AdminSidebar activePage={activePage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={onNavigate} profile={{ name: email ?? 'Admin', description: 'System Administrator', initials: email?.slice(0, 2).toUpperCase() ?? 'AD' }} onLogout={handleLogout} />
    <div className="min-h-screen lg:ml-[250px]">
      <Navbar title={title} context="Admin Console" onMenuClick={() => setSidebarOpen(true)} accentClass="hover:bg-[#F8F1ED] hover:text-[#B95235]">
        <div className="ml-auto flex items-center gap-4">
          <button type="button" aria-label="Notifications" className="relative text-[#625A55]"><Bell size={19} /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#DD7655]" /></button>
          <button type="button" aria-label="Help" className="text-[#625A55]"><CircleHelp size={19} /></button>
          <div className="hidden h-6 w-px bg-[#E5DED9] sm:block" />
          <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DD7655] text-white"><UserCog size={17} /></div><span className="hidden text-sm font-semibold sm:block">{email ?? 'Admin'}</span></div>
        </div>
      </Navbar>
      <main className="space-y-6 p-5 lg:p-8">{children}<Footer role="Admin Console" /></main>
    </div>
  </div>;
}
