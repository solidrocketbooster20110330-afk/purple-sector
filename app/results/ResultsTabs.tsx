"use client";

import { useState } from "react";

export default function ResultsTabs() {
  const [tab, setTab] = useState("race");

  const btnStyle = (active: boolean) => ({
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: active ? "#a855f7" : "#131942",
    color: "white",
  });

  return (
    <div
      style={{
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          style={btnStyle(tab === "race")}
          onClick={() => setTab("race")}
        >
          Race
        </button>

        <button
          style={btnStyle(tab === "qualifying")}
          onClick={() =>
            setTab("qualifying")
          }
        >
          Qualifying
        </button>

        <button
          style={btnStyle(tab === "practice")}
          onClick={() =>
            setTab("practice")
          }
        >
          Practice
        </button>
      </div>

      <div
        style={{
          color: "#a9adff",
          fontSize: "14px",
        }}
      >
        {tab === "race" &&
          "Race Results"}

        {tab === "qualifying" &&
          "Qualifying Results"}

        {tab === "practice" &&
          "Practice Results"}
      </div>
    </div>
  );
}
