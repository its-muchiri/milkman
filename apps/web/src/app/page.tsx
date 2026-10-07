'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowIcon, BottleIcon, WhatsAppIcon, CheckIcon, ClockIcon } from '../components/icons';
import { PACK_PRICE_KSH } from '@milkman/shared';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LOCATIONS = [
  'Diaspora',
  'Mjini Soko',
  'Mjini Town',
  'Ngomongo',
  'Executive',
  'D8',
  'Exit 9',
];

const WHATSAPP_NUMBER = '254715673960';
const POCHI_SHORTCODE = '715673960';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function Home() {
  const [packs, setPacks] = useState(1);
  const [step, setStep] = useState<'location' | 'details' | 'pay'>('location');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const orderY = useTransform(scrollY, [0, 500], [100, -50]);

  const total = packs * 50;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.animate-on-scroll').forEach((el, i) => {
        gsap.fromTo(
          el as HTMLElement,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el as HTMLElement,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!checkoutRequestId || paymentStatus === 'success' || paymentStatus === 'failed') return;
    const timer = setInterval(() => {
      checkPaymentStatus();
    }, 3000);
    return () => clearInterval(timer);
  }, [checkoutRequestId, paymentStatus]);

  function validateLocation(): boolean {
    if (!selectedLocation) {
      setErrors({ location: 'Please select your nearest location' });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateDetails(): boolean {
    const next: Record<string, string> = {};
    if (!phone.trim()) next.phone = 'Phone number is required';
    else if (!/^(\+?254|0)[17]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      next.phone = 'Enter a valid Kenyan number like 0712 345 678';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitOrder() {
    if (!validateDetails()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: selectedLocation,
          phone: phone.trim(),
          packs,
          total,
          location: selectedLocation,
          note: note.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Order failed');
      }

      const data = (await res.json()) as { reference: string };
      setConfirmation(data.reference);
      setStep('pay');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  }

  function sendToWhatsApp() {
    const msg = encodeURIComponent(
      `Hello, I want to order ${packs} pack(s) from ${selectedLocation}. Total: KSh ${total}. Phone: ${phone}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }

  async function initiateMpesaPayment() {
    if (!confirmation) return;
    setPaying(true);
    setPaymentStatus('pending');
    setErrors({});

    try {
      const res = await fetch('/api/daraja/pochi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: total,
          accountReference: confirmation,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Payment initiation failed');
      }

      const data = (await res.json()) as { CheckoutRequestID?: string; CustomerMessage?: string };
      if (data.CheckoutRequestID) {
        setCheckoutRequestId(data.CheckoutRequestID);
        setErrors({ payment: data.CustomerMessage || 'Check your phone for the STK Push prompt.' });
      } else {
        setErrors({ payment: data.CustomerMessage || 'Payment initiated. Check your phone.' });
      }
    } catch (err) {
      setPaymentStatus('failed');
      setErrors({ payment: err instanceof Error ? err.message : 'Payment initiation failed' });
    } finally {
      setPaying(false);
    }
  }

  async function checkPaymentStatus() {
    if (!checkoutRequestId) return;
    try {
      const res = await fetch(`/api/payments/status/${checkoutRequestId}`);
      if (!res.ok) {
        throw new Error('Failed to check payment status');
      }
      const data = (await res.json()) as { status?: string };
      if (data.status === 'paid') {
        setPaymentStatus('success');
        setErrors({});
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        setErrors({ payment: 'Payment failed. Please try again.' });
      }
    } catch (err) {
      // Silently fail - user can try again
    }
  }

  function resetOrder() {
    setStep('location');
    setSelectedLocation('');
    setPhone('');
    setNote('');
    setConfirmation(null);
    setErrors({});
  }

  if (confirmation) {
    return (
      <main>
        <section className="hero" id="home">
          <nav className="topbar">
            <Link className="brand" href="#home">
              <BottleIcon />
              <span>The Milkman</span>
            </Link>
            <div className="nav-place">Kutus · Kirinyaga</div>
            <button className="nav-order" type="button" onClick={resetOrder}>
              New order
            </button>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <motion.div className="kicker" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                Order received
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                Your<br />reference
              </motion.h1>
              <motion.div className="confirmation-logo" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
                <Image src="/logo.png" alt="The Milkman" width={120} height={120} className="confirmation-logo-img" />
              </motion.div>
              <motion.p className="confirmation-ref" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                {confirmation}
              </motion.p>
              <motion.div className="confirmation-details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <p>{packs} pack{packs > 1 ? 's' : ''} · KSh {total} · {selectedLocation}</p>
              </motion.div>
              <motion.div className="confirmation-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <button className="primary-button" type="button" onClick={sendToWhatsApp}>
                  <WhatsAppIcon />
                  <span>Chat on WhatsApp</span>
                </button>
                <button className="primary-button secondary-button" type="button" onClick={resetOrder}>
                  <CheckIcon />
                  <span>Place another order</span>
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="hero" id="home">
        <nav className="topbar">
          <Link className="brand" href="#home">
            <Image src="/logo.png" alt="The Milkman logo" width={40} height={40} className="brand-logo" priority />
            <span>The Milkman</span>
          </Link>
          <div className="nav-place">Kutus · Kirinyaga</div>
          <button className="nav-order" type="button" onClick={() => orderRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Order now <ArrowIcon />
          </button>
        </nav>

        <motion.div className="hero-grid" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="hero-copy">
            <motion.div className="kicker" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              Your neighbourhood milk round
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}>
              The<br />Milkman
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
              Fresh milk delivered around Kutus, Kirinyaga. Simple to order, carefully packed, and brought straight to your door.
            </motion.p>
            <motion.button className="primary-button" type="button" onClick={() => orderRef.current?.scrollIntoView({ behavior: 'smooth' })} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              Get fresh milk <ArrowIcon />
            </motion.button>
          </div>

          <div className="illustration-wrap">
            <div className="sun-disc" />
            <div className="hero-3d">
              <div className="hero-3d-placeholder" aria-hidden="true">
                <Image src="/poster.png" alt="The Milkman" width={300} height={300} className="hero-logo-img" priority />
              </div>
            </div>
            <div className="vintage-stamp">
              <span>Fresh</span>
              <BottleIcon />
              <span>Daily</span>
            </div>
          </div>

          <div className="hours-card">
            <ClockIcon />
            <div>
              <span>Order every day</span>
              <strong>8:00 AM — 10:00 PM</strong>
            </div>
          </div>
        </motion.div>

        <div className="hero-footer">
          <span>Fresh milk</span>
          <span>Local delivery</span>
          <span>Kutus, Kenya</span>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="how-it-works">
        <div className="section-heading animate-on-scroll">
          <span>Good milk, no fuss</span>
          <h2>A simple daily service.</h2>
        </div>
        <div className="steps">
          {[
            { num: '01', icon: <BottleIcon />, title: 'Choose your milk', desc: 'Pick the number of packs and confirm your details.', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
            { num: '02', icon: <WhatsAppIcon />, title: 'Order on time', desc: 'Send your order between 8:00 AM and 10:00 PM.', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80' },
            { num: '03', icon: <ArrowIcon />, title: 'We deliver', desc: 'We confirm your details and bring it to you in Kutus.', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
          ].map((step, i) => (
            <motion.article key={step.num} className="animate-on-scroll" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeIn}>
              <span className="step-number">{step.num}</span>
              <div className="step-image">
                <Image src={step.img} alt={step.title} fill sizes="(min-width: 900px) 300px, 80vw" />
              </div>
              {step.icon}
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── ORDER FORM ─────────────────────────────────────────────── */}
      <section className="order-section" id="order" ref={orderRef}>
        <motion.div className="order-intro animate-on-scroll" style={{ y: orderY }}>
          <span className="small-label">Today&apos;s milk round</span>
          <div className="order-intro-image">
            <Image src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80" alt="Fresh milk" fill sizes="(min-width: 900px) 40vw, 90vw" />
          </div>
          <h2>
            Milk at<br />your door.
          </h2>
          <p>Place your order below. We&apos;ll contact you to confirm the delivery location and time.</p>
          <div className="open-note">
            <ClockIcon />
            <span>
              Ordering hours
              <strong>8:00 AM — 10:00 PM daily · EAT</strong>
            </span>
          </div>
        </motion.div>

        <motion.div className="order-card animate-on-scroll" variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
          {step === 'location' && (
            <motion.div className="order-step" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="order-card-head">
                <span>Select your location</span>
                <span>KSh {PACK_PRICE_KSH} / pack</span>
              </div>
              <div className="location-grid">
                {LOCATIONS.map((loc) => (
                  <motion.button key={loc} type="button" className={`location-chip ${selectedLocation === loc ? 'selected' : ''}`} onClick={() => { setSelectedLocation(loc); setErrors({}); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {loc}
                  </motion.button>
                ))}
              </div>
              {errors.location && <p className="field-error">{errors.location}</p>}
              <button className="checkout-button" type="button" disabled={!selectedLocation} onClick={() => { if (validateLocation()) setStep('details'); }}>
                <span>Continue</span>
                <ArrowIcon />
              </button>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div className="order-step" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="order-card-head">
                <span>Your details</span>
                <span>{selectedLocation}</span>
              </div>
              <div className="form-fields">
                <label className="field">
                  <span>Phone number</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" autoComplete="tel" />
                  {errors.phone && <em className="field-error">{errors.phone}</em>}
                </label>
                <label className="field">
                  <span>Note <small>(optional)</small></span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gate instructions, landmarks..." rows={3} />
                </label>
              </div>
              <div className="stepper">
                <button type="button" onClick={() => setPacks(Math.max(1, packs - 1))}>−</button>
                <span>{packs} pack{packs > 1 ? 's' : ''}</span>
                <button type="button" onClick={() => setPacks(packs + 1)}>+</button>
              </div>
              <div className="total-row">
                <span>Your total</span>
                <strong>KSh {total}</strong>
              </div>
              <button className="checkout-button" type="button" disabled={submitting} onClick={submitOrder}>
                <span>{submitting ? 'Placing order...' : 'Order milk'}</span>
                <ArrowIcon />
              </button>
            </motion.div>
          )}

          {step === 'pay' && (
            <motion.div className="order-step" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="order-card-head">
                <span>Complete payment</span>
                <span>KSh {total}</span>
              </div>
              <div className="payment-options">
                {paymentStatus === 'success' ? (
                  <div className="payment-success">
                    <p>Payment successful! Your order is confirmed.</p>
                    <p className="payment-ref">Reference: {confirmation}</p>
                  </div>
                ) : (
                  <>
                    {!checkoutRequestId && (
                      <button className="checkout-button mpesa-button" type="button" onClick={initiateMpesaPayment} disabled={paying}>
                        <WhatsAppIcon />
                        <span>{paying ? 'Processing...' : 'Pay with M-Pesa'}</span>
                      </button>
                    )}
                    {checkoutRequestId && paymentStatus !== 'failed' && (
                      <button className="checkout-button secondary-button" type="button" onClick={checkPaymentStatus}>
                        <span>Check payment status</span>
                      </button>
                    )}
                    <button className="checkout-button secondary-button" type="button" onClick={sendToWhatsApp}>
                      <span>Chat on WhatsApp</span>
                    </button>
                    {errors.payment && <p className="field-error">{errors.payment}</p>}
                    <p className="payment-hint">
                      Pay via M-Pesa Pochi la Biashara or chat with us on WhatsApp.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {errors.form && <p className="form-error">{errors.form}</p>}
        </motion.div>
      </section>

      {/* ── STORY SECTION ─────────────────────────────────────────── */}
      <section className="story-section">
        <div className="story-grid">
          <motion.div className="story-image" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }}>
            <Image src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80" alt="Fresh milk bottles" fill sizes="(min-width: 900px) 45vw, 90vw" priority />
          </motion.div>
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Morning fresh</span>
            <h2>From the dairy,<br />to your doorstep.</h2>
            <p>We work with local dairy farmers around Kirinyaga to bring you fresh, clean milk every morning.</p>
          </motion.div>
        </div>

        <div className="story-grid reverse">
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Simple ordering</span>
            <h2>Fifty shillings,<br />that is the whole idea.</h2>
            <p>One standard pack, one fixed price. Order between 8:00 AM and 10:00 PM, and we deliver before 8:00 AM the next day.</p>
          </motion.div>
          <motion.div className="story-image" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }}>
            <Image src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80" alt="Milk delivery" fill sizes="(min-width: 900px) 45vw, 90vw" priority />
          </motion.div>
        </div>

        <div className="story-grid">
          <motion.div className="story-image" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }}>
            <Image src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80" alt="Dairy farm" fill sizes="(min-width: 900px) 45vw, 90vw" priority />
          </motion.div>
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Our process</span>
            <h2>From farm<br />to fridge.</h2>
            <p>We collect fresh milk every morning and deliver it to your doorstep before 8 AM.</p>
          </motion.div>
        </div>

        <div className="story-grid">
          <motion.div className="story-image" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }}>
            <Image src="/images.jpg" alt="Local dairy" fill sizes="(min-width: 900px) 45vw, 90vw" priority />
          </motion.div>
          <motion.div className="story-copy" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: 0.2 }}>
            <span className="kicker">Our story</span>
            <h2>Quality you can trust.</h2>
            <p>We source directly from local farmers in Kirinyaga to ensure the highest quality milk reaches your home.</p>
          </motion.div>
        </div>
      </section>

      {/* ── HORIZONTAL SCROLL ─────────────────────────────────────── */}
      <section className="horizontal-scroll-section">
        <div className="section-heading animate-on-scroll">
          <span>Why choose us</span>
          <h2>Quality you can taste.</h2>
        </div>
        <div className="horizontal-scroll-container">
          {[
            { title: 'Fresh daily', desc: 'Delivered every morning before 8 AM.', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
            { title: 'Fair price', desc: 'KSh 50 per pack, no hidden costs.', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80' },
            { title: 'Local farmers', desc: 'We source directly from Kirinyaga.', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
            { title: 'Easy ordering', desc: 'Order via WhatsApp or this form.', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80' },
            { title: 'Fast delivery', desc: 'Same-day delivery across Kutus.', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80' },
          ].map((item, i) => (
            <motion.div key={item.title} className="horizontal-card" initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ y: -6, scale: 1.02 }}>
              <div className="horizontal-card-image">
                <Image src={item.img} alt={item.title} fill sizes="(min-width: 900px) 320px, 80vw" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PARALLAX ─────────────────────────────────────────────── */}
      <section className="parallax-section" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=80')" }}>
        <motion.div className="parallax-content" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}>
          <h2>From farm to doorstep,<br />every single day.</h2>
          <p>We believe in fresh, quality milk delivered with care.</p>
        </motion.div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────────────────── */}
      <section className="gallery-section">
        <div className="section-heading animate-on-scroll">
          <span>Gallery</span>
          <h2>Fresh moments.</h2>
        </div>
        <div className="gallery-grid">
          {[
            'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
            '/images.jpg',
            'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80',
            '/images-1.jpg',
            'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
          ].map((src, i) => (
            <motion.div key={src} className="gallery-item" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
              <Image src={src} alt={`Gallery image ${i + 1}`} fill sizes="(min-width: 900px) 300px, 90vw" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────────────────── */}
      <section className="gallery-section">
        <div className="section-heading animate-on-scroll">
          <span>Gallery</span>
          <h2>Fresh moments.</h2>
        </div>
        <div className="gallery-grid">
          {[
            '/poster.png',
            '/images.jpg',
            '/images-1.jpg',
            '/poster.png',
            '/images.jpg',
            '/images-1.jpg',
          ].map((src, i) => (
            <motion.div key={src} className="gallery-item" initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: i * 0.08 }}>
              <Image src={src} alt={`Gallery image ${i + 1}`} fill sizes="(min-width: 900px) 300px, 90vw" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PREMIUM FEATURES ────────────────────────────────────────── */}
      <section className="premium-section">
        <div className="section-heading animate-on-scroll">
          <span>Premium service</span>
          <h2>Quality you can trust.</h2>
        </div>
        <div className="premium-grid">
          {[
            { title: 'Fresh daily', desc: 'Delivered every morning before 8 AM.', icon: '🥛' },
            { title: 'Fair price', desc: 'KSh 50 per pack, no hidden costs.', icon: '💰' },
            { title: 'Local farmers', desc: 'We source directly from Kirinyaga.', icon: '🌾' },
            { title: 'Easy ordering', desc: 'Order via WhatsApp or this form.', icon: '📱' },
            { title: 'Fast delivery', desc: 'Same-day delivery across Kutus.', icon: '🚀' },
            { title: 'Quality tested', desc: 'Every pack is tested and certified.', icon: '✓' },
          ].map((feature, i) => (
            <motion.div key={feature.title} className="premium-card" initial={{ opacity: 0, y: 40, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ y: -8, scale: 1.02 }}>
              <div className="premium-card-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer>
        <Link className="brand footer-brand" href="#home">
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
