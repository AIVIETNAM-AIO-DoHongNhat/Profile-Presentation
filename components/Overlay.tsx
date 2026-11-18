"use client";
// Bảng chữ bên trái màn hình. Mỗi nhịp bấm sáng lên đúng dòng ứng với cảnh 3D đang diễn.
import { AnimatePresence, LayoutGroup, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Beat, Slide, Video } from "@/content/slides";
import { CONCEPT_VIDEO, DEFINITION, GROUP, MEMBERS, METHODS, ROLES, SECTIONS, SEC_COLOR, SUMMARY, TAKEAWAY, TEAM_ORDER, TOPIC } from "@/content/slides";

type P = { slide: Slide; n: number; step: number; setStep: (s: number) => void; goTo: (n: number) => void };

const state = (i: number, cur: number) => (i < cur ? "past" : i === cur ? "now" : "future");

/** Chữ trong **…** được tô sáng. */
function Rich({ t }: { t: string }) {
  return <>{t.split(/(\*\*[^*]+\*\*)/g).map((x, i) => (x.startsWith("**") && x.endsWith("**") ? <mark key={i}>{x.slice(2, -2)}</mark> : x))}</>;
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Danh sách nhịp: dòng đang nói mở ra mượt, thanh màu bên trái trượt theo dòng hiện tại. */
function Beats({ beats, cur, setStep, extra }: { beats: Beat[]; cur: number; setStep: (s: number) => void; extra?: (i: number) => React.ReactNode }) {
  return (
    <LayoutGroup>
      <ol className="beats" data-noadvance>
        {beats.map((b, i) => {
          const now = i === cur, ex = extra?.(i);
          return (
            <li key={i} className={`beat ${state(i, cur)}`}>
              <button onClick={() => setStep(i)}>
                {now && <motion.span className="beat-bar" layoutId="beat-bar" transition={{ duration: 0.5, ease: EASE }} />}
                <span className="beat-k mono">{/^[a-z]$/.test(b.k) ? "—" : b.k}</span>
                <span className="beat-body">
                  <b>{b.t}</b>
                  <AnimatePresence initial={false}>
                    {now && (b.d || ex) && (
                      <motion.span key="more" className="beat-more"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3, delay: 0.08 } }}>
                        <motion.span className="beat-more-in" initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                          {b.d && <span className="beat-d"><Rich t={b.d} /></span>}
                          {ex}
                        </motion.span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </LayoutGroup>
  );
}

/* ---------- video ---------- */
/** Link video → link nhúng. Hỗ trợ Facebook (video, reel), YouTube; trả về null nếu không nhận ra. */
function embedSrc(url: string) {
  try {
    const u = new URL(url, "https://x.invalid"), host = u.hostname.replace(/^(www|m|web)\./, "");
    if (host === "facebook.com" || host === "fb.watch") {
      // link nhúng copy từ Facebook (plugins/video.php?href=…) thì lấy lại link gốc
      const href = u.pathname.startsWith("/plugins/") ? u.searchParams.get("href") ?? url : url;
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&autoplay=true&mute=0`;
    }
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host.endsWith("youtube.com")) id = u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ?? "";
    if (/^[\w-]{6,}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    return null;
  } catch { return null; }
}
/**
 * Màn hình chiếu đặt cạnh bảng chữ: tự hiện và phát khi tới đúng nhịp, rời nhịp thì tắt (không cần bấm).
 * "Phóng to" chỉ đổi kích thước bằng CSS, khung video không bị tải lại nên không mất đoạn đang xem.
 */
function VideoScreen({ v }: { v: Video }) {
  const [big, setBig] = useState(false);
  const src = embedSrc(v.url), file = /\.(mp4|webm|mov)(\?|$)/i.test(v.url);
  useEffect(() => { // Esc để thu nhỏ lại (không chuyển trang)
    if (!big) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); setBig(false); } };
    window.addEventListener("keydown", h, true); return () => window.removeEventListener("keydown", h, true);
  }, [big]);
  return (
    <motion.aside className={`screen ${big ? "big" : ""}`} data-noadvance style={{ "--vr": v.ratio ?? "16 / 9" } as React.CSSProperties}
      initial={{ opacity: 0, x: 70, rotate: 1.5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
      transition={{ duration: 0.65, ease: EASE, delay: 0.35 }}>
      <header className="screen-bar mono">
        <i className="rec" aria-hidden />ĐANG CHIẾU<span>· {v.by}</span>
        <button onClick={() => setBig(b => !b)}>{big ? "⤡ THU NHỎ" : "⤢ PHÓNG TO"}</button>
      </header>
      <div className="screen-frame">
        {file ? <video src={v.url} controls autoPlay playsInline />
          : src ? <iframe src={src} title={v.title} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          : <a className="vlink" href={v.url} target="_blank" rel="noreferrer">Mở video trong tab mới ↗</a>}
      </div>
      <p className="screen-cap">{v.title} <a href={v.url} target="_blank" rel="noreferrer">Mở nguồn ↗</a></p>
    </motion.aside>
  );
}

/** Con số trong kết luận vụ việc đếm lên (ví dụ "1.530 tin, bài", "196 năm tù"). */
function CountUp({ text }: { text: string }) {
  const m = text.match(/^([\d.]+)(.*)$/), ref = useRef<HTMLSpanElement>(null);
  const target = m ? parseInt(m[1].replace(/\./g, ""), 10) : 0;
  useEffect(() => {
    if (!m || !ref.current) return;
    const el = ref.current;
    const c = animate(0, target, { duration: 1.1, delay: 0.35, ease: "easeOut", onUpdate: v => { el.textContent = Math.round(v).toLocaleString("vi-VN"); } });
    return () => c.stop();
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <>{text}</>;
  return <><span ref={ref}>0</span>{m[2]}</>;
}

function Panel({ sec, kicker, title, sub, children, className = "" }: { sec?: string; kicker: string; title: string; sub?: string; children?: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`} style={{ "--ac": SEC_COLOR[sec ?? ""] ?? "#b0261f" } as React.CSSProperties}>
      <div className="kick mono">{sec && <b>{sec}</b>}{kicker}</div>
      <h1>{title}</h1>
      {sub && <p className="sub">{sub}</p>}
      {children}
    </section>
  );
}

export default function Overlay(p: P) {
  const s = p.slide, step = p.step;
  switch (s.kind) {
    case "cover":
      return (
        <div className="cover cover-front">
          <div className="cf-kick"><span>Chuyên đề</span><i aria-hidden /></div>
          <h1 className="cf-title" aria-label={TOPIC}>
            <span>Tập hợp lực lượng,</span>
            <span>thành lập tổ chức phản động</span>
            <em>trên không gian mạng</em>
          </h1>
          <div className="cf-rule" aria-hidden><b /><i /></div>
          <div className="cf-team">
            <div className="cf-team-h">Nhóm thực hiện <span>·</span> {GROUP}</div>
            <ol style={{ "--rows": Math.ceil(MEMBERS.length / 2) } as React.CSSProperties}>
              {TEAM_ORDER.map(k => (
                <li key={k}>{MEMBERS[k].name}{MEMBERS[k].role === 0 && <em>{ROLES[0].label}</em>}</li>
              ))}
            </ol>
          </div>
          <div className="cf-hint mono">Nhấn chuột hoặc <kbd>→</kbd> để bắt đầu<span>·</span><kbd>F</kbd> toàn màn hình<span>·</span><kbd>O</kbd> tổng quan</div>
        </div>
      );
    case "team":
      return <Panel kicker="THÀNH VIÊN" title={GROUP} sub={`${MEMBERS.length} thành viên thực hiện chuyên đề`}>
        <ul className={`roles ${step >= 1 ? "on" : ""}`}>
          {ROLES.map((r, k) => {
            const n = MEMBERS.filter(m => m.role === k).length;
            return <li key={r.label} style={{ "--rc": r.color } as React.CSSProperties}><i />{r.label}<b className="mono">{String(n).padStart(2, "0")}</b></li>;
          })}
        </ul>
        {step < 1 && <div className="tip mono">BẤM ĐỂ MỞ HỒ SƠ TỪNG NGƯỜI</div>}
      </Panel>;
    case "toc":
      return <Panel kicker="MỤC LỤC" title="Nội dung trình bày">
        <ol className="toc" data-noadvance>
          {SECTIONS.map(sec => (
            <li key={sec.n} style={{ "--sc": SEC_COLOR[sec.n] } as React.CSSProperties}>
              <button className="toc-main" onClick={() => p.goTo(sec.to)}><b className="mono">{sec.n}</b><span>{sec.label}</span><em className="mono">{String(sec.to).padStart(2, "0")}</em></button>
              {sec.n === "V" && <div className="toc-sub">{METHODS.map(m => <button key={m.n} onClick={() => p.goTo(sec.to + m.n - 1)}><i className="mono">{m.n}</i>{m.short}</button>)}</div>}
            </li>
          ))}
        </ol>
      </Panel>;
    case "concept": {
      // tới đúng nhịp nói về nội dung video thì màn hình chiếu tự trượt vào bên cạnh và phát
      const vid = CONCEPT_VIDEO.beat === undefined || step === CONCEPT_VIDEO.beat;
      return <>
        <Panel sec="I" kicker="KHÁI NIỆM" title="Khái niệm">
          <p className="quote"><Rich t={DEFINITION} /></p>
          <Beats beats={s.beats} cur={step} setStep={p.setStep} />
        </Panel>
        <AnimatePresence>{vid && <VideoScreen key="screen" v={CONCEPT_VIDEO} />}</AnimatePresence>
      </>;
    }
    case "features":
      return <Panel sec="II" kicker="ĐẶC ĐIỂM" title="Ba đặc điểm nổi bật"><Beats beats={s.beats} cur={step} setStep={p.setStep} /></Panel>;
    case "types":
      return <Panel sec="III" kicker="CÁC DẠNG HỘI NHÓM" title="Ba dạng hội nhóm" sub="Mức gắn kết với nhóm thực tế tăng dần">
        <Beats beats={s.beats} cur={step} setStep={p.setStep} extra={i => i === step && (
          <span className="tags">{["Liên hệ", "Vai trò", "Thành viên"].map((h, k) => <span key={h}><i className="mono">{h}</i>{s.beats[i].tags[k]}</span>)}</span>
        )} />
      </Panel>;
    case "forms":
      return <Panel sec="IV" kicker="HÌNH THỨC THÀNH LẬP" title="Ba hình thức thành lập"><Beats beats={s.beats} cur={step} setStep={p.setStep} /></Panel>;
    case "method": {
      const m = s.m, inCase = step >= m.beats.length, c = m.case;
      return <Panel sec="V" kicker={`PHƯƠNG THỨC ${m.n}/5`} title={m.title} className={inCase ? "is-case" : ""}>
        <div className="tools mono">{m.tools}</div>
        {!inCase ? <Beats beats={m.beats} cur={step} setStep={p.setStep} /> : (
          <div className="case" data-noadvance>
            <div className="case-head"><span className="mono">VỤ VIỆC MINH HỌA · {c.period}</span><b>{c.name}</b></div>
            <dl>{c.facts.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}</dl>
            <div className="verdict"><b><CountUp text={c.verdict[0]} /></b><span>{c.verdict[1]}</span></div>
            <div className="src">{c.source} · {c.caption}</div>
            <button className="back mono" onClick={() => p.setStep(0)}>← XEM LẠI THỦ ĐOẠN</button>
          </div>
        )}
      </Panel>;
    }
    case "solutions":
      return <Panel sec="VI" kicker="GIẢI PHÁP" title="Giải pháp" sub="Năm nhóm giải pháp ứng với năm phương thức, cùng giải pháp chung">
        <Beats beats={s.groups.map(g => ({ k: g.k, t: g.t }))} cur={step} setStep={p.setStep} extra={i => i === step && (
          <ul className="items">{s.groups[i].items.map(x => <li key={x}>{x}</li>)}</ul>
        )} />
      </Panel>;
    case "summary":
      // bảng tổng kết: 6 ô ứng với 6 mục, hiện lần lượt; dòng thông điệp chốt ở dưới
      return (
        <section className="summary">
          <header className="sum-head">
            <div className="kick mono">TỔNG KẾT</div>
            <h1>Tóm tắt nội dung chuyên đề</h1>
            <p>{TOPIC}</p>
          </header>
          <div className="sum-grid">
            {SUMMARY.map((c, i) => (
              <article key={c.n} className="sum-cell" style={{ "--sc": SEC_COLOR[c.n], animationDelay: `${0.25 + i * 0.12}s` } as React.CSSProperties}>
                <div className="sum-top"><b>{c.n}</b><h3>{c.label}</h3></div>
                {c.lead && <p className="sum-lead">{c.lead}</p>}
                {c.n === "V"
                  ? <ol className="sum-chips">{c.items.map((t, k) => <li key={t}><i className="mono">{k + 1}</i>{t}</li>)}</ol>
                  : <ul>{c.items.map(t => <li key={t}>{t}</li>)}</ul>}
              </article>
            ))}
          </div>
          <footer className="sum-take">
            <span className="mono">THÔNG ĐIỆP</span>
            {TAKEAWAY.map((t, k) => <b key={t}>{k > 0 && <i aria-hidden>·</i>}{t}</b>)}
          </footer>
        </section>
      );
    case "closing":
      return (
        <div className="cover thanks">
          <div className="kick mono">KẾT THÚC TRÌNH BÀY · {GROUP.toUpperCase()}</div>
          <h1><span>Cảm ơn thầy</span><span>và các bạn</span><em>đã lắng nghe!</em></h1>
          <p className="cover-names">{TOPIC}</p>
        </div>
      );
    default:
      return null;
  }
}
