import { Award, Bell, BriefcaseBusiness, CalendarDays, CircleHelp, FileText, LayoutDashboard, Mail, Search, Settings, UserRound } from 'lucide-react';
import { Sidebar, type SidebarGroup, type SidebarProps } from '../common/Sidebar';

const groups: SidebarGroup[] = [
  { items: [
    { label: 'Dashboard', icon: LayoutDashboard }, { label: 'My Profile', icon: UserRound },
    { label: 'Resume', icon: FileText }, { label: 'Find Jobs', icon: Search },
    { label: 'My Applications', icon: BriefcaseBusiness }, { label: 'Interviews', icon: CalendarDays },
    { label: 'Offers', icon: Award }, { label: 'Messages', icon: Mail }, { label: 'Notifications', icon: Bell, dot: true },
  ] },
  { items: [{ label: 'Settings', icon: Settings }, { label: 'Help / Support', icon: CircleHelp }] },
];

const theme = {
  surface: 'bg-[#fbfaff]', border: 'border-[#e5e7f0]', headerBorder: 'border-[#edeef5]', section: 'text-[#929cb0]', divider: 'border-[#e7e8f0]',
  mark: 'bg-[#5147e8] shadow-[#5147e8]/25', active: 'bg-gradient-to-r from-[#eeecff] to-[#e8e6ff] text-[#5046e5] shadow-sm shadow-[#5046e5]/[0.04]',
  inactive: 'text-[#586178] hover:bg-[#f1f2f8] hover:text-[#5046e5]', activeIcon: 'text-[#5046e5]', inactiveIcon: 'text-[#929cb0] transition group-hover:text-[#5046e5]', badge: 'bg-[#efedff] text-[#5046e5]',
  profileBorder: 'border-[#e9eaf2]', profileBackground: 'bg-gradient-to-r from-[#f0efff] to-[#f5f5fc] hover:from-[#e9e6ff] hover:to-[#efedff]', avatar: 'bg-gradient-to-br from-[#6155f3] to-[#3e35c8]', signOut: 'text-[#68738a] hover:bg-[#f1f2f8] hover:text-[#c44759]',
};

type Props = Omit<SidebarProps, 'roleLabel' | 'groups' | 'theme' | 'onLogout'>;
export function CandidateSidebar(props: Props) { return <Sidebar {...props} roleLabel="CANDIDATE PORTAL" groups={groups} theme={theme} />; }
