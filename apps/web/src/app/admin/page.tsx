'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: 'easeOut' as const },
  }),
};

export default function AdminOverviewPage() {
  const stats = [
    { label: 'Today\'s orders', value: '24', href: '/admin/orders' },
    { label: 'Pending', value: '8', href: '/admin/orders' },
    { label: 'Customers', value: '142', href: '/admin/customers' },
    { label: 'Revenue', value: 'KSh 1,200', href: '/admin/orders' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Overview</h1>
          <p>Welcome back. Here is what is happening today.</p>
        </div>
        <Link className="checkout-button" href="/admin/orders">
          <span>View orders</span>
        </Link>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} className="admin-stat-card" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <span className="admin-stat-label">{stat.label}</span>
            <strong className="admin-stat-value">{stat.value}</strong>
            <Link href={stat.href} className="admin-stat-link">View →</Link>
          </motion.div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Recent orders</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ref: 'MLK-1042', customer: 'Kevin', location: 'Diaspora', total: 'KSh 100', status: 'new' },
                { ref: 'MLK-1041', customer: 'Amina', location: 'Mjini Town', total: 'KSh 50', status: 'confirmed' },
                { ref: 'MLK-1040', customer: 'John', location: 'Executive', total: 'KSh 150', status: 'packed' },
              ].map((order) => (
                <tr key={order.ref}>
                  <td>{order.ref}</td>
                  <td>{order.customer}</td>
                  <td>{order.location}</td>
                  <td>{order.total}</td>
                  <td><span className={`admin-status admin-status-${order.status}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
