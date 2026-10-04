"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchItem = {
  type: "driver" | "team" | "race";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const drivers: SearchItem[] = [
  ["max_verstappen","Max Verstappen","Red Bull Racing"],
  ["lando_norris","Lando Norris","McLaren"],
  ["oscar_piastri","Oscar Piastri","McLaren"],
  ["charles_leclerc","Charles Leclerc","Ferrari"],
  ["lewis_hamilton","Lewis Hamilton","Ferrari"],
  ["george_russell","George Russell","Mercedes"],
].map(([id,title,subtitle]) => ({
  type:"driver", id, title, subtitle, href:`/championship/${id}`,
}));

const teams: SearchItem[] = [
  ["mclaren","McLaren"],
  ["ferrari","Ferrari"],
  ["red_bull","Red Bull Racing"],
  ["mercedes","Mercedes"],
  ["aston_martin","Aston Martin"],
  ["alpine","Alpine"],
  ["williams","Williams"],
  ["rb","Racing Bulls"],
  ["haas","Haas"],
  ["audi","Audi"],
  ["cadillac","Cadillac"],
].map(([id,title]) => ({
  type:"team", id, title, subtitle:"Constructor", href:`/championship/constructors/${id}`,
}));

const races: SearchItem[] = [
  ["1","Australian Grand Prix","Round 1"],
  ["2","Chinese Grand Prix","Round 2"],
  ["3","Japanese Grand Prix","Round 3"],
  ["4","Bahrain Grand Prix","Round 4"],
  ["5","Saudi Arabian Grand Prix","Round 5"],
  ["6","Miami Grand Prix","Round 6"],
  ["7","Emilia-Romagna Grand Prix","Round 7"],
  ["8","Monaco Grand Prix","Round 8"],
  ["9","Spanish Grand Prix","Round 9"],
  ["10","Canadian Grand Prix","Round 10"],
  ["11","Austrian Grand Prix","Round 11"],
  ["12","British Grand Prix","Round 12"],
  ["13","Belgian Grand Prix","Round 13"],
  ["14","Hungarian Grand Prix","Round 14"],
  ["15","Dutch Grand Prix","Round 15"],
  ["16","Italian Grand Prix","Round 16"],
  ["17","Azerbaijan Grand Prix","Round 17"],
  ["18","Singapore Grand Prix","Round 18"],
  ["19","United States Grand Prix","Round 19"],
  ["20","Mexico City Grand Prix","Round 20"],
  ["21","São Paulo Grand Prix","Round 21"],
  ["22","Las Vegas Grand Prix","Round 22"],
  ["23","Qatar Grand Prix","Round 23"],
  ["24","Abu Dhabi Grand Prix","Round 24"],
].map(([id,title,subtitle]) => ({
  type:"race", id, title, subtitle, href:`/results?round=${id}`,
}));

const allItems = [...drivers, ...teams, ...races];

const pageStyle = {
  minHeight:"100vh",
  background:"linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
  color:"white",
  padding:"24px",
  paddingBottom:"100px",
  fontFamily:"Arial, sans-serif",
};

export default function SearchPage() {
  const [query,setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allItems
      .filter(item =>
        `${item.title} ${item.subtitle}`.toLowerCase().includes(q)
      )
      .slice(0,12);
  },[query]);

  return (
    <main style={pageStyle}>
      <Link href="/" style={{color:"#a9adff",textDecoration:"none"}}>
        ← Home
      </Link>

      <h1 style={{fontSize:"34px",margin:"22px 0 6px"}}>🔎 Search</h1>
      <p style={{color:"#9fa7ff",marginTop:0}}>
        Drivers, teams, and Grands Prix
      </p>

      <div style={{
        background:"#131942",
        border:"1px solid #2b347a",
        borderRadius:"18px",
        padding:"14px 16px",
        marginTop:"20px",
      }}>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search driver, team, or GP..."
          aria-label="Search"
          style={{
            width:"100%",
            boxSizing:"border-box",
            border:"none",
            outline:"none",
            background:"transparent",
            color:"white",
            fontSize:"17px",
          }}
        />
      </div>

      <div style={{
        marginTop:"18px",
        background:"#131942",
        border:"1px solid #2b347a",
        borderRadius:"20px",
        overflow:"hidden",
      }}>
        {!query.trim() ? (
          <div style={{padding:"20px",color:"#a9adff"}}>
            검색어를 입력해 주세요.
          </div>
        ) : results.length === 0 ? (
          <div style={{padding:"20px",color:"#a9adff"}}>
            검색 결과가 없습니다.
          </div>
        ) : (
          results.map((item,index)=>(
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              style={{
                display:"block",
                color:"white",
                textDecoration:"none",
                padding:"15px 18px",
                borderBottom:index===results.length-1?"none":"1px solid #2b347a",
              }}
            >
              <div style={{fontWeight:"bold"}}>
                {item.type==="driver"?"👤":item.type==="team"?"🏭":"🏁"} {item.title}
              </div>
              <div style={{color:"#a9adff",fontSize:"13px",marginTop:"4px"}}>
                {item.subtitle}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
