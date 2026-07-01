import { TICKER_ITEMS } from "@/data/site";

export const Ticker = ({ items = TICKER_ITEMS }) => {
  const doubled = [...items, ...items];
  return (
    <div
      data-testid="ticker-marquee"
      className="pb-sec-charcoal overflow-hidden py-4"
      style={{ borderTop: "1px solid var(--pb-border)", borderBottom: "1px solid var(--pb-border)" }}
    >
      <div className="pb-ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="pb-ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
};
