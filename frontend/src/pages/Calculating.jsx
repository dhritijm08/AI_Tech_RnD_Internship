import React, { useEffect, useState } from "react";
import { LOGOS } from "../lib/logos";
import starburstImg from "../assets/starburst.png";
import eosWhiteImg from "../assets/eos_logo_white.png";

const MESSAGES = [
  "ANALYSING 6 GAME SESSIONS...",
  "PROCESSING SCORES...",
  "COMPUTING COGNITIVE METRICS...",
  "FINALISING RESULTS...",
];

export default function Calculating({ gameCount = 6, onDone }) {
  const [progress, setProgress] = useState(0.05);
  const [msgIndex, setMsgIndex] = useState(0);

  // Animate ring 5% → 85% over 3s then call onDone
  useEffect(() => {
    const start = Date.now();
    const duration = 3000;
    let raf;
    const frame = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setProgress(0.05 + p * 0.80);
      if (p < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        if (onDone) setTimeout(onDone, 500);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  // Reveal messages one by one
  useEffect(() => {
    const id = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1)),
      900
    );
    return () => clearInterval(id);
  }, []);

  // SVG ring — larger radius, thicker stroke
  const R = 38;
  const circumference = 2 * Math.PI * R;
  const dash = circumference * progress;
  const gap = circumference - dash;

  // Use direct imports with fallback to LOGOS
  const eosLogo = eosWhiteImg || LOGOS?.eosWhite;
  const starburst = starburstImg || LOGOS?.starburst;
  const cignaLogo = LOGOS?.cignaXEosWhite;

  return (
    <div className="eos-frame">
      <style>{`
        @keyframes calc-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .calc-ring-spin {
          animation: calc-spin 8s linear infinite;
        }
        @keyframes calc-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .calc-msg-new { animation: calc-fade-up 0.4s ease forwards; }
      `}</style>

      <div
        className="eos-stage eos-stage-navy"
        data-testid="calculating-screen"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* ── Decorative right-edge blobs ── */}
        {starburst && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {[
              { top: "8%",  right: "-6%",  size: 100, opacity: 0.09, rotate: 15  },
              { top: "28%", right: "1%",   size: 65,  opacity: 0.07, rotate: -5  },
              { top: "50%", right: "-4%",  size: 85,  opacity: 0.08, rotate: 35  },
              { top: "66%", right: "5%",   size: 50,  opacity: 0.06, rotate: 0   },
            ].map((b, i) => (
              <img
                key={i}
                src={starburst}
                alt=""
                style={{
                  position: "absolute",
                  top: b.top,
                  right: b.right,
                  width: b.size,
                  opacity: b.opacity,
                  transform: `rotate(${b.rotate}deg)`,
                  filter: "brightness(0) invert(1)",
                  userSelect: "none",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Main content ── */}
        <div
          className="relative z-10 w-full h-full flex flex-col items-center justify-between"
          style={{ padding: "36px 24px 32px" }}
        >
          {/* Top logo */}
          {eosLogo ? (
            <img
              src={eosLogo}
              alt="Echoes of Silence"
              style={{ width: 240, objectFit: "contain" }}
            />
          ) : (
            <div style={{ height: 48 }} />
          )}

          {/* CALCULATING heading */}
          <div className="flex flex-col items-center" style={{ marginTop: 8 }}>
            <h1
              className="font-display text-white tracking-wider"
              style={{ fontSize: "clamp(28px,8vw,40px)", margin: 0 }}
            >
              CALCULATING
            </h1>
            <p
              className="text-white/70"
              style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 400 }}
            >
              your results
            </p>
          </div>

          {/* ── Ring + starburst ── */}
          <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>
            {/* SVG ring */}
            <svg
              viewBox="0 0 100 100"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <defs>
                <linearGradient id="cRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#c8e86a" />
                  <stop offset="45%"  stopColor="#4ecbca" />
                  <stop offset="100%" stopColor="#6fc7e0" />
                </linearGradient>
              </defs>
              {/* Track — visible dark teal */}
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(78,203,202,0.22)" strokeWidth="13" />
              {/* Progress arc */}
              <circle
                cx="50" cy="50" r={R}
                fill="none"
                stroke="url(#cRingGrad)"
                strokeWidth="13"
                strokeDasharray={`${dash} ${gap}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>

            {/* Starburst centered + spinning */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {starburst ? (
                <img src={starburst} alt="" className="calc-ring-spin" style={{ width: "48%", filter: "brightness(0) invert(1)" }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
              )}
            </div>
          </div>

          {/* Status messages */}
          <div className="text-center" style={{ minHeight: 72 }}>
            {MESSAGES.slice(0, msgIndex + 1).map((msg, i) => (
              <p
                key={i}
                className={`font-display text-white tracking-widest ${i === msgIndex ? "calc-msg-new" : ""}`}
                style={{
                  fontSize: 15,
                  margin: "4px 0",
                  opacity: i === msgIndex ? 1 : 0.38,
                  fontWeight: 700,
                }}
              >
                {msg}
              </p>
            ))}
          </div>

          {/* Bottom: Cigna × EoS */}
          {cignaLogo ? (
            <img src={cignaLogo} alt="Cigna × Echoes of Silence" style={{ width: 200, objectFit: "contain" }} />
          ) : eosLogo ? (
            /* fallback: just show EoS logo again */
            <img src={eosLogo} alt="Echoes of Silence" style={{ width: 160, objectFit: "contain", opacity: 0.8 }} />
          ) : (
            <div style={{ height: 40 }} />
          )}
        </div>
      </div>
    </div>
  );
}
