import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Bookmark, LogOut, Mail, Search, Settings, UserRound } from "lucide-react";
import { logout } from "../../../api/auth.api";
import { Navbar } from "../../../components/common/Navbar";
import useAuthStore from "../../../store/auth.store";
import { CandidateSidebar } from "./CandidateSidebar";

export type CandidatePageName = "Dashboard" | "My Profile" | "Resume" | "Find Jobs" | "Saved Jobs" | "My Applications" | "Interviews" | "Offers" | "Messages" | "Notifications" | "Settings" | "Help / Support";
export function CandidatePageLayout({ title, activePage, children }: { title: string; activePage: CandidatePageName; children: ReactNode }) {
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.user?.email);
  const logoutUser = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const initials = (email || "CA").slice(0, 2).toUpperCase();
  const navigateTo = (page: string) => {
    const paths: Partial<Record<CandidatePageName, string>> = {
      Dashboard: "/candidate/dashboard", "My Profile": "/candidate/profile", Resume: "/candidate/resume", "Find Jobs": "/candidate/jobs", "Saved Jobs": "/candidate/jobs/saved", "My Applications": "/candidate/applications",
    };
    const path = paths[page as CandidatePageName];
    if (path) navigate(path);
  };
  const signOut = async () => { try { await logout(); } catch { /* Complete local sign-out if the request fails. */ } finally { logoutUser(); navigate("/login", { replace: true }); } };
  return <div className="min-h-screen bg-[#f6f7fb] text-[#1e2433]">
    <CandidateSidebar activePage={activePage} onNavigate={navigateTo} open={sidebarOpen} onClose={() => setSidebarOpen(false)} profile={{ name: email || "Candidate", description: "Candidate account", initials }} onProfileClick={() => navigate("/candidate/profile")} />
    <div className="min-h-screen lg:pl-[250px]">
      <Navbar title={title} onMenuClick={() => setSidebarOpen(true)}>
        <div className="relative min-w-0 w-full max-w-[430px]"><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a9]"/><input type="search" onKeyDown={(event) => { if (event.key === "Enter") navigate("/candidate/jobs"); }} placeholder="Search jobs, companies, or skills..." aria-label="Search jobs, companies, or skills" className="h-[43px] w-full rounded-lg border border-[#dce1ed] bg-white pl-10 pr-4 text-[13px] text-[#26344c] outline-none transition placeholder:text-[#929cb0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"/></div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <div className="relative"><button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} className="relative grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"><Bell size={20}/><span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#f05269]"/></button>{notificationsOpen && <div className="absolute right-0 top-12 z-[70] w-[270px] rounded-xl border border-[#e4e6ef] bg-white p-4 shadow-xl"><p className="text-[13px] font-bold text-[#20283a]">Notifications</p><p className="mt-2 text-[12px] leading-5 text-[#78839a]">Your application and interview updates will appear here.</p></div>}</div>
          <button type="button" aria-label="Messages" onClick={() => navigate("/candidate/dashboard")} className="grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"><Mail size={20}/></button>
          <div className="relative"><button type="button" aria-label="Open account menu" aria-expanded={profileOpen} onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} className="ml-1 grid h-10 w-10 place-items-center rounded-full border-2 border-[#e5e2ff] bg-gradient-to-br from-[#6155f3] to-[#3930b9] text-[12px] font-bold text-white transition hover:ring-4 hover:ring-[#5046e5]/10">{initials}</button>{profileOpen && <div className="absolute right-0 top-12 z-[70] w-48 rounded-xl border border-[#e4e6ef] bg-white p-2 shadow-xl"><button type="button" onClick={() => navigate("/candidate/profile")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><UserRound size={16}/>My Profile</button><button type="button" onClick={() => navigate("/candidate/jobs/saved")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><Bookmark size={16}/>Saved Jobs</button><button type="button" onClick={() => navigate("/candidate/profile")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><Settings size={16}/>Settings</button><div className="my-1 border-t border-[#eceef4]"/><button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#c44759] hover:bg-red-50"><LogOut size={16}/>Sign out</button></div>}</div>
        </div>
      </Navbar>
      <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  </div>;
}
