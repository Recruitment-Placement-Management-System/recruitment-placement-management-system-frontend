import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';

type NavbarProps = {
  title: string;
  context?: string;
  onMenuClick: () => void;
  children?: ReactNode;
  accentClass?: string;
};

export function Navbar({ title, context, onMenuClick, children, accentClass = 'hover:bg-[#f0efff] hover:text-[#5046e5]' }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-[#e7e9f1] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onMenuClick}
        className={`shrink-0 rounded-lg p-2 text-[#66718a] transition lg:hidden ${accentClass}`}
      >
        <Menu size={21} />
      </button>
      <div className="hidden min-w-0 shrink-0 sm:block">
        {context && <p className="truncate text-[10px] text-[#7a849a]">{context}</p>}
        <h1 className="truncate text-[18px] font-bold tracking-[-0.4px] text-[#20283a]">{title}</h1>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">{children}</div>
    </header>
  );
}

