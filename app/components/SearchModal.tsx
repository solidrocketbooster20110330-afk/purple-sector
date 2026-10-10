"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchItem = {
  type: "driver" | "team" | "race";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords?: string;
};

type DriverStanding = {
  Driver: { driverId: string; givenName: string; familyName: string };
  Constructors?: { name: string }[];
};
type ConstructorStanding = { Constructor: { constructorId: string; name: string } };
type Race = { round: string; raceName: string; Circuit?: { Location?: { country?: string } } };

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const responses = await Promise.all([
          fetch("/api/standings", { cache: "no-store" }),
          fetch("/api/constructors", { cache: "no-store" }),
          fetch("/api/schedule", { cache: "no-store" }),
        ]);
        if (responses.some((response) => !response.ok)) throw new Error("Search data request failed");
        const [driversData, teamsData, racesData] = await Promise.all(responses.map((response) => response.json()));
        if (!Array.isArray(driversData) || !Array.isArray(teamsData) || !Array.isArray(racesData)) {
          throw new Error("Unexpected search data");
        }
        const drivers: SearchItem[] = (driversData as DriverStanding[])
          .filter((d) => d?.Driver?.driverId)
          .map((d) => ({
            type: "driver",
            id: d.Driver.driverId,
            title: `${d.Driver.givenName} ${d.Driver.familyName}`,
            subtitle: d.Constructors?.[0]?.name ?? "Driver",
            href: `/championship/${d.Driver.driverId}`,
            keywords: d.Driver.driverId.replace(/_/g, " "),
          }));
        const teams: SearchItem[] = (teamsData as ConstructorStanding[])
          .filter((t) => t?.Constructor?.constructorId)
          .map((t) => ({
            type: "team",
            id: t.Constructor.constructorId,
            title: t.Constructor.name,
            subtitle: "Constructor",
            href: `/championship/constructors/${t.Constructor.constructorId}`,
            keywords: t.Constructor.constructorId.replace(/_/g, " "),
          }));
        const races: SearchItem[] = (racesData as Race[])
          .filter((r) => r?.round && r?.raceName)
          .map((r) => ({
            type: "race",
            id: String(r.round),
            title: r.raceName,
            subtitle: `Round ${r.round}${r.Circuit?.Location?.country ? ` · ${r.Circuit.Location.country}` : ""}`,
            href: `/results?round=${r.round}`,
            keywords: `R${r.round} round ${r.round}`,
          }));
        if (!cancelled) setItems([...drivers, ...teams, ...races]);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((item) => `${item.title} ${item.subtitle} ${item.keywords ?? ""}`.toLowerCase().includes(q)).slice(0, 12);
  }, [items, query]);

  const openResult = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 2000, display: "flex",
        alignItems: "flex-start", justifyContent: "center", padding: "min(12vh, 90px) 16px 24px",
        background: "rgba(0,0,0,0.68)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <section
        role="dialog" aria-modal="true" aria-labelledby="purple-search-title"
        style={{
          width: "min(680px, 100%)", maxHeight: "min(76vh, 720px)", display: "flex", flexDirection: "column",
          overflow: "hidden", color: "#f8f7fb", background: "#111016",
          border: "1px solid #3b2b50", borderRadius: "22px",
          boxShadow: "0 24px 90px rgba(0,0,0,0.65)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 22px 14px" }}>
          <div>
            <div style={{ color: "#a78bfa", fontSize: 11, fontWeight: 800, letterSpacing: "1.8px" }}>PURPLE SECTOR</div>
            <h2 id="purple-search-title" style={{ margin: "4px 0 0", fontSize: 24, letterSpacing: "-0.5px" }}>Search</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="검색 닫기" style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid #3a2b4d", background: "#211b2a", color: "#eee8f7", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #60448a", background: "#09080d", borderRadius: 14, padding: "0 14px", boxShadow: "0 0 0 3px rgba(124,58,237,0.10)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="드라이버, 팀, 그랑프리 검색..." aria-label="검색어" style={{ width: "100%", minWidth: 0, height: 52, border: 0, outline: 0, background: "transparent", color: "white", fontSize: 16 }} />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기" style={{ border: 0, background: "transparent", color: "#aaa1b8", fontSize: 20, cursor: "pointer" }}>×</button>}
          </div>
        </div>
        <div style={{ overflowY: "auto", minHeight: 100, padding: "0 12px 12px" }}>
          {!query.trim() ? (
            <div style={{ padding: "18px 12px 22px", color: "#938a9e", fontSize: 14 }}>드라이버 · 팀 · 그랑프리를 검색하세요.</div>
          ) : loading ? (
            <div style={{ padding: 18, color: "#aaa1b8" }}>검색 데이터를 불러오는 중...</div>
          ) : loadError ? (
            <div style={{ padding: 18, color: "#fca5a5" }}>검색 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 18, color: "#aaa1b8" }}>검색 결과가 없습니다.</div>
          ) : results.map((item) => (
            <button key={`${item.type}-${item.id}`} type="button" onClick={() => openResult(item.href)} style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "13px 12px", border: 0, borderRadius: 12, background: "transparent", color: "white", textAlign: "left", cursor: "pointer" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: "#251b34", fontSize: 19 }}>{item.type === "driver" ? "👤" : item.type === "team" ? "🏭" : "🏁"}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontWeight: 750, fontSize: 15 }}>{item.title}</span>
                <span style={{ display: "block", marginTop: 4, color: "#a49aad", fontSize: 12 }}>{item.subtitle}</span>
              </span>
              <span aria-hidden="true" style={{ color: "#8b7a9e", fontSize: 20 }}>›</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 20px", borderTop: "1px solid #292330", color: "#82788d", fontSize: 11 }}>
          <span>ESC 또는 바깥 영역을 눌러 닫기</span><span> PURPLE SECTOR </span>
        </div>
      </section>
    </div>
  );
}
