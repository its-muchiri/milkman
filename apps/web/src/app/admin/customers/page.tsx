'use client';

import { useState } from 'react';

export default function AdminCustomersPage() {
  const [customers] = useState([
    { id: '1', name: 'Kevin', phone: '+254 712 345 678', location: 'Diaspora', orders: 12, total: 600 },
    { id: '2', name: 'Amina', phone: '+254 723 456 789', location: 'Mjini Town', orders: 8, total: 400 },
    { id: '3', name: 'John', phone: '+254 734 567 890', location: 'Executive', orders: 24, total: 1200 },
    { id: '4', name: 'Grace', phone: '+254 745 678 901', location: 'D8', orders: 5, total: 250 },
    { id: '5', name: 'Peter', phone: '+254 756 789 012', location: 'Exit 9', orders: 18, total: 900 },
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer base.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.location}</td>
                <td>{customer.orders}</td>
                <td>KSh {customer.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
