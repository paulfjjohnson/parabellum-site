export const Crest = ({ size = 200, className = "", opacity = 1 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    style={{ opacity }}
    aria-hidden="true"
  >
    <polygon
      points="50,4 88,26 88,74 50,96 12,74 12,26"
      fill="none"
      stroke="var(--pb-gold)"
      strokeWidth="1"
    />
    <polygon
      points="50,14 79,31 79,69 50,86 21,69 21,31"
      fill="none"
      stroke="var(--pb-gold)"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <text
      x="50"
      y="66"
      textAnchor="middle"
      fontFamily="var(--pb-serif)"
      fontSize="46"
      fontWeight="300"
      fill="var(--pb-gold)"
    >
      P
    </text>
  </svg>
);
