import { Bell, Bot, BriefcaseBusiness, Building2, CalendarDays, ChartNoAxesCombined, CheckSquare, ClipboardList, LayoutDashboard, MessageSquare, Settings, ShieldCheck, Users, UserRound } from 'lucide-react';
import { Sidebar, type SidebarGroup, type SidebarProps } from '../common/Sidebar';

const groups: SidebarGroup[] = [
  { label: 'MAIN', items: [
    { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Manage Jobs', icon: BriefcaseBusiness },
    { label: 'Applications', icon: ClipboardList }, { label: 'Candidates', icon: Users },
    { label: 'Interviews', icon: CalendarDays }, { label: 'Offers', icon: ShieldCheck }, { label: 'Placements', icon: CheckSquare },
  ] },
  { label: 'AI & INSIGHTS', items: [{ label: 'AI Matching', icon: Users, badge: 'AI' }, { label: 'AI Assistant', icon: Bot }, { label: 'Analytics', icon: ChartNoAxesCombined }] },
  { label: 'COMMUNICATION', items: [{ label: 'Chats', icon: MessageSquare }, { label: 'Notifications', icon: Bell }] },
  { label: 'COMPANY', items: [{ label: 'Company', icon: Building2 }, { label: 'Profile', icon: UserRound }] },
  { label: 'SETTINGS', items: [{ label: 'Settings', icon: Settings }  ] },
];

const theme = {
  surface: 'bg-white', border: 'border-[#E8ECF5]', headerBorder: 'border-[#E8ECF5]', section: 'text-[#89969B]', divider: 'border-[#E8ECF5]',
  mark: 'bg-[#006B63] shadow-[#006B63]/20', active: 'bg-[#BFE9E5] text-[#006B63]', inactive: 'text-[#52616A] hover:bg-[#EDF8F6] hover:text-[#006B63]',
  activeIcon: 'text-[#006B63]', inactiveIcon: 'text-[#8A999D] transition group-hover:text-[#006B63]', badge: 'bg-[#DDF3F0] text-[#006B63]',
  profileBorder: 'border-[#E8ECF5]', profileBackground: 'bg-[#F0F5FF] hover:bg-[#E7F4F2]', avatar: 'bg-[#087F75]', signOut: 'text-[#687983] hover:bg-[#EDF8F6] hover:text-[#006B63]',
};

type Props = Omit<SidebarProps, 'roleLabel' | 'groups' | 'theme'>;
export function RecruiterSidebar(props: Props) { return <Sidebar {...props} roleLabel="RECRUITER PORTAL" groups={groups} theme={theme} />; }
 