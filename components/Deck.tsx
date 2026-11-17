"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GROUP, SLIDES, SECTIONS, SEC_COLOR, SEC_OF, TITLES, stepsOf } from "@/content/slides";
import Overlay from "./Overlay";

// Thế giới 3D: dựng một lần, không bị gỡ khi đổi trang (layout giữ Deck qua các route).
const World = dynamic(() => import("./world/World"), { ssr: false });

const TOTAL = SLIDES.length;

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };
const fsElement = () => document.fullscreenElement ?? (document as FsDoc).webkitFullscreenElement ?? null;
/** Bật / tắt toàn màn hình (có dự phòng cho Safari). */
function toggleFullscreen() {
  const d = document as FsDoc, el = document.documentElement as FsEl;
  if (fsElement()) { if (d.exitFullscreen) d.exitFullscreen().catch(() => null); else d.webkitExitFullscreen?.(); }
  else if (el.requestFullscreen) el.requestFullscreen().catch(() => null); else el.webkitRequestFullscreen?.();
}

export default function Deck() {
  const params = useParams<{ n: string }>();
  const router = useRouter();
  const n = Math.min(Math.max(parseInt(params?.n ?? "1", 10) || 1, 1), TOTAL);
  const slide = SLIDES[n - 1];
  const max = stepsOf(slide);
  const [step, setStepRaw] = useState(0);
  const enterAtEnd = useRef(false);
  const first = useRef(true);
  const [scale, setScale] = useState(1);
  const [webgl, setWebgl] = useState(true);
  const [overview, setOverview] = useState(false);
  const [idle, setIdle] = useState(false);
  const [full, setFull] = useState(false);
  const setStep = useCallback((s: number) => setStepRaw(Math.max(0, Math.min(s, max))), [max]);

  useEffect(() => {
    try { const c = document.createElement("canvas"); setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl"))); } catch { setWebgl(false); }
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    let s = enterAtEnd.current ? stepsOf(SLIDES[n - 1]) : 0;
    if (first.current) { // mở thẳng một bước: /ho-so/10/?s=3
      first.current = false;
      const q = parseInt(new URLSearchParams(window.location.search).get("s") ?? "", 10);
      if (!Number.isNaN(q)) s = Math.max(0, Math.min(q, stepsOf(SLIDES[n - 1])));
    }
    setStepRaw(s); enterAtEnd.current = false;
  }, [n]);

  useEffect(() => {
    const on = () => setFull(!!fsElement());
    document.addEventListener("fullscreenchange", on); document.addEventListener("webkitfullscreenchange", on);
    return () => { document.removeEventListener("fullscreenchange", on); document.removeEventListener("webkitfullscreenchange", on); };
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 2500); };
    wake(); window.addEventListener("mousemove", wake); return () => { clearTimeout(t); window.removeEventListener("mousemove", wake); };
  }, []);

  const goTo = useCallback((to: number, atEnd = false) => {
    if (to < 1 || to > TOTAL) return;
    enterAtEnd.current = atEnd; setOverview(false);
    router.push(`/ho-so/${to}/`);
  }, [router]);
  const next = useCallback(() => { if (step < max) setStepRaw(step + 1); else goTo(n + 1); }, [step, max, n, goTo]);
  const prev = useCallback(() => { if (step > 0) setStepRaw(step - 1); else goTo(n - 1, true); }, [step, n, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "o" || (k === "escape" && overview)) { e.preventDefault(); setOverview(v => !v); return; }
      if (overview) return;
      if (["arrowright", "pagedown", " ", "enter"].includes(k)) { e.preventDefault(); next(); }
      if (["arrowleft", "pageup", "backspace"].includes(k)) { e.preventDefault(); prev(); }
      if (k === "home") goTo(1);
      if (k === "end") goTo(TOTAL);
      if (k === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, overview]);

  const onClick = (e: React.MouseEvent) => {
    if (overview || (e.target as HTMLElement).closest("a,button,[data-noadvance]")) return;
    next();
  };
  const sec = String(SEC_OF[n]);
  const secRoot = sec.split(".")[0];

  return (
    <div className={`viewport ${idle && !overview ? "idle" : ""}`} onClick={onClick}>
      <div className={`stage k-${slide.kind}`} style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
        <div className="world">{webgl ? <World n={n} step={step} /> : <div className="no3d" />}</div>
        <div className="vignette" />
        {slide.kind !== "cover" && (
          <div className="hud-id">
            <b className="mono">{sec || "·"}</b>
            <span className="mono">TRANG {String(n).padStart(2, "0")}/{TOTAL}</span>
          </div>
        )}
        <div key={n} className="overlay"><Overlay slide={slide} n={n} step={step} setStep={setStep} goTo={goTo} /></div>
        <button className={`fs-btn ${full ? "on" : ""}`} data-noadvance onClick={toggleFullscreen} aria-label={full ? "Thoát toàn màn hình" : "Toàn màn hình"} title={full ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {full
              ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
              : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
          <span className="mono">{full ? "THOÁT TOÀN MÀN HÌNH" : "TOÀN MÀN HÌNH"}</span>
          <kbd className="mono">F</kbd>
        </button>
        <nav className="tabs" data-noadvance>
          {SECTIONS.map(s => <button key={s.n} className={`tab ${secRoot === s.n ? "on" : ""}`} onClick={() => goTo(s.to)} title={s.label}><b>{s.n}</b><span>{s.label}</span></button>)}
        </nav>
        <div className="progress"><div style={{ width: `${((n - 1 + (max ? step / (max + 1) : 0)) / (TOTAL - 1)) * 100}%` }} /></div>
        {max > 0 && (
          <div className="stepper" data-noadvance>
            <span className="mono">BƯỚC {step + 1}/{max + 1}</span>
            {Array.from({ length: max + 1 }, (_, i) => <button key={i} aria-label={`Bước ${i + 1}`} className={`${i <= step ? "on" : ""} ${i === step ? "cur" : ""}`} onClick={() => setStep(i)} />)}
          </div>
        )}
        {overview && (
          <div className="overview" data-noadvance onClick={e => { if (e.target === e.currentTarget) setOverview(false); }}>
            <header className="ov-head">
              <div><span className="mono">CHUYÊN ĐỀ · {GROUP.toUpperCase()}</span><h2>Tổng quan</h2></div>
              <div className="ov-legend">
                {SECTIONS.map(sec => <span key={sec.n} style={{ "--sc": SEC_COLOR[sec.n] } as React.CSSProperties}><i />{sec.n} · {sec.label}</span>)}
              </div>
              <button className="ov-close mono" onClick={() => setOverview(false)}><kbd>O</kbd> ĐÓNG</button>
            </header>
            <div className="ov-grid">
              {TITLES.map((t, i) => {
                const sec = String(SEC_OF[i + 1]), root = sec.split(".")[0], color = SEC_COLOR[root] ?? "#56657c";
                const [kick, main] = t.includes(" · ") ? t.split(" · ") : ["", t];
                return (
                  <button key={i} className={`ov-card ${i + 1 === n ? "on" : ""}`} style={{ "--sc": color, animationDelay: `${i * 0.025}s` } as React.CSSProperties} onClick={() => goTo(i + 1)}>
                    <span className="ov-tab mono">{root ? `MỤC ${sec}` : "CHUNG"}</span>
                    {kick && <small className="mono">{kick}</small>}
                    <b>{main}</b>
                    <em className="mono">{String(i + 1).padStart(2, "0")}</em>
                    {i + 1 === n && <i className="mono">ĐANG XEM</i>}
                  </button>
                );
              })}
            </div>
            <footer className="ov-keys mono">
              <span><kbd>→</kbd><kbd>Space</kbd> tiếp</span><span><kbd>←</kbd> lùi</span><span><kbd>Home</kbd><kbd>End</kbd> đầu / cuối</span><span><kbd>F</kbd> toàn màn hình</span><span><kbd>O</kbd> tổng quan</span>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
