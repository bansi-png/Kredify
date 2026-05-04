import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  bg:"#060C1A", surf:"#0A1424", card:"#0D1B30", dim:"#172A45",
  border:"rgba(0,210,195,0.1)", cyan:"#00D4C3", cyanbg:"rgba(0,212,195,0.07)",
  cyanglow:"rgba(0,212,195,0.28)", text:"#ECF2FF", muted:"#7A90B4",
};

const TIERS = [
  { name:"Bronze",   min:0,   max:249,  c:"#CD7F32", bg:"rgba(205,127,50,0.09)",  glow:"rgba(205,127,50,0.32)"   },
  { name:"Silver",   min:250, max:499,  c:"#B8C8DC", bg:"rgba(184,200,220,0.09)", glow:"rgba(184,200,220,0.32)"  },
  { name:"Gold",     min:500, max:749,  c:"#FFD700", bg:"rgba(255,215,0,0.09)",   glow:"rgba(255,215,0,0.32)"    },
  { name:"Platinum", min:750, max:1000, c:"#B8BCFF", bg:"rgba(184,188,255,0.09)", glow:"rgba(184,188,255,0.32)"  },
];

const SOURCES = [
  { id:"upi",    icon:"⚡", label:"UPI History",    desc:"24 months of transactions",   pts:250 },
  { id:"rent",   icon:"🏠", label:"Rent Receipts",  desc:"On-time payments verified",    pts:200 },
  { id:"util",   icon:"💡", label:"Utility Bills",  desc:"12 months consistent",         pts:150 },
  { id:"chit",   icon:"🤝", label:"Chit Fund",      desc:"Community savings group",      pts:200 },
  { id:"gst",    icon:"📊", label:"GST Returns",    desc:"Business income filings",      pts:100 },
  { id:"salary", icon:"💼", label:"Salary Slips",   desc:"Employment verified",          pts:100 },
];

const LOANS = [
  { tier:"Bronze",   min:0,   amount:"₹25,000",    rate:"18.0%", term:"12 mo", lender:"QuickFin"    },
  { tier:"Silver",   min:250, amount:"₹1,00,000",  rate:"14.0%", term:"24 mo", lender:"TrustBank"   },
  { tier:"Gold",     min:500, amount:"₹5,00,000",  rate:"10.5%", term:"36 mo", lender:"NovaPay"     },
  { tier:"Platinum", min:750, amount:"₹15,00,000", rate:"7.9%",  term:"60 mo", lender:"Apex Capital" },
];

function getTier(s) { return TIERS.find(t => s >= t.min && s <= t.max) || TIERS[0]; }

