import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LOGOS } from "../lib/logos";
import { useAssessment } from "../context/AssessmentContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Welcome() {
  const navigate = useNavigate();
  const { setUser } = useAssessment();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", day: "", month: "", year: "", email: "",
    phone: "", company: "", designation: "",
  });

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.day || !form.email) {
      alert("Please fill Name, Day and Email.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/users`, form);
      setUser(data);
      navigate("/game");
    } catch (e) {
      console.error(e);
      alert("Could not start. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: "#e8ecd8",
    border: "none",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#0d2240",
    fontStyle: "italic",
    fontFamily: "Inter, sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

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
        data-testid="welcome-screen"
        style={{
          width: "100%",
          maxWidth: "400px",
          minHeight: "calc(100vh - 32px)",
          borderRadius: "28px",
          background: "linear-gradient(175deg, #e8f5c0 0%, #c8ecd0 30%, #a8e0d8 60%, #88cce0 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "36px 24px 36px",
          boxSizing: "border-box",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Logo */}
        <img
          src={LOGOS.eos}
          alt="Echoes of Silence"
          data-testid="welcome-logo"
          style={{ width: "220px", objectFit: "contain" }}
        />

        {/* Title */}
        <p
          data-testid="welcome-title"
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontWeight: 900,
            fontSize: "20px",
            color: "#4a9e4a",
            letterSpacing: "0.04em",
            margin: "20px 0 4px 0",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          COGNITIVE ASSESSMENT
        </p>
        <p style={{
          color: "#0d2240",
          fontSize: "13px",
          margin: "0 0 20px 0",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
          opacity: 0.8,
        }}>
          Insights today, better tomorrow.
        </p>

        {/* Form card */}
        <div
          data-testid="welcome-form-card"
          style={{
            width: "100%",
            background: "#0d2240",
            borderRadius: "16px",
            padding: "20px 16px",
            boxSizing: "border-box",
          }}
        >
          <p style={{
            color: "#fff",
            textAlign: "center",
            fontFamily: "'Archivo Black', sans-serif",
            fontWeight: 900,
            fontSize: "13px",
            letterSpacing: "0.1em",
            margin: "0 0 16px 0",
          }}>
            FILL THE DETAILS
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input style={inputStyle} placeholder="Name*" value={form.name} onChange={onChange("name")} data-testid="input-name" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <input style={inputStyle} placeholder="Day*" value={form.day} onChange={onChange("day")} data-testid="input-day" />
              <input style={inputStyle} placeholder="Month" value={form.month} onChange={onChange("month")} data-testid="input-month" />
              <input style={inputStyle} placeholder="Year" value={form.year} onChange={onChange("year")} data-testid="input-year" />
            </div>

            <input style={inputStyle} placeholder="Email-ID*" value={form.email} onChange={onChange("email")} data-testid="input-email" />
            <input style={inputStyle} placeholder="Phone No" value={form.phone} onChange={onChange("phone")} data-testid="input-phone" />
            <input style={inputStyle} placeholder="Company Name" value={form.company} onChange={onChange("company")} data-testid="input-company" />
            <input style={inputStyle} placeholder="Designation" value={form.designation} onChange={onChange("designation")} data-testid="input-designation" />
          </div>
        </div>

        {/* TAP TO START button */}
        <button
          data-testid="welcome-start-btn"
          onClick={submit}
          disabled={submitting}
          style={{
            marginTop: "24px",
            width: "85%",
            padding: "16px 0",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(90deg, #c8e86a 0%, #4ecbca 100%)",
            color: "#fff",
            fontFamily: "'Archivo Black', sans-serif",
            fontWeight: 900,
            fontSize: "15px",
            letterSpacing: "0.1em",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(78,203,202,0.35)",
            transition: "transform 0.2s ease",
            opacity: submitting ? 0.7 : 1,
          }}
          onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          {submitting ? "STARTING..." : "TAP TO START"}
        </button>

        {/* Co-brand */}
        <img
          src={LOGOS.cignaXEos}
          alt="Cigna x Echoes of Silence"
          data-testid="welcome-cobrand"
          style={{ width: "200px", marginTop: "24px", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
