import type { ReactNode } from 'react';
import { ChevronDown, LogOut, X, type LucideIcon } from 'lucide-react';

export type SidebarItem = { label: string; icon: LucideIcon; badge?: string; dot?: boolean };
export type SidebarGroup = { label?: string; items: SidebarItem[] };
export type SidebarTheme = {
  surface: string;
  border: string;
  headerBorder: string;
  section: string;
  divider: string;
  mark: string;
  active: string;
  inactive: string;
  activeIcon: string;
  inactiveIcon: string;
  badge: string;
  profileBorder: string;
  profileBackground: string;
  avatar: string;
  signOut: string;
};

export type SidebarProps = {
  roleLabel: string;
  groups: SidebarGroup[];
  activePage: string;
  onNavigate?: (page: string) => void;
  open: boolean;
  onClose: () => void;
  profile: { name: string; description: string; initials: string };
  onProfileClick?: () => void;
  onLogout?: () => void;
  profileAccessory?: ReactNode;
  theme: SidebarTheme;
};

export function Sidebar({ roleLabel, groups, activePage, onNavigate, open, onClose, profile, onProfileClick, onLogout, profileAccessory, theme }: SidebarProps) {
  return (
    <>
      {open && <button type="button" aria-label="Close sidebar overlay" onClick={onClose} className="fixed inset-0 z-40 bg-[#0d1528]/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[250px] flex-col border-r ${theme.border} ${theme.surface} transition-transform duration-300 motion-reduce:transition-none lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`flex h-[84px] shrink-0 items-center justify-between border-b px-5 ${theme.headerBorder}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className={`grid h-10 w-10 shrink-0 grid-cols-2 gap-[4px] rounded-[9px] p-[8px] shadow-sm ${theme.mark}`} aria-hidden="true">
              <span className="rounded-[2px] bg-white" /><span className="rounded-[2px] bg-white/75" />
              <span className="rounded-[2px] bg-white/75" /><span className="rounded-[2px] bg-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[21px] font-bold tracking-[-0.7px] text-[#172033]">R&amp;PMS</p>
              <p className={`mt-1 truncate text-[9px] font-semibold tracking-[1.2px] ${theme.section}`}>{roleLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-lg p-2 text-[#7c879e] hover:bg-black/5 lg:hidden"><X size={19} /></button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 py-5" aria-label={`${roleLabel} navigation`}>
          {groups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`} className={groupIndex ? `mt-5 border-t pt-5 ${theme.divider}` : ''}>
              {group.label && <p className={`mb-2 px-3 text-[10px] font-bold tracking-[0.8px] ${theme.section}`}>{group.label}</p>}
              <div className="space-y-1">
                {group.items.map(({ label, icon: Icon, badge, dot }) => {
                  const active = activePage === label;
                  return <button key={label} type="button" onClick={() => { onNavigate?.(label); onClose(); }} aria-current={active ? 'page' : undefined} className={`group flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left text-[13px] font-semibold transition ${active ? theme.active : theme.inactive}`}>
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} className={active ? theme.activeIcon : theme.inactiveIcon} />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {badge && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${theme.badge}`}>{badge}</span>}
                    {dot && <span className="h-2 w-2 shrink-0 rounded-full bg-[#ee596a]" />}
                  </button>;
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`shrink-0 border-t p-3.5 ${theme.profileBorder}`}>
          <button type="button" onClick={() => { onProfileClick?.(); onClose(); }} disabled={!onProfileClick} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition disabled:cursor-default ${theme.profileBackground}`}>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white ${theme.avatar}`}>{profile.initials}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[#202a40]">{profile.name}</p><p className="mt-0.5 truncate text-[11px] text-[#78839a]">{profile.description}</p></div>
            {profileAccessory ?? <ChevronDown size={15} className="shrink-0 text-[#7b849b]" />}
          </button>
          {onLogout && <button type="button" onClick={onLogout} className={`mt-2 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[12px] font-semibold transition ${theme.signOut}`}><LogOut size={16} />Sign out</button>}
        </div>
      </aside>
    </>
  );
}