function useCount(target) {
  const [v, setV] = useState(0);
  useEffect(() => {
    setV(0);
    if (!target) return;
    let cur = 0, id;
    const run = () => {
      cur = Math.min(cur + Math.max(1, Math.ceil((target - cur) / 10)), target);
      setV(cur);
      if (cur < target) id = requestAnimationFrame(run);
    };
    id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return v;
}

// ─── GAUGE SVG ────────────────────────────────────────────────
function Gauge({ score }) {
  const pct = Math.min(score / 1000, 1);
  const tier = getTier(score);
  const cx = 110, cy = 118, R = 88;

  function toXY(deg) {
    const r = (deg - 90) * Math.PI / 180;
    return [+(cx + R * Math.cos(r)).toFixed(2), +(cy + R * Math.sin(r)).toFixed(2)];
  }
  function arcD(s, e, sw) {
    const [x1, y1] = toXY(s);
    const [x2, y2] = toXY(e % 360);
    const lg = sw > 180 ? 1 : 0;
    return `M${x1},${y1} A${R},${R} 0 ${lg} 1 ${x2},${y2}`;
  }

  const SA = 225, SW = 270;
  const fsw = SW * pct;
  const bgD = arcD(SA, SA + SW, SW);
  const fillD = pct > 0.004 ? arcD(SA, SA + fsw, fsw) : null;
  const disp = useCount(score);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width="220" height="196" style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.c} stopOpacity="0.65"/>
            <stop offset="100%" stopColor={tier.c}/>
          </linearGradient>
          <filter id="blur4">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
          </filter>
        </defs>
        {/* Track */}
        <path d={bgD} fill="none" stroke={T.dim} strokeWidth="9" strokeLinecap="round"/>
        {/* Glow */}
        {fillD && <path d={fillD} fill="none" stroke={tier.c} strokeWidth="13" strokeLinecap="round"
          opacity="0.25" filter="url(#blur4)" style={{ transition:"all 0.8s" }}/>}
        {/* Fill */}
        {fillD && <path d={fillD} fill="none" stroke="url(#g1)" strokeWidth="9" strokeLinecap="round"
          style={{ transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)" }}/>}
        {/* Tick dots */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => {
          const [dx, dy] = toXY(SA + SW * p);
          return <circle key={p} cx={dx} cy={dy} r="2.5" fill={p <= pct ? tier.c : T.dim}/>;
        })}
        {/* Score */}
        <text x={cx} y={cy + 10} textAnchor="middle" fill={T.text}
          fontSize="42" fontWeight="800" fontFamily="'Syne',sans-serif">{disp}</text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill={T.muted}
          fontSize="10" letterSpacing="3" fontFamily="monospace">TRUSTSCORE</text>
        <text x={28} y={cy + 44} fill={T.muted} fontSize="9" fontFamily="monospace">0</text>
        <text x={183} y={cy + 44} fill={T.muted} fontSize="9" fontFamily="monospace">1000</text>
      </svg>
      <div style={{
        marginTop:"0px", padding:"5px 20px", borderRadius:"20px",
        background: tier.bg, border:`1px solid ${tier.c}`,
        color: tier.c, fontSize:"11px", fontWeight:"700", letterSpacing:"2.5px",
        boxShadow:`0 0 20px ${tier.glow}`, transition:"all 0.5s",
      }}>{tier.name.toUpperCase()} TIER</div>
    </div>
  );
}

// ─── NAV DOTS ─────────────────────────────────────────────────
function Dots({ screen, go }) {
  return (
    <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
      {["onboard","score","split","market"].map(s => (
        <div key={s} onClick={() => go(s)} title={s} style={{
          width: screen === s ? "22px" : "7px", height:"7px",
          borderRadius:"4px", background: screen === s ? T.cyan : T.dim,
          cursor:"pointer", transition:"all 0.3s",
          boxShadow: screen === s ? `0 0 10px ${T.cyanglow}` : "none",
        }}/>
      ))}
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────
function Landing({ go, demo }) {
  return (
    <div style={{
      minHeight:"calc(100vh - 56px)", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", textAlign:"center",
      padding:"60px 24px", position:"relative", overflow:"hidden",
    }}>
      {/* Grid background */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:`linear-gradient(${T.dim} 1px,transparent 1px),linear-gradient(90deg,${T.dim} 1px,transparent 1px)`,
        backgroundSize:"56px 56px", opacity:0.18,
        maskImage:"radial-gradient(ellipse 80% 70% at 50% 50%,black 20%,transparent 80%)",
        WebkitMaskImage:"radial-gradient(ellipse 80% 70% at 50% 50%,black 20%,transparent 80%)",
      }}/>
      {/* Glow orb */}
      <div style={{
        position:"absolute", top:"42%", left:"50%", transform:"translate(-50%,-50%)",
        width:"640px", height:"520px", borderRadius:"50%",
        background:`radial-gradient(circle,${T.cyanglow} 0%,transparent 65%)`,
        pointerEvents:"none",
      }}/>
      <div style={{ position:"relative", zIndex:1, maxWidth:"640px" }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:"6px",
          padding:"5px 16px", borderRadius:"20px",
          background:T.cyanbg, border:"1px solid rgba(0,212,195,0.22)",
          color:T.cyan, fontSize:"10.5px", fontWeight:"700", letterSpacing:"2px",
          marginBottom:"30px",
        }}>
          <span>ZK-PROOF</span>
          <span style={{ opacity:0.35 }}>·</span>
          <span>ALTERNATIVE CREDIT</span>
          <span style={{ opacity:0.35 }}>·</span>
          <span>PRIVACY-FIRST</span>
        </div>

        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontSize:"clamp(38px,6.5vw,68px)",
          fontWeight:"800", lineHeight:"1.06", color:T.text,
          letterSpacing:"-1.5px", marginBottom:"22px",
        }}>
          Get credit for<br/>
          <span style={{ color:T.cyan, textShadow:`0 0 50px ${T.cyanglow}` }}>who you are,</span><br/>
          not what's on file.
        </h1>

        <p style={{
          fontSize:"16px", color:T.muted, lineHeight:"1.75",
          maxWidth:"480px", margin:"0 auto 44px",
        }}>
          1.4 billion people are credit invisible. Kredify proves your
          creditworthiness using UPI history, rent receipts & chit funds —
          without exposing a single transaction.
        </p>

        {/* Stats */}
        <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"44px" }}>
          {[["1.4B","Credit Invisible"],["0","Transactions Exposed"],["ZK","Cryptographic Proof"],["4×","More Loan Access"]].map(([n,l]) => (
            <div key={n} style={{
              padding:"14px 18px", borderRadius:"14px", minWidth:"110px",
              background:T.card, border:`1px solid ${T.dim}`,
            }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:"800", color:T.cyan }}>{n}</div>
              <div style={{ fontSize:"11px", color:T.muted, marginTop:"3px", lineHeight:"1.4" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => go("onboard")} style={{
            padding:"14px 42px", borderRadius:"10px", border:"none",
            background:`linear-gradient(135deg,${T.cyan},#0090A8)`,
            color:T.bg, fontWeight:"800", fontSize:"14px", fontFamily:"'Syne',sans-serif",
            cursor:"pointer", boxShadow:`0 4px 28px ${T.cyanglow}`, letterSpacing:"0.3px",
            transition:"all 0.2s",
          }}>Build Your TrustScore →</button>
          <button onClick={demo} style={{
            padding:"14px 28px", borderRadius:"10px",
            background:"transparent", border:`1px solid ${T.dim}`,
            color:T.muted, fontSize:"13px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
          }}>See Demo</button>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARD ──────────────────────────────────────────────────
function Onboard({ connected, toggle, score, tier, go }) {
  const total = SOURCES.reduce((s, x) => s + x.pts, 0);
  const pct = (score / total) * 100;
  return (
    <div style={{ maxWidth:"700px", margin:"0 auto", padding:"28px 0 40px" }}>
      <div style={{ marginBottom:"28px" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"26px", fontWeight:"800", marginBottom:"8px", color:T.text }}>
          Connect your <span style={{ color:T.cyan }}>financial story</span>
        </h2>
        <p style={{ color:T.muted, fontSize:"14px", lineHeight:"1.7", maxWidth:"500px" }}>
          Each source generates a zero-knowledge proof. Lenders see your TrustScore — never your raw transactions. Select what you're comfortable sharing.
        </p>
      </div>

      {/* Progress card */}
      <div style={{
        padding:"16px 20px", borderRadius:"14px",
        background:T.card, border:`1px solid ${T.dim}`, marginBottom:"22px",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <span style={{ fontSize:"12px", color:T.muted }}>Score progress — {connected.size} of {SOURCES.length} sources</span>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:"800", color:tier.c }}>{score}</span>
            <span style={{ fontSize:"12px", color:T.muted }}>/1000</span>
            <div style={{
              padding:"2px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", letterSpacing:"1px",
              background:tier.bg, border:`1px solid ${tier.c}`, color:tier.c,
            }}>{tier.name}</div>
          </div>
        </div>
        <div style={{ height:"5px", background:T.dim, borderRadius:"3px", overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:"3px",
            background:`linear-gradient(90deg,${T.cyan},${tier.c})`,
            width:`${pct}%`, transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)",
            boxShadow:`0 0 10px ${T.cyanglow}`,
          }}/>
        </div>
      </div>

      {/* Sources grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"12px", marginBottom:"28px" }}>
        {SOURCES.map(s => {
          const on = connected.has(s.id);
          return (
            <div key={s.id} onClick={() => toggle(s.id)} style={{
              padding:"16px", borderRadius:"14px", cursor:"pointer", userSelect:"none",
              background: on ? `linear-gradient(145deg,${T.card},rgba(0,212,195,0.04))` : T.card,
              border:`1px solid ${on ? T.cyan : T.dim}`,
              boxShadow: on ? `0 0 22px rgba(0,212,195,0.07)` : "none",
              transition:"all 0.25s",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                <div style={{
                  width:"40px", height:"40px", borderRadius:"11px", fontSize:"20px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: on ? T.cyanbg : T.dim,
                  border: on ? "1px solid rgba(0,212,195,0.22)" : "none",
                  transition:"all 0.25s",
                }}>{s.icon}</div>
                {/* Toggle */}
                <div style={{
                  width:"38px", height:"21px", borderRadius:"11px",
                  background: on ? T.cyan : T.dim, position:"relative",
                  transition:"all 0.3s", boxShadow: on ? `0 0 10px ${T.cyanglow}` : "none",
                  marginTop:"2px",
                }}>
                  <div style={{
                    position:"absolute", top:"3px",
                    left: on ? "18px" : "3px",
                    width:"15px", height:"15px", borderRadius:"50%", background:"white",
                    transition:"left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
                  }}/>
                </div>
              </div>
              <div style={{ fontWeight:"600", fontSize:"13px", marginBottom:"2px", color:T.text }}>{s.label}</div>
              <div style={{ color:T.muted, fontSize:"11.5px", marginBottom:"8px" }}>{s.desc}</div>
              <div style={{
                display:"inline-block", padding:"2px 9px", borderRadius:"20px", fontSize:"11px", fontWeight:"600",
                background: on ? T.cyanbg : T.dim, color: on ? T.cyan : T.muted,
                border: on ? "1px solid rgba(0,212,195,0.22)" : "none", transition:"all 0.2s",
              }}>+{s.pts} pts</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
        <span style={{ fontSize:"12px", color:T.muted }}>{connected.size === 0 ? "Select at least one source to continue" : ""}</span>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={() => go("landing")} style={{
            padding:"10px 22px", borderRadius:"9px", background:"transparent",
            border:`1px solid ${T.dim}`, color:T.muted, fontSize:"13px", cursor:"pointer",
          }}>← Back</button>
          <button onClick={() => go("score")} disabled={connected.size === 0} style={{
            padding:"12px 30px", borderRadius:"9px", border:"none", fontFamily:"'Syne',sans-serif",
            background: connected.size > 0 ? `linear-gradient(135deg,${T.cyan},#0090A8)` : T.dim,
            color: connected.size > 0 ? T.bg : T.muted,
            fontWeight:"700", fontSize:"14px",
            cursor: connected.size > 0 ? "pointer" : "not-allowed",
            transition:"all 0.2s",
          }}>Generate TrustScore →</button>
        </div>
      </div>
    </div>
  );
}

// ─── SCORE ────────────────────────────────────────────────────
function Score({ score, tier, connected, go }) {
  const [show, setShow] = useState(false);
  const [zkId] = useState(`zk_0x${Math.random().toString(16).slice(2,6)}...${Math.random().toString(16).slice(2,6)}`);
  useEffect(() => { const t = setTimeout(() => setShow(true), 150); return () => clearTimeout(t); }, []);

  return (
    <div style={{ maxWidth:"480px", margin:"0 auto", padding:"24px 0 40px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ textAlign:"center", marginBottom:"20px" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"24px", fontWeight:"800", color:T.text, marginBottom:"6px" }}>
          Your <span style={{ color:T.cyan }}>TrustScore</span> is Ready
        </h2>
        <p style={{ color:T.muted, fontSize:"13px" }}>Zero-knowledge proof generated. Cryptographically verified — no raw data exposed.</p>
      </div>

      {show && <Gauge score={score}/>}

      {/* Tier ladder */}
      <div style={{ display:"flex", gap:"6px", margin:"22px 0 18px", justifyContent:"center", flexWrap:"wrap" }}>
        {TIERS.map(t => {
          const reached = score >= t.min;
          return (
            <div key={t.name} style={{
              padding:"4px 14px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", letterSpacing:"1.5px",
              background: reached ? t.bg : "rgba(23,42,69,0.4)",
              border:`1px solid ${reached ? t.c : T.dim}`,
              color: reached ? t.c : T.muted,
              boxShadow: reached ? `0 0 14px ${t.glow}` : "none",
              transition:"all 0.5s",
            }}>{t.name}</div>
          );
        })}
      </div>

      {/* ZK cert */}
      <div style={{
        width:"100%", background:T.card, border:`1px solid ${T.dim}`,
        borderRadius:"14px", padding:"18px", marginBottom:"24px", fontFamily:"monospace",
      }}>
        <div style={{ color:T.cyan, fontSize:"9px", letterSpacing:"3px", marginBottom:"14px" }}>ZK PROOF CERTIFICATE</div>
        {[
          ["PROOF_ID",    zkId],
          ["ALGORITHM",   "Groth16 ZK-SNARK"],
          ["CHAIN",       "Polygon zkEVM"],
          ["SOURCES",     `${connected.size} verified`],
          ["SCORE_BAND",  `${tier.min} – ${tier.max}`],
          ["VALIDITY",    "90 days"],
          ["STATUS",      "✓ VALID"],
        ].map(([k, v]) => (
          <div key={k} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:"11.5px",
          }}>
            <span style={{ color:T.muted }}>{k}</span>
            <span style={{ color: k === "STATUS" ? T.cyan : T.text }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => go("onboard")} style={{
          padding:"10px 22px", borderRadius:"9px", background:"transparent",
          border:`1px solid ${T.dim}`, color:T.muted, fontSize:"13px", cursor:"pointer",
        }}>← Edit Sources</button>
        <button onClick={() => go("split")} style={{
          padding:"12px 28px", borderRadius:"9px", border:"none", fontFamily:"'Syne',sans-serif",
          background:`linear-gradient(135deg,${T.cyan},#0090A8)`,
          color:T.bg, fontWeight:"700", fontSize:"14px", cursor:"pointer",
        }}>See Lender View →</button>
      </div>
    </div>
  );
}

// ─── SPLIT SCREEN ─────────────────────────────────────────────
function Split({ score, tier, connected, go }) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 620);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const RAW = [
    "2025-01-03  UPI-TXN-99482  ₹1,200   SWIGGY_FOOD_ORDER",
    "2025-01-04  UPI-TXN-99483  ₹45,000  RENT_SHRI_PROPERTIES",
    "2025-01-05  UPI-TXN-99484  ₹2,300   BEST_ELECTRICITY_BILL",
    "2025-01-07  UPI-TXN-99485  ₹850     RELIANCE_FRESH",
    "2025-01-10  UPI-TXN-99486  ₹15,000  NIDHI_CHIT_FUND",
    "2025-01-12  UPI-TXN-99487  ₹320     HP_PETROL_ANDHERI",
    "2025-01-14  UPI-TXN-99488  ₹5,000   CHIT_EMI_JAN",
    "2025-01-16  UPI-TXN-99489  ₹4,200   TATA_POWER_Q1",
    "//  ...  8,426 more transactions ...",
    "RENT_RCPT_JAN_25  ₹45,000  STATUS:PAID",
    "RENT_RCPT_FEB_25  ₹45,000  STATUS:PAID",
    "//  ...  10 more receipts ...",
    "GST_Q3_2024  TURNOVER:₹8,40,000  FILED",
    "SALARY_JAN  ₹72,000  EMPLOYER:TCS",
  ];

  return (
    <div style={{ maxWidth:"980px", margin:"0 auto", padding:"24px 0 40px" }}>
      <div style={{ textAlign:"center", marginBottom:"22px" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"24px", fontWeight:"800", color:T.text, marginBottom:"6px" }}>
          The <span style={{ color:T.cyan }}>ZK Difference</span>
        </h2>
        <p style={{ color:T.muted, fontSize:"13px" }}>Your raw data never leaves your device. Lenders only receive a cryptographic proof.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap:"14px", marginBottom:"22px" }}>
        {/* Left — raw */}
        <div style={{
          background:"#040A14", border:"1px solid rgba(255,70,70,0.2)",
          borderRadius:"14px", padding:"18px", fontFamily:"monospace",
          display:"flex", flexDirection:"column",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
            <div style={{ display:"flex", gap:"5px" }}>
              {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                <div key={c} style={{ width:"10px", height:"10px", borderRadius:"50%", background:c }}/>
              ))}
            </div>
            <span style={{ color:"rgba(255,100,100,0.75)", fontSize:"10px", letterSpacing:"1.5px", fontWeight:"700" }}>TRADITIONAL LENDER VIEW</span>
          </div>
          <div style={{ color:"rgba(255,80,80,0.4)", fontSize:"10px", marginBottom:"8px" }}>// raw_financial_export.dump</div>
          <div style={{ flex:1, height:"260px", overflowY:"auto" }}>
            {RAW.map((l, i) => (
              <div key={i} style={{
                padding:"3px 0", fontSize:"10.5px", lineHeight:"1.7",
                color: l.startsWith("//") ? T.muted : i % 3 === 0 ? "#FF8888" : i % 3 === 1 ? "#FFAA55" : "#7AABCC",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                borderBottom:"1px solid rgba(255,255,255,0.025)",
              }}>{l}</div>
            ))}
          </div>
          <div style={{
            marginTop:"12px", padding:"8px 12px", borderRadius:"8px",
            background:"rgba(255,60,60,0.07)", border:"1px solid rgba(255,60,60,0.2)",
            color:"#FF6666", fontSize:"11px", textAlign:"center",
          }}>⚠ 8,440 transactions exposed to lender</div>
        </div>

        {/* Right — certificate */}
        <div style={{
          background:`linear-gradient(145deg,${T.card},${T.surf})`,
          border:`1px solid ${tier.c}`, borderRadius:"14px",
          padding:"20px", boxShadow:`0 4px 44px ${tier.glow}`,
          display:"flex", flexDirection:"column",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
            <div style={{ display:"flex", gap:"5px" }}>
              {[0.4,0.7,1].map(o => (
                <div key={o} style={{ width:"10px", height:"10px", borderRadius:"50%", background:T.cyan, opacity:o }}/>
              ))}
            </div>
            <span style={{ color:T.cyan, fontSize:"10px", letterSpacing:"1.5px", fontWeight:"700" }}>KREDIFY TRUSTCERTIFICATE</span>
          </div>

          {/* Score badge */}
          <div style={{
            textAlign:"center", padding:"18px", borderRadius:"12px",
            background:tier.bg, border:`1px solid ${tier.c}`, marginBottom:"14px",
          }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"54px", fontWeight:"800", color:tier.c, lineHeight:"1" }}>{score}</div>
            <div style={{ color:tier.c, fontSize:"11px", fontWeight:"700", letterSpacing:"2.5px", marginTop:"4px" }}>
              {tier.name.toUpperCase()} TIER · CREDITWORTHY
            </div>
          </div>

          {[
            ["Lender receives",    "TrustScore + ZK proof"],
            ["Raw transactions",   "0 — fully private"],
            ["Sources verified",   `${connected.size} of 6`],
            ["Algorithm",          "Groth16 ZK-SNARK"],
            ["Loan eligibility",   "See marketplace →"],
          ].map(([k, v]) => (
            <div key={k} style={{
              display:"flex", justifyContent:"space-between",
              padding:"6px 0", fontSize:"12px",
              borderBottom:"1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ color:T.muted }}>{k}</span>
              <span style={{ color: k === "Raw transactions" ? T.cyan : T.text, fontWeight: k === "Raw transactions" ? "700" : "400" }}>{v}</span>
            </div>
          ))}

          <div style={{
            marginTop:"12px", padding:"8px 12px", borderRadius:"8px",
            background:"rgba(0,212,195,0.05)", border:"1px solid rgba(0,212,195,0.2)",
            color:T.cyan, fontSize:"11px", textAlign:"center",
          }}>✓ Zero raw data shared · Full privacy guaranteed</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={() => go("score")} style={{
          padding:"10px 22px", borderRadius:"9px", background:"transparent",
          border:`1px solid ${T.dim}`, color:T.muted, fontSize:"13px", cursor:"pointer",
        }}>← Back</button>
        <button onClick={() => go("market")} style={{
          padding:"12px 28px", borderRadius:"9px", border:"none", fontFamily:"'Syne',sans-serif",
          background:`linear-gradient(135deg,${T.cyan},#0090A8)`,
          color:T.bg, fontWeight:"700", fontSize:"14px", cursor:"pointer",
        }}>View Loan Offers →</button>
      </div>
    </div>
  );
}

// ─── MARKETPLACE ──────────────────────────────────────────────
function Market({ score, tier, go }) {
  return (
    <div style={{ maxWidth:"760px", margin:"0 auto", padding:"24px 0 40px" }}>
      <div style={{ textAlign:"center", marginBottom:"24px" }}>
        <div style={{
          display:"inline-block", padding:"4px 14px", borderRadius:"20px", marginBottom:"12px",
          background:tier.bg, border:`1px solid ${tier.c}`,
          color:tier.c, fontSize:"11px", fontWeight:"700", letterSpacing:"1.5px",
        }}>YOUR SCORE: {score} · {tier.name.toUpperCase()}</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"24px", fontWeight:"800", color:T.text, marginBottom:"6px" }}>
          Loan Offers <span style={{ color:T.cyan }}>Unlocked</span>
        </h2>
        <p style={{ color:T.muted, fontSize:"13px", maxWidth:"440px", margin:"0 auto" }}>
          Higher TrustScore = better rates & larger amounts. Add more sources to unlock premium tiers.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))", gap:"14px", marginBottom:"24px" }}>
        {LOANS.map(loan => {
          const tk = TIERS.find(t => t.name === loan.tier) || TIERS[0];
          const unlocked = score >= loan.min;
          return (
            <div key={loan.tier} style={{
              borderRadius:"16px", padding:"18px", position:"relative", overflow:"hidden",
              background: unlocked ? `linear-gradient(145deg,${T.card},rgba(255,255,255,0.015))` : T.card,
              border:`1px solid ${unlocked ? tk.c : T.dim}`,
              opacity: unlocked ? 1 : 0.58,
              boxShadow: unlocked ? `0 0 28px ${tk.glow}` : "none",
              transition:"all 0.3s",
            }}>
              {!unlocked && (
                <div style={{
                  position:"absolute", inset:0, zIndex:2,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  background:"rgba(6,12,26,0.78)", backdropFilter:"blur(3px)", borderRadius:"16px",
                }}>
                  <div style={{ fontSize:"24px", marginBottom:"6px" }}>🔒</div>
                  <div style={{ color:T.muted, fontSize:"11px", fontWeight:"600", textAlign:"center" }}>
                    Unlock at<br/>{loan.tier} Tier
                  </div>
                  <div style={{ color:T.dim, fontSize:"10px", marginTop:"4px" }}>{loan.min} pts needed</div>
                </div>
              )}
              <div style={{
                display:"inline-block", padding:"3px 10px", borderRadius:"20px", marginBottom:"12px",
                background:tk.bg, border:`1px solid ${tk.c}`,
                color:tk.c, fontSize:"10px", fontWeight:"700", letterSpacing:"1px",
              }}>{loan.tier.toUpperCase()}</div>
              <div style={{
                fontFamily:"'Syne',sans-serif", fontSize:"clamp(18px,2.5vw,22px)",
                fontWeight:"800", color: unlocked ? T.text : T.muted, marginBottom:"2px",
              }}>{loan.amount}</div>
              <div style={{ color:T.muted, fontSize:"11px", marginBottom:"14px" }}>{loan.lender}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"14px" }}>
                {[["RATE", loan.rate, T.cyan], ["TERM", loan.term, T.text]].map(([lbl, val, col]) => (
                  <div key={lbl} style={{ padding:"7px", background:T.dim, borderRadius:"8px", textAlign:"center" }}>
                    <div style={{ color:T.muted, fontSize:"9px", letterSpacing:"1px", marginBottom:"2px" }}>{lbl}</div>
                    <div style={{ fontWeight:"700", fontSize:"13px", color: unlocked ? col : T.muted }}>{val}</div>
                  </div>
                ))}
              </div>
              <button style={{
                width:"100%", padding:"9px", borderRadius:"8px", fontFamily:"'Syne',sans-serif",
                background: unlocked ? `linear-gradient(135deg,${T.cyan},#0090A8)` : "transparent",
                color: unlocked ? T.bg : T.muted,
                border: unlocked ? "none" : `1px solid ${T.dim}`,
                fontWeight:"700", fontSize:"12px",
                cursor: unlocked ? "pointer" : "default",
              }}>{unlocked ? "Apply Now →" : `Need ${loan.tier}`}</button>
            </div>
          );
        })}
      </div>

      <div style={{
        textAlign:"center", padding:"18px", background:T.card,
        borderRadius:"14px", border:`1px solid ${T.dim}`,
      }}>
        <p style={{ color:T.muted, fontSize:"12px", marginBottom:"14px" }}>
          Increase your score by connecting more data sources to unlock premium offers.
        </p>
        <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => go("split")} style={{
            padding:"10px 22px", borderRadius:"9px", background:"transparent",
            border:`1px solid ${T.dim}`, color:T.muted, fontSize:"13px", cursor:"pointer",
          }}>← Back</button>
          <button onClick={() => go("onboard")} style={{
            padding:"12px 28px", borderRadius:"9px", border:"none", fontFamily:"'Syne',sans-serif",
            background:`linear-gradient(135deg,${T.cyan},#0090A8)`,
            color:T.bg, fontWeight:"700", fontSize:"14px", cursor:"pointer",
          }}>Add More Sources →</button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function Kredify() {
  const [screen, setScreen] = useState("landing");
  const [connected, setConnected] = useState(new Set());
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const score = Array.from(connected).reduce((sum, id) => {
    const s = SOURCES.find(x => x.id === id);
    return sum + (s ? s.pts : 0);
  }, 0);
  const tier = getTier(score);

  const go = (s) => { setScreen(s); setAnimKey(k => k + 1); };

  const toggle = (id) => {
    setConnected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const demo = () => {
    setConnected(new Set(["upi", "rent", "chit"]));
    go("score");
  };

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .kfade { animation: fadeUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards; }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: ${T.dim}; border-radius: 2px; }
    ::-webkit-scrollbar-track { background: transparent; }
    button:hover { opacity: 0.9; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{
        minHeight:"100vh", background:T.bg, color:T.text,
        fontFamily:"'DM Sans',system-ui,-apple-system,sans-serif",
      }}>
        {/* Nav */}
        <nav style={{
          height:"56px", display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 28px",
          borderBottom:`1px solid rgba(0,212,195,0.08)`,
          background:"rgba(6,12,26,0.92)", backdropFilter:"blur(20px)",
          position:"sticky", top:0, zIndex:100,
        }}>
          <div onClick={() => go("landing")} style={{
            fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:"800",
            letterSpacing:"1px", cursor:"pointer",
          }}>
            <span style={{ color:T.cyan }}>K</span>REDIFY
          </div>
          {screen !== "landing" && <Dots screen={screen} go={go}/>}
          <div style={{ minWidth:"80px", textAlign:"right" }}>
            {score > 0 && screen !== "landing" && (
              <div style={{
                display:"inline-block", padding:"4px 12px", borderRadius:"20px", fontSize:"11px",
                fontWeight:"700", letterSpacing:"1px",
                background:tier.bg, border:`1px solid ${tier.c}`, color:tier.c,
              }}>{tier.name} · {score}</div>
            )}
          </div>
        </nav>

        {/* Screen */}
        <div key={animKey} className="kfade" style={{
          padding: screen === "landing" ? "0" : "16px 20px",
          maxWidth: screen === "split" ? "1020px" : "820px",
          margin:"0 auto", overflowX:"hidden",
        }}>
          {screen === "landing"  && <Landing go={go} demo={demo}/>}
          {screen === "onboard" && <Onboard connected={connected} toggle={toggle} score={score} tier={tier} go={go}/>}
          {screen === "score"   && <Score score={score} tier={tier} connected={connected} go={go}/>}
          {screen === "split"   && <Split score={score} tier={tier} connected={connected} go={go}/>}
          {screen === "market"  && <Market score={score} tier={tier} go={go}/>}
        </div>
      </div>
    </>
  );
}
