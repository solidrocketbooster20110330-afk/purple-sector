type ArtProps = { color?: string; label?: string; accent?: string; number?: string; team?: string };

/** Original generic motorsport vector art. It avoids official team logos and branded liveries. */
export function DriverHelmetArt({ color = "#7c3aed", label = "Driver helmet illustration" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 190" role="img" aria-label={label} style={{ display: "block", width: "100%", maxWidth: 240, height: "auto" }}>
      <defs>
        <linearGradient id="helmetShell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff"/><stop offset=".48" stopColor="#d7d4df"/><stop offset="1" stopColor="#77717f"/></linearGradient>
        <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4b5563"/><stop offset=".55" stopColor="#10121b"/><stop offset="1" stopColor="#020308"/></linearGradient>
      </defs>
      <ellipse cx="120" cy="166" rx="76" ry="10" fill="#000" opacity=".32"/>
      <path d="M53 117C42 69 72 25 117 20c43-5 73 26 74 68l-8 40-32 20-57-1-28-16z" fill="url(#helmetShell)" stroke="#fff" strokeOpacity=".65" strokeWidth="2"/>
      <path d="M49 93c31-17 82-21 135-4l-8 31c-37 13-82 13-119-1z" fill="url(#visor)" stroke={color} strokeWidth="3"/>
      <path d="M58 92c33-12 76-15 116-5" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="3"/>
      <path d="M70 48c22-18 50-22 76-13l-13 15-53 9z" fill={color}/>
      <path d="M80 132l8 19 51 3 17-13-5-9z" fill={color}/>
      <path d="M100 31l-6 27 14 6 11-35" fill="#fff" opacity=".72"/>
      <path d="M56 119l-3 15 26 13 9-6-8-18" fill="#5b5565"/>
      <circle cx="169" cy="137" r="5" fill={color}/>
    </svg>
  );
}

