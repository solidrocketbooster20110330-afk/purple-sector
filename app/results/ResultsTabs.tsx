"use client";

import { useState } from "react";

export default function ResultsTabs() {
  const [tab, setTab] = useState("race");

  const buttonStyle = (
    active: boolean
  ) => ({
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: active
      ? "#7c3aed"
      : "#131942",
    color: "white",
    fontWeight: "bold",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <button
        onClick={() =>
          setTab("race")
        }
        style={buttonStyle(
          tab === "race"
        )}
      >
        🏁 Race
      </button>

      <button
        onClick={() =>
          setTab("qualifying")
        }
        style={buttonStyle(
          tab === "qualifying"
        )}
      >
        ⚡ Qualifying
      </button>

      <button
        onClick={() =>
          setTab("practice")
        }
        style={buttonStyle(
          tab === "practice"
        )}
      >
        🛠 Practice
      </button>
    </div>
  );
}
