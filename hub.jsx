/* global React, SECTIONS, StatusBadge, Ic, Badge */
const { useMemo: _hubMemo } = React;

function Hub({ data, onOpen, onboardingId }) {
  const stats = SECTIONS.map((s) => ({
    s,
    complete: s.isComplete(data),
    progress: s.progress(data),
  }));
  const done = stats.filter((x) => x.complete).length;
  const inProg = stats.filter((x) => !x.complete && x.progress > 0).length;
  const notStarted = stats.filter((x) => x.progress === 0).length;
  const total = SECTIONS.length;
  const totalMin = SECTIONS.filter((s) => !s.isComplete(data)).reduce((a, s) => a + s.minutes, 0);

  const [filter, setFilter] = React.useState("all");
  const visible = stats.filter(({ complete, progress }) => {
    if (filter === "all") return true;
    if (filter === "todo") return !complete;
    if (filter === "done") return complete;
    return true;
  });

  const statusOf = ({ complete, progress }) => {
    if (complete) return "complete";
    if (progress > 0) return "progress";
    return "notstarted";
  };

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow">Provider Onboarding · Atrium Compounding</div>
          <h1>Welcome, Dr. Castellano. Let's get your <em>practice set up</em> to prescribe.</h1>
          <p>Complete the ten sections below to activate your provider portal. Most offices finish in 25–40 minutes — you can save and return any time.</p>
          <div className="meta">
            <span><b>{totalMin} min</b> remaining</span>
            <span className="pip"></span>
            <span>Last saved <b>2 minutes ago</b></span>
            <span className="pip"></span>
            <span>Onboarding ID <b style={{ fontFamily: "var(--mono)" }}>{onboardingId}</b></span>
          </div>
        </div>
        <div className="hero-progress">
          <div className="label">Progress</div>
          <div className="ratio">{done}<span>/{total}</span></div>
          <div className="stack">
            {stats.map(({ s, complete, progress }) => (
              <div key={s.id} className={"seg" + (complete ? " done" : progress > 0 ? " partial" : "")}></div>
            ))}
          </div>
          <div className="breakdown">
            <div className="row"><span>Verified</span><b>{done}</b></div>
            <div className="row"><span>In progress</span><b>{inProg}</b></div>
            <div className="row"><span>Not started</span><b>{notStarted}</b></div>
          </div>
        </div>
      </section>

      {/* Tasks */}
      <div className="section-head">
        <h2>Onboarding tasks</h2>
        <div className="filter">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All {total}</button>
          <button className={filter === "todo" ? "on" : ""} onClick={() => setFilter("todo")}>To do {total - done}</button>
          <button className={filter === "done" ? "on" : ""} onClick={() => setFilter("done")}>Verified {done}</button>
        </div>
      </div>

      <div className="tasks">
        {visible.map(({ s, complete, progress }) => (
          <button key={s.id} className="task" onClick={() => onOpen(s.id)}>
            <div className="num">{s.num}</div>
            <div className="body">
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <div className="fields">
                <span>{s.fields} fields</span>
                <span className="pip"></span>
                <span>~{s.minutes} min</span>
              </div>
            </div>
            <div className="right-col">
              <StatusBadge status={statusOf({ complete, progress })} />
              <div className="progress-mini"><div style={{ width: (progress * 100).toFixed(0) + "%" }}></div></div>
            </div>
          </button>
        ))}
      </div>

      {/* Submit footer */}
      <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16, padding: "24px 28px", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "var(--r-3)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 500, marginBottom: 2 }}>Ready to submit for credentialing review</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Atrium typically completes credentialing review within 2 business days. You'll receive an email once approved.</div>
        </div>
        <button className="btn btn--ghost">Save & exit</button>
        <button className="btn btn--brand" disabled={done < total}>
          {done < total ? `Complete ${total - done} more to submit` : "Submit for review"}
          <Ic.arrow />
        </button>
      </div>
    </div>
  );
}

window.Hub = Hub;
