/* global React, ReactDOM, SECTIONS, DEMO_DATA, EMPTY_DATA,
   Hub, Ic, StatusBadge, Badge,
   IdentitySection, CredentialsSection, MalpracticeSection,
   CompoundingSection, PatientSection, ShippingSection,
   BillingSection, EhrSection, StaffSection, AttestSection,
   TweaksPanel, TweakSection, TweakToggle, useTweaks */

const SECTION_COMPS = {
  identity: IdentitySection,
  credentials: CredentialsSection,
  malpractice: MalpracticeSection,
  compounding: CompoundingSection,
  patient: PatientSection,
  shipping: ShippingSection,
  billing: BillingSection,
  ehr: EhrSection,
  staff: StaffSection,
  attest: AttestSection,
};

function clone(d) { return JSON.parse(JSON.stringify(d)); }

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "demoData": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Reset data when toggle flips
  const initial = t.demoData ? clone(DEMO_DATA) : clone(EMPTY_DATA);
  const [data, setData] = React.useState(initial);
  const lastDemo = React.useRef(t.demoData);

  React.useEffect(() => {
    if (lastDemo.current !== t.demoData) {
      setData(t.demoData ? clone(DEMO_DATA) : clone(EMPTY_DATA));
      lastDemo.current = t.demoData;
    }
  }, [t.demoData]);

  const set = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const [route, setRoute] = React.useState("hub"); // "hub" or section id
  const [savedAt, setSavedAt] = React.useState(Date.now());
  const [saving, setSaving] = React.useState(false);

  // Auto-save indicator
  React.useEffect(() => {
    setSaving(true);
    const t = setTimeout(() => { setSaving(false); setSavedAt(Date.now()); }, 600);
    return () => clearTimeout(t);
  }, [data]);

  const goHub = () => setRoute("hub");
  const goSection = (id) => { setRoute(id); window.scrollTo({ top: 0, behavior: "instant" }); };

  const stats = SECTIONS.map((s) => ({ s, complete: s.isComplete(data), progress: s.progress(data) }));
  const done = stats.filter((x) => x.complete).length;

  return (
    <div className="app" data-screen-label={route === "hub" ? "Hub" : "Section: " + route}>
      <header className="topbar">
        <div className="brand">
          <div className="mark"></div>
          <span>Atrium</span>
        </div>
        <div className="crumb">
          {route === "hub" ? (
            <span>Provider Onboarding</span>
          ) : (
            <>
              <span style={{ cursor: "pointer" }} onClick={goHub}>Onboarding</span>
              <span style={{ color: "var(--ink-4)" }}>/</span>
              <b>{SECTIONS.find((s) => s.id === route)?.title}</b>
            </>
          )}
        </div>
        <div className="right">
          <div className="savestate">
            {saving ? <><span className="spin" style={{ width: 9, height: 9, borderWidth: 1.5, color: "var(--ink-3)" }}></span>Saving…</> : <><span className="dot"></span>Saved · auto-save on</>}
          </div>
          <button className="btn btn--ghost btn--sm">Need help?</button>
          <div className="account">
            <span>D. Reyes · Bayview</span>
            <div className="avatar">DR</div>
          </div>
        </div>
      </header>

      {route === "hub" ? (
        <Hub data={data} onOpen={goSection} />
      ) : (
        <SectionDetail
          sectionId={route}
          data={data}
          set={set}
          stats={stats}
          onNav={goSection}
          onHub={goHub}
        />
      )}

      <TweaksPanel title="Tweaks" defaultPosition="bottom-right">
        <TweakSection title="Prototype">
          <TweakToggle
            label="Demo data"
            description="Pre-fill the form with a sample provider (Dr. Castellano)."
            value={t.demoData}
            onChange={(v) => setTweak("demoData", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function SectionDetail({ sectionId, data, set, stats, onNav, onHub }) {
  const idx = SECTIONS.findIndex((s) => s.id === sectionId);
  const s = SECTIONS[idx];
  const Comp = SECTION_COMPS[sectionId];
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  const statusOf = ({ complete, progress }) => {
    if (complete) return "complete";
    if (progress > 0) return "progress";
    return "notstarted";
  };
  const myStat = stats[idx];

  return (
    <div className="page page--full">
      <div className="detail">
        <aside className="sidenav">
          <button className="btn btn--ghost btn--sm" style={{ alignSelf: "start", marginBottom: 16 }} onClick={onHub}>
            <Ic.back />Back to overview
          </button>
          <div className="nav-title">All sections</div>
          {SECTIONS.map((sec, i) => {
            const st = stats[i];
            return (
              <button key={sec.id} className={"nav-item" + (sec.id === sectionId ? " on" : "")} onClick={() => onNav(sec.id)}>
                <span className="num">{sec.num}</span>
                <span style={{ flex: 1 }}>{sec.title}</span>
                <span className={"tick" + (st.complete ? " done" : st.progress > 0 ? " partial" : "")}>{st.complete && <Ic.check />}</span>
              </button>
            );
          })}
        </aside>

        <main className="detail-main">
          <div className="detail-head">
            <div className="eyebrow">
              Section {s.num} of {SECTIONS.length}
              <StatusBadge status={statusOf(myStat)} />
            </div>
            <h1>{s.title}</h1>
            <p>{s.blurb}</p>
          </div>

          <Comp data={data} set={set} />

          <div className="actions">
            <button className="btn btn--ghost" onClick={onHub}>Back to overview</button>
            <div className="spacer"></div>
            {prev && <button className="btn btn--ghost" onClick={() => onNav(prev.id)}><Ic.back />{prev.title}</button>}
            {next ? (
              <button className="btn btn--brand" onClick={() => onNav(next.id)}>Continue · {next.title}<Ic.arrow /></button>
            ) : (
              <button className="btn btn--brand" onClick={onHub}>Finish & review<Ic.arrow /></button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
