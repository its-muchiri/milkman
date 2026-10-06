'use client';

import { useState } from 'react';

export default function AdminOrdersPage() {
  const [orders] = useState([
    { ref: 'MLK-1042', customer: 'Kevin', phone: '+254 712 345 678', location: 'Diaspora', packs: 2, total: 100, status: 'new', date: '2026-10-06' },
    { ref: 'MLK-1041', customer: 'Amina', phone: '+254 723 456 789', location: 'Mjini Town', packs: 1, total: 50, status: 'confirmed', date: '2026-10-06' },
    { ref: 'MLK-1040', customer: 'John', phone: '+254 734 567 890', location: 'Executive', packs: 3, total: 150, status: 'packed', date: '2026-10-06' },
    { ref: 'MLK-1039', customer: 'Grace', phone: '+254 745 678 901', location: 'D8', packs: 1, total: 50, status: 'out_for_delivery', date: '2026-10-06' },
    { ref: 'MLK-1038', customer: 'Peter', phone: '+254 756 789 012', location: 'Exit 9', packs: 2, total: 100, status: 'delivered', date: '2026-10-05' },
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Orders</h1>
          <p>Manage and track all orders.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Packs</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.ref}>
                <td>{order.ref}</td>
                <td>{order.customer}</td>
                <td>{order.phone}</td>
                <td>{order.location}</td>
                <td>{order.packs}</td>
                <td>KSh {order.total}</td>
                <td><span className={`admin-status admin-status-${order.status}`}>{order.status}</span></td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
