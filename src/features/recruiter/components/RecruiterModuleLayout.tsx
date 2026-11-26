import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Bot, LogOut, MessageSquare, Search, Settings, UserRound } from "lucide-react";
import { logout } from "../../../api/auth.api";
import useAuthStore from "../../../store/auth.store";
import { Navbar } from "../../../components/common/Navbar";
import { RecruiterSidebar } from "./RecruiterSidebar";

type Props = { title: string; context: string; activePage: string; children: ReactNode };

export function RecruiterModuleLayout({ title, context, activePage, children }: Props) {
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.user?.email);
  const logoutUser = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigateTo = (page: string) => {
    if (page === "Dashboard") navigate("/recruiter/dashboard");
    else if (page === "Profile") navigate("/recruiter/profile");
    else if (page === "Company") navigate("/recruiter/company");
    else if (page === "Verification") navigate("/recruiter/verification");
    else if (page === "Verification History") navigate("/recruiter/verification/history");
    else setProfileMenuOpen(false);
  };
  const signOut = async () => {
    try { await logout(); } catch (error) { console.error("Logout failed:", error); }
    finally { logoutUser(); navigate("/login", { replace: true }); }
  };
  const initials = (email || "RE").slice(0, 2).toUpperCase();

  return <div className="min-h-screen bg-[#F7F8FF] text-[#102039]">
    <RecruiterSidebar activePage={activePage} onNavigate={navigateTo} open={sidebarOpen} onClose={() => setSidebarOpen(false)} profile={{ name: email || "Recruiter", description: "Recruiter account", initials }} onProfileClick={() => navigate("/recruiter/profile")} />
    <main className="min-h-screen min-w-0 lg:ml-[250px]">
      <Navbar title={title} context={context} onMenuClick={() => setSidebarOpen(true)} accentClass="hover:bg-[#EDF8F6] hover:text-[#006B63]">
        <div className="relative mx-auto hidden max-w-[470px] min-w-0 flex-1 md:block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A858F]"/><input placeholder="Search candidates, jobs, applications..." className="h-9 w-full rounded-lg border border-[#E4EAF3] bg-[#F0F5FF] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#006B63] focus:ring-2 focus:ring-[#006B63]/10"/></div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" className="hidden items-center gap-1.5 rounded-lg bg-[#F7F0FF] px-3 py-2 text-[11px] font-semibold text-[#7625B9] sm:flex"><Bot size={15}/>Assistant</button>
          <button type="button" aria-label="Open messages" className="relative rounded-lg p-2 text-[#52606B] hover:bg-[#F0F8F7] hover:text-[#006B63]"><MessageSquare size={17}/></button>
          <div className="relative"><button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setProfileMenuOpen(false); }} className="relative rounded-lg p-2 text-[#52606B] hover:bg-[#F0F8F7] hover:text-[#006B63]"><Bell size={17}/><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#DC4545]"/></button>{notificationsOpen&&<div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#E4EAF3] bg-white p-4 shadow-[0_10px_30px_rgba(16,32,57,0.12)]"><p className="text-xs font-bold">Notifications</p><p className="mt-2 text-[11px] leading-5 text-[#7A858F]">Recruiter updates and verification status will appear here.</p></div>}</div>
          <div className="relative"><button type="button" aria-label="Open profile menu" aria-expanded={profileMenuOpen} onClick={() => { setProfileMenuOpen((open) => !open); setNotificationsOpen(false); }} className="grid h-8 w-8 place-items-center rounded-full border border-[#DCE6ED] bg-[#D8E9F7] text-[10px] font-bold text-[#006B63] transition hover:border-[#006B63] hover:ring-2 hover:ring-[#006B63]/10">{initials}</button>{profileMenuOpen&&<div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#E4EAF3] bg-white p-1.5 shadow-[0_10px_30px_rgba(16,32,57,0.12)]"><button type="button" onClick={() => navigateTo("Profile")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-[#46545A] hover:bg-[#F0F8F7] hover:text-[#006B63]"><UserRound size={15}/>My Profile</button><button type="button" onClick={() => navigateTo("Settings")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-[#46545A] hover:bg-[#F0F8F7] hover:text-[#006B63]"><Settings size={15}/>Settings</button><div className="my-1 border-t border-[#EEF0F5]"/><button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-[#D04444] hover:bg-[#FFF2F2]"><LogOut size={15}/>Sign out</button></div>}</div>
        </div>
      </Navbar>
      <div className="space-y-5 p-4 sm:p-6">{children}</div>
    </main>
  </div>;
}
