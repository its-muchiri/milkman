'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BottleIcon, ArrowIcon, WhatsAppIcon } from '../../components/icons';

export default function ContactPage() {
  return (
    <main>
      <section className="hero" id="home">
        <nav className="topbar">
          <Link className="brand" href="/">
            <Image src="/logo.png" alt="The Milkman logo" width={40} height={40} className="brand-logo" priority />
            <span>The Milkman</span>
          </Link>
          <div className="nav-place">Kutus · Kirinyaga</div>
          <Link className="nav-order" href="/#order">
            Order now <ArrowIcon />
          </Link>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <motion.div className="kicker" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              Get in touch
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              We&apos;re here<br />to help.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              Have questions about our delivery areas, pricing, or anything else? Reach out to us on WhatsApp or call us directly.
            </motion.p>
            <motion.div className="contact-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <a className="primary-button" href="https://wa.me/254715673960" target="_blank" rel="noreferrer">
                <WhatsAppIcon />
                <span>Chat on WhatsApp</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="story-grid">
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="kicker">Contact info</span>
            <h2>Reach us directly</h2>
            <p><strong>WhatsApp:</strong> +254 715 673 960</p>
            <p><strong>Hours:</strong> 8:00 AM — 10:00 PM daily</p>
            <p><strong>Area:</strong> Kutus, Kirinyaga, Kenya</p>
            <p>We deliver to Diaspora, Mjini Soko, Mjini Town, Ngomongo, Executive, D8, and Exit 9.</p>
          </motion.div>
          <motion.div className="story-image" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8 }}>
            <Image src="/images-1.jpg" alt="Contact us" fill sizes="(min-width: 900px) 45vw, 90vw" />
          </motion.div>
        </div>

        <div className="story-grid reverse">
          <motion.div className="story-image" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8 }}>
            <Image src="/poster.png" alt="Delivery" fill sizes="(min-width: 900px) 45vw, 90vw" />
          </motion.div>
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Fast response</span>
            <h2>We respond quickly</h2>
            <p>Message us on WhatsApp for fast ordering and support. We typically respond within minutes during business hours.</p>
          </motion.div>
        </div>
      </section>

      <footer>
        <Link className="brand footer-brand" href="/">
          <Image src="/logo.png" alt="The Milkman logo" width={40} height={40} className="brand-logo" priority />
          <span>The Milkman</span>
        </Link>
        <p>Fresh milk. Friendly service. Every day.</p>
        <div className="footer-meta">
          <span>8:00 AM — 10:00 PM</span>
          <span>Kutus · Kirinyaga · Kenya</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </main>
  );
}
