import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Frame from "../components/Frame";
import { LOGOS } from "../lib/logos";

export default function QrCodePage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const url = `${window.location.origin}/results/${sessionId}`;

  return (
    <Frame tall>
      <div
        className="relative z-10 h-full w-full flex flex-col p-6 sm:p-8 items-center"
        data-testid="qr-screen"
      >
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">
          YOUR QR CODE
        </h1>

        {/* Card */}
        <div
          className="rounded-3xl mt-5 w-full flex flex-col items-center px-6 pt-8 pb-10"
          style={{
            background: "linear-gradient(160deg, #e8f8e8 0%, #d0f0e8 50%, #c8eef0 100%)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* QR with corner brackets */}
          <div className="relative p-3">
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderTop: true, borderLeft: true },
              { top: 0, right: 0, borderTop: true, borderRight: true },
              { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
              { bottom: 0, right: 0, borderBottom: true, borderRight: true },
            ].map((corner, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 36,
                  height: 36,
                  top: corner.top !== undefined ? corner.top : undefined,
                  bottom: corner.bottom !== undefined ? corner.bottom : undefined,
                  left: corner.left !== undefined ? corner.left : undefined,
                  right: corner.right !== undefined ? corner.right : undefined,
                  borderTop: corner.borderTop ? "4px solid #0d2240" : "none",
                  borderBottom: corner.borderBottom ? "4px solid #0d2240" : "none",
                  borderLeft: corner.borderLeft ? "4px solid #0d2240" : "none",
                  borderRight: corner.borderRight ? "4px solid #0d2240" : "none",
                }}
              />
            ))}

            <QRCodeSVG
              value={url}
              size={280}
              bgColor="transparent"
              fgColor="#0d2240"
              level="M"
            />
          </div>

          <h3
            className="font-display text-3xl mt-5 tracking-widest"
            style={{ color: "#5cb85c" }}
          >
            SCAN ME
          </h3>

          <button
            className="mt-4 w-full max-w-[360px] py-4 rounded-full font-display text-white text-base tracking-widest"
            style={{
              background: "linear-gradient(90deg, #c8e86a, #4ecbca)",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/results/${sessionId}`)}
            data-testid="qr-view-results"
          >
            VIEW MY RESULTS
          </button>
        </div>

        <img
          src={LOGOS.cignaXEos}
          alt="Cigna x Echoes of Silence"
          className="w-[220px] mt-6"
        />
      </div>
    </Frame>
  );
}
