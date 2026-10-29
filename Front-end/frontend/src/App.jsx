import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import heroImage from "./assets/hero.png";
import {
  api,
  AUTH_EXPIRED_EVENT,
  getApiErrorMessage,
  readSession,
  SESSION_KEY,
} from "./lib/api";
import "./App.css";

function App() {
  const [session, setSession] = useState(readSession);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleExpiredSession = () => setSession(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
    return () =>
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  function signOut() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setMenuOpen(false);
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="HotelPro home">
            <span className="brand-mark" aria-hidden="true">H</span>
            <span>hotel<span className="brand-accent">pro</span></span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`main-nav${menuOpen ? " is-open" : ""}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Explore stays</Link>
            {session ? (
              <>
                <Link to="/bookings" onClick={() => setMenuOpen(false)}>My bookings</Link>
                <span className="nav-greeting">Hi, {session.user.name.split(" ")[0]}</span>
                <button className="nav-button" type="button" onClick={signOut}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link className="button button-small" to="/register" onClick={() => setMenuOpen(false)}>
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HotelListPage />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage session={session} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLogin={setSession} />} />
          <Route path="/bookings" element={<MyBookingsPage session={session} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <Link className="brand brand-footer" to="/">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>hotel<span className="brand-accent">pro</span></span>
        </Link>
        <p>Find a stay that feels like yours.</p>
        <span>HotelPro · Your next stay starts here</span>
      </footer>
    </div>
  );
}

function HotelListPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadHotels() {
      try {
        const { data } = await api.get("/hotels", { signal: controller.signal });
        if (!data?.success || !Array.isArray(data.hotels)) {
          throw new Error("The hotel service returned an unexpected response.");
        }
        setHotels(data.hotels);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(requestError, "We couldn't load hotels."));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHotels();
    return () => controller.abort();
  }, []);

  const filteredHotels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return hotels;
    return hotels.filter((hotel) =>
      [
        hotel.name,
        hotel.description,
        hotel.location?.city,
        hotel.location?.state,
        hotel.location?.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [hotels, query]);

  return (
    <>
      <section className="hero" style={{ "--hero-image": `url("${heroImage}")` }}>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow eyebrow-light">A better kind of getaway</p>
          <h1>Stay somewhere<br />that stays with you.</h1>
          <p className="hero-copy">
            Thoughtful places, memorable moments. Discover your next stay with HotelPro.
          </p>
          <a className="button button-light" href="#stays">Explore stays <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-note"><span className="hero-note-dot" /> Find your place to pause</div>
      </section>

      <section className="content-section stays-section" id="stays">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2>Stays worth the trip</h2>
            <p className="section-copy">Browse the hotels available on HotelPro.</p>
          </div>
          <label className="search-field">
            <span className="sr-only">Search by hotel or destination</span>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Hotel or destination"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <LoadingState label="Finding available stays" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : filteredHotels.length ? (
          <div className="hotel-grid">
            {filteredHotels.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}
          </div>
        ) : hotels.length ? (
          <EmptyState
            title="No stays match that search"
            message="Try another hotel name or destination."
            action={<button className="text-button" type="button" onClick={() => setQuery("")}>Clear search</button>}
          />
        ) : (
          <EmptyState title="No hotels to show yet" message="There are no active hotel listings available right now." />
        )}
      </section>

      <section className="trust-strip" aria-label="HotelPro booking information">
        <div><span className="trust-icon">✳</span><strong>Find your fit</strong><span>Explore the current hotel collection</span></div>
        <div><span className="trust-icon">⌂</span><strong>Book in a few steps</strong><span>Choose your dates and guest count</span></div>
        <div><span className="trust-icon">♡</span><strong>Your plans, together</strong><span>Review bookings from your account</span></div>
      </section>
    </>
  );
}

function HotelCard({ hotel }) {
  return (
    <article className="hotel-card">
      <Link className="hotel-card-image-link" to={`/hotels/${hotel._id}`} aria-label={`View ${hotel.name}`}>
        <HotelImage hotel={hotel} className="hotel-card-image" />
        <span className="image-label">HotelPro stay</span>
      </Link>
      <div className="hotel-card-body">
        <div className="hotel-card-location">
          <span aria-hidden="true">⌖</span>
          {[hotel.location?.city, hotel.location?.country].filter(Boolean).join(", ") || "Location details available"}
        </div>
        <h3><Link to={`/hotels/${hotel._id}`}>{hotel.name}</Link></h3>
        <p className="hotel-card-description">{hotel.description}</p>
        <div className="hotel-card-footer">
          <p className="price"><strong>{formatPrice(hotel.pricePerNight)}</strong><span> / night</span></p>
          <Link className="arrow-link" to={`/hotels/${hotel._id}`} aria-label={`View ${hotel.name}`}>View stay <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </article>
  );
}

function HotelDetailsPage({ session }) {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadHotel() {
      try {
        const { data } = await api.get(`/hotels/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!data?.success || !data.hotel) {
          throw new Error("The hotel service returned an unexpected response.");
        }
        setHotel(data.hotel);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(requestError, "We couldn't load this hotel."));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHotel();
    return () => controller.abort();
  }, [id]);

  if (loading) return <LoadingState label="Loading hotel details" />;
  if (error) return <div className="content-section"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!hotel) return <div className="content-section"><EmptyState title="Hotel not found" message="This stay may no longer be available." action={<Link className="button" to="/">Browse hotels</Link>} /></div>;

  return (
    <section className="content-section detail-section">
      <Link className="back-link" to="/">← Back to stays</Link>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-image-wrap"><HotelImage hotel={hotel} className="detail-image" /></div>
          <div className="detail-title">
            <p className="eyebrow">{[hotel.location?.city, hotel.location?.country].filter(Boolean).join(" · ")}</p>
            <h1>{hotel.name}</h1>
            <p className="detail-address">{[hotel.location?.address, hotel.location?.city, hotel.location?.state, hotel.location?.country].filter(Boolean).join(", ")}</p>
          </div>
          <div className="detail-description">
            <h2>About this stay</h2>
            <p>{hotel.description}</p>
          </div>
          {hotel.amenities?.length > 0 && (
            <div className="amenities">
              <h2>What this stay offers</h2>
              <ul>{hotel.amenities.map((amenity) => <li key={amenity}><span aria-hidden="true">✓</span>{amenity}</li>)}</ul>
            </div>
          )}
          <p className="capacity-note">Room capacity: up to {hotel.roomCapacity} {hotel.roomCapacity === 1 ? "guest" : "guests"}</p>
        </div>
        <BookingForm hotel={hotel} session={session} />
      </div>
    </section>
  );
}

