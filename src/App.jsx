import { useState, useCallback, useEffect } from "react";
import WorldMap from "./components/WorldMap";
import SidePanel from "./components/SidePanel";
import { countries, grains } from "./data/countries";
import QRPanel from "./components/QRPanel";

const isMobile = () => window.innerWidth < 768;

export default function App() {
  const [selectedGrain, setSelectedGrain] = useState("trigo");
  const [selected, setSelected] = useState(null);
  const [markerPositions, setMarkerPositions] = useState({});
  const [rankingOpen, setRankingOpen] = useState(false);
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentCountries = countries[selectedGrain];
  const currentGrain = grains[selectedGrain];
  const sorted = Object.entries(currentCountries).sort((a, b) => a[1].rank - b[1].rank);

  const handleSelect = (key) => {
    setSelected(prev => prev === key ? null : key);
    if (mobile) setRankingOpen(false);
  };

  const handleGrainChange = (grain) => {
    setSelectedGrain(grain);
    setSelected(null);
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
        padding: mobile ? "0.75rem 1rem" : "1rem 2rem",
        background: "linear-gradient(to bottom, rgba(6,13,24,0.97), transparent)",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: mobile ? "flex-start" : "center",
        gap: mobile ? "0.5rem" : "0",
      }}>
        <div>
          <div className="bebas" style={{
            fontSize: mobile ? "1.1rem" : "1.5rem",
            color: currentGrain.color,
            letterSpacing: "0.1em",
            transition: "color 0.4s",
          }}>
            {currentGrain.emoji} Soja, Milho e Trigo no Mundo
          </div>
          <div style={{ fontSize: "0.62rem", color: "rgba(245,237,216,0.3)", letterSpacing: "0.15em" }}>
            MOSTRA CIENTÍFICA E TECNOLÓGICA 2026 · 9º ANO
          </div>
        </div>

        {/* Grain selector */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {Object.entries(grains).map(([key, g]) => (
            <button
              key={key}
              onClick={() => handleGrainChange(key)}
              style={{
                padding: mobile ? "0.35rem 0.75rem" : "0.5rem 1.2rem",
                borderRadius: "100px",
                border: `1.5px solid ${selectedGrain === key ? g.color : "rgba(255,255,255,0.1)"}`,
                background: selectedGrain === key ? `${g.color}20` : "rgba(255,255,255,0.04)",
                color: selectedGrain === key ? g.color : "rgba(245,237,216,0.4)",
                fontSize: mobile ? "0.72rem" : "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex", alignItems: "center", gap: "0.3rem",
              }}
            >
              <span>{g.emoji}</span>
              {!mobile && <span>{g.label}</span>}
              {mobile && <span style={{ fontSize: "0.65rem" }}>{g.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
        <WorldMap
          onCountrySelect={handleSelect}
          selectedCountry={selected}
          onMarkerPosition={handleMarkerPosition}
          currentCountries={currentCountries}
          currentGrain={currentGrain}
        />
      </div>

      {/* Side Panel */}
      <SidePanel
        countryKey={selected}
        onClose={() => setSelected(null)}
        markerPos={markerPositions}
        currentCountries={currentCountries}
        currentGrain={currentGrain}
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
          border: `1px solid ${currentGrain.color}40`,
          borderRight: "none",
          borderRadius: "8px 0 0 8px",
          color: currentGrain.color, cursor: "pointer",
          transition: "right 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, color 0.3s",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>🏆</span>
        <span style={{
          fontSize: "0.55rem", letterSpacing: "0.1em",
          textTransform: "uppercase", writingMode: "vertical-rl",
          color: "rgba(245,237,216,0.4)",
        }}>Ranking</span>
      </button>

      {/* Ranking panel */}
      <div style={{
        position: "absolute", top: mobile ? "0" : "50%",
        right: rankingOpen ? "0" : "-270px",
        transform: mobile ? "none" : "translateY(-50%)",
        bottom: mobile ? "0" : "auto",
        width: "270px", zIndex: 24,
        background: "rgba(6,13,24,0.96)",
        border: `1px solid ${currentGrain.color}25`,
        borderRadius: mobile ? "0" : "10px 0 0 10px",
        backdropFilter: "blur(20px)",
        transition: "right 0.4s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
        maxHeight: mobile ? "100vh" : "70vh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${currentGrain.color}, transparent)`, flexShrink: 0 }} />

        <div style={{ padding: "1rem 1.2rem 0.75rem", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="bebas" style={{ fontSize: "1.2rem", color: currentGrain.color, letterSpacing: "0.1em" }}>
              🏆 {currentGrain.emoji} {currentGrain.label}
            </div>
            <div style={{ fontSize: "0.62rem", color: "rgba(245,237,216,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {currentGrain.source} · Mi t
            </div>
          </div>
          {mobile && (
            <button onClick={() => setRankingOpen(false)} style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              color: "rgba(245,237,216,0.4)", width: "28px", height: "28px",
              borderRadius: "50%", cursor: "pointer", fontSize: "0.85rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          )}
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
                    width: `${(c.production / currentGrain.maxProduction) * 100}%`,
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
          <div className="bebas" style={{ fontSize: mobile ? "2rem" : "4rem", letterSpacing: "0.15em" }}>
            Explore o mapa
          </div>
          <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", marginTop: "0.3rem" }}>
            {mobile ? "Toque num país" : "Clique num país destacado"}
          </div>
        </div>
      )}
    </div>
  );
}