import { useEffect, useState } from "react";
import { wheatCountries } from "../data/countries";

const roleLabel = {
  produtor: { label: "Produtor", color: "#E8B84B" },
  exportador: { label: "Exportador", color: "#5A9E72" },
};

export default function SidePanel({ countryKey, onClose, markerPos }) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (countryKey) {
      setData(wheatCountries[countryKey]);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => setData(null), 400);
    }
  }, [countryKey]);

  useEffect(() => {
    if (!markerPos || !countryKey) return;
    const pos = markerPos[countryKey] || markerPos;
    if (pos) setCardPos(pos);
  }, [markerPos, countryKey]);

  if (!data) return null;

  const cardWidth = 300;
  const cardHeight = 420;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Position card near marker but keep inside viewport
  let cx = (cardPos.x || vw / 2) + 30;
  let cy = (cardPos.y || vh / 2) - cardHeight / 2;
  if (cx + cardWidth > vw - 20) cx = (cardPos.x || vw / 2) - cardWidth - 30;
  if (cy < 70) cy = 70;
  if (cy + cardHeight > vh - 20) cy = vh - cardHeight - 20;

  // Arrow: from marker to card edge
  const mx = cardPos.x || vw / 2;
  const my = cardPos.y || vh / 2;
  const arrowEndX = cx < mx ? cx + cardWidth : cx;
  const arrowEndY = cy + cardHeight / 2;

  return (
    <>
      {/* SVG Arrow */}
      {visible && (
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 25 }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={data.color} opacity="0.8" />
            </marker>
          </defs>
          <path
            d={`M ${mx} ${my} C ${mx + (arrowEndX - mx) * 0.5} ${my}, ${arrowEndX - (arrowEndX - mx) * 0.3} ${arrowEndY}, ${arrowEndX} ${arrowEndY}`}
            fill="none"
            stroke={data.color}
            strokeWidth="1.5"
            strokeDasharray="5,4"
            opacity="0.6"
            markerEnd="url(#arrowhead)"
          />
          {/* Dot at marker */}
          <circle cx={mx} cy={my} r="5" fill={data.color} opacity="0.9" />
          <circle cx={mx} cy={my} r="9" fill="none" stroke={data.color} strokeWidth="1.5" opacity="0.4" />
        </svg>
      )}

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: cardWidth,
          background: "rgba(6,13,24,0.92)",
          border: `1px solid ${data.color}40`,
          borderRadius: "10px",
          backdropFilter: "blur(24px)",
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 30px ${data.color}15`,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          zIndex: 30,
          overflow: "hidden",
        }}
      >
        {/* Top accent */}
        <div style={{ height: "2px", background: `linear-gradient(90deg, ${data.color}, transparent)` }} />

        {/* Header */}
        <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "2rem" }}>{data.flag}</span>
              <div>
                <div className="bebas" style={{ fontSize: "1.4rem", color: "#F5EDD8", lineHeight: 1 }}>
                  {data.name}
                </div>
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.6rem", padding: "0.1rem 0.45rem", borderRadius: "100px",
                    background: roleLabel[data.role].color + "20",
                    color: roleLabel[data.role].color,
                    border: `1px solid ${roleLabel[data.role].color}40`,
                  }}>
                    {roleLabel[data.role].label}
                  </span>
                  <span style={{
                    fontSize: "0.6rem", padding: "0.1rem 0.45rem", borderRadius: "100px",
                    background: "rgba(255,255,255,0.06)", color: "rgba(245,237,216,0.4)",
                  }}>
                    #{data.rank} mundial
                  </span>
                  {data.isHome && (
                    <span style={{
                      fontSize: "0.6rem", padding: "0.1rem 0.45rem", borderRadius: "100px",
                      background: "rgba(232,184,75,0.15)", color: "#E8B84B",
                      border: "1px solid rgba(232,184,75,0.3)",
                    }}>🏠 Nosso país</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              color: "rgba(245,237,216,0.4)", width: "24px", height: "24px",
              borderRadius: "50%", cursor: "pointer", fontSize: "0.75rem",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Bar */}
          <div style={{ marginTop: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.3)" }}>
                Produção anual
              </span>
              <span className="bebas" style={{ fontSize: "0.95rem", color: data.color }}>
                {data.production} Mi t
              </span>
            </div>
            <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "2px",
                background: `linear-gradient(90deg, ${data.color}55, ${data.color})`,
                width: `${(data.production / 140) * 100}%`,
                transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "0.8rem 1rem", maxHeight: "260px", overflowY: "auto" }}>
          {!data.isHome && (
            <div style={{
              padding: "0.6rem 0.8rem", marginBottom: "0.75rem", borderRadius: "5px",
              background: "rgba(232,184,75,0.05)",
              borderLeft: "2px solid rgba(232,184,75,0.35)",
            }}>
              <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#E8B84B", marginBottom: "0.3rem" }}>
                🇧🇷 Conexão com o Brasil
              </div>
              <p style={{ fontSize: "0.78rem", color: "rgba(245,237,216,0.6)", lineHeight: 1.55 }}>
                {data.connectionBR}
              </p>
            </div>
          )}

          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.25)", marginBottom: "0.4rem" }}>
              Fatos
            </div>
            {data.facts.map((fact, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem", fontSize: "0.78rem", color: "rgba(245,237,216,0.55)" }}>
                <span style={{ color: data.color, flexShrink: 0 }}>—</span>
                {fact}
              </div>
            ))}
          </div>

          <div style={{
            padding: "0.6rem 0.8rem", borderRadius: "5px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.25)", marginBottom: "0.3rem" }}>
              💡 Você sabia?
            </div>
            <p style={{ fontSize: "0.78rem", color: "rgba(245,237,216,0.45)", lineHeight: 1.55, fontStyle: "italic" }}>
              "{data.curiosity}"
            </p>
          </div>
        </div>
      </div>
    </>
  );
}