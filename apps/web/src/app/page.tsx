'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  PACK_PRICE_KSH,
  TIMEZONE,
  ORDER_REFERENCE_PREFIX,
} from '@milkman/shared';
import { normalizeKePhone, isValidKePhone, checkGeofence } from '@milkman/shared';
import type { GeofenceResult } from '@milkman/shared';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useInView } from 'framer-motion';

const MilkPackScene = dynamic(() => import('./_milk-3d').then((m) => m.MilkPackScene), { ssr: false });

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg viewBox="0 0 32 40" aria-hidden="true">
      <path d="M11 3h10v6l4 6v19a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V15l4-6V3Z" />
      <path d="M8 18h16M11 8h10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function MpesaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" />
      <path d="M12 7v5l4.5 2.7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

type Confirmation = {
  reference: string;
  name: string;
  phone: string;
  packs: number;
  total: number;
  location: string;
  lat?: number;
  lng?: number;
};

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [packs, setPacks] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceResult | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  const honeypotFieldId = useId();
  const total = packs * PACK_PRICE_KSH;
  const phoneError = phone ? (!isValidKePhone(phone) ? 'Enter a valid Kenyan mobile number' : '') : '';
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || typeof window === 'undefined') {
      setMapError('Google Maps API key not configured');
      return;
    }

    const setOptions = (window as unknown as { google: { maps: { setOptions: (opts: { key: string; version: string }) => void; importLibrary: (lib: string) => Promise<unknown> } } }).google.maps.setOptions;
    if (setOptions) {
      setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY, version: 'weekly' });
    }

    const importLib = (window as unknown as { google: { maps: { importLibrary: (lib: string) => Promise<unknown> } } }).google.maps.importLibrary;
    if (!importLib) {
      setMapError('Google Maps library not available');
      return;
    }

    importLib('maps')
      .then(() => {
        setMapLoaded(true);
        setMapLoading(false);
      })
      .catch((err) => {
        console.error('Google Maps load error', err);
        setMapError('Failed to load map');
        setMapLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -0.5667, lng: 37.2833 },
      zoom: 12,
      disableDefaultUI: false,
      clickableIcons: true,
    });

    const marker = new window.google.maps.Marker({
      position: { lat: -0.5667, lng: 37.2833 },
      map,
      draggable: true,
      title: 'Delivery location',
    });

    const updateFromLatLng = (lat: number, lng: number) => {
      setSelectedLatLng({ lat, lng });
      marker.setPosition({ lat, lng });
      const fence = checkGeofence({ lat, lng }, { lat: -0.5667, lng: 37.2833 });
      setGeofenceResult(fence);
      setLocation(`Map pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    };

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) updateFromLatLng(e.latLng.lat(), e.latLng.lng());
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) updateFromLatLng(pos.lat(), pos.lng());
    });
  }, [mapLoaded]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.animate-on-scroll').forEach((el) => {
        gsap.fromTo(
          el as HTMLElement,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
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

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!phone.trim()) next.phone = 'Phone number is required';
    else if (!isValidKePhone(phone)) next.phone = 'Enter a valid Kenyan mobile number like 0712 345 678';
    if (!location.trim()) next.location = 'Delivery location is required';
    if (packs < 1) next.packs = 'At least one pack is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: normalizeKePhone(phone),
          packs,
          total,
          location: location.trim(),
          note: note.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Order failed');
      }

      const data = (await res.json()) as { reference: string };
      setConfirmation({
        reference: data.reference,
        name: name.trim(),
        phone: normalizeKePhone(phone) || phone.trim(),
        packs,
        total,
        location: location.trim(),
        lat: selectedLatLng?.lat,
        lng: selectedLatLng?.lng,
      });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  }

  async function payWithMpesa() {
    if (!confirmation) return;
    setPaying(true);

    try {
      const res = await fetch('/api/daraja/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: confirmation.phone,
          amount: confirmation.total,
          reference: confirmation.reference,
          accountRef: `MLK-${confirmation.reference}`,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Payment failed');
      }

      alert('STK Push sent to your phone. Complete the payment to confirm your order.');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Payment failed' });
    } finally {
      setPaying(false);
    }
  }

  function resetOrder() {
    setPacks(1);
    setName('');
    setPhone('');
    setLocation('');
    setNote('');
    setConfirmation(null);
    setErrors({});
    setSelectedLatLng(null);
    setGeofenceResult(null);
  }

  function goToOrder() {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  }

  if (confirmation) {
    const whatsappText = encodeURIComponent(
      `Hello, I just placed order ${confirmation.reference} for ${confirmation.packs} pack(s) to ${confirmation.location}. Total KSh ${confirmation.total}.`
    );
    return (
      <main>
        <section className="hero" id="home">
          <nav className="topbar" aria-label="Main navigation">
            <a className="brand" href="#home" aria-label="The Milkman home">
              <BottleIcon />
              <span>The Milkman</span>
            </a>
            <div className="nav-place">Kutus · Kirinyaga</div>
            <button className="nav-order" type="button" onClick={resetOrder}>
              New order
            </button>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="kicker">Order received</div>
              <h1>
                Your
                <br />
                reference
              </h1>
              <p className="confirmation-details">
                {confirmation.name} · {confirmation.phone}
              </p>
              <p className="confirmation-ref">{confirmation.reference}</p>
              <p className="confirmation-meta">
                {confirmation.packs} pack(s) · KSh {confirmation.total} · {confirmation.location}
              </p>
              <div className="confirmation-actions">
                <button className="primary-button" type="button" onClick={payWithMpesa} disabled={paying}>
                  <MpesaIcon />
                  <span>{paying ? 'Requesting payment...' : 'Pay with M-Pesa'}</span>
                </button>
                <a
                  className="primary-button whatsapp-button"
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon />
                  <span>Chat on WhatsApp</span>
                </a>
                <button className="primary-button secondary-button" type="button" onClick={resetOrder}>
                  <CheckIcon />
                  <span>Place another order</span>
                </button>
              </div>
            </div>

            <div className="illustration-wrap">
              <div className="sun-disc" />
              <div className="hero-3d">
                <MilkPackScene />
              </div>
              <div className="vintage-stamp">
                <span>Fresh</span>
                <BottleIcon />
                <span>Daily</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero" id="home">
        <nav className="topbar" aria-label="Main navigation">
          <a className="brand" href="#home" aria-label="The Milkman home">
            <BottleIcon />
            <span>The Milkman</span>
          </a>
          <div className="nav-place">Kutus · Kirinyaga</div>
          <button className="nav-order" type="button" onClick={goToOrder}>
            Order now <ArrowIcon />
          </button>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="kicker">Your neighbourhood milk round</div>
            <h1>
              The
              <br />
              Milkman
            </h1>
            <p>
              Fresh milk delivered around Kutus, Kirinyaga. Simple to order,
              carefully packed, and brought straight to your door.
            </p>
            <button className="primary-button" type="button" onClick={goToOrder}>
              Get fresh milk <ArrowIcon />
            </button>
          </div>

          <div className="illustration-wrap">
            <div className="sun-disc" />
            <div className="hero-3d">
              <MilkPackScene />
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
        </div>

        <div className="hero-footer">
          <span>Fresh milk</span>
          <span>Local delivery</span>
          <span>Kutus, Kenya</span>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-heading animate-on-scroll">
          <span>Good milk, no fuss</span>
          <h2>A simple daily service.</h2>
        </div>
        <div className="steps">
          <article className="animate-on-scroll">
            <span className="step-number">01</span>
            <BottleIcon />
            <h3>Choose your milk</h3>
            <p>Pick the number of packs and confirm your details.</p>
          </article>
          <article className="animate-on-scroll">
            <span className="step-number">02</span>
            <ClockIcon />
            <h3>Order on time</h3>
            <p>Send your order between 8:00 AM and 10:00 PM.</p>
          </article>
          <article className="animate-on-scroll">
            <span className="step-number">03</span>
            <ArrowIcon />
            <h3>We deliver</h3>
            <p>We confirm your details and bring it to you in Kutus.</p>
          </article>
        </div>
      </section>

      <section className="order-section" id="order">
        <div className="order-intro animate-on-scroll">
          <span className="small-label">Today&apos;s milk round</span>
          <h2>
            Milk at
            <br />
            your door.
          </h2>
          <p>
            Place your order below. We&apos;ll contact you to confirm
            the delivery location and time.
          </p>
          <div className="open-note">
            <ClockIcon />
            <span>
              Ordering hours
              <strong>8:00 AM — 10:00 PM daily · {TIMEZONE}</strong>
            </span>
          </div>
        </div>

        <div className="order-card animate-on-scroll">
          <form className="order-form" onSubmit={submitOrder} noValidate>
            <div className="order-card-head">
              <span>Order milk here</span>
              <span>KSh {PACK_PRICE_KSH} / pack</span>
            </div>

            <div className="form-fields">
              <label className="field">
                <span>Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kevin"
                  autoComplete="name"
                />
                {errors.name && <em className="field-error">{errors.name}</em>}
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07xx xxx xxx or +254..."
                  autoComplete="tel"
                />
                {phoneError && <em className="field-error">{phoneError}</em>}
              </label>

              <label className="field">
                <span>Delivery location</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Tap the map or type a landmark"
                />
                {errors.location && <em className="field-error">{errors.location}</em>}
              </label>

              <div className="map-wrap">
                <div ref={mapRef} className="map-canvas" />
                {mapLoading && <p className="map-loading">Loading map...</p>}
                {mapError && <p className="map-error">{mapError}</p>}
                {geofenceResult && (
                  <div className="geofence-badge">
                    {geofenceResult.distanceKm.toFixed(1)} km · {geofenceResult.zone.replace('_', ' ')} · {geofenceResult.vehicle}
                  </div>
                )}
              </div>

              <label className="field">
                <span>Packs</span>
                <div className="stepper">
                  <button
                    type="button"
                    aria-label="Reduce packs"
                    onClick={() => setPacks(Math.max(1, packs - 1))}
                  >
                    −
                  </button>
                  <span>{packs}</span>
                  <button
                    type="button"
                    aria-label="Increase packs"
                    onClick={() => setPacks(packs + 1)}
                  >
                    +
                  </button>
                </div>
              </label>

              <label className="field">
                <span>Note <small>(optional)</small></span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Gate instructions, landmarks..."
                  rows={3}
                />
              </label>
            </div>

            <div className="total-row">
              <span>Your total</span>
              <strong>KSh {total}</strong>
            </div>

            <div className="payment-row">
              <button
                className={`checkout-button ${submitting ? 'submitting' : ''}`}
                type="submit"
                disabled={submitting}
              >
                <span>{submitting ? 'Placing order...' : 'Order milk'}</span>
                <ArrowIcon />
              </button>
              <button
                className={`checkout-button mpesa-button ${paying ? 'submitting' : ''}`}
                type="button"
                disabled={!location || packs < 1}
                onClick={payWithMpesa}
              >
                <MpesaIcon />
                <span>{paying ? 'Requesting STK Push...' : 'Pay with M-Pesa Pochi'}</span>
              </button>
            </div>

            <p className="order-note">
              Orders are locked for next-morning delivery between 5:30 AM and 8:00 AM.
            </p>

            <div className="honeypot-field" aria-hidden="true">
              <label htmlFor={honeypotFieldId}>Website</label>
              <input
                id={honeypotFieldId}
                name="website"
                tabIndex={-1}
                autoComplete="off"
                onChange={(e) => {
                  if (e.target.value) setName(e.target.value);
                }}
              />
            </div>

            {errors.form && <p className="form-error">{errors.form}</p>}
          </form>
        </div>
      </section>

      <section className="story-section">
        <div className="story-grid">
          <div className="story-image animate-on-scroll">
            <Image
              src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80"
              alt="Fresh milk bottles on a wooden table"
              fill
              sizes="(min-width: 900px) 45vw, 90vw"
              priority
            />
          </div>
          <div className="story-copy animate-on-scroll">
            <span className="kicker">Morning fresh</span>
            <h2>
              From the dairy,
              <br />
              to your doorstep.
            </h2>
            <p>
              We work with local dairy farmers around Kirinyaga to bring you
              fresh, clean milk every morning. No middlemen, no long supply
              chains — just good milk.
            </p>
          </div>
        </div>

        <div className="story-grid reverse">
          <div className="story-copy animate-on-scroll">
            <span className="kicker">Simple ordering</span>
            <h2>
              Fifty shillings,
              <br />
              that is the whole idea.
            </h2>
            <p>
              One standard pack, one fixed price. Order between 8:00 AM and
              10:00 PM, and we deliver before 8:00 AM the next day.
            </p>
          </div>
          <div className="story-image animate-on-scroll">
            <Image
              src="https://images.unsplash.com/photo-1628088062854-d1871b0cdd8a?auto=format&fit=crop&w=900&q=80"
              alt="A milk delivery rider on a bicycle"
              fill
              sizes="(min-width: 900px) 45vw, 90vw"
              priority
            />
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#home">
          <BottleIcon />
          <span>The Milkman</span>
        </a>
        <p>Fresh milk. Friendly service. Every day.</p>
        <div className="footer-meta">
          <span>8:00 AM — 10:00 PM</span>
          <span>Kutus · Kirinyaga · Kenya</span>
          <a className="footer-legal" href="/privacy">Privacy</a>
          <a className="footer-legal" href="/terms">Terms</a>
        </div>
      </footer>
    </main>
  );
}
