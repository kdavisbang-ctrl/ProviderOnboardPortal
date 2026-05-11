/* global React, ReactDOM, SECTIONS, EMPTY_DATA,
   Hub, Ic, StatusBadge, AccountMenu,
   IdentitySection, CredentialsSection, MalpracticeSection,
   CompoundingSection, PatientSection, ShippingSection,
   BillingSection, EhrSection, StaffSection, AttestSection,
   TweaksPanel, TweakSection, TweakButton, useTweaks,
   AuthScreen, RoleSelectScreen, PharmacyApp */

function AthenaLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M2 28 L13 3 L22 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 17 L18 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 9 A 10 10 0 1 1 12 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

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

// Coerce any field that should be a string (per template) back to '' if corrupt
function coerceStrings(obj, template) {
  Object.keys(template).forEach(k => {
    if (typeof template[k] === 'string' && typeof obj[k] !== 'string') obj[k] = '';
  });
}

function dbToData(row) {
  const e = EMPTY_DATA;
  const identity = { ...clone(e.identity), ...(row.identity_data || {}) };
  identity.practice = { ...clone(e.identity.practice), ...(identity.practice || {}) };
  coerceStrings(identity, e.identity);
  coerceStrings(identity.practice, e.identity.practice);
  const credentials = { ...clone(e.credentials), ...(row.credentials_data || {}) };
  if (!Array.isArray(credentials.licenses)) credentials.licenses = [];
  if (!Array.isArray(credentials.deaSchedules)) credentials.deaSchedules = [];
  if (!Array.isArray(credentials.csrStates)) credentials.csrStates = [];
  coerceStrings(credentials, e.credentials);
  const compounding = { ...clone(e.compounding), ...(row.compounding_data || {}) };
  if (!Array.isArray(compounding.categories)) compounding.categories = [];
  if (!Array.isArray(compounding.formulations)) compounding.formulations = [];
  if (!Array.isArray(compounding.bases)) compounding.bases = [];
  if (!Array.isArray(compounding.flavorPrefs)) compounding.flavorPrefs = [];
  const patient = { ...clone(e.patient), ...(row.patient_data || {}) };
  if (!Array.isArray(patient.populations)) patient.populations = [];
  const malpractice = { ...clone(e.malpractice), ...(row.malpractice_data || {}) };
  coerceStrings(malpractice, e.malpractice);
  const billing = { ...clone(e.billing), ...(row.billing_data || {}) };
  coerceStrings(billing, e.billing);
  const ehr = { ...clone(e.ehr), ...(row.ehr_data || {}) };
  coerceStrings(ehr, e.ehr);
  return {
    identity,
    credentials,
    malpractice,
    compounding,
    patient,
    shipping:     Array.isArray(row.shipping_data) ? row.shipping_data : clone(e.shipping),
    billing,
    ehr,
    staff:        Array.isArray(row.staff_data) ? row.staff_data : clone(e.staff),
    attestations: { ...clone(e.attestations), ...(row.attestations_data || {}) },
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

function Spinner({ label }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 13 }}>
        <span className="spin" style={{ width: 14, height: 14, borderWidth: 1.5, color: 'var(--ink-3)' }} />
        {label}
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ padding: 32, background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--r-3)', color: 'var(--danger)', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Failed to load your data</div>
        <div style={{ fontSize: 13, marginBottom: 16, color: 'var(--ink-2)' }}>{error}</div>
        <button className="btn btn--ghost btn--sm" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Auth — undefined = still checking
  const [session, setSession] = React.useState(undefined);
  const [user, setUser]       = React.useState(null);

  // Role — null = loading, 'none' = no profile yet
  const [role, setRole]       = React.useState(null);

  // Provider onboarding state
  const [dbId, setDbId]                   = React.useState(null);
  const [onboardingId, setOnboardingId]   = React.useState('');
  const [appStatus, setAppStatus]         = React.useState('draft');
  const [sectionReviews, setSectionReviews] = React.useState({});
  const [dbReady, setDbReady]             = React.useState(false);
  const [loadError, setLoadError]         = React.useState(null);
  const [data, setData]                   = React.useState(clone(EMPTY_DATA));
  const [route, setRoute]                 = React.useState('hub');
  const [savedAt, setSavedAt]             = React.useState(Date.now());
  const [saving, setSaving]               = React.useState(false);

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

  // ── Load role when user is known ───────────────────
  React.useEffect(() => {
    if (!user) { setRole(null); return; }
    loadRole(user.id);
  }, [user?.id]);

  const loadRole = async (userId) => {
    const { data: profile, error } = await window.sb
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) { setRole('none'); return; }
    setRole(profile.role);
    if (profile.role === 'provider') loadProviderData(userId);
  };

  // ── Load provider data ─────────────────────────────
  const loadProviderData = async (userId) => {
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
      else { setDbId(newRow.id); setOnboardingId(newRow.onboarding_id); setAppStatus(newRow.status || 'draft'); }
    } else {
      const row = rows[0];
      setDbId(row.id);
      setOnboardingId(row.onboarding_id);
      setAppStatus(row.status || 'draft');
      const cleanData = dbToData(row);
      setData(cleanData);
      // Self-heal: write sanitized data back to purge any corrupt objects stored in DB
      await window.sb.from('provider_onboardings').update(dataToDb(cleanData)).eq('id', row.id);

      // Load section reviews so provider can see pharmacy feedback
      const { data: reviews } = await window.sb
        .from('section_reviews')
        .select('*')
        .eq('provider_onboarding_id', row.id);
      if (reviews) {
        const r = {};
        reviews.forEach(rev => { r[rev.section_id] = { status: rev.status, notes: rev.notes || '' }; });
        setSectionReviews(r);
      }
    }
    setDbReady(true);
  };

  // ── Debounced save ─────────────────────────────────
  const saveTimer     = React.useRef(null);
  const skipFirstSave = React.useRef(true);

  React.useEffect(() => {
    if (!dbId || !dbReady || role !== 'provider') return;
    if (skipFirstSave.current) { skipFirstSave.current = false; return; }

    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await window.sb.from('provider_onboardings').update(dataToDb(data)).eq('id', dbId);
      setSaving(false);
      setSavedAt(Date.now());
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  const set = (key, value) => setData(d => ({ ...d, [key]: typeof value === 'function' ? value(d[key]) : value }));

  const goHub     = () => setRoute('hub');
  const goSection = (id) => { setRoute(id); window.scrollTo({ top: 0, behavior: 'instant' }); };

  // ── Submit application ─────────────────────────────
  const submitApplication = async () => {
    const { data: updated } = await window.sb
      .from('provider_onboardings')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', dbId)
      .select()
      .single();
    if (updated) setAppStatus('submitted');
  };

  // ── Sign out ───────────────────────────────────────
  const signOut = async () => {
    await window.sb.auth.signOut();
    setData(clone(EMPTY_DATA));
    setDbId(null); setOnboardingId(''); setDbReady(false);
    setRole(null); setRoute('hub');
    skipFirstSave.current = true;
  };

  const stats = SECTIONS.map(s => ({ s, complete: s.isComplete(data), progress: s.progress(data) }));

  // ── Render states ──────────────────────────────────

  if (session === undefined || (user && role === null)) return <Spinner label="Loading…" />;
  if (!session) return <AuthScreen />;
  if (role === 'none') return <RoleSelectScreen user={user} onRole={(r) => { setRole(r); if (r === 'provider') loadProviderData(user.id); }} />;
  if (role === 'pharmacy') return <PharmacyApp user={user} onSignOut={signOut} />;

  // Provider
  if (!dbReady) return <Spinner label="Loading your profile…" />;
  if (loadError) return <ErrorScreen error={loadError} onRetry={() => loadProviderData(user.id)} />;

  const savedAgo   = Math.round((Date.now() - savedAt) / 1000);
  const savedLabel = savedAgo < 5 ? 'just now' : savedAgo < 60 ? `${savedAgo}s ago` : `${Math.round(savedAgo / 60)}m ago`;

  return (
    <div className="app" data-screen-label={route === 'hub' ? 'Hub' : 'Section: ' + route}>
      <header className="topbar">
        <div className="brand">
          <div className="mark"><AthenaLogo size={28} /></div>
          <span className="brand-name">Athena Compounding</span>
        </div>
        <div className="crumb">
          {route === 'hub' ? (
            <span>Provider Onboarding</span>
          ) : (
            <>
              <span style={{ cursor: 'pointer' }} onClick={goHub}>Onboarding</span>
              <span style={{ color: 'var(--ink-4)' }}>/</span>
              <b>{SECTIONS.find(s => s.id === route)?.title}</b>
            </>
          )}
        </div>
        <div className="right">
          <div className="savestate">
            {saving
              ? <><span className="spin" style={{ width: 9, height: 9, borderWidth: 1.5, color: 'var(--ink-3)' }} />Saving…</>
              : <><span className="dot" />Saved · {savedLabel}</>}
          </div>
          <button className="btn btn--ghost btn--sm topbar-help">Need help?</button>
          <div className="account">
            <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <AccountMenu email={user.email} onSignOut={signOut} />
          </div>
        </div>
      </header>

      {route === 'hub' ? (
        <Hub
          data={data}
          onOpen={goSection}
          onboardingId={onboardingId}
          status={appStatus}
          sectionReviews={sectionReviews}
          onSubmit={submitApplication}
        />
      ) : (
        <SectionDetail
          sectionId={route}
          data={data}
          set={set}
          stats={stats}
          onNav={goSection}
          onHub={goHub}
          appStatus={appStatus}
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

function SectionDetail({ sectionId, data, set, stats, onNav, onHub, appStatus }) {
  const idx    = SECTIONS.findIndex(s => s.id === sectionId);
  const s      = SECTIONS[idx];
  const Comp   = SECTION_COMPS[sectionId];
  const prev   = SECTIONS[idx - 1];
  const next   = SECTIONS[idx + 1];
  const locked = appStatus === 'approved' || appStatus === 'rejected';

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

          {locked && (
            <div className="callout" style={{ marginBottom: 24, borderColor: appStatus === 'approved' ? 'var(--ok)' : 'var(--danger)', background: appStatus === 'approved' ? 'var(--ok-soft)' : 'var(--danger-soft)' }}>
              <div className="ic"><Ic.shield /></div>
              <div>
                <strong>Application {appStatus === 'approved' ? 'approved' : 'rejected'}.</strong>{' '}
                These fields are read-only. Contact Athena Compounding to request changes.
              </div>
            </div>
          )}
          <fieldset disabled={locked} style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
            <div style={{ pointerEvents: locked ? 'none' : undefined }}>
              <Comp data={data} set={set} />
            </div>
          </fieldset>

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
