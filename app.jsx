/* global React, ReactDOM, SECTIONS, EMPTY_DATA,
   Hub, Ic, StatusBadge,
   IdentitySection, CredentialsSection, MalpracticeSection,
   CompoundingSection, PatientSection, ShippingSection,
   BillingSection, EhrSection, StaffSection, AttestSection,
   TweaksPanel, TweakSection, TweakButton, useTweaks,
   AuthScreen */

const SECTION_COMPS = {
  identity:    IdentitySection,
  credentials: CredentialsSection,
  malpractice: MalpracticeSection,
  compounding: CompoundingSection,
  patient:     PatientSection,
  shipping:    ShippingSection,
  billing:     BillingSection,
  ehr:         EhrSection,
  staff:       StaffSection,
  attest:      AttestSection,
};

function clone(d) { return JSON.parse(JSON.stringify(d)); }

function dbToData(row) {
  const e = EMPTY_DATA;
  return {
    identity:     row.identity_data     || clone(e.identity),
    credentials:  row.credentials_data  || clone(e.credentials),
    malpractice:  row.malpractice_data  || clone(e.malpractice),
    compounding:  row.compounding_data  || clone(e.compounding),
    patient:      row.patient_data      || clone(e.patient),
    shipping:     row.shipping_data     || clone(e.shipping),
    billing:      row.billing_data      || clone(e.billing),
    ehr:          row.ehr_data          || clone(e.ehr),
    staff:        row.staff_data        || clone(e.staff),
    attestations: row.attestations_data || clone(e.attestations),
  };
}

