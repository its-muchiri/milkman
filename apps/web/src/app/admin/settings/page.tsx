'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [settings] = useState({
    packPrice: 50,
    currency: 'KES',
    orderingHoursStart: '08:00',
    orderingHoursEnd: '22:00',
    deliveryStart: '05:30',
    deliveryEnd: '08:00',
    whatsappNumber: '+254 715 673 960',
    pochiShortcode: '715673960',
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Settings</h1>
          <p>Manage delivery, pricing, and contact details.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-setting-card">
          <h3>Pricing</h3>
          <label className="field">
            <span>Pack price (KES)</span>
            <input type="number" defaultValue={settings.packPrice} />
          </label>
        </div>
        <div className="admin-setting-card">
          <h3>Ordering hours</h3>
          <label className="field">
            <span>Start</span>
            <input type="time" defaultValue={settings.orderingHoursStart} />
          </label>
          <label className="field">
            <span>End</span>
            <input type="time" defaultValue={settings.orderingHoursEnd} />
          </label>
        </div>
        <div className="admin-setting-card">
          <h3>Delivery window</h3>
          <label className="field">
            <span>Start</span>
            <input type="time" defaultValue={settings.deliveryStart} />
          </label>
          <label className="field">
            <span>End</span>
            <input type="time" defaultValue={settings.deliveryEnd} />
          </label>
        </div>
        <div className="admin-setting-card">
          <h3>WhatsApp / M-Pesa</h3>
          <label className="field">
            <span>WhatsApp number</span>
            <input type="text" defaultValue={settings.whatsappNumber} />
          </label>
          <label className="field">
            <span>Pochi shortcode</span>
            <input type="text" defaultValue={settings.pochiShortcode} />
          </label>
        </div>
      </div>
    </div>
  );
}