export function RaceCarArt({ color = "#7c3aed", accent = "#f8fafc", label = "Original racing car illustration", number = "", team = "" }: ArtProps) {
  const isPapaya = color.toLowerCase() === "#ff8000";
  const isRed = color.toLowerCase() === "#e80020" || color.toLowerCase() === "#f50537" || color.toLowerCase() === "#e6002b";
  const isBlue = color.toLowerCase() === "#3671c6" || color.toLowerCase() === "#6692ff";
  const isTeal = color.toLowerCase() === "#27f4d2" || color.toLowerCase() === "#00665e";
  const second = accent || (isPapaya ? "#111827" : isRed ? "#f8fafc" : isBlue ? "#e11d48" : isTeal ? "#0f172a" : "#f8fafc");
  return (
    <svg viewBox="0 0 560 250" role="img" aria-label={label} style={{ display: "block", width: "100%", height: "auto", maxHeight: 280 }}>
      <defs>
        <linearGradient id="raceCarBody" x1="0" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".3"/><stop offset=".2" stopColor={color}/><stop offset=".78" stopColor={color}/><stop offset="1" stopColor="#08090d"/></linearGradient>
        <linearGradient id="raceCarWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={color}/><stop offset="1" stopColor="#0b0b10"/></linearGradient>
        <linearGradient id="tireShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#30323a"/><stop offset=".5" stopColor="#07080b"/><stop offset="1" stopColor="#24252c"/></linearGradient>
        <filter id="carShadow" x="-20%" y="-30%" width="140%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="282" cy="210" rx="235" ry="14" fill="#000" opacity=".48" filter="url(#carShadow)"/>
      {/* Rear wing and endplates */}
      <path d="M427 64l78-7 9 8-5 9-80 4z" fill="url(#raceCarWing)" stroke={second} strokeWidth="2"/>
      <path d="M436 69l-5 33 13 3 8-34zM500 64l7 34 11 1-3-34z" fill={color} stroke="#0b0b0d" strokeWidth="2"/>
      {/* Rear tyre */}
      <path d="M408 139c-2-21 7-41 23-44 17-3 29 12 31 36 2 22-6 39-22 41-17 2-29-11-32-33z" fill="url(#tireShade)" stroke="#555861" strokeWidth="3"/>
      <path d="M420 141c-1-13 5-25 13-26 10-1 17 8 18 21 1 13-4 23-13 24-9 1-17-7-18-19z" fill="#20232a" stroke="#9397a1" strokeWidth="2"/>
      {/* Nose/front wing */}
      <path d="M47 174l103-8 49 9 0 9-105 8-46-5z" fill="url(#raceCarWing)" stroke={color} strokeWidth="2"/>
      <path d="M39 185l-12 14 17 3 28-11zM174 186l30 3 9 11-39-2z" fill={second} stroke="#0b0b0d" strokeWidth="2"/>
      <path d="M56 177l70-4 25 4-14 4-75 2z" fill={color}/>
      {/* Front tyre */}
      <path d="M92 150c-1-22 8-39 24-41 17-2 29 15 29 37 0 21-9 37-25 38-16 1-27-13-28-34z" fill="url(#tireShade)" stroke="#555861" strokeWidth="3"/>
      <path d="M105 151c0-13 5-23 13-24 10 0 16 10 16 22s-5 22-14 22c-9 0-15-8-15-20z" fill="#20232a" stroke="#9397a1" strokeWidth="2"/>
      {/* Sidepod and floor */}
      <path d="M131 146l76-25 91-15 108 17 28 19-13 19-83 9-132-4-56-7z" fill="url(#raceCarBody)" stroke="#08090d" strokeWidth="3"/>
      <path d="M193 148l61 5 68-8 72 1-20 17-138 1-48-7z" fill={second} opacity=".92"/>
      <path d="M154 140l49-28 38-14 49 4 26 17-59 5-36 18z" fill={color} stroke="#090a0d" strokeWidth="2"/>
      <path d="M171 135l46-22 36-7 18 4-27 18z" fill={second} opacity=".88"/>
      {/* Cockpit tub */}
      <path d="M254 112l18-28 29-9 26 5 15 18-13 18-48 7z" fill="#0b0d13" stroke="#89909c" strokeWidth="2"/>
      <path d="M275 91l20-10 22 5 11 13-37 6z" fill="#182536" stroke="#cbd5e1" strokeOpacity=".65" strokeWidth="2"/>
      <path d="M290 80l22 1 17 12-7 5-11-9-20-2z" fill={color}/>
      {/* Halo */}
      <path d="M247 103c13-24 39-34 59-29 16 4 26 14 35 29" fill="none" stroke="#d9dce4" strokeWidth="7" strokeLinecap="round"/>
      <path d="M247 103l-3 13M341 103l7 7" stroke="#a1a6b1" strokeWidth="5" strokeLinecap="round"/>
      {/* Airbox and engine cover */}
      <path d="M282 79l4-18 16-7 18 11-1 16-12 5z" fill={color} stroke="#090a0d" strokeWidth="2"/>
      <path d="M290 62l12-4 11 9-12 4z" fill="#111827"/>
      {/* Aerodynamic spine details */}
      <path d="M208 115l37-10 19 3-29 13zM344 120l38 4 14 8-58-3z" fill={second}/>
      <path d="M155 145l52-5 24 4-19 6-46 2z" fill="#fff" opacity=".23"/>
      <path d="M205 163l125 5 79-7" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2"/>
      {/* Wheel rims/front face */}
      <circle cx="118" cy="151" r="8" fill={color} stroke="#e5e7eb" strokeWidth="2"/>
      <circle cx="432" cy="140" r="8" fill={color} stroke="#e5e7eb" strokeWidth="2"/>
      <circle cx="118" cy="151" r="3" fill="#111827"/><circle cx="432" cy="140" r="3" fill="#111827"/>
      {/* Number / subtle team-specific styling */}
      {isPapaya && <path d="M188 150l18-1 15 8-20 2z" fill="#fff" opacity=".95"/>}
      {isRed && <path d="M181 147l26-6 17 8-29 7z" fill="#fff" opacity=".92"/>}
      {isBlue && <path d="M187 146l25-6 20 6-27 9z" fill="#facc15" opacity=".9"/>}
      {isTeal && <path d="M183 148l26-6 21 7-27 8z" fill="#e5e7eb" opacity=".9"/>}
      {number ? <g><path d="M272 132l48-5 10 21-51 5z" fill="#f8fafc" opacity=".92"/><text x="302" y="145" fill="#0b0b10" fontSize="17" fontWeight="900" textAnchor="middle">{number}</text></g> : null}
      <path d="M23 203l47-2 7-7 16 3 8 7-60 5zM424 181l65-4 10 7-16 7-49-2z" fill="#050608" stroke={color} strokeWidth="2"/>
      <text x="280" y="238" fontSize="12" fontWeight="800" letterSpacing="3" textAnchor="middle" fill="#b8b3c4">{team.toUpperCase()}</text>
    </svg>
  );
}
