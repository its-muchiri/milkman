import { useState } from "react";
import milkmanIllustration from "./assets/the-milkman-reference.png";

const sizes = [
  { id: "half", label: "500 ml", price: 60 },
  { id: "one", label: "1 litre", price: 110 },
  { id: "two", label: "2 litres", price: 210 },
];

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

export default function App() {
  const [selectedSize, setSelectedSize] = useState("one");
  const [quantity, setQuantity] = useState(1);
  const [ordered, setOrdered] = useState(false);

  const milk = sizes.find((size) => size.id === selectedSize)!;
  const total = milk.price * quantity;

  function goToOrder() {
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
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
            <img
              src={milkmanIllustration}
              alt="Vintage illustration of a milkman carrying bottles"
            />
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
        <div className="section-heading">
          <span>Good milk, no fuss</span>
          <h2>A simple daily service.</h2>
        </div>
        <div className="steps">
          <article>
            <span className="step-number">01</span>
            <BottleIcon />
            <h3>Choose your milk</h3>
            <p>Pick the bottle size and quantity that works for you.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <ClockIcon />
            <h3>Order on time</h3>
            <p>Send your order between 8:00 AM and 10:00 PM.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <ArrowIcon />
            <h3>We deliver</h3>
            <p>We confirm your details and bring it to you in Kutus.</p>
          </article>
        </div>
      </section>

      <section className="order-section" id="order">
        <div className="order-intro">
          <span className="small-label">Today&apos;s milk round</span>
          <h2>
            Milk at
            <br />
            your door.
          </h2>
          <p>
            Choose your bottle and quantity. We&apos;ll contact you to confirm
            the delivery location and time.
          </p>
          <div className="open-note">
            <ClockIcon />
            <span>
              Ordering hours
              <strong>8:00 AM — 10:00 PM daily</strong>
            </span>
          </div>
        </div>

        <div className="order-card">
          <div className="order-card-head">
            <span>Choose a bottle</span>
            <span>Prices in KSh</span>
          </div>

          <div className="size-options">
            {sizes.map((size) => (
              <button
                type="button"
                key={size.id}
                className={selectedSize === size.id ? "selected" : ""}
                onClick={() => {
                  setSelectedSize(size.id);
                  setOrdered(false);
                }}
              >
                <BottleIcon />
                <span>{size.label}</span>
                <strong>KSh {size.price}</strong>
              </button>
            ))}
          </div>

          <div className="quantity-row">
            <div>
              <span>How many?</span>
              <small>Number of bottles</small>
            </div>
            <div className="stepper">
              <button
                type="button"
                aria-label="Reduce quantity"
                onClick={() => {
                  setQuantity(Math.max(1, quantity - 1));
                  setOrdered(false);
                }}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => {
                  setQuantity(quantity + 1);
                  setOrdered(false);
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="total-row">
            <span>Your total</span>
            <strong>KSh {total}</strong>
          </div>

          <button
            className={`checkout-button ${ordered ? "confirmed" : ""}`}
            type="button"
            onClick={() => setOrdered(true)}
          >
            <span>
              {ordered ? "Order request received" : "Request delivery"}
            </span>
            <ArrowIcon />
          </button>
          <p className="order-note">
            Serving Kutus and nearby areas in Kirinyaga.
          </p>
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
        </div>
      </footer>
    </main>
  );
}
