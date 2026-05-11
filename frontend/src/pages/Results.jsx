import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LOGOS } from "../lib/logos";
const EOS_LOGO = "data:image/webp;base64,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";
const EMAIL_EOS_LOGO = "data:image/webp;base64,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";
const EMAIL_CIGNA_LOGO = "data:image/webp;base64,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";
import { useAssessment } from "../context/AssessmentContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function DonutScore({ score }) {
  const pct = score / 100;
  const C = 2 * Math.PI * 44;
  const dash = pct * C;
  return (
    <svg viewBox="0 0 100 100" width="260" height="260">
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8e86a" /><stop offset="0.5" stopColor="#4ecbca" /><stop offset="1" stopColor="#6fc7e0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#0d2240" strokeWidth="10" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#dg)" strokeWidth="10"
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={C * 0.25}
        strokeLinecap="butt"
        transform="rotate(-90 50 50)" />
      <circle cx="50" cy="50" r="33" fill="#fff" />
      <text x="50" y="48" textAnchor="middle" fontSize="24" fontFamily="Archivo Black" fontWeight="900" fill="#5cb85c">{score}</text>
      <text x="50" y="62" textAnchor="middle" fontSize="7" fill="#5cb85c">/100</text>
    </svg>
  );
}

function Bubble({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl"
        style={{
          background: "radial-gradient(circle at 35% 30%, #ffffff, #d6ec85 50%, #9bcc3a)",
          color: "#3a7a1a",
          boxShadow: "0 0 0 3px #c8e86a, 0 0 0 5px #8ab830, inset 0 -4px 10px rgba(0,0,0,0.12)",
          fontWeight: "900",
        }}>
        {value}
      </div>
      <span className="font-display text-xs tracking-widest mt-2 text-[#0d2240]">{label}</span>
    </div>
  );
}

function emailButtonLabel(emailSent, emailing) {
  if (emailSent) return "EMAIL SENT ✓";
  if (emailing) return "SENDING…";
  return "EMAIL ME RESULTS";
}

