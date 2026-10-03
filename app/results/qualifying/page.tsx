"use client";

import BottomNav from "../../components/BottomNav";
import ResultsTabs from "../ResultsTabs";
import { useEffect, useState } from "react";

type Race = { season: string; round: string; raceName: string };
type QualifyingResult = {
  position: string;
  number: string;
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
  Q1?: string; Q2?: string; Q3?: string;
};

const pageStyle = { minHeight:"100vh", background:"linear-gradient(180deg,#05071f 0%,#0c1037 100%)", color:"white", padding:"20px", paddingBottom:"90px", fontFamily:"Arial, sans-serif" };
const cardStyle = { background:"#131942", border:"1px solid #2b347a", borderRadius:"20px", padding:"20px", overflowX:"auto" as const };
const headers=["POS","NO","DRIVER","TEAM","Q1","Q2","Q3"];

function positionLabel(position:string){if(position==="1")return"🥇";if(position==="2")return"🥈";if(position==="3")return"🥉";return`P${position}`;}

export default function QualifyingPage(){
 const [races,setRaces]=useState<Race[]>([]);
 const [selectedRace,setSelectedRace]=useState<Race|null>(null);
 const [results,setResults]=useState<QualifyingResult[]>([]);
 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(true);

 useEffect(()=>{fetch("https://api.jolpi.ca/ergast/f1/current.json").then(r=>r.ok?r.json():null).then(d=>{const items=d?.MRData?.RaceTable?.Races??[];setRaces(items);setSelectedRace(items[items.length-1]??null);}).finally(()=>setLoading(false));},[]);
 useEffect(()=>{if(!selectedRace)return;setResults([]);fetch(`https://api.jolpi.ca/ergast/f1/${selectedRace.season}/${selectedRace.round}/qualifying.json`).then(r=>r.ok?r.json():null).then(d=>setResults(d?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults??[]));},[selectedRace]);

 return <main style={pageStyle}>
  <h1 style={{marginBottom:"6px"}}>⚡ Qualifying Results</h1>
  <div style={{position:"relative",marginBottom:"20px"}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:0,border:0,background:"transparent",color:"#a9adff",fontSize:"18px",fontWeight:"bold",cursor:"pointer"}}>
    <span>{selectedRace?.raceName??(loading?"Loading...":"Grand Prix")}</span><span style={{fontSize:"12px"}}>{open?"▲":"▼"}</span>
   </button>
   {open&&<div style={{position:"absolute",top:"32px",left:0,right:0,zIndex:20,background:"#131942",border:"1px solid #2b347a",borderRadius:"14px",padding:"8px",maxHeight:"320px",overflowY:"auto",boxShadow:"0 12px 30px rgba(0,0,0,.35)"}}>
    {races.slice().reverse().map(race=><button key={`${race.season}-${race.round}`} type="button" onClick={()=>{setSelectedRace(race);setOpen(false)}} style={{width:"100%",display:"block",textAlign:"left",padding:"10px 12px",marginBottom:"4px",border:0,borderRadius:"10px",background:selectedRace?.round===race.round?"#7c3aed":"transparent",color:"white",cursor:"pointer",fontSize:"14px"}}>{race.raceName}</button>)}
   </div>}
  </div>
  <ResultsTabs/>
  <div style={cardStyle}>
   {results.length===0?<p>{loading?"결과를 불러오는 중...":"Qualifying 데이터 없음"}</p>:
   <table style={{width:"100%",minWidth:"680px",borderCollapse:"collapse",tableLayout:"fixed"}}><colgroup><col style={{width:"60px"}}/><col style={{width:"60px"}}/><col style={{width:"190px"}}/><col style={{width:"150px"}}/><col style={{width:"110px"}}/><col style={{width:"110px"}}/><col style={{width:"110px"}}/></colgroup>
    <thead><tr>{headers.map(h=><th key={h} style={{padding:"11px 7px",color:"#a9adff",borderBottom:"2px solid #2b347a",fontSize:"12px",whiteSpace:"nowrap",textAlign:h==="DRIVER"||h==="TEAM"?"left":"center"}}>{h}</th>)}</tr></thead>
    <tbody>{results.map(d=><tr key={d.position}>
     <td style={{padding:"11px 7px",textAlign:"center",fontWeight:"bold",borderBottom:"1px solid #222a66"}}>{positionLabel(d.position)}</td>
     <td style={{padding:"11px 7px",textAlign:"center",fontWeight:"bold",borderBottom:"1px solid #222a66"}}>#{d.number}</td>
     <td style={{padding:"11px 7px",borderBottom:"1px solid #222a66",whiteSpace:"nowrap"}}>{d.Driver.givenName} {d.Driver.familyName}</td>
     <td style={{padding:"11px 7px",borderBottom:"1px solid #222a66,color:"#a9adff",whiteSpace:"normal"}}>{d.Constructor.name}</td>
     <td style={{padding:"11px 7px",textAlign:"center",borderBottom:"1px solid #222a66"}}>{d.Q1??"-"}</td>
     <td style={{padding:"11px 7px",textAlign:"center",borderBottom:"1px solid #222a66"}}>{d.Q2??"-"}</td>
     <td style={{padding:"11px 7px",textAlign:"center",borderBottom:"1px solid #222a66"}}>{d.Q3??"-"}</td>
    </tr>)}</tbody>
   </table>}
  </div>
  <BottomNav/>
 </main>;
}
