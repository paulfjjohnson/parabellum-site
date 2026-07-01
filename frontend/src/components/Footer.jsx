import { Link } from "react-router-dom";
import { Crest } from "@/components/Crest";

const COLS = [
  {
    title: "Ecosystem",
    links: [
      ["Tee Party Solution", "/tee-party"],
      ["Digital Products", "/digital-products"],
      ["AI + Automation", "/ai-automation"],
      ["Services", "/services"],
      ["Tools", "/tools"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Partners", "/partners"],
      ["Field Notes", "/drops"],
      ["Request a Launch", "/request-a-launch"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/legal/terms"],
      ["Privacy", "/legal/privacy"],
      ["Acceptable Use", "/legal/acceptable-use"],
    ],
  },
];

export const Footer = () => (
  <footer data-testid="main-footer" className="pb-sec-black" style={{ borderTop: "1px solid var(--pb-border)" }}>
    <div className="pb-container" style={{ paddingTop: 64, paddingBottom: 40 }}>
      <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Crest size={38} />
            <span className="pb-mono" style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase" }}>Parabellum</span>
          </div>
          <p className="pb-body" style={{ fontSize: 16, maxWidth: 320 }}>
            A merch-tech ecosystem. We engineer the merchandise, the launch system, and the AI workflows behind it.
          </p>
          <p className="pb-mono pb-gold-text mt-5" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>
            Si Vis Pacem · Para Bellum
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <div className="pb-mono pb-gold-text mb-5" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>
              {col.title}
            </div>
            <ul className="flex flex-col gap-3">
              {col.links.map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="pb-body transition-colors duration-300"
                    style={{ fontSize: 15 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--pb-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--pb-gray-soft)")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pb-hairline my-10" style={{ background: "var(--pb-border-soft)" }} />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--pb-gray)" }}>
          © 2026 The Parabellum Company
        </span>
        <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--pb-gray)" }}>
          Built for Operators. Engineered for Scale.
        </span>
      </div>
    </div>
  </footer>
);
