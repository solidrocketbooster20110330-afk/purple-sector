"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Controls = { left: boolean; right: boolean; gas: boolean; brake: boolean };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${secs.toFixed(3).padStart(6, "0")}`;
};

export default function RacingGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef<Controls>({ left: false, right: false, gas: false, brake: false });
  const game = useRef({
    speed: 0, playerX: 0, distance: 0, lap: 1, lapElapsed: 0, totalElapsed: 0,
    lastFrame: 0, running: false, lapTimes: [] as number[], steer: 0, messageUntil: 0,
  });
  const [speed, setSpeed] = useState(0);
  const [lap, setLap] = useState(1);
  const [lapTime, setLapTime] = useState("00:00.000");
  const [bestTime, setBestTime] = useState("--:--.---");
  const [lastTime, setLastTime] = useState("--:--.---");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("READY TO RACE");
  const [completed, setCompleted] = useState(0);

  const reset = useCallback(() => {
    const g = game.current;
    g.speed = 0; g.playerX = 0; g.distance = 0; g.lap = 1; g.lapElapsed = 0;
    g.totalElapsed = 0; g.lastFrame = 0; g.running = false; g.lapTimes = []; g.steer = 0;
    controls.current = { left: false, right: false, gas: false, brake: false };
    setSpeed(0); setLap(1); setLapTime("00:00.000"); setBestTime("--:--.---");
    setLastTime("--:--.---"); setRunning(false); setMessage("READY TO RACE"); setCompleted(0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let lastUi = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawCar = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // wheels
      ctx.fillStyle = "#111116";
      ctx.fillRect(-34, -25, 13, 34); ctx.fillRect(21, -25, 13, 34);
      ctx.fillRect(-29, 19, 11, 26); ctx.fillRect(18, 19, 11, 26);
      // front wing
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath(); ctx.moveTo(-40, 38); ctx.lineTo(-29, 30); ctx.lineTo(29, 30); ctx.lineTo(40, 38); ctx.lineTo(37, 44); ctx.lineTo(-37, 44); ctx.closePath(); ctx.fill();
      // body
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath(); ctx.moveTo(-25, 28); ctx.lineTo(-18, -9); ctx.lineTo(-12, -29); ctx.lineTo(-7, -39); ctx.lineTo(7, -39); ctx.lineTo(12, -29); ctx.lineTo(18, -9); ctx.lineTo(25, 28); ctx.lineTo(16, 36); ctx.lineTo(-16, 36); ctx.closePath(); ctx.fill();
      // side highlights
      ctx.fillStyle = "#c4b5fd";
      ctx.beginPath(); ctx.moveTo(-17, -7); ctx.lineTo(-11, -25); ctx.lineTo(-7, -28); ctx.lineTo(-8, 15); ctx.lineTo(-15, 24); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(17, -7); ctx.lineTo(11, -25); ctx.lineTo(7, -28); ctx.lineTo(8, 15); ctx.lineTo(15, 24); ctx.closePath(); ctx.fill();
      // cockpit and halo
      ctx.fillStyle = "#171329";
      ctx.beginPath(); ctx.ellipse(0, -10, 8, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e9d5ff"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, -11, 10, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      // rear wing
      ctx.fillStyle = "#4c1d95"; ctx.fillRect(-29, 25, 58, 7);
      ctx.fillStyle = "#f5f3ff"; ctx.font = "bold 8px Arial"; ctx.textAlign = "center"; ctx.fillText("PS", 0, 19);
      ctx.restore();
    };

    const render = (now: number) => {
      const g = game.current;
      const dt = g.lastFrame ? Math.min((now - g.lastFrame) / 1000, 0.05) : 0;
      g.lastFrame = now;
      const c = controls.current;
      if (g.running) {
        if (c.gas) g.speed += 100 * dt;
        else g.speed -= 19 * dt;
        if (c.brake) g.speed -= 190 * dt;
        g.speed = clamp(g.speed, 0, 320);
        const steerInput = (c.right ? 1 : 0) - (c.left ? 1 : 0);
        g.steer += (steerInput - g.steer) * Math.min(1, dt * 5);
        g.playerX += g.steer * (0.6 + g.speed / 180) * dt;
        g.playerX = clamp(g.playerX, -1.35, 1.35);
        g.distance += (g.speed / 3.6) * dt / 850;
        g.lapElapsed += dt;
        g.totalElapsed += dt;
        if (g.distance >= 1) {
          g.distance -= 1;
          g.lapTimes.push(g.lapElapsed);
          const finished = g.lapElapsed;
          setLastTime(formatTime(finished));
          setBestTime(formatTime(Math.min(...g.lapTimes)));
          g.lapElapsed = 0;
          g.lap += 1;
          setLap(g.lap);
          setCompleted(g.lapTimes.length);
          setMessage(`LAP ${g.lap - 1} COMPLETE!`);
          g.messageUntil = now + 1800;
        }
        if (Math.abs(g.playerX) > 0.94) g.speed = Math.max(0, g.speed - 48 * dt);
      }

      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.58);
      sky.addColorStop(0, "#17152b"); sky.addColorStop(1, "#65508a");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
      const horizon = height * 0.37;
      // distant skyline and hills
      ctx.fillStyle = "#282541";
      ctx.beginPath(); ctx.moveTo(0, horizon + 8);
      for (let x = 0; x <= width + 30; x += 30) ctx.lineTo(x, horizon - 15 - Math.sin(x * 0.025) * 12 - Math.cos(x * 0.012) * 7);
      ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
      // grass
      ctx.fillStyle = "#1d513e"; ctx.fillRect(0, horizon, width, height - horizon);
      // track perspective strips
      const curve = Math.sin(g.distance * Math.PI * 2) * 0.23 + Math.sin(g.distance * Math.PI * 6) * 0.08;
      const center = width * (0.5 - g.playerX * 0.17 + curve * 0.35);
      for (let i = 0; i < 44; i++) {
        const z1 = i / 44;
        const z2 = (i + 1) / 44;
        const y1 = horizon + (height - horizon) * z1 * z1;
        const y2 = horizon + (height - horizon) * z2 * z2;
        const half1 = width * (0.035 + z1 * 0.68);
        const half2 = width * (0.035 + z2 * 0.68);
        const offset1 = Math.sin((z1 * 1.7 + g.distance * 2.1) * Math.PI) * width * 0.12 * z1;
        const offset2 = Math.sin((z2 * 1.7 + g.distance * 2.1) * Math.PI) * width * 0.12 * z2;
        const cx1 = center + offset1;
        const cx2 = center + offset2;
        ctx.fillStyle = i % 2 ? "#eeeeee" : "#e34264";
        ctx.beginPath(); ctx.moveTo(cx1 - half1 * 1.08, y1); ctx.lineTo(cx1 - half1, y1); ctx.lineTo(cx2 - half2, y2); ctx.lineTo(cx2 - half2 * 1.08, y2); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx1 + half1, y1); ctx.lineTo(cx1 + half1 * 1.08, y1); ctx.lineTo(cx2 + half2 * 1.08, y2); ctx.lineTo(cx2 + half2, y2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = i % 2 ? "#55545f" : "#4b4a55";
        ctx.beginPath(); ctx.moveTo(cx1 - half1, y1); ctx.lineTo(cx1 + half1, y1); ctx.lineTo(cx2 + half2, y2); ctx.lineTo(cx2 - half2, y2); ctx.closePath(); ctx.fill();
        // dashed center line
        if (i % 5 < 2) {
          ctx.strokeStyle = "#f7f4ff"; ctx.lineWidth = 1 + z2 * 3;
          ctx.beginPath(); ctx.moveTo(cx1, y1); ctx.lineTo(cx2, y2); ctx.stroke();
        }
        // trackside boards
        if (i % 8 === 0 && i > 3) {
          const signW = 8 + z2 * 28; const signH = 5 + z2 * 13;
          ctx.fillStyle = "#eee8ff";
          ctx.fillRect(cx2 - half2 * 1.18 - signW, y2 - signH, signW, signH);
          ctx.fillRect(cx2 + half2 * 1.18, y2 - signH, signW, signH);
        }
      }
      // motion streaks when fast
      if (g.speed > 180) {
        ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const x = (i / 8) * width;
          ctx.beginPath(); ctx.moveTo(x, height * 0.68); ctx.lineTo(x + (x - width / 2) * 0.06, height * 0.9); ctx.stroke();
        }
      }
      const carX = width * 0.5 + g.playerX * width * 0.25;
      drawCar(carX, height * 0.79, clamp(width / 440, 0.72, 1.25));
      // HUD in canvas for a game-like overlay
      ctx.fillStyle = "rgba(8, 7, 18, .68)";
      ctx.fillRect(12, 12, 132, 61);
      ctx.fillStyle = "#c4b5fd"; ctx.font = "bold 10px Arial"; ctx.fillText("PURPLE SECTOR", 22, 28);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 26px Arial"; ctx.fillText(String(Math.round(g.speed)), 20, 54);
      ctx.fillStyle = "#c4b5fd"; ctx.font = "10px Arial"; ctx.fillText("KM/H", 83, 53);
      ctx.fillStyle = "rgba(8, 7, 18, .68)"; ctx.fillRect(width - 94, 12, 82, 45);
      ctx.fillStyle = "#a78bfa"; ctx.font = "bold 10px Arial"; ctx.textAlign = "right"; ctx.fillText("LAP", width - 22, 28);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 23px Arial"; ctx.fillText(String(g.lap), width - 22, 49); ctx.textAlign = "left";
      if (!g.running) {
        ctx.fillStyle = "rgba(5, 4, 12, .38)"; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "900 27px Arial"; ctx.fillText("PURPLE SECTOR", width / 2, height * 0.31);
        ctx.fillStyle = "#c4b5fd"; ctx.font = "bold 12px Arial"; ctx.fillText("3D ARCADE RACING", width / 2, height * 0.31 + 23);
        ctx.fillStyle = "#fff"; ctx.font = "bold 13px Arial"; ctx.fillText("TAP START RACE BELOW", width / 2, height * 0.47);
        ctx.textAlign = "left";
      }
      if (now < g.messageUntil) {
        ctx.fillStyle = "rgba(17, 12, 32, .82)"; ctx.fillRect(width / 2 - 95, height * 0.18, 190, 36);
        ctx.fillStyle = "#ddd6fe"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center"; ctx.fillText(message, width / 2, height * 0.18 + 23); ctx.textAlign = "left";
      }
      if (now - lastUi > 100) {
        setSpeed(Math.round(g.speed));
        if (g.running) setLapTime(formatTime(g.lapElapsed));
        lastUi = now;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const keyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) e.preventDefault();
      if (key === "arrowleft" || key === "a") controls.current.left = true;
      if (key === "arrowright" || key === "d") controls.current.right = true;
      if (key === "arrowup" || key === "w" || key === " ") controls.current.gas = true;
      if (key === "arrowdown" || key === "s") controls.current.brake = true;
    };
    const keyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "arrowleft" || key === "a") controls.current.left = false;
      if (key === "arrowright" || key === "d") controls.current.right = false;
      if (key === "arrowup" || key === "w" || key === " ") controls.current.gas = false;
      if (key === "arrowdown" || key === "s") controls.current.brake = false;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [message]);

  const start = () => {
    game.current.running = true;
    game.current.lastFrame = 0;
    setRunning(true);
    setMessage("GO GO GO!");
    game.current.messageUntil = performance.now() + 1200;
  };

  const hold = (control: keyof Controls, value: boolean) => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    controls.current[control] = value;
    if (value) {
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch {}
    }
  };

  return (
    <main className="race-page">
      <style jsx>{`
        .race-page{min-height:calc(100vh - 60px);background:radial-gradient(ellipse at top,#21123e 0%,#090711 55%,#050505 100%);color:#f8f7ff;padding:20px 14px 30px;box-sizing:border-box}
        .race-shell{width:min(100%,760px);margin:0 auto}
        .race-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:2px 0 14px}
        .eyebrow{font-size:11px;letter-spacing:.2em;color:#c4b5fd;font-weight:900}
        h1{font-size:clamp(23px,5vw,34px);letter-spacing:-.04em;margin:5px 0 0;font-weight:950}
        .pill{border:1px solid #5b3a92;border-radius:999px;padding:8px 10px;color:#ddd6fe;font-size:10px;white-space:nowrap}
        .track-frame{border:1px solid #6d45a7;border-radius:20px;overflow:hidden;box-shadow:0 16px 55px #0009;background:#171329}
        canvas{display:block;width:100%;height:min(58vh,530px);min-height:370px;touch-action:none}
        .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
        .stat{background:#15111f;border:1px solid #2d2342;border-radius:13px;padding:11px 10px;min-width:0}
        .label{font-size:10px;color:#a9a1bb;letter-spacing:.1em;text-transform:uppercase}
        .value{font-size:clamp(15px,3.7vw,21px);font-weight:850;margin-top:5px;font-variant-numeric:tabular-nums;white-space:nowrap}
        .controls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:stretch;margin-top:12px}
        .control{min-height:68px;border:1px solid #493468;background:linear-gradient(180deg,#24183a,#130f20);color:#fff;border-radius:16px;font-weight:900;font-size:13px;touch-action:none;user-select:none;-webkit-user-select:none}
        .control:active{background:#6d28d9;transform:scale(.98)}
        .control span{display:block;font-size:23px;margin-bottom:3px;color:#c4b5fd}
        .go{background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:0;box-shadow:0 8px 25px #6d28d944}
        .go span{color:#fff}
        .action-row{display:flex;gap:9px;margin-top:10px}
        .secondary{flex:1;background:#171321;border:1px solid #332747;color:#d9d3e8;border-radius:12px;padding:11px;font-weight:800}
        .hint{text-align:center;color:#a9a1bb;font-size:11px;line-height:1.6;margin:12px 0 0}
        @media(min-width:600px){.race-page{padding-top:28px}.controls{max-width:520px;margin:12px auto 0}.action-row{max-width:520px;margin:10px auto 0}.stats{gap:12px}.stat{padding:14px}}
      `}</style>
      <div className="race-shell">
        <header className="race-head">
          <div><div className="eyebrow">PURPLE SECTOR ARCADE</div><h1>RACING MODE</h1></div>
          <div className="pill">3D VIEW · SOLO</div>
        </header>
        <div className="track-frame"><canvas ref={canvasRef} aria-label="3인칭 F1 레이싱 게임 화면" /></div>
        <section className="stats" aria-label="레이스 기록">
          <div className="stat"><div className="label">현재 랩</div><div className="value">{lap} / ∞</div></div>
          <div className="stat"><div className="label">랩 타임</div><div className="value">{lapTime}</div></div>
          <div className="stat"><div className="label">최고 기록</div><div className="value">{bestTime}</div></div>
        </section>
        <div className="controls">
          <button className="control" onPointerDown={hold("left", true)} onPointerUp={hold("left", false)} onPointerCancel={hold("left", false)} onLostPointerCapture={hold("left", false)} aria-label="좌회전"><span>◀</span>LEFT</button>
          <button className="control go" onPointerDown={hold("gas", true)} onPointerUp={hold("gas", false)} onPointerCancel={hold("gas", false)} onLostPointerCapture={hold("gas", false)} aria-label="가속"><span>▲</span>THROTTLE</button>
          <button className="control" onPointerDown={hold("right", true)} onPointerUp={hold("right", false)} onPointerCancel={hold("right", false)} onLostPointerCapture={hold("right", false)} aria-label="우회전"><span>▶</span>RIGHT</button>
        </div>
        <div className="action-row">
          <button className="secondary" onPointerDown={hold("brake", true)} onPointerUp={hold("brake", false)} onPointerCancel={hold("brake", false)} onLostPointerCapture={hold("brake", false)}>▼ BRAKE</button>
          {!running ? <button className="secondary" onClick={start}>▶ START RACE</button> : <button className="secondary" onClick={() => { game.current.running = false; setRunning(false); setMessage("PAUSED"); }}>Ⅱ PAUSE</button>}
          <button className="secondary" onClick={reset}>↻ RESET</button>
        </div>
        <p className="hint">화면 버튼을 길게 눌러 조작하세요 · PC: 방향키 또는 WASD · 트랙 바깥으로 나가면 속도가 줄어듭니다.<br/>완주한 랩의 기록은 자동 저장되어 최고 기록을 갱신합니다.</p>
      </div>
    </main>
  );
}
