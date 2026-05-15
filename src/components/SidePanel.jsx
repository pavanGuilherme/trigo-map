import { useEffect, useState, useRef, useCallback } from "react";

const roleLabel = {
  produtor: { label: "Produtor", color: "#E8B84B" },
  exportador: { label: "Exportador", color: "#5A9E72" },
  importador: { label: "Importador", color: "#E74C3C" },
};

const isMobile = () => window.innerWidth < 768;

export default function SidePanel({ countryKey, onClose, markerPos, currentCountries, currentGrain }) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const isDragged = useRef(false);

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (countryKey && currentCountries[countryKey]) {
      setData(currentCountries[countryKey]);
      isDragged.current = false;
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => setData(null), 400);
    }
  }, [countryKey, currentCountries]);

  useEffect(() => {
    if (!markerPos || !countryKey || isDragged.current || mobile) return;
    const pos = markerPos[countryKey] || markerPos;
    if (!pos) return;

    const cardWidth = 300;
    const cardHeight = 440;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let cx = (pos.x || vw / 2) + 30;
    let cy = (pos.y || vh / 2) - cardHeight / 2;
    if (cx + cardWidth > vw - 20) cx = (pos.x || vw / 2) - cardWidth - 30;
    if (cy < 70) cy = 70;
    if (cy + cardHeight > vh - 20) cy = vh - cardHeight - 20;

    setCardPos({ x: cx, y: cy });
  }, [markerPos, countryKey, mobile]);

  const onMouseDown = useCallback((e) => {
    if (mobile || e.target.closest("button")) return;
    e.preventDefault();
    setDragging(true);
    isDragged.current = true;
    dragOffset.current = {
      x: e.clientX - cardPos.x,
      y: e.clientY - cardPos.y,
    };
  }, [cardPos, mobile]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardWidth = 300;
      const cardHeight = cardRef.current?.offsetHeight || 440;
      let nx = e.clientX - dragOffset.current.x;
      let ny = e.clientY - dragOffset.current.y;
      nx = Math.max(0, Math.min(nx, vw - cardWidth));
      ny = Math.max(0, Math.min(ny, vh - cardHeight));
      setCardPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  if (!data) return null;

  const grainColor = currentGrain?.color || data.color;
  const mx = markerPos?.[countryKey]?.x || window.innerWidth / 2;
  const my = markerPos?.[countryKey]?.y || window.innerHeight / 2;
  const cardWidth = 300;
  const arrowEndX = cardPos.x < mx ? cardPos.x + cardWidth : cardPos.x;
  const arrowEndY = cardPos.y + (cardRef.current?.offsetHeight || 440) / 2;

  // ====== MOBILE: Bottom Sheet ======
  if (mobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 28,
            background: "rgba(0,0,0,0.4)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* Bottom sheet */}
        <div
          ref={cardRef}
          style={{
            position: "fixed",
            left: 0, right: 0, bottom: 0,
            zIndex: 30,
            background: "rgba(6,13,24,0.97)",
            borderTop: `2px solid ${data.color}60`,
            borderRadius: "16px 16px 0 0",
            backdropFilter: "blur(24px)",
            boxShadow: `0 -8px 40px rgba(0,0,0,0.6), 0 0 30px ${data.color}15`,
            transform: visible ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "0.75rem 0 0.25rem" }}>
            <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "rgba(245,237,216,0.2)" }} />
          </div>

          {/* Header */}
          <div style={{ padding: "0.5rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "2.5rem" }}>{data.flag}</span>
                <div>
                  <div className="bebas" style={{ fontSize: "1.6rem", color: "#F5EDD8", lineHeight: 1 }}>
                    {data.name}
                  </div>
                  <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "100px",
                      background: (roleLabel[data.role]?.color || data.color) + "20",
                      color: roleLabel[data.role]?.color || data.color,
                      border: `1px solid ${roleLabel[data.role]?.color || data.color}40`,
                    }}>
                      {roleLabel[data.role]?.label || data.role}
                    </span>
                    <span style={{
                      fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "100px",
                      background: "rgba(255,255,255,0.06)", color: "rgba(245,237,216,0.4)",
                    }}>#{data.rank} mundial</span>
                    {data.isHome && (
                      <span style={{
                        fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "100px",
                        background: "rgba(232,184,75,0.15)", color: "#E8B84B",
                        border: "1px solid rgba(232,184,75,0.3)",
                      }}>🏠 Nosso país</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{
                background: "rgba(255,255,255,0.08)", border: "none",
                color: "rgba(245,237,216,0.5)", width: "32px", height: "32px",
                borderRadius: "50%", cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>

            {/* Highlight + bar */}
            <div style={{
              marginTop: "1rem", padding: "0.6rem 0.9rem", borderRadius: "6px",
              background: `${data.color}12`, border: `1px solid ${data.color}25`,
            }}>
              <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.35)", marginBottom: "0.2rem" }}>
                {currentGrain.emoji} {currentGrain.label} — Destaque
              </div>
              <div className="bebas" style={{ fontSize: "1.2rem", color: data.color }}>
                {data.highlight}
              </div>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.3)" }}>Produção anual</span>
                <span className="bebas" style={{ fontSize: "1rem", color: data.color }}>{data.production} Mi t</span>
              </div>
              <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "2px",
                  background: `linear-gradient(90deg, ${data.color}55, ${data.color})`,
                  width: `${(data.production / currentGrain.maxProduction) * 100}%`,
                  transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "1rem 1.25rem 2rem", overflowY: "auto", flex: 1 }}>
            {!data.isHome && (
              <div style={{
                padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "6px",
                background: "rgba(232,184,75,0.05)",
                borderLeft: "3px solid rgba(232,184,75,0.35)",
              }}>
                <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#E8B84B", marginBottom: "0.35rem" }}>
                  🇧🇷 Conexão com o Brasil
                </div>
                <p style={{ fontSize: "0.85rem", color: "rgba(245,237,216,0.65)", lineHeight: 1.6 }}>
                  {data.connectionBR}
                </p>
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.25)", marginBottom: "0.5rem" }}>
                Fatos
              </div>
              {data.facts.map((fact, i) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.4rem", fontSize: "0.85rem", color: "rgba(245,237,216,0.6)" }}>
                  <span style={{ color: data.color, flexShrink: 0 }}>—</span>
                  {fact}
                </div>
              ))}
            </div>

            <div style={{
              padding: "0.75rem 1rem", borderRadius: "6px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.25)", marginBottom: "0.35rem" }}>
                💡 Você sabia?
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(245,237,216,0.5)", lineHeight: 1.6, fontStyle: "italic" }}>
                "{data.curiosity}"
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ====== DESKTOP: Floating card ======
  return (
    <>
      {visible && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 25 }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={data.color} opacity="0.8" />
            </marker>
          </defs>
          <path
            d={`M ${mx} ${my} C ${mx + (arrowEndX - mx) * 0.5} ${my}, ${arrowEndX - (arrowEndX - mx) * 0.3} ${arrowEndY}, ${arrowEndX} ${arrowEndY}`}
            fill="none" stroke={data.color} strokeWidth="1.5" strokeDasharray="5,4" opacity="0.6"
            markerEnd="url(#arrowhead)"
          />
          <circle cx={mx} cy={my} r="5" fill={data.color} opacity="0.9" />
          <circle cx={mx} cy={my} r="9" fill="none" stroke={data.color} strokeWidth="1.5" opacity="0.4" />
        </svg>
      )}

      <div
        ref={cardRef}
        onMouseDown={onMouseDown}
        style={{
          position: "absolute",
          left: cardPos.x, top: cardPos.y,
          width: 300,
          background: "rgba(6,13,24,0.92)",
          border: `1px solid ${data.color}40`,
          borderRadius: "10px",
          backdropFilter: "blur(24px)",
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${data.color}15`,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          transition: dragging ? "opacity 0.35s ease" : "opacity 0.35s ease, transform 0.35s ease",
          zIndex: 30, overflow: "hidden",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <div style={{ height: "2px", background: `linear-gradient(90deg, ${grainColor}, transparent)` }} />
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.4rem", opacity: 0.25 }}>
          <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: "#F5EDD8" }} />
        </div>

        <div style={{ padding: "0.6rem 1rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "2rem" }}>{data.flag}</span>
              <div>
                <div className="bebas" style={{ fontSize: "1.4rem", color: "#F5EDD8", lineHeight: 1 }}>{data.name}</div>
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.6rem", padding: "0.1rem 0.45rem", borderRadius: "100px",
                    background: (roleLabel[data.role]?.color || data.color) + "20",
                    color: roleLabel[data.role]?.color || data.color,
                    border: `1px solid ${roleLabel[data.role]?.color || data.color}40`,
                  }}>{roleLabel[data.role]?.label || data.role}</span>
                  <span style={{
                    fontSize: "0.6rem", padding: "0.1rem 0.45rem", borderRadius: "100px",
                    background: "rgba(255,255,255,0.06)", color: "rgba(245,237,216,0.4)",
                  }}>#{data.rank} mundial</span>
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

          <div style={{
            marginTop: "0.8rem", padding: "0.5rem 0.75rem", borderRadius: "5px",
            background: `${data.color}12`, border: `1px solid ${data.color}25`,
          }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.35)", marginBottom: "0.2rem" }}>
              {currentGrain.emoji} {currentGrain.label} — Destaque
            </div>
            <div className="bebas" style={{ fontSize: "1.1rem", color: data.color }}>{data.highlight}</div>
          </div>

          <div style={{ marginTop: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.3)" }}>Produção anual</span>
              <span className="bebas" style={{ fontSize: "0.95rem", color: data.color }}>{data.production} Mi t</span>
            </div>
            <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "2px",
                background: `linear-gradient(90deg, ${data.color}55, ${data.color})`,
                width: `${(data.production / currentGrain.maxProduction) * 100}%`,
                transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "0.8rem 1rem", maxHeight: "240px", overflowY: "auto", cursor: "auto" }}>
          {!data.isHome && (
            <div style={{
              padding: "0.6rem 0.8rem", marginBottom: "0.75rem", borderRadius: "5px",
              background: "rgba(232,184,75,0.05)", borderLeft: "2px solid rgba(232,184,75,0.35)",
            }}>
              <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#E8B84B", marginBottom: "0.3rem" }}>
                🇧🇷 Conexão com o Brasil
              </div>
              <p style={{ fontSize: "0.78rem", color: "rgba(245,237,216,0.6)", lineHeight: 1.55 }}>{data.connectionBR}</p>
            </div>
          )}

          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.25)", marginBottom: "0.4rem" }}>Fatos</div>
            {data.facts.map((fact, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem", fontSize: "0.78rem", color: "rgba(245,237,216,0.55)" }}>
                <span style={{ color: data.color, flexShrink: 0 }}>—</span>{fact}
              </div>
            ))}
          </div>

          <div style={{ padding: "0.6rem 0.8rem", borderRadius: "5px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(245,237,216,0.25)", marginBottom: "0.3rem" }}>💡 Você sabia?</div>
            <p style={{ fontSize: "0.78rem", color: "rgba(245,237,216,0.45)", lineHeight: 1.55, fontStyle: "italic" }}>"{data.curiosity}"</p>
          </div>
        </div>
      </div>
    </>
  );
}