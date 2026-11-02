import type { ReactNode } from 'react';

type FooterProps = {
  role: string;
  status?: ReactNode;
};

export function Footer({ role, status }: FooterProps) {
  return (
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7f0] py-5 text-[10px] text-[#8992a6]">
      <span>&copy; 2026 R&amp;PMS &middot; Recruitment &amp; Placement Management System</span>
      <span className="flex items-center gap-1.5">
        {role}
        {status && <span className="ml-2 inline-flex items-center gap-1.5">&middot; {status}</span>}
      </span>
    </footer>
  );
}

