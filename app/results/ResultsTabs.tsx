"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ResultsTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab =
    searchParams.get("type") ??
    "race";

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
          router.push(
            "/results?type=race"
          )
        }
        style={buttonStyle(
          tab === "race"
        )}
      >
        🏁 Race
      </button>

      <button
        onClick={() =>
          router.push(
            "/results?type=qualifying"
          )
        }
        style={buttonStyle(
          tab === "qualifying"
        )}
      >
        ⚡ Qualifying
      </button>

      <button
        onClick={() =>
          router.push(
            "/results?type=practice"
          )
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
