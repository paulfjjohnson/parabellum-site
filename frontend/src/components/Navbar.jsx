import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/data/site";
import { Crest } from "@/components/Crest";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      data-testid="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      style={{
        background: scrolled || open ? "rgba(5,5,5,0.94)" : "transparent",
        backdropFilter: scrolled || open ? "blur(16px)" : "none",
        borderBottom: scrolled || open ? "1px solid var(--pb-border)" : "1px solid transparent",
      }}
    >
      <div className="pb-container flex items-center justify-between" style={{ height: 76 }}>
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
          <Crest size={34} />
          <span className="pb-mono" style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--pb-white)" }}>
            Parabellum
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.to.replace(/\//g, "")}`}
              className="pb-mono transition-colors duration-300"
              style={{
                fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                color: pathname === l.to ? "var(--pb-gold)" : "var(--pb-gray-soft)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--pb-gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === l.to ? "var(--pb-gold)" : "var(--pb-gray-soft)")}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/request-a-launch" data-testid="nav-cta" className="pb-btn pb-btn-gold">
            Request a Launch <ArrowRight size={13} />
          </Link>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden"
          style={{ color: "var(--pb-white)" }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden pb-container pb-6" style={{ borderTop: "1px solid var(--pb-border-soft)" }}>
          <div className="flex flex-col gap-5 pt-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="pb-mono" style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--pb-gray-soft)" }}>
                {l.label}
              </Link>
            ))}
            <Link to="/request-a-launch" className="pb-btn pb-btn-gold mt-2 justify-center">
              Request a Launch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
