'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BottleIcon, ArrowIcon } from '../../components/icons';

const NAV = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Link className="brand" href="/admin">
            <BottleIcon />
            <span>The Milkman</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`admin-nav-link ${active ? 'active' : ''}`}>
                <span>{item.label}</span>
                {pathname.startsWith(item.href) && <ArrowIcon />}
              </Link>
            );
          })}
        </nav>
        <Link className="admin-exit" href="/">
          Exit <ArrowIcon />
        </Link>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
