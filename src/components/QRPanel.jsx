import { useState } from "react";

const URL = "https://trigo-map.vercel.app/";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(URL)}&bgcolor=060d18&color=E8B84B&qzone=2`;

export default function QRPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: "absolute", bottom: "1.5rem", right: "1rem",
          zIndex: 25, padding: "0.6rem 0.9rem",
          background: "rgba(6,13,24,0.92)",
          border: "1px solid rgba(232,184,75,0.25)",
          borderRadius: "8px",
          color: "#E8B84B", cursor: "pointer",
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", gap: "0.5rem",
          fontSize: "0.78rem", fontWeight: 600,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(232,184,75,0.6)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(232,184,75,0.25)"}
      >
        <span style={{ fontSize: "1.1rem" }}>📱</span>
        <span>Acessar no celular</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 28,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <div style={{
        position: "fixed",
        bottom: open ? "1.5rem" : "-320px",
        right: "1rem",
        zIndex: 30,
        width: "260px",
        background: "rgba(6,13,24,0.97)",
        border: "1px solid rgba(232,184,75,0.2)",
        borderRadius: "12px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        transition: "bottom 0.4s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #E8B84B, transparent)" }} />

        <div style={{ padding: "1.25rem", textAlign: "center" }}>
          <div className="bebas" style={{ fontSize: "1.1rem", color: "#E8B84B", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
            📱 Acesse no Celular
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(245,237,216,0.4)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Aponte a câmera para o QR Code e explore o mapa no seu celular
          </p>

          <div style={{
            display: "inline-block", padding: "0.75rem",
            background: "#060d18", borderRadius: "8px",
            border: "1px solid rgba(232,184,75,0.15)",
          }}>
            <img src={QR_URL} alt="QR Code" width={180} height={180} style={{ display: "block", borderRadius: "4px" }} />
          </div>

          <div style={{
            marginTop: "1rem", padding: "0.5rem 0.75rem",
            background: "rgba(232,184,75,0.06)",
            borderRadius: "6px",
            border: "1px solid rgba(232,184,75,0.12)",
          }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(245,237,216,0.35)", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>URL</div>
            <div style={{ fontSize: "0.72rem", color: "#E8B84B", wordBreak: "break-all" }}>{URL}</div>
          </div>

          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: "1rem", width: "100%", padding: "0.5rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              color: "rgba(245,237,216,0.4)",
              fontSize: "0.78rem", cursor: "pointer",
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}