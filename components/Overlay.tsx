"use client";
// Phiếu trích yếu bên trái màn hình. Mỗi nhịp bấm sáng lên đúng dòng ứng với cảnh 3D đang diễn.
import { useEffect, useState } from "react";
import type { Beat, Link, Slide } from "@/content/slides";
import { COVER, DEFINITION, MEMBERS, PURPOSE, ROLES, SECTIONS, SLIDES, TEAM_ORDER, TEAM_STAGGER, TITLES, TOPIC } from "@/content/slides";

type P = { slide: Slide; n: number; step: number; setStep: (s: number) => void; goTo: (n: number) => void };

const state = (i: number, cur: number) => (i < cur ? "past" : i === cur ? "now" : "future");

/** Chú giải vai trò: mỗi vai trò sáng lên đúng lúc nét bút chì bắt đầu khoanh nhóm đó trong cảnh 3D. */
function TeamLegend({ on }: { on: boolean }) {
  const [t, setT] = useState(-1);
  useEffect(() => {
    if (!on) { setT(-1); return; }
    const t0 = performance.now(); setT(0);
    const id = setInterval(() => { const e = (performance.now() - t0) / 1000; setT(e); if (e > MEMBERS.length * TEAM_STAGGER + 1) clearInterval(id); }, 100);
    return () => clearInterval(id);
  }, [on]);
  return (
    <div className="legend" data-noadvance>
      {ROLES.map((r, k) => {
        const ids = TEAM_ORDER.filter(i => MEMBERS[i].role === k);
        if (!ids.length) return null;
        const start = TEAM_ORDER.indexOf(ids[0]) * TEAM_STAGGER;
        return <div key={k} className={`role ${t >= start ? "on" : ""}`} style={{ "--rc": r.color } as React.CSSProperties}><i /><span>{r.label}</span><b className="mono">{String(ids.length).padStart(2, "0")}</b></div>;
      })}
      {!on && <em className="mono">BẤM ĐỂ KHOANH DANH TÍNH</em>}
    </div>
  );
}

/** Chữ trong **…** hiện thành đoạn highlight (như bút dạ quang). */
function Rich({ t }: { t: string }) {
  return <>{t.split(/(\*\*[^*]+\*\*)/g).map((x, i) => (x.startsWith("**") && x.endsWith("**") ? <mark key={i}>{x.slice(2, -2)}</mark> : x))}</>;
}

/** Ký hiệu cột trái của mỗi ý: chữ cái (a, b, c…) giữ nguyên; "Đặc điểm 01", "Giai đoạn 2"… rút gọn thành số; còn lại là gạch đầu dòng. */
const marker = (k: string) => (k.length <= 2 ? k : (k.match(/(\d+)\s*$/)?.[1]?.padStart(2, "0") ?? "•"));

