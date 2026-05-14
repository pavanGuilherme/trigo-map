import { wheatCountries } from "../data/countries";
import { motion } from "framer-motion";

const sorted = Object.entries(wheatCountries).sort((a, b) => a[1].rank - b[1].rank);

export default function Legend({ selectedCountry, onSelect }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-4 left-1/2 z-20 px-4 py-3 rounded"
      style={{
        transform: "translateX(-50%)",
        background: "rgba(10,10,8,0.88)",
        border: "1px solid rgba(232,184,75,0.12)",
        backdropFilter: "blur(16px)",
        maxWidth: "90vw",
        overflowX: "auto",
      }}
    >
      <div className="text-xs uppercase tracking-widest mb-2 text-center" style={{ color: "rgba(245,237,216,0.3)" }}>
        Clique num país para explorar
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {sorted.map(([key, c]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-medium"
            style={{
              background: selectedCountry === key ? c.color + "30" : "rgba(255,255,255,0.04)",
              border: `1px solid ${selectedCountry === key ? c.color : "rgba(255,255,255,0.08)"}`,
              color: selectedCountry === key ? c.color : "rgba(245,237,216,0.5)",
              cursor: "pointer",
            }}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}