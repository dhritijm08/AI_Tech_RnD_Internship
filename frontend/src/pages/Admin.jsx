import React, { useEffect, useState } from "react";
import axios from "axios";
import { LOGOS } from "../lib/logos";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "eos_admin_token";

function downloadButtonLabel(downloading, from, to) {
  if (downloading) return "DOWNLOADING…";
  if (from || to) return "DOWNLOAD FILTERED CSV";
  return "DOWNLOAD ALL LEADS CSV";
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [downloading, setDownloading] = useState(false);

  const tryAuth = async (t) => {
    setError("");
    try {
      const r = await axios.get(`${API}/admin/stats`, { headers: { "X-Admin-Token": t } });
      setStats(r.data);
      setAuthed(true);
      localStorage.setItem(TOKEN_KEY, t);
    } catch (e) {
      setError("Invalid token");
      setAuthed(false);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  useEffect(() => { if (token) tryAuth(token); /* eslint-disable-next-line */ }, []);

  const download = async () => {
    setDownloading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const r = await axios.get(`${API}/admin/export.csv`, {
        headers: { "X-Admin-Token": token },
        responseType: "blob",
        params,
      });
      const url = URL.createObjectURL(new Blob([r.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      const name = from || to ? `echoes-leads-${from || "all"}_to_${to || "today"}.csv` : "echoes-leads.csv";
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(""); setAuthed(false); setStats(null); };

  if (!authed) {
    return (
      <div style={{ background: "#0d2240", minHeight: "100vh" }} className="flex items-center justify-center p-6">
        <div className="max-w-[420px] w-full bg-[#13325c] rounded-2xl p-6" data-testid="admin-login">
          <img src={LOGOS.eosWhite} alt="" className="w-[180px] mx-auto" />
          <h1 className="font-display text-white text-xl text-center mt-3 tracking-widest">ADMIN ACCESS</h1>
          <p className="text-white/70 text-sm text-center mt-1">Enter your admin token to continue.</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="X-Admin-Token"
            className="mt-5 w-full rounded-md px-4 py-3 bg-white/10 text-white outline-none border border-white/20"
            data-testid="admin-token-input"
          />
          {error && <p className="text-red-400 text-sm mt-2" data-testid="admin-error">{error}</p>}
          <button
            onClick={() => tryAuth(token)}
            disabled={!token}
            className="eos-btn-gradient mt-4 w-full"
            data-testid="admin-login-btn"
          >
            UNLOCK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d2240", minHeight: "100vh" }}>
      <div className="max-w-[760px] mx-auto p-6 sm:p-8" data-testid="admin-dashboard">
        <div className="flex justify-between items-center">
          <h1 className="font-display text-white text-2xl sm:text-3xl tracking-widest">ADMIN DASHBOARD</h1>
          <button onClick={logout} className="text-white/70 text-sm underline">Log out</button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            <Stat label="Participants" value={stats.users} />
            <Stat label="Sessions" value={stats.sessions} />
            <Stat label="Avg score" value={stats.avg_score} suffix="/100" />
          </div>
        )}

        <div className="mt-6 bg-[#13325c] rounded-2xl p-5">
          <h2 className="font-display text-[#c8e86a] tracking-widest text-sm">EXPORT LEADS CSV</h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <label className="text-white/80 text-sm">
              From
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="block w-full mt-1 rounded-md bg-white/10 text-white px-3 py-2 border border-white/20" data-testid="admin-from" />
            </label>
            <label className="text-white/80 text-sm">
              To
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="block w-full mt-1 rounded-md bg-white/10 text-white px-3 py-2 border border-white/20" data-testid="admin-to" />
            </label>
          </div>
          <button
            onClick={download}
            disabled={downloading}
            className="eos-btn-gradient mt-4 w-full"
            data-testid="admin-download-btn"
          >
            {downloadButtonLabel(downloading, from, to)}
          </button>
          <p className="text-white/50 text-xs mt-2">Tip: leave both dates blank to download every record.</p>
        </div>

        <a href="/leaderboard" className="block text-center mt-6 text-white/70 underline text-sm">View public leaderboard →</a>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix = "" }) {
  return (
    <div className="bg-[#13325c] rounded-xl p-4 text-center">
      <div className="font-display text-3xl text-[#c8e86a]">{value}{suffix && <span className="text-base text-white/60 ml-1">{suffix}</span>}</div>
      <div className="text-white/70 text-xs tracking-widest mt-1 uppercase">{label}</div>
    </div>
  );
}
