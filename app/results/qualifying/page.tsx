"use client";

import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import ResultsTabs from "../ResultsTabs";
import { useEffect, useState } from "react";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getLatestGrandPrix,
  getRelevantGrandPrix,
  getStoredGrandPrixRound,
  storeGrandPrix,
  type GrandPrix,
} from "../../../lib/grandPrix";

type QualifyingResult = {
  position: string;
  number: string;
  Driver: { driverId?: string; givenName: string; familyName: string };
  Constructor: { constructorId?: string; name: string };
  Q1?: string;
  Q2?: string;
  Q3?: string;
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "20px",
  paddingBottom: "90px",
  fontFamily: "Arial, sans-serif",
};
const cardStyle = {
  background: "#101010",
  border: "1px solid #3a1217",
  borderRadius: "20px",
  padding: "20px",
  overflowX: "auto" as const,
};
const headers = ["POS","NO","DRIVER","TEAM","Q1","Q2","Q3"];

export default function QualifyingPage() {
  const [races,setRaces] = useState<GrandPrix[]>([]);
  const [selectedRace,setSelectedRace] = useState<GrandPrix | null>(null);
  const [results,setResults] = useState<QualifyingResult[]>([]);
  const [open,setOpen] = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    fetchGrandPrix()
      .then((items) => {
        setRaces(items);
        const queryRound = new URLSearchParams(window.location.search).get("round");
        const selected =
          getGrandPrixByRound(items, queryRound) ??
          getRelevantGrandPrix(items) ??
          getLatestGrandPrix(items);
        setSelectedRace(selected);
        if (selected) storeGrandPrix(selected.round);
      })
      .catch(() => setRaces([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRace) return;
    setResults([]);
    fetch(
      `https://api.jolpi.ca/ergast/f1/${selectedRace.season}/${selectedRace.round}/qualifying.json`,
      { cache:"no-store" }
    )
      .then(r => r.ok ? r.json() : null)
      .then(d => setResults(d?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults ?? []));
  }, [selectedRace]);

  return (
    <main style={pageStyle}>
      <h1 style={{marginBottom:"6px"}}>⚡ Qualifying Results</h1>
      <div style={{position:"relative",marginBottom:"20px"}}>
        <button type="button" onClick={() => setOpen(v => !v)} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:0,border:0,background:"transparent",color:"#ef233c",fontSize:"18px",fontWeight:"bold",cursor:"pointer"}}>
          <span>{selectedRace?.raceName ?? (loading ? "Loading..." : "Grand Prix")}</span>
          <span style={{fontSize:"12px"}}>{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <div style={{position:"absolute",top:"32px",left:0,right:0,zIndex:20,background:"#101010",border:"1px solid #3a1217",borderRadius:"14px",padding:"8px",maxHeight:"320px",overflowY:"auto",boxShadow:"0 12px 30px rgba(0,0,0,.35)"}}>
            {races.slice().reverse().map(race => (
              <button key={`${race.season}-${race.round}`} type="button" onClick={() => {
                  storeGrandPrix(race.round);
                  window.location.href = `/results/qualifying?round=${race.round}`;
                }} style={{width:"100%",display:"block",textAlign:"left",padding:"10px 12px",marginBottom:"4px",border:0,borderRadius:"10px",background:selectedRace?.round===race.round ? "#c4162a" : "transparent",color:"white",cursor:"pointer",fontSize:"14px"}}>
                {race.raceName}
              </button>
            ))}
          </div>
        )}
      </div>

      <ResultsTabs />

      <div style={cardStyle}>
        {results.length===0 ? (
          <p>{loading ? "결과를 불러오는 중..." : "Qualifying 데이터 없음"}</p>
        ) : (
          <table style={{width:"100%",minWidth:"680px",borderCollapse:"collapse",tableLayout:"fixed"}}>
            <colgroup>
              <col style={{width:"60px"}}/><col style={{width:"60px"}}/><col style={{width:"190px"}}/><col style={{width:"150px"}}/><col style={{width:"110px"}}/><col style={{width:"110px"}}/><col style={{width:"110px"}}/>
            </colgroup>
            <thead><tr>{headers.map(h => (
              <th key={h} style={{padding:"11px 7px",color:"#ef233c",borderBottom:"2px solid #3a1217",fontSize:"12px",whiteSpace:"nowrap",textAlign:h==="DRIVER"||h==="TEAM"?"left":"center"}}>{h}</th>
            ))}</tr></thead>
            <tbody>{results.map(d => (
              <tr key={d.position}>
                <td style={{padding:"11px 7px",textAlign:"center",fontWeight:"bold",borderBottom:"1px solid #35191e"}}>{d.position==="1"?"🥇":d.position==="2"?"🥈":d.position==="3"?"🥉":`P${d.position}`}</td>
                <td style={{padding:"11px 7px",textAlign:"center",fontWeight:"bold",borderBottom:"1px solid #35191e"}}>#{d.number}</td>
                {d.Driver.driverId ? (
                  <Link href={`/championship/${d.Driver.driverId}`} style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>{d.Driver.givenName} {d.Driver.familyName}</Link>
                ) : (
                  <span style={{ fontWeight: 600 }}>{d.Driver.givenName} {d.Driver.familyName}</span>
                )}
                {d.Constructor.constructorId ? (
                  <Link href={`/championship/constructors/${d.Constructor.constructorId}`} style={{ color: "#ef233c", textDecoration: "none" }}>{d.Constructor.name}</Link>
                ) : (
                  <span>{d.Constructor.name}</span>
                )}
                <td style={{padding:"11px 7px",textAlign:"center",borderBottom:"1px solid #35191e"}}>{d.Q1 ?? "-"}</td>
                <td style={{padding:"11px 7px",textAlign:"center",borderBottom:"1px solid #35191e"}}>{d.Q2 ?? "-"}</td>
                <td style={{padding:"11px 7px",textAlign:"center",borderBottom:"1px solid #35191e"}}>{d.Q3 ?? "-"}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
