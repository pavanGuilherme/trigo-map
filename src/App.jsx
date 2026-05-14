import { useState, useCallback } from "react";
import WorldMap from "./components/WorldMap";
import SidePanel from "./components/SidePanel";
import { wheatCountries } from "./data/countries";

const sorted = Object.entries(wheatCountries).sort((a, b) => a[1].rank - b[1].rank);

export default function App() {
  const [selected, setSelected] = useState(null);
  const [markerPositions, setMarkerPositions] = useState({});
  const [rankingOpen, setRankingOpen] = useState(false);

  const handleSelect = (key) => {
    setSelected(prev => prev === key ? null : key);
  };

  const handleMarkerPosition = useCallback((positions) => {
    setMarkerPositions(prev => ({ ...prev, ...positions }));
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#060d18" }}>

      {/* Background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 50% 40%, #0a1628 0%, #060d18 100%)",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        padding: "1.2rem 2rem",
        background: "linear-gradient(to bottom, rgba(6,13,24,0.97), transparent)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        pointerEvents: "none",
      }}>
        <div>
          <div className="bebas" style={{ fontSize: "1.5rem", color: "#E8B84B", letterSpacing: "0.1em" }}>
            🌾 Trigo no Brasil e no Mundo
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(245,237,216,0.3)", letterSpacing: "0.2em", marginTop: "0.1rem" }}>
            FEIRA DE CIÊNCIAS · 9º ANO
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {[
            { color: "#E8B84B", label: "Produtores" },
            { color: "#5A9E72", label: "Exportadores" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "rgba(245,237,216,0.35)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
        <WorldMap
          onCountrySelect={handleSelect}
          selectedCountry={selected}
          onMarkerPosition={handleMarkerPosition}
        />
      </div>

      {/* Card with arrow */}
      <SidePanel
        countryKey={selected}
        onClose={() => setSelected(null)}
        markerPos={markerPositions}
      />

      {/* Ranking toggle button */}
      <button
        onClick={() => setRankingOpen(prev => !prev)}
        style={{
          position: "absolute", top: "50%",
          right: rankingOpen ? "270px" : "0",
          transform: "translateY(-50%)",
          zIndex: 25, padding: "0.75rem 0.5rem",
          background: "rgba(6,13,24,0.92)",
          border: "1px solid rgba(232,184,75,0.2)",
          borderRight: "none",
          borderRadius: "8px 0 0 8px",
          color: "#E8B84B", cursor: "pointer",
          transition: "right 0.4s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>🏆</span>
        <span style={{
          fontSize: "0.55rem", letterSpacing: "0.1em",
          textTransform: "uppercase", writingMode: "vertical-rl",
          color: "rgba(245,237,216,0.4)",
        }}>
          Ranking
        </span>
      </button>

      {/* Ranking panel */}
      <div style={{
        position: "absolute", top: "50%",
        right: rankingOpen ? "0" : "-270px",
        transform: "translateY(-50%)",
        width: "270px", zIndex: 24,
        background: "rgba(6,13,24,0.94)",
        border: "1px solid rgba(232,184,75,0.15)",
        borderRadius: "10px 0 0 10px",
        backdropFilter: "blur(20px)",
        transition: "right 0.4s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
        maxHeight: "70vh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #E8B84B, transparent)", flexShrink: 0 }} />

        <div style={{ padding: "1rem 1.2rem 0.75rem", flexShrink: 0 }}>
          <div className="bebas" style={{ fontSize: "1.2rem", color: "#E8B84B", letterSpacing: "0.1em" }}>
            🏆 Ranking de Produção
          </div>
          <div style={{ fontSize: "0.62rem", color: "rgba(245,237,216,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Safra 2024/25 · Mi toneladas
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 1.2rem 1rem" }}>
          {sorted.map(([key, c], i) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                width: "100%", padding: "0.65rem 0.5rem",
                background: selected === key ? `${c.color}15` : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer", textAlign: "left",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${c.color}18`}
              onMouseLeave={e => e.currentTarget.style.background = selected === key ? `${c.color}15` : "transparent"}
            >
              <div className="bebas" style={{ fontSize: "1.1rem", color: "rgba(245,237,216,0.2)", minWidth: "22px" }}>
                {i + 1}
              </div>
              <span style={{ fontSize: "1.3rem" }}>{c.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.82rem", color: "#F5EDD8", fontWeight: 500, marginBottom: "0.25rem" }}>
                  {c.name}
                </div>
                <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    background: `linear-gradient(90deg, ${c.color}66, ${c.color})`,
                    width: `${(c.production / 140) * 100}%`,
                  }} />
                </div>
              </div>
              <div className="bebas" style={{ fontSize: "0.95rem", color: c.color, whiteSpace: "nowrap" }}>
                {c.production}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center hint */}
      {!selected && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none", textAlign: "center", zIndex: 3,
          color: "rgba(245,237,216,0.06)",
        }}>
          <div className="bebas" style={{ fontSize: "4rem", letterSpacing: "0.15em" }}>Explore o mapa</div>
          <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", marginTop: "0.3rem" }}>
            Clique num país destacado
          </div>
        </div>
      )}
    </div>
  );
}