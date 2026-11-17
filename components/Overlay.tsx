"use client";
// Bảng chữ bên trái màn hình. Mỗi nhịp bấm sáng lên đúng dòng ứng với cảnh 3D đang diễn.
import { AnimatePresence, LayoutGroup, animate, motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Beat, Slide } from "@/content/slides";
import { DEFINITION, GROUP, MEMBERS, METHODS, ROLES, SECTIONS, SEC_COLOR, TOPIC } from "@/content/slides";

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
        <div className="cover">
          <div className="kick mono">CHUYÊN ĐỀ · {GROUP.toUpperCase()}</div>
          <h1>Tập hợp lực lượng, thành lập tổ chức phản động <em>trên không gian mạng</em></h1>
          <p className="cover-names">{MEMBERS.map(m => m.name).join(" · ")}</p>
          <div className="hint mono"><span className="blink">Nhấn chuột hoặc → để bắt đầu</span><span><kbd>F</kbd> toàn màn hình · <kbd>O</kbd> tổng quan</span></div>
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
    case "concept":
      return <Panel sec="I" kicker="KHÁI NIỆM" title="Khái niệm">
        <p className="quote"><Rich t={DEFINITION} /></p>
        <Beats beats={s.beats} cur={step} setStep={p.setStep} />
      </Panel>;
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