function dataToDb(data) {
  return {
    identity_data:     data.identity,
    credentials_data:  data.credentials,
    malpractice_data:  data.malpractice,
    compounding_data:  data.compounding,
    patient_data:      data.patient,
    shipping_data:     data.shipping,
    billing_data:      data.billing,
    ehr_data:          data.ehr,
    staff_data:        data.staff,
    attestations_data: data.attestations,
  };
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{"demoData": false}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Auth state — undefined = still checking, null = not logged in
  const [session, setSession]           = React.useState(undefined);
  const [user, setUser]                 = React.useState(null);

  // DB state
  const [dbId, setDbId]                 = React.useState(null);
  const [onboardingId, setOnboardingId] = React.useState('');
  const [dbReady, setDbReady]           = React.useState(false);
  const [loadError, setLoadError]       = React.useState(null);

  // Form state
  const [data, setData]       = React.useState(clone(EMPTY_DATA));
  const [route, setRoute]     = React.useState('hub');
  const [savedAt, setSavedAt] = React.useState(Date.now());
  const [saving, setSaving]   = React.useState(false);

  // ── Auth listener ──────────────────────────────────
  React.useEffect(() => {
    window.sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = window.sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data when user logs in ────────────────────
  React.useEffect(() => {
    if (!user) return;
    loadData(user.id);
  }, [user?.id]);

  const loadData = async (userId) => {
    setDbReady(false);
    setLoadError(null);

    const { data: rows, error } = await window.sb
      .from('provider_onboardings')
      .select('*')
      .eq('user_id', userId);

    if (error) { setLoadError(error.message); setDbReady(true); return; }

    if (!rows || rows.length === 0) {
      const { data: newRow, error: insertErr } = await window.sb
        .from('provider_onboardings')
        .insert({ user_id: userId })
        .select()
        .single();
      if (insertErr) { setLoadError(insertErr.message); }
      else { setDbId(newRow.id); setOnboardingId(newRow.onboarding_id); }
    } else {
      const row = rows[0];
      setDbId(row.id);
      setOnboardingId(row.onboarding_id);
      setData(dbToData(row));
    }
    setDbReady(true);
  };

  // ── Debounced save ─────────────────────────────────
  const saveTimer     = React.useRef(null);
  const skipFirstSave = React.useRef(true);

  React.useEffect(() => {
    if (!dbId || !dbReady) return;
    if (skipFirstSave.current) { skipFirstSave.current = false; return; }

    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await window.sb
        .from('provider_onboardings')
        .update(dataToDb(data))
        .eq('id', dbId);
      setSaving(false);
      setSavedAt(Date.now());
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  const set = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const goHub     = () => setRoute('hub');
  const goSection = (id) => { setRoute(id); window.scrollTo({ top: 0, behavior: 'instant' }); };

  const signOut = async () => {
    await window.sb.auth.signOut();
    setData(clone(EMPTY_DATA));
    setDbId(null);
    setOnboardingId('');
    setDbReady(false);
    setRoute('hub');
    skipFirstSave.current = true;
  };

  const stats = SECTIONS.map((s) => ({ s, complete: s.isComplete(data), progress: s.progress(data) }));

  // ── Render states ──────────────────────────────────

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 13 }}>
          <span className="spin" style={{ width: 14, height: 14, borderWidth: 1.5, color: 'var(--ink-3)' }} />
          Loading…
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  if (!dbReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 13 }}>
          <span className="spin" style={{ width: 14, height: 14, borderWidth: 1.5, color: 'var(--ink-3)' }} />
          Loading your profile…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ padding: 32, background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--r-3)', color: 'var(--danger)', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Failed to load your data</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>{loadError}</div>
          <button className="btn btn--ghost btn--sm" onClick={() => loadData(user.id)}>Try again</button>
        </div>
      </div>
    );
  }

  const savedAgo   = Math.round((Date.now() - savedAt) / 1000);
  const savedLabel = savedAgo < 5 ? 'just now' : savedAgo < 60 ? `${savedAgo}s ago` : `${Math.round(savedAgo / 60)}m ago`;

  return (
    <div className="app" data-screen-label={route === 'hub' ? 'Hub' : 'Section: ' + route}>
      <header className="topbar">
        <div className="brand">
          <div className="mark"></div>
          <span>Atrium</span>
        </div>
        <div className="crumb">
          {route === 'hub' ? (
            <span>Provider Onboarding</span>
          ) : (
            <>
              <span style={{ cursor: 'pointer' }} onClick={goHub}>Onboarding</span>
              <span style={{ color: 'var(--ink-4)' }}>/</span>
              <b>{SECTIONS.find((s) => s.id === route)?.title}</b>
            </>
          )}
        </div>
        <div className="right">
          <div className="savestate">
            {saving
              ? <><span className="spin" style={{ width: 9, height: 9, borderWidth: 1.5, color: 'var(--ink-3)' }} />Saving…</>
              : <><span className="dot" />Saved · {savedLabel}</>}
          </div>
          <button className="btn btn--ghost btn--sm">Need help?</button>
          <div className="account">
            <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <div className="avatar" title="Sign out" style={{ cursor: 'pointer' }} onClick={signOut}>
              {(user.email || '?')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {route === 'hub' ? (
        <Hub data={data} onOpen={goSection} onboardingId={onboardingId} />
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

      <TweaksPanel title="Tweaks">
        <TweakSection label="Account">
          <div style={{ fontSize: 12, color: 'rgba(41,38,27,.55)', marginBottom: 8, wordBreak: 'break-all' }}>
            {user.email}
          </div>
          <TweakButton label="Sign out" secondary onClick={signOut} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function SectionDetail({ sectionId, data, set, stats, onNav, onHub }) {
  const idx  = SECTIONS.findIndex((s) => s.id === sectionId);
  const s    = SECTIONS[idx];
  const Comp = SECTION_COMPS[sectionId];
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];

  const statusOf = ({ complete, progress }) =>
    complete ? 'complete' : progress > 0 ? 'progress' : 'notstarted';

  return (
    <div className="page page--full">
      <div className="detail">
        <aside className="sidenav">
          <button className="btn btn--ghost btn--sm" style={{ alignSelf: 'start', marginBottom: 16 }} onClick={onHub}>
            <Ic.back />Back to overview
          </button>
          <div className="nav-title">All sections</div>
          {SECTIONS.map((sec, i) => {
            const st = stats[i];
            return (
              <button key={sec.id} className={'nav-item' + (sec.id === sectionId ? ' on' : '')} onClick={() => onNav(sec.id)}>
                <span className="num">{sec.num}</span>
                <span style={{ flex: 1 }}>{sec.title}</span>
                <span className={'tick' + (st.complete ? ' done' : st.progress > 0 ? ' partial' : '')}>
                  {st.complete && <Ic.check />}
                </span>
              </button>
            );
          })}
        </aside>

        <main className="detail-main">
          <div className="detail-head">
            <div className="eyebrow">
              Section {s.num} of {SECTIONS.length}
              <StatusBadge status={statusOf(stats[idx])} />
            </div>
            <h1>{s.title}</h1>
            <p>{s.blurb}</p>
          </div>

          <Comp data={data} set={set} />

          <div className="actions">
            <button className="btn btn--ghost" onClick={onHub}>Back to overview</button>
            <div className="spacer" />
            {prev && (
              <button className="btn btn--ghost" onClick={() => onNav(prev.id)}>
                <Ic.back />{prev.title}
              </button>
            )}
            {next ? (
              <button className="btn btn--brand" onClick={() => onNav(next.id)}>
                Continue · {next.title}<Ic.arrow />
              </button>
            ) : (
              <button className="btn btn--brand" onClick={onHub}>
                Finish & review<Ic.arrow />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
