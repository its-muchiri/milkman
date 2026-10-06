import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — The Milkman',
  description: 'Privacy policy for The Milkman milk delivery service.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link className="back-link" href="/">
          ← Back to home
        </Link>
        <h1>Privacy Policy</h1>
        <p>Last updated: October 2026</p>

        <h2>What we collect</h2>
        <p>
          We collect your name, phone number, delivery address, and order details
          so we can deliver milk to you. We do not sell this data.
        </p>

        <h2>How we use it</h2>
        <p>
          Your data is used only to fulfill and improve the delivery service,
          send order confirmations, and comply with applicable law.
        </p>

        <h2>Payments</h2>
        <p>
          Payments are processed by M-Pesa. We do not store card or mobile-money
          PINs.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? WhatsApp us or call the number listed on our homepage.
        </p>
      </div>
    </main>
  );
}
