import React from "react";
import { useNavigate } from "react-router-dom";
import eosLogo from "../assets/eos_logo_white.png";
import starburst from "../assets/starburst.png";

export default function Splash() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#c8e86a",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
    }}>
      <div
        data-testid="splash-screen"
        style={{
          width: "100%",
          maxWidth: "400px",
          minHeight: "calc(100vh - 32px)",
          borderRadius: "28px",
          background: "linear-gradient(175deg, #c2e860 0%, #8dd98a 20%, #4ecbca 50%, #3ab5df 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "44px 0 36px",
          boxSizing: "border-box",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <img src={eosLogo} alt="Echoes of Silence"
          style={{ width: "200px", objectFit: "contain" }} />

        <div style={{ width: "100%", textAlign: "center", padding: "0", margin: "0" }}>
          <p style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontWeight: 900,
            fontSize: "24px",
            color: "#fff",
            letterSpacing: "0.04em",
            margin: "0 0 10px 0",
            lineHeight: 1.1,
            textAlign: "center",
            padding: "0",
            display: "block",
            width: "100%",
          }}
          data-testid="splash-title"
          >
            COGNITIVE ASSESSMENT
          </p>
          <p style={{
            color: "#fff", fontSize: "14px", margin: 0, padding: 0,
            fontFamily: "Inter, sans-serif", opacity: 0.95, textAlign: "center",
            display: "block", width: "100%",
          }}>
            Insights today, better tomorrow.
          </p>
        </div>

        <img src={starburst} alt="" aria-hidden style={{
          width: "90%", objectFit: "contain", filter: "brightness(0) invert(1)",
        }} />

        <button data-testid="splash-start-btn" onClick={() => navigate("/register")}
          style={{
            background: "#fff", color: "#5cb85c",
            fontFamily: "'Archivo Black', sans-serif", fontWeight: 900,
            fontSize: "15px", letterSpacing: "0.1em", borderRadius: "999px",
            padding: "17px 0", width: "85%", border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)", transition: "transform 0.2s ease",
          }}
          onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          TAP TO START
        </button>
      </div>
    </div>
  );
}
