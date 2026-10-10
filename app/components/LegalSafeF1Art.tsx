type ArtProps = { color?: string; label?: string };

/** Original generic motorsport artwork. Contains no official F1/team logos or third-party photos. */
export function DriverHelmetArt({ color = "#7c3aed", label = "Driver helmet illustration" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 190" role="img" aria-label={label} style={{ display: "block", width: "100%", maxWidth: 240, height: "auto" }}>
      <defs>
        <linearGradient id="helmetShell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7f4ff"/><stop offset="1" stopColor="#8c849b"/></linearGradient>
        <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#373047"/><stop offset="1" stopColor="#08070d"/></linearGradient>
      </defs>
      <ellipse cx="120" cy="166" rx="76" ry="10" fill="#000" opacity=".28" />
      <path d="M53 117C42 69 72 25 117 20c43-5 73 26 74 68l-8 40-32 20-57-1-28-16z" fill="url(#helmetShell)" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
      <path d="M49 93c31-17 82-21 135-4l-8 31c-37 13-82 13-119-1z" fill="url(#visor)" stroke="#c4b5fd" strokeWidth="3" />
      <path d="M59 92c33-12 76-15 116-5" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" />
      <path d="M70 48c22-18 50-22 76-13l-13 15-53 9z" fill={color} />
      <path d="M80 132l8 19 51 3 17-13-5-9z" fill={color} />
      <path d="M100 31l-6 27 14 6 11-35" fill="#fff" opacity=".7" />
      <path d="M56 119l-3 15 26 13 9-6-8-18" fill="#5b5565" />
      <circle cx="169" cy="137" r="5" fill={color} />
    </svg>
  );
}

export function RaceCarArt({ color = "#7c3aed", label = "Original racing car illustration" }: ArtProps) {
  return (
    <svg viewBox="0 0 360 170" role="img" aria-label={label} style={{ display: "block", width: "100%", height: "auto" }}>
      <defs><linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".24"/><stop offset=".5" stopColor={color}/><stop offset="1" stopColor="#111"/></linearGradient></defs>
      <ellipse cx="180" cy="142" rx="145" ry="12" fill="#000" opacity=".35" />
      <path d="M24 112l24-9 38-5 42-33 66-8 44 24 41 9 35 17-8 14-54 4-18-15H104l-17 14-57 1z" fill="url(#carPaint)" stroke={color} strokeWidth="2" />
      <path d="M111 96l29-29 48-4 29 28z" fill="#17131e" stroke="#c4b5fd" strokeOpacity=".65" strokeWidth="2" />
      <path d="M137 68l13-16 37-2 13 18z" fill={color} stroke="#ddd6fe" strokeOpacity=".7" />
      <path d="M24 108l42-2 10 8-49 5zM255 106l70 3-7 8-58 2z" fill="#e5e7eb" />
      <path d="M40 95l-4-16 28 1 10 14zM280 92l38-3 10 13-45-1z" fill={color} stroke="#ddd6fe" strokeWidth="2" />
      <circle cx="93" cy="123" r="25" fill="#08080a" stroke="#5b5565" strokeWidth="5"/><circle cx="93" cy="123" r="10" fill="#9ca3af"/>
      <circle cx="269" cy="123" r="25" fill="#08080a" stroke="#5b5565" strokeWidth="5"/><circle cx="269" cy="123" r="10" fill="#9ca3af"/>
      <path d="M148 92l27 0 10 6-44 0z" fill="#fff" opacity=".8" />
      <path d="M112 105l117 0" stroke="#fff" strokeOpacity=".7" strokeWidth="3" />
      <path d="M163 38l-4 14 44 0 9-10z" fill="#a1a1aa" />
      <path d="M171 38l-3-9 25 0 10 9z" fill={color} />
    </svg>
  );
}
