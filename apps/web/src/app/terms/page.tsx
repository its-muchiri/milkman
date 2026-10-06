import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — The Milkman',
  description: 'Terms of service for The Milkman milk delivery service.',
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link className="back-link" href="/">
          ← Back to home
        </Link>
        <h1>Terms of Service</h1>
        <p>Last updated: October 2026</p>

        <h2>Service</h2>
        <p>
          The Milkman delivers fresh milk packs in Kutus, Kirinyaga. Orders are
          accepted daily between 8:00 AM and 10:00 PM Africa/Nairobi.
        </p>

        <h2>Orders and delivery</h2>
        <p>
          Orders placed by 10:00 PM are scheduled for next-morning delivery
          between 5:30 AM and 8:00 AM. Delivery depends on rider availability
          and road conditions.
        </p>

        <h2>Payments</h2>
        <p>
          We accept M-Pesa. Failed or expired payments may cancel the order.
        </p>

        <h2>Limits</h2>
        <p>
          We may cancel or refuse orders outside our delivery zone or when stock
          is unavailable.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? WhatsApp us or call the number listed on our homepage.
        </p>
      </div>
    </main>
  );
}
