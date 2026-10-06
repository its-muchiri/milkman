'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BottleIcon, ArrowIcon } from '../../components/icons';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export default function AboutPage() {
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
              Our story
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              Fresh milk,<br />local roots.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              The Milkman started with a simple idea: deliver fresh, quality milk to homes in Kutus, Kirinyaga at a fair price.
              We work directly with local dairy farmers, cutting out middlemen and ensuring every pack is fresh and clean.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="story-grid">
          <motion.div className="story-image" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Image src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80" alt="Dairy farm" fill sizes="(min-width: 900px) 45vw, 90vw" />
          </motion.div>
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Local farmers</span>
            <h2>Supporting our community</h2>
            <p>We partner with dairy farmers across Kirinyaga County, providing them with a reliable market for their milk while ensuring you get the freshest product possible.</p>
          </motion.div>
        </div>

        <div className="story-grid reverse">
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Quality first</span>
            <h2>Every pack, every day</h2>
            <p>From the farm to your doorstep, we maintain strict quality controls. Our milk is tested, pasteurized, and packed under hygienic conditions to ensure you get the best.</p>
          </motion.div>
          <motion.div className="story-image" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Image src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80" alt="Fresh milk" fill sizes="(min-width: 900px) 45vw, 90vw" />
          </motion.div>
        </div>
      </section>

      <footer>
        <Link className="brand footer-brand" href="/">
          <BottleIcon />
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