function buildEmailHTML(name, normScore, category, interp, correct, wrong, accuracy, dateStr, dimensions) {
  const firstName = name ? name.split(" ")[0] : "Friend";
  const focusTip = normScore >= 85
    ? "Your results are excellent! Continue challenging your brain with new tasks and consider retesting periodically to maintain your edge."
    : normScore >= 60
    ? "Your results indicate you can further improve your processing speed. Regular practice with symbol-matching exercises can help."
    : "Your results indicate that processing speed is the area to focus on next. Start with simple exercises and build up gradually.";

  // Donut — canvas rendered PNG. SVG is stripped by Gmail/Outlook.
  // Canvas runs in the browser when buildEmailHTML() is called, result embedded as <img>.
  const pct = Math.min(normScore / 100, 1);
  const donutSvg = (() => {
    const SIZE = 220;
    const cx = SIZE / 2, cy = SIZE / 2;
    const outerR = 90, innerR = 62;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + pct * 2 * Math.PI;
    // Dark navy background ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.arc(cx, cy, innerR, 2 * Math.PI, 0, true);
    ctx.fillStyle = '#0d2240';
    ctx.fill();
    // Teal filled arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.fillStyle = '#4ecbca';
    ctx.fill();
    // White hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // Score text
    ctx.fillStyle = '#7cc43e';
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px Arial';
    ctx.fillText(String(normScore), cx, cy + 10);
    ctx.font = '22px Arial';
    ctx.fillText('/100', cx, cy + 36);
    const dataUrl = canvas.toDataURL('image/png');
    return '<img src="' + dataUrl + '" width="220" height="220" alt="Score: ' + normScore + '/100" style="display:block;margin:0 auto" />';
  })();

  // Dimension bubbles — lime coin style matching the certificate
  const dimHtml = dimensions ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
      <tr>
        ${["attention","processing","memory","flexibility"].map(k => {
          const val = dimensions[k] ?? "—";
          const fs = String(val).length >= 3 ? "15px" : "22px";
          return `
        <td align="center" style="padding:0 4px">
          <div style="width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#ffffff 0%,#daf07a 45%,#a8d840 100%);border:3px solid #b8e04a;outline:2.5px solid #82b820;display:table;margin:0 auto">
            <span style="display:table-cell;text-align:center;vertical-align:middle;font-size:${fs};font-weight:900;color:#2d6a00;font-family:Arial,sans-serif">${val}</span>
          </div>
          <div style="font-size:9px;font-weight:700;color:#0d2240;text-transform:uppercase;letter-spacing:1px;margin-top:8px;font-family:Arial,sans-serif">${k}</div>
        </td>`;
        }).join("")}
      </tr>
    </table>` : "";

  // Cigna x EOS logo row — use the actual combined logo image
  const cignaEosHtml = `<div style="width:280px;height:79px;background-image:url('${EMAIL_CIGNA_LOGO}');background-size:contain;background-repeat:no-repeat;background-position:center;margin:0 auto"></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Cognitive Assessment Results</title></head>
<body style="margin:0;padding:0;background:#d4e8c2;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#d4e8c2;padding:24px 16px">
<tr><td align="center">

<!-- Outer gradient border matching certificate -->
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:linear-gradient(160deg,#a8d840 0%,#4ecbca 60%,#3db8d8 100%);border-radius:18px;padding:5px">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(160deg,#f5fdf0 0%,#e8f8f2 50%,#ddf4f8 100%);border-radius:14px;overflow:hidden">

  <!-- EOS LOGO (matching certificate top) -->
  <tr><td align="center" style="padding:32px 40px 4px">
    <div style="width:200px;height:57px;background-image:url('${EMAIL_EOS_LOGO}');background-size:contain;background-repeat:no-repeat;background-position:center;margin:0 auto"></div>
    <!--[if !mso]><!-->
    <div style="display:none;mso-hide:all">
      <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:900;color:#0d2240;letter-spacing:1px;text-align:center">Echoes</div>
      <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:400;color:#0d2240;text-align:center">of Silence<sup style="font-size:11px">&reg;</sup></div>
    </div>
    <!--<![endif]-->
  </td></tr>

  <!-- COGNITIVE ASSESSMENT HEADING -->
  <tr><td align="center" style="padding:20px 40px 4px">
    <div style="font-size:24px;font-weight:900;color:#5cb85c;letter-spacing:2px;font-family:Arial,sans-serif">COGNITIVE ASSESSMENT</div>
    <div style="font-size:13px;color:#0d2240;margin-top:6px;font-family:Arial,sans-serif">Insights today, better tomorrow.</div>
  </td></tr>

  <!-- DONUT SCORE -->
  <tr><td align="center" style="padding:12px 40px 4px">
    ${donutSvg}
  </td></tr>

  <!-- CATEGORY LABEL e.g. ADVANCED -->
  <tr><td align="center" style="padding:4px 40px 20px">
    <div style="font-size:30px;font-weight:900;color:#9bc94c;letter-spacing:3px;font-family:Arial,sans-serif">${category.toUpperCase()}</div>
  </td></tr>

  <!-- DIMENSION BUBBLES -->
  <tr><td style="padding:0 24px 20px">
    ${dimHtml}
  </td></tr>

  <!-- CIGNA x EOS LOGOS -->
  <tr><td align="center" style="padding:0 40px 24px">
    ${cignaEosHtml}
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 40px 0">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#b8e04a,#4ecbca,transparent)"></div>
  </td></tr>

  <!-- PERSONAL BODY TEXT -->
  <tr><td style="background:#ffffff;padding:32px 40px">
    <p style="font-size:15px;font-weight:700;color:#0d2240;margin:0 0 6px">Hi ${firstName},</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 24px">
      Here are your personal scores across the four key dimensions of cognitive performance.
    </p>

    <!-- INSIGHT BOX -->
    <div style="background:#f0faf5;border-left:4px solid #4ecbca;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:24px">
      <p style="font-size:13px;color:#0d2240;line-height:1.7;margin:0">${interp || focusTip}</p>
    </div>

    <!-- TIPS BOX -->
    <div style="background:#f8fffc;border:1.5px solid #c8e86a;border-radius:12px;padding:20px 22px;margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;color:#1a4731;margin-bottom:12px">Remember, your brain may take time to adapt:</div>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:8px;vertical-align:top"><span style="color:#4ecbca;margin-right:8px">●</span><span style="font-size:12px;color:#444;line-height:1.6">It's normal to feel mentally tired but <em>not</em> strained after cognitive exercises</span></td></tr>
        <tr><td style="padding-bottom:8px;vertical-align:top"><span style="color:#4ecbca;margin-right:8px">●</span><span style="font-size:12px;color:#444;line-height:1.6">Practising twice a week can lead to improvements in processing speed</span></td></tr>
        <tr><td style="padding-bottom:8px;vertical-align:top"><span style="color:#4ecbca;margin-right:8px">●</span><span style="font-size:12px;color:#444;line-height:1.6">Listen to your body — take breaks when needed</span></td></tr>
        <tr><td style="vertical-align:top"><span style="color:#4ecbca;margin-right:8px">●</span><span style="font-size:12px;color:#444;line-height:1.6">Cognitive training can reduce the likelihood of age-related cognitive decline</span></td></tr>
      </table>
    </div>

    <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0">Assessment completed on ${dateStr}</p>
  </td></tr>

  <!-- ABOUT THIS TEST -->
  <tr><td style="background:#f5fdf0;padding:20px 40px;text-align:center;border-top:1px solid #d4eec8">
    <div style="font-size:11px;font-weight:700;color:#0d2240;margin-bottom:6px">About this test</div>
    <div style="font-size:10px;color:#555;line-height:1.6">
      The Digit Symbol Substitution Test (DSST) is designed to measure aspects of processing speed, attention, and working memory.
      It requires the participant to match symbols with corresponding numbers under timed conditions.
    </div>
  </td></tr>

  <!-- DEVELOPED BY FOOTER -->
  <tr><td style="background:#f0faf8;padding:18px 40px;text-align:center">
    <div style="font-size:11px;color:#5a8a70;line-height:1.6">
      Developed by <strong style="color:#0d2240">Echoes of Silence®</strong> · Insights today, better tomorrow.<br>
      © ${new Date().getFullYear()} Echoes of Silence. All rights reserved.
    </div>
  </td></tr>

</table>
</td></tr>
</table>

</td></tr></table>
</body></html>`;
}


export default function Results() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { reset } = useAssessment();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/sessions/${sessionId}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [sessionId]);

  const sendEmail = async () => {
    if (!data) return;
    setEmailing(true);
    setEmailError("");
    try {
      const recipient = data.user_email;
      if (!recipient) throw new Error("No email on file for this user.");

      const dateStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
      const correct = data.dimensions ? Object.values(data.dimensions).reduce((a, b) => a + b, 0) : data.total_score;
      const htmlBody = buildEmailHTML(
        data.user_name || "Friend",
        data.total_score ?? 0,
        data.level || "—",
        "",
        correct,
        0,
        data.total_score,
        dateStr,
        data.dimensions
      );

      // Try backend first (avoids EmailJS payload/stream issues with large HTML)
      let sent = false;
      try {
        const res = await fetch(`${API}/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_email: recipient,
            to_name: data.user_name || "Friend",
            subject: "Your Echoes of Silence Cognitive Assessment Results are ready",
            html_body: htmlBody,
            score: String(data.total_score ?? ""),
            level: data.level || "",
            date: dateStr,
          }),
        });
        // Always consume the body to avoid "body stream already read" errors
        await res.text().catch(() => {});
        if (res.ok) {
          sent = true;
        }
      } catch (_) {
        // backend endpoint not available, fall through to EmailJS
      }

      // Fallback: EmailJS with stripped-down payload (no embedded images)
      if (!sent) {
        const { default: emailjs } = await import("@emailjs/browser");
        const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
        const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
        const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

        // Both logos are now small compressed JPEGs (~6KB each) — safe to send via EmailJS
        const lightHtml = htmlBody;

        const result = await new Promise((resolve, reject) => {
          emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              email: recipient,
              to_email: recipient,
              to_name: data.user_name || "Friend",
              subject: "Your Echoes of Silence Cognitive Assessment Results are ready",
              html_body: lightHtml,
              score: String(data.total_score ?? ""),
              level: data.level || "",
              date: dateStr,
            },
            { publicKey: EMAILJS_PUBLIC_KEY }
          ).then(resolve).catch(reject);
        });
        sent = true;
      }

      if (sent) setEmailSent(true);
    } catch (e) {
      setEmailError(e?.message || "Could not send email. Please try again.");
    } finally {
      setEmailing(false);
    }
  };

  const playAgain = () => {
    reset();
    navigate("/register");
  };

  if (error) return <div className="eos-frame"><div className="eos-stage flex items-center justify-center text-[#0d2240] p-6">Could not load results.</div></div>;
  if (!data) return <div className="eos-frame"><div className="eos-stage flex items-center justify-center text-[#0d2240]">Loading...</div></div>;

  return (
    <div style={{ background: "#0d2240", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto p-6 sm:p-8 text-center">
        <h1 className="font-display text-white text-3xl sm:text-4xl mt-4" data-testid="results-title">YOUR RESULTS</h1>
        <p className="text-white tracking-widest mt-1" data-testid="results-level">{data.level}</p>

        <div
          className="mt-6 p-1"
          style={{ background: "linear-gradient(180deg, #c8e86a 0%, #4ecbca 100%)", boxShadow: "0 0 24px rgba(200,232,106,0.3)" }}
        >
          <div style={{ background: "linear-gradient(160deg, #f0faf0 0%, #e0f5f0 50%, #d0f0f8 100%)", aspectRatio: "auto", borderRadius: 14 }}>
            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center" data-testid="results-card">
              <img src={EOS_LOGO} alt="Echoes of Silence" style={{ width: 200, objectFit: "contain" }} className="mt-2" />
              <h2 className="font-display text-2xl sm:text-3xl mt-4" style={{ color: "#5cb85c" }}>COGNITIVE ASSESSMENT</h2>
              <p className="text-[#0d2240] text-sm">Insights today, better tomorrow.</p>

              <div className="mt-4"><DonutScore score={data.total_score} /></div>

              <h3 className="font-display text-3xl mt-2" style={{ color: "#9bc94c" }}>{data.level}</h3>

              <div className="grid grid-cols-4 gap-3 mt-4 w-full">
                <Bubble value={data.dimensions.attention} label="ATTENTION" />
                <Bubble value={data.dimensions.processing} label="PROCESSING" />
                <Bubble value={data.dimensions.memory} label="MEMORY" />
                <Bubble value={data.dimensions.flexibility} label="FLEXIBILITY" />
              </div>

              <img src={LOGOS.cignaXEos} alt="" className="w-[200px] mt-5" />

              <p className="text-[#0d2240] text-xs mt-4 text-center max-w-[420px]">
                <strong>About this test</strong><br />
                The DSST-inspired cognitive assessment measures aspects of processing speed, attention, memory and cognitive flexibility through 6 short interactive games.
              </p>
            </div>
          </div>
        </div>

        <button className="eos-btn-gradient mt-6 w-full max-w-[420px]" onClick={() => navigate(`/share/${sessionId}`)} data-testid="results-share-btn">
          SHARE MY SCORE
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3 max-w-[420px] mx-auto">
          <button
            onClick={sendEmail}
            disabled={emailing || emailSent}
            className="rounded-full px-4 py-3 font-display text-sm tracking-widest border-2"
            style={{
              borderColor: "#c8e86a",
              color: "#c8e86a",
              background: emailSent ? "rgba(200,232,106,0.18)" : "transparent",
              opacity: emailing ? 0.6 : 1,
            }}
            data-testid="results-email-btn"
          >
            {emailButtonLabel(emailSent, emailing)}
          </button>
          <button
            onClick={playAgain}
            className="rounded-full px-4 py-3 font-display text-sm tracking-widest border-2 border-[#4ecbca] text-[#4ecbca]"
            data-testid="results-replay-btn"
          >
            PLAY AGAIN
          </button>
        </div>

        {emailError ? (
          <p className="text-[#ff8b8b] text-xs mt-2" data-testid="results-email-error">{emailError}</p>
        ) : null}

        <button
          onClick={() => navigate("/leaderboard")}
          className="block mx-auto mt-3 text-white/80 text-sm underline"
          data-testid="results-leaderboard-link"
        >
          View leaderboard →
        </button>
      </div>
    </div>
  );
}
