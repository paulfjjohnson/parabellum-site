import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "", y = 28 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const Eyebrow = ({ children, className = "", ...props }) => (
  <div className={`pb-eyebrow ${className}`} {...props}>{children}</div>
);