function Beats({ beats, cur, setStep, offset = 0 }: { beats: Beat[]; cur: number; setStep?: (s: number) => void; offset?: number }) {
  return (
    <ol className="beats" data-noadvance={setStep ? true : undefined}>
      {beats.map((b, i) => (
        <li key={i} className={`beat ${state(i, cur)}`}>
          <button className={b.k ? "" : "no-m"} onClick={setStep ? () => setStep(i + offset) : undefined} tabIndex={setStep ? 0 : -1}>
            {b.k && <span className="beat-m serif">{marker(b.k)}</span>}
            <span className="beat-body">
              <b className="serif">{b.t}</b>
              {b.d && <span className="beat-d"><Rich t={b.d} /></span>}
              {b.x && <span className="beat-x"><i className="mono">DẤU HIỆU</i><Rich t={b.x} /></span>}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
function Chips({ links, goTo }: { links: Link[]; goTo: (n: number) => void }) {
  return <div className="chips" data-noadvance>{links.map(l => <button key={l.to} onClick={() => goTo(l.to)}><i />{l.label}<em>→ {String(l.to).padStart(2, "0")}</em></button>)}</div>;
}
function Card({ kicker, title, children, className = "" }: { kicker: string; title?: string; children?: React.ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      <div className="card-tab mono">{kicker}</div>
      {title && <h1 className="card-title serif">{title}</h1>}
      {children}
    </section>
  );
}

export default function Overlay(p: P) {
  const s = p.slide, step = p.step;
  switch (s.kind) {
    case "cover":
      return (
        <div className={`cover-text ${step >= 1 ? "opened" : ""}`}>
          <div className="mono cover-kicker">HỒ SƠ CHUYÊN ĐỀ · HS-01/KGM · LƯU HÀNH NỘI BỘ</div>
          <h1 className="serif">Tập hợp lực lượng,<br />thành lập tổ chức<br />phản động<br /><em>trên không gian mạng</em></h1>
          <dl className="cover-meta">{COVER.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd className="serif">{v}</dd></div>)}</dl>
          <div className="hint mono"><span className="blink">{step === 0 ? "Nhấn chuột hoặc → để mở hồ sơ" : "Nhấn tiếp để bắt đầu"}</span><span><kbd>F</kbd> toàn màn hình · <kbd>O</kbd> tổng quan</span></div>
        </div>
      );
    case "team":
      return <Card kicker="THÀNH VIÊN" title="Thành viên thực hiện chuyên đề" className="slim">
        <TeamLegend on={step >= 1} />
      </Card>;
    case "toc":
      return <Card kicker="MỤC LỤC" title="Nội dung hồ sơ">
        <ol className="toc" data-noadvance>
          {SECTIONS.map((sec, i) => {
            const end = SECTIONS[i + 1]?.to ?? 16;
            return <li key={sec.n}>
              <button className="toc-main" onClick={() => p.goTo(sec.to)}><b className="serif">{sec.n}</b><span>{sec.label}</span><em className="mono">{String(sec.to).padStart(2, "0")}</em></button>
              {Array.from({ length: end - sec.to - 1 }, (_, j) => sec.to + 1 + j).map(t => <button key={t} className="toc-sub" onClick={() => p.goTo(t)}><span className="serif">{TITLES[t - 1]}</span><em className="mono">{String(t).padStart(2, "0")}</em></button>)}
            </li>;
          })}
        </ol>
      </Card>;
    case "concept":
      return <Card kicker="MỤC I · KHÁI NIỆM" title="Định nghĩa và hai quá trình">
        <div className="sublabel mono">ĐỊNH NGHĨA</div>
        <p className="quote serif"><Rich t={DEFINITION} /></p>
        <div className="sublabel mono">HAI QUÁ TRÌNH</div>
        <Beats beats={s.beats} cur={step} setStep={p.setStep} />
        <div className="purpose"><b className="mono">MỤC ĐÍCH</b><span><Rich t={PURPOSE} /></span></div>
      </Card>;
    case "features":
      return <Card kicker="MỤC II · ĐẶC ĐIỂM" title="Ba đặc điểm nổi bật"><Beats beats={s.beats} cur={step} setStep={p.setStep} /></Card>;
    case "types":
      return <Card kicker="MỤC III · CÁC DẠNG HỘI NHÓM" title="Ba dạng theo mối liên hệ với nhóm thực tế">
        <Beats beats={s.beats} cur={step} setStep={p.setStep} />
        <Chips links={s.links} goTo={p.goTo} />
      </Card>;
    case "forms":
      return <Card kicker="MỤC IV · HÌNH THỨC THÀNH LẬP" title="Ba hình thức theo cơ sở hình thành">
        <Beats beats={s.beats} cur={step} setStep={p.setStep} />
        <Chips links={s.links} goTo={p.goTo} />
      </Card>;
    case "network":
      return <Card kicker="MỤC V · PHƯƠNG THỨC, THỦ ĐOẠN" title="Từ đám đông đến tổ đơn tuyến">
        <Beats beats={s.beats.map((b, i) => ({ k: String(i + 1).padStart(2, "0"), t: b.t, d: b.d }))} cur={step} setStep={p.setStep} />
        <div className="rule mono">ĐÔNG → ÍT NGƯỜI · CÔNG KHAI → BÍ MẬT · TRONG NƯỚC → CHỈ ĐẠO TỪ NƯỚC NGOÀI</div>
      </Card>;
    case "case": {
      const d = s.data, last = d.findings.length + 1;
      return <Card kicker={`HỒ SƠ VỤ VIỆC ${d.num}`} title={d.name} className="case">
        {d.tag && <div className="case-tag mono">{d.tag}</div>}
        <dl className="meta">{d.meta.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}</dl>
        <ol className="findings">{d.findings.map((f, i) => <li key={i} className={state(i, step - 1)}><i className="mono">TÌNH TIẾT 0{i + 1}</i><Rich t={f} /></li>)}</ol>
        <div className={`lesson ${step >= last ? "on" : ""}`}><b className="mono">KẾT LUẬN NGHIỆP VỤ</b><span className="serif"><Rich t={d.lesson} /></span></div>
        <Chips links={d.links} goTo={p.goTo} />
        <div className="src">{d.source}</div>
      </Card>;
    }
    case "stage": {
      const n = s.rows.length, rowsBeats: Beat[] = s.rows.map(([k, t, d]) => ({ k, t, d }));
      const inTimeline = !!s.timeline && step >= n;
      return <Card kicker={`MỤC ${s.sec} · ${s.kicker.toUpperCase()}`} title={s.title} className={inTimeline ? "with-tl" : ""}>
        <Beats beats={rowsBeats} cur={inTimeline ? n : Math.min(step, n)} setStep={p.setStep} />
        {s.timeline ? (
          <div className={`tl ${inTimeline ? "on" : ""}`}>
            <div className="tl-head mono">VỤ VIỆC {s.data.num} · {s.data.name}</div>
            <Beats beats={s.timeline.map(([y, d]) => ({ t: y, d }))} cur={step - n} setStep={p.setStep} offset={n} />
          </div>
        ) : (
          <div className={`mini-case ${step >= n ? "on" : ""}`}>
            <div className="mono">VỤ VIỆC MINH HỌA {s.data.num}</div>
            <b className="serif">{s.data.name}</b>
            <dl className="meta">{s.data.meta.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}</dl>
            <Chips links={s.data.links} goTo={p.goTo} />
          </div>
        )}
        <div className="src">{s.data.source}</div>
      </Card>;
    }
    case "conclusion":
      return <Card kicker="MỤC VI · NHẬN XÉT CHUNG" title="Ba nhận xét rút ra" className="dark">
        <Beats beats={s.beats} cur={step} setStep={p.setStep} />
        <div className={`require ${step >= s.beats.length ? "on" : ""}`}><b className="mono">YÊU CẦU ĐẶT RA</b><span className="serif"><Rich t={s.require} /></span></div>
      </Card>;
    case "closing": {
      if (step >= 1) return (
        <div className="thanks">
          <div className="mono cover-kicker">HỒ SƠ CHUYÊN ĐỀ · HS-01/KGM · KẾT THÚC TRÌNH BÀY</div>
          <h1 className="serif"><span>Cảm ơn thầy</span><span>và các bạn</span><em>đã lắng nghe!</em></h1>
          <p className="thanks-topic serif">{TOPIC}</p>
          <dl className="cover-meta">{COVER.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd className="serif">{v}</dd></div>)}</dl>
        </div>
      );
      const req = SLIDES.find(x => x.kind === "conclusion");
      return (
        <section className="board">
          <header className="board-head">
            <div className="board-tab mono">BẢNG GHI NHỚ · TỔNG HỢP</div>
            <h1 className="serif">Những nội dung cốt lõi cần nắm</h1>
            <span className="mono">{TOPIC.toUpperCase()}</span>
          </header>
          <ol className="board-grid" data-noadvance>
            {s.recap.map((r, i) => (
              <li key={r.n} style={{ animationDelay: `${0.35 + i * 0.16}s` }}>
                <button onClick={() => p.goTo(r.to)} title={`Mở trang ${r.to}`}>
                  <div className="bc-top"><b className="serif">{r.n}</b><span><i>{r.label}</i><em className="mono">{r.head}</em></span><u className="mono">→ {String(r.to).padStart(2, "0")}</u></div>
                  <ul>{r.items.map((it, k) => <li key={k}><span className="mono">0{k + 1}</span><p><Rich t={it} /></p></li>)}</ul>
                  {r.note && <div className="bc-note">{r.note}</div>}
                </button>
              </li>
            ))}
          </ol>
          <footer className="board-foot" data-noadvance>
            {req && req.kind === "conclusion" && <div className="bf-req"><b className="mono">YÊU CẦU ĐẶT RA</b><span className="serif"><Rich t={req.require} /></span></div>}
            <div className="bf-cases"><b className="mono">05 VỤ VIỆC MINH HỌA</b><div>{s.cases.map(c => <button key={c.to} onClick={() => p.goTo(c.to)}>{c.label}</button>)}</div></div>
          </footer>
        </section>
      );
    }
    default:
      return <Card kicker={TOPIC} />;
  }
}
