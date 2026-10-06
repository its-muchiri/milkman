'use client';

import { useState } from 'react';

export default function AdminProductsPage() {
  const [products] = useState([
    { id: '1', name: 'Fresh Milk Pack', price: 50, stock: 200, unit: 'pack' },
    { id: '2', name: 'Fresh Milk 500ml', price: 80, stock: 150, unit: 'bottle' },
    { id: '3', name: 'Fresh Milk 1L', price: 140, stock: 100, unit: 'bottle' },
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog and stock.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>KSh {product.price}</td>
                <td>{product.stock}</td>
                <td>{product.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
