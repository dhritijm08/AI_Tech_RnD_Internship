import React from "react";

/**
 * Lime-bordered frame containing the gradient stage.
 * variant: "gradient" (default), "navy"
 */
export default function Frame({ children, variant = "gradient", tall = false }) {
  return (
    <div className="eos-frame">
      <div
        className={`eos-stage ${variant === "navy" ? "eos-stage-navy" : ""} ${tall ? "eos-stage-tall" : ""}`}
        data-testid="eos-stage"
      >
        {children}
      </div>
    </div>
  );
}
