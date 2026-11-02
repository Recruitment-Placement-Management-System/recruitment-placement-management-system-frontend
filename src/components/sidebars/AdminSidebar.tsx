import { BarChart3, BriefcaseBusiness, ClipboardList, FileText, LayoutDashboard, ShieldCheck, UserCog, Users } from 'lucide-react';
import { Sidebar, type SidebarGroup, type SidebarProps } from '../common/Sidebar';

const groups: SidebarGroup[] = [
  { label: 'OVERVIEW', items: [{ label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'USER MANAGEMENT', items: [{ label: 'Users', icon: Users }, { label: 'Candidates', icon: UserCog }, { label: 'Recruiters', icon: BriefcaseBusiness }] },
  { label: 'VERIFICATION', items: [{ label: 'Verification Queue', icon: ShieldCheck }] },
  { label: 'RECRUITMENT', items: [{ label: 'Jobs', icon: BriefcaseBusiness }, { label: 'Applications', icon: ClipboardList }] },
  { label: 'INSIGHTS', items: [{ label: 'Analytics', icon: BarChart3 }, { label: 'Reports', icon: FileText }] },
];

const theme = {
  surface: 'bg-white', border: 'border-[#E9E1DC]', headerBorder: 'border-[#E9E1DC]', section: 'text-[#9A8D86]', divider: 'border-[#EEE7E2]',
  mark: 'bg-[#DD7655] shadow-[#DD7655]/20', active: 'bg-[#F7E9E3] text-[#B95235]', inactive: 'text-[#514A46] hover:bg-[#F8F1ED] hover:text-[#B95235]',
  activeIcon: 'text-[#B95235]', inactiveIcon: 'text-[#9A8D86] transition group-hover:text-[#B95235]', badge: 'bg-[#F7E9E3] text-[#B95235]',
  profileBorder: 'border-[#E9E1DC]', profileBackground: 'bg-[#FBF7F4] hover:bg-[#F8F1ED]', avatar: 'bg-[#DD7655]', signOut: 'text-[#685D57] hover:bg-[#F8F1ED] hover:text-[#B95235]',
};

type Props = Omit<SidebarProps, 'roleLabel' | 'groups' | 'theme' | 'onNavigate' | 'onProfileClick'>;
export function AdminSidebar(props: Props) { return <Sidebar {...props} roleLabel="ADMIN CONSOLE" groups={groups} theme={theme} />; }