function BookingForm({ hotel, session }) {
  const location = useLocation();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [today] = useState(() => getLocalDateString(new Date()));
  const minCheckout = checkIn ? addDays(checkIn, 1) : addDays(today, 1);
  const nights = checkIn && checkOut && checkOut > checkIn
    ? Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000)
    : 0;

  async function submitBooking(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const guestCount = Number(guests);
    if (!checkIn || !checkOut || checkOut <= checkIn || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > hotel.roomCapacity) {
      setError("Choose valid dates and a guest count within this hotel's capacity.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/bookings", {
        hotelId: hotel._id,
        checkIn,
        checkOut,
        guests: guestCount,
      });
      if (!data?.success || !data.booking) {
        throw new Error("The booking service returned an unexpected response.");
      }
      setSuccess(data.message || "Booking created successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We couldn't create your booking."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="booking-card">
      <p className="eyebrow">Make it yours</p>
      <p className="booking-price"><strong>{formatPrice(hotel.pricePerNight)}</strong><span> / night</span></p>
      <p className="booking-caption">Price shown by the hotel listing. No payment is collected here.</p>
      {success ? (
        <div className="form-notice notice-success" role="status">
          <strong>{success}</strong>
          <p>Your booking is confirmed by the hotel booking service.</p>
          <Link to="/bookings" className="button button-full">View my bookings</Link>
        </div>
      ) : !session ? (
        <div className="login-required">
          <p>Log in to choose dates and request this booking.</p>
          <Link className="button button-full" to="/login" state={{ from: location.pathname }}>
            Log in to continue
          </Link>
        </div>
      ) : (
        <form className="booking-form" onSubmit={submitBooking}>
          <label>
            Check-in
            <input type="date" min={today} required value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
          </label>
          <label>
            Check-out
            <input type="date" min={minCheckout} required value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
          </label>
          <label>
            Guests
            <select value={guests} onChange={(event) => setGuests(event.target.value)} required>
              {Array.from({ length: Math.max(1, hotel.roomCapacity) }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>
              ))}
            </select>
          </label>
          {nights > 0 && (
            <div className="estimate-row">
              <span>{formatPrice(hotel.pricePerNight)} × {nights} {nights === 1 ? "night" : "nights"}</span>
              <strong>{formatPrice(hotel.pricePerNight * nights)}</strong>
            </div>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-full" type="submit" disabled={submitting}>
            {submitting ? "Sending request…" : "Book this stay"}
          </button>
        </form>
      )}
    </aside>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitRegistration(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      if (!data?.success || !data.user) {
        throw new Error("The registration service returned an unexpected response.");
      }
      setSuccess(data.message || "Your account has been created.");
      window.setTimeout(() => navigate("/login", { state: { email } }), 900);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We couldn't create your account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow="Your next chapter" title="Create your account" subtitle="Join HotelPro and keep your upcoming stays in one place.">
      <form className="auth-form" onSubmit={submitRegistration}>
        <label>Full name<input name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /><span className="field-hint">Use 8–72 characters.</span></label>
        <label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success} Taking you to log in…</p>}
        <button className="button button-full" type="submit" disabled={busy || Boolean(success)}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </AuthLayout>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const initialEmail = location.state?.email || "";

  async function submitLogin(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (!data?.success || typeof data.token !== "string" || !data.user) {
        throw new Error("The login service returned an unexpected response.");
      }
      const nextSession = { token: data.token, user: data.user };
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      onLogin(nextSession);
      const requestedPath = location.state?.from;
      const destination =
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : "/";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We couldn't log you in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to HotelPro" subtitle="Access your bookings and plan your next stay.">
      <form className="auth-form" onSubmit={submitLogin}>
        <label>Email address<input name="email" type="email" autoComplete="email" defaultValue={initialEmail} required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-full" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="auth-switch">New to HotelPro? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}

function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link className="auth-back" to="/">← Explore stays</Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <p className="privacy-note">Your account is used to manage bookings. HotelPro does not collect payment details here.</p>
      </div>
    </section>
  );
}

function MyBookingsPage({ session }) {
  const [result, setResult] = useState({ userId: null, bookings: [], error: "" });

  useEffect(() => {
    if (!session) return undefined;
    const controller = new AbortController();
    async function loadBookings() {
      try {
        const { data } = await api.get("/bookings/my", { signal: controller.signal });
        if (!data?.success || !Array.isArray(data.bookings)) {
          throw new Error("The bookings service returned an unexpected response.");
        }
        setResult({ userId: session.user.id, bookings: data.bookings, error: "" });
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setResult({
            userId: session.user.id,
            bookings: [],
            error: getApiErrorMessage(requestError, "We couldn't load your bookings."),
          });
        }
      }
    }
    loadBookings();
    return () => controller.abort();
  }, [session]);
  const loading = Boolean(session) && result.userId !== session.user.id;

  if (!session) {
    return (
      <section className="content-section">
        <EmptyState
          title="Log in to view your bookings"
          message="Your HotelPro bookings will appear here after you sign in."
          action={<Link className="button" to="/login" state={{ from: "/bookings" }}>Log in</Link>}
        />
      </section>
    );
  }

  return (
    <section className="content-section bookings-section">
      <p className="eyebrow">Your travel plans</p>
      <h1 className="page-title">My bookings</h1>
      <p className="section-copy">A handy place to see the stays you’ve booked.</p>
      {loading ? <LoadingState label="Loading your bookings" /> : result.error ? (
        <ErrorState message={result.error} onRetry={() => window.location.reload()} />
      ) : result.bookings.length ? (
        <div className="booking-list">
          {result.bookings.map((booking) => <BookingRow key={booking._id} booking={booking} />)}
        </div>
      ) : (
        <EmptyState title="No bookings yet" message="When you book a stay, you’ll find its details here." action={<Link className="button" to="/">Explore hotels</Link>} />
      )}
    </section>
  );
}

function BookingRow({ booking }) {
  const hotel = booking.hotel;
  return (
    <article className="booking-row">
      {hotel ? <HotelImage hotel={hotel} className="booking-row-image" /> : <div className="booking-row-image image-placeholder"><span>HotelPro</span></div>}
      <div className="booking-row-info">
        <p className="eyebrow">{hotel ? [hotel.location?.city, hotel.location?.country].filter(Boolean).join(" · ") : "Hotel details unavailable"}</p>
        <h2>{hotel?.name || "Hotel stay"}</h2>
        <p>{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} <span className="booking-divider">·</span> {booking.guests} {booking.guests === 1 ? "guest" : "guests"}</p>
      </div>
      <div className="booking-row-total">
        <span className={`status-pill status-${booking.status}`}>{booking.status || "booked"}</span>
        <strong>{formatPrice(booking.totalPrice)}</strong>
        <span>Total listed price</span>
      </div>
    </article>
  );
}

function HotelImage({ hotel, className }) {
  const [failed, setFailed] = useState(false);
  if (!hotel.imageUrl || failed) {
    return <div className={`${className} image-placeholder`}><span>HotelPro</span></div>;
  }
  return <img className={className} src={hotel.imageUrl} alt={hotel.name} loading="lazy" onError={() => setFailed(true)} />;
}

function LoadingState({ label }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card state-error" role="alert">
      <span className="state-symbol" aria-hidden="true">!</span>
      <h2>That didn’t load</h2>
      <p>{message}</p>
      {onRetry && <button className="button button-outline" type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div className="state-card">
      <span className="state-symbol state-symbol-soft" aria-hidden="true">✳</span>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}

function NotFoundPage() {
  return (
    <section className="content-section">
      <EmptyState title="We can’t find that page" message="It may have moved, or the address may be incorrect." action={<Link className="button" to="/">Back to HotelPro</Link>} />
    </section>
  );
}

function formatPrice(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Price unavailable";
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

export default App;
