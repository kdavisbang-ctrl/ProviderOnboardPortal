/* global React, SECTIONS, Ic, Badge */

// ── Status helpers ────────────────────────────────
const STATUS_META = {
  draft:             { kind: 'mute',   label: 'Draft' },
  submitted:         { kind: 'brand',  label: 'Submitted' },
  in_review:         { kind: 'warn',   label: 'In Review' },
  approved:          { kind: 'ok',     label: 'Approved' },
  changes_requested: { kind: 'warn',   label: 'Changes Requested' },
  rejected:          { kind: 'danger', label: 'Rejected' },
};

function AppStatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft;
  return <Badge kind={m.kind}>{m.label}</Badge>;
}

function providerName(app) {
  const id = app.identity_data || {};
  return [id.firstName, id.middleName, id.lastName, id.credentials].filter(Boolean).join(' ') || '—';
}

// ── Pharmacy App shell ────────────────────────────
function PharmacyApp({ user, onSignOut }) {
  const [selected, setSelected] = React.useState(null);

  const openApp  = (app) => { setSelected(app); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const closeApp = ()    => setSelected(null);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="mark"></div>
          <span>Atrium</span>
        </div>
        <div className="crumb">
          {selected ? (
            <>
              <span style={{ cursor: 'pointer' }} onClick={closeApp}>Applications</span>
              <span style={{ color: 'var(--ink-4)' }}>/</span>
              <b>{providerName(selected)}</b>
            </>
          ) : (
            <span>Pharmacy Admin</span>
          )}
        </div>
        <div className="right">
          <div className="account">
            <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <div className="avatar" title="Sign out" style={{ cursor: 'pointer' }} onClick={onSignOut}>
              {(user.email || '?')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {selected
        ? <PharmacyReview app={selected} user={user} onBack={closeApp} onAppUpdated={setSelected} />
        : <PharmacyDashboard onOpenApp={openApp} />}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────
function PharmacyDashboard({ onOpenApp }) {
  const [apps, setApps]       = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter]   = React.useState('all');

  React.useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await window.sb
      .from('provider_onboardings')
      .select('*')
      .order('submitted_at', { ascending: false, nullsFirst: false });
    setApps(data || []);
    setLoading(false);
  };

  const FILTERS = ['all', 'submitted', 'in_review', 'changes_requested', 'approved', 'rejected', 'draft'];
  const counts  = FILTERS.reduce((acc, f) => ({ ...acc, [f]: f === 'all' ? apps.length : apps.filter(a => a.status === f).length }), {});
  const visible = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const statCards = [
    { label: 'Total applications', value: counts.all,                                      color: 'var(--ink)' },
    { label: 'Awaiting review',    value: (counts.submitted || 0) + (counts.in_review || 0), color: 'var(--brand)' },
    { label: 'Approved',           value: counts.approved || 0,                             color: 'var(--ok)' },
    { label: 'Need changes',       value: counts.changes_requested || 0,                    color: 'var(--warn)' },
  ];

  return (
    <div className="page page--full">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-ink)', marginBottom: 10 }}>
          Atrium Compounding · Admin Portal
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Provider Applications
        </h1>
        <p style={{ color: 'var(--ink-3)', margin: 0, fontSize: 14 }}>
          Review, approve, or request changes on provider credentialing applications.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', padding: '16px 18px' }}>
            <div style={{ fontSize: 30, fontFamily: 'var(--serif)', fontWeight: 400, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const on = filter === f;
          const label = STATUS_META[f]?.label || 'All';
          const count = counts[f];
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
              background: on ? 'var(--ink)' : 'var(--panel)',
              color: on ? 'var(--bg)' : 'var(--ink-3)',
              borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>
              {f === 'all' ? 'All' : label}{count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.3fr 1fr 110px 28px', gap: 12, padding: '11px 18px', background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <div>Provider</div><div>Practice</div><div>Submitted</div><div>Status</div><div />
        </div>

        {loading && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span className="spin" style={{ width: 14, height: 14, borderWidth: 1.5, color: 'var(--ink-3)' }} />
            Loading applications…
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>
            No {filter !== 'all' ? `"${STATUS_META[filter]?.label}" ` : ''}applications yet.
          </div>
        )}

        {!loading && visible.map((app, i) => {
          const id        = app.identity_data || {};
          const name      = providerName(app);
          const practice  = id.practice?.name || '—';
          const submitted = app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—';
          return (
            <div key={app.id} onClick={() => onOpenApp(app)}
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.3fr 1fr 110px 28px', gap: 12, padding: '14px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 100ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{id.email || '—'}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{practice}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{submitted}</div>
              <div><AppStatusBadge status={app.status} /></div>
              <div style={{ color: 'var(--ink-4)' }}><Ic.arrow /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Application Review ────────────────────────────
function PharmacyReview({ app, user, onBack, onAppUpdated }) {
  const [activeSection, setActiveSection] = React.useState(SECTIONS[0].id);
  const [reviews, setReviews]             = React.useState({});
  const [draft, setDraft]                 = React.useState(null); // { sectionId, status, notes }
  const [sectionSaving, setSectionSaving] = React.useState(false);
  const [overallSaving, setOverallSaving] = React.useState(false);

  React.useEffect(() => { loadReviews(); }, [app.id]);

  const loadReviews = async () => {
    const { data } = await window.sb
      .from('section_reviews')
      .select('*')
      .eq('provider_onboarding_id', app.id);
    if (data) {
      const r = {};
      data.forEach(row => { r[row.section_id] = { status: row.status, notes: row.notes || '' }; });
      setReviews(r);
    }
  };

  const saveSection = async () => {
    if (!draft || !draft.status) return;
    setSectionSaving(true);
    await window.sb.from('section_reviews').upsert({
      provider_onboarding_id: app.id,
      section_id: draft.sectionId,
      status: draft.status,
      notes: draft.notes || '',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }, { onConflict: 'provider_onboarding_id,section_id' });
    setReviews(prev => ({ ...prev, [draft.sectionId]: { status: draft.status, notes: draft.notes || '' } }));
    setDraft(null);
    setSectionSaving(false);
  };

  const setOverallStatus = async (status) => {
    setOverallSaving(true);
    const { data: updated } = await window.sb
      .from('provider_onboardings')
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq('id', app.id)
      .select()
      .single();
    if (updated) onAppUpdated(updated);
    setOverallSaving(false);
  };

  const startReview = () => setOverallStatus('in_review');

  const sectionReview = reviews[activeSection];
  const isDraftActive = draft?.sectionId === activeSection;
  const activeDraft   = isDraftActive ? draft : null;

  const approvedCount  = Object.values(reviews).filter(r => r.status === 'approved').length;
  const changesCount   = Object.values(reviews).filter(r => r.status === 'changes_requested').length;
  const rejectedCount  = Object.values(reviews).filter(r => r.status === 'rejected').length;
  const reviewedCount  = Object.keys(reviews).length;

  const SECTION_STATUS_STYLE = {
    approved:          { bg: 'var(--ok)',     color: 'white' },
    changes_requested: { bg: 'var(--warn)',   color: 'white' },
    rejected:          { bg: 'var(--danger)', color: 'white' },
  };

  return (
    <div className="page page--full">
      {/* Application header */}
      <div style={{ marginBottom: 28 }}>
        <button className="btn btn--ghost btn--sm" onClick={onBack} style={{ marginBottom: 20 }}>
          <Ic.back />Back to applications
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>
              {app.onboarding_id} · Submitted {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'N/A'}
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, letterSpacing: '-0.015em', margin: '0 0 6px' }}>
              {providerName(app)}
            </h1>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>
              {app.identity_data?.practice?.name || '—'} · {app.identity_data?.email || '—'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <AppStatusBadge status={app.status} />
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                {reviewedCount}/{SECTIONS.length} sections reviewed · {approvedCount} approved · {changesCount} need changes{rejectedCount > 0 ? ` · ${rejectedCount} rejected` : ''}
              </span>
              {overallSaving && <span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5, color: 'var(--ink-3)' }} />}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {app.status === 'submitted' && (
              <button className="btn btn--ghost btn--sm" onClick={startReview}>Mark as in review</button>
            )}
            <button
              className="btn btn--ghost btn--sm"
              style={{ color: 'var(--danger)', borderColor: 'var(--line-2)' }}
              onClick={() => { if (window.confirm('Reject this application? The provider will be notified.')) setOverallStatus('rejected'); }}
            >
              Reject
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => setOverallStatus('changes_requested')}>
              Request changes
            </button>
            <button className="btn btn--brand btn--sm" onClick={() => setOverallStatus('approved')}>
              <Ic.check />Approve application
            </button>
          </div>
        </div>
      </div>

      <div className="detail">
        {/* Section nav */}
        <aside className="sidenav">
          <div className="nav-title">Sections</div>
          {SECTIONS.map(sec => {
            const rev   = reviews[sec.id];
            const style = rev ? SECTION_STATUS_STYLE[rev.status] : null;
            return (
              <button key={sec.id}
                className={'nav-item' + (sec.id === activeSection ? ' on' : '')}
                onClick={() => { setActiveSection(sec.id); setDraft(null); }}
              >
                <span className="num">{sec.num}</span>
                <span style={{ flex: 1 }}>{sec.title}</span>
                <span className="tick" style={style ? { background: style.bg, color: style.color } : {}}>
                  {rev?.status === 'approved' && <Ic.check />}
                  {(rev?.status === 'changes_requested' || rev?.status === 'rejected') && '!'}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Section panel */}
        <main className="detail-main">
          {SECTIONS.filter(s => s.id === activeSection).map(sec => (
            <div key={sec.id}>
              <div className="detail-head">
                <div className="eyebrow">Section {sec.num} of {SECTIONS.length}</div>
                <h1>{sec.title}</h1>
                <p>{sec.blurb}</p>
              </div>

              {/* Provider's data */}
              <SectionDataDisplay sectionId={sec.id} appData={app} />

              <hr className="divider" />

              {/* Review controls */}
              <div className="subsec">
                <h2>Your review</h2>
                <p className="sub">Mark this section or request specific corrections from the provider.</p>

                {/* Existing saved review (when not editing) */}
                {sectionReview && !isDraftActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: sectionReview.status === 'approved' ? 'var(--ok-soft)' : 'var(--warn-soft)', border: `1px solid ${sectionReview.status === 'approved' ? 'var(--ok)' : 'var(--warn)'}`, borderRadius: 'var(--r-2)', marginBottom: 16, fontSize: 13 }}>
                    <span style={{ color: sectionReview.status === 'approved' ? 'var(--ok)' : 'var(--warn)' }}>
                      {sectionReview.status === 'approved' ? <Ic.check /> : '!'}
                    </span>
                    <span>
                      <b>{sectionReview.status === 'approved' ? 'Approved' : sectionReview.status === 'changes_requested' ? 'Changes requested' : 'Rejected'}</b>
                      {sectionReview.notes && ` — "${sectionReview.notes}"`}
                    </span>
                    <button className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }}
                      onClick={() => setDraft({ sectionId: sec.id, status: sectionReview.status, notes: sectionReview.notes || '' })}>
                      Edit
                    </button>
                  </div>
                )}

                {/* Review decision buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { value: 'approved',          label: 'Approve',         desc: 'Section is complete and acceptable',            color: 'var(--ok)',     soft: 'var(--ok-soft)' },
                    { value: 'changes_requested',  label: 'Request changes', desc: 'Provider needs to update this section',         color: 'var(--warn)',   soft: 'var(--warn-soft)' },
                    { value: 'rejected',           label: 'Reject section',  desc: 'Section cannot be accepted as submitted',       color: 'var(--danger)', soft: 'var(--danger-soft)' },
                  ].map(opt => {
                    const active = (isDraftActive ? draft?.status : null) === opt.value || (!isDraftActive && !sectionReview && false);
                    const on = isDraftActive && draft?.status === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => setDraft({ sectionId: sec.id, status: opt.value, notes: (isDraftActive && draft?.status === opt.value ? draft?.notes : sectionReview?.notes) || '' })}
                        style={{
                          border: `1.5px solid ${on ? opt.color : 'var(--line)'}`,
                          background: on ? opt.soft : 'var(--panel)',
                          borderRadius: 'var(--r-2)', padding: '12px 14px',
                          textAlign: 'left', cursor: 'pointer', font: 'inherit', transition: 'all 120ms',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, color: on ? opt.color : 'var(--ink)' }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Notes field */}
                {isDraftActive && (draft?.status === 'changes_requested' || draft?.status === 'rejected') && (
                  <div className="field" style={{ marginBottom: 16 }}>
                    <label>Notes for provider <span className="req">*</span></label>
                    <textarea className="textarea" rows={3}
                      placeholder="Describe what needs to be corrected or provided…"
                      value={draft?.notes || ''}
                      onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                    />
                  </div>
                )}

                {isDraftActive && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn--brand"
                      disabled={sectionSaving || ((draft?.status === 'changes_requested' || draft?.status === 'rejected') && !draft?.notes?.trim())}
                      onClick={saveSection}
                    >
                      {sectionSaving
                        ? <><span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} />Saving…</>
                        : 'Save review'}
                    </button>
                    <button className="btn btn--ghost" onClick={() => setDraft(null)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// ── Section Data Display ──────────────────────────
function SectionDataDisplay({ sectionId, appData }) {
  const renders = {
    identity: () => {
      const id = appData.identity_data || {};
      const p  = id.practice || {};
      return [
        { h: 'Provider Identity' },
        { k: 'Full name',         v: [id.firstName, id.middleName, id.lastName].filter(Boolean).join(' ') || '—' },
        { k: 'Credentials',       v: id.credentials || '—' },
        { k: 'NPI',               v: id.npi || '—', mono: true, badge: id.npiVerified ? <Badge kind="ok">NPPES verified</Badge> : <Badge kind="warn">Not verified</Badge> },
        { k: 'Direct email',      v: id.email || '—' },
        { k: 'Mobile phone',      v: id.phone || '—' },
        { h: 'Practice' },
        { k: 'Practice name',     v: p.name || '—' },
        { k: 'Practice type',     v: p.type || '—' },
        { k: 'Tax ID (EIN)',       v: p.tin || '—', mono: true },
        { k: 'Website',           v: p.website || '—' },
        { k: 'Years in practice', v: p.yearsInPractice || '—' },
      ];
    },
    credentials: () => {
      const c = appData.credentials_data || {};
      return [
        { h: 'DEA Registration' },
        { k: 'DEA number',     v: c.dea || '—',                                mono: true },
        { k: 'Expiration',     v: c.deaExp || '—' },
        { k: 'Schedules',      v: (c.deaSchedules || []).join(', ') || '—' },
        { h: 'State Medical Licenses' },
        ...(c.licenses || []).length > 0
          ? (c.licenses || []).map(l => ({ k: l.state, v: `${l.number}  ·  exp. ${l.expires}`, mono: true }))
          : [{ k: 'Licenses', v: 'None added' }],
        { h: 'Board Certification' },
        { k: 'Certifying board', v: c.boardCert || '—' },
        { k: 'Year certified',   v: c.boardYear || '—' },
        { k: 'CSR states',       v: (c.csrStates || []).join(', ') || '—' },
      ];
    },
    malpractice: () => {
      const m = appData.malpractice_data || {};
      return [
        { k: 'Carrier',              v: m.carrier || '—' },
        { k: 'Policy number',        v: m.policyNumber || '—', mono: true },
        { k: 'Per-occurrence limit', v: m.perOccurrence ? `$${Number(m.perOccurrence).toLocaleString()}` : '—' },
        { k: 'Aggregate limit',      v: m.aggregate ? `$${Number(m.aggregate).toLocaleString()}` : '—' },
        { k: 'Effective date',       v: m.effective || '—' },
        { k: 'Expiration date',      v: m.expires || '—' },
        { k: 'COI on file',          v: m.fileName || '—', badge: m.fileName ? <Badge kind="ok">Uploaded</Badge> : <Badge kind="warn">Missing</Badge> },
      ];
    },
    compounding: () => {
      const c = appData.compounding_data || {};
      return [
        { k: 'Therapeutic categories',   v: (c.categories || []).join('\n') || '—' },
        { k: 'Preferred formulations',   v: (c.formulations || []).join(', ') || '—' },
        { k: 'Sterile compounding',      v: c.sterileNeeded ? 'Yes — sterile preparations' : 'No — non-sterile only' },
        { k: 'Preferred bases',          v: (c.bases || []).join(', ') || '—' },
        { k: 'Flavor preferences',       v: (c.flavorPrefs || []).join(', ') || '—' },
        { k: 'Prescribing notes',        v: c.notes || '—' },
      ];
    },
    patient: () => {
      const p = appData.patient_data || {};
      return [
        { k: 'Active patient panel',       v: p.avgPatients || '—' },
        { k: 'Est. monthly Rx to Atrium',  v: p.monthlyRx != null ? String(p.monthlyRx) : '—' },
        { k: '% Rush orders',              v: p.rushPercent != null ? `${p.rushPercent}%` : '—' },
        { k: '% Cash pay',                 v: p.cashPay != null ? `${p.cashPay}%` : '—' },
        { k: '% Insurance',                v: p.insurancePay != null ? `${p.insurancePay}%` : '—' },
        { k: 'Patient populations',        v: (p.populations || []).join('\n') || '—' },
      ];
    },
    shipping: () => {
      const locs = appData.shipping_data || [];
      if (!locs.length) return [{ k: 'Locations', v: 'None added' }];
      return locs.flatMap((loc, i) => [
        { h: `${i + 1}. ${loc.label || 'Untitled'}${loc.primary ? ' (Primary)' : ''}` },
        { k: 'Practice name', v: loc.name || '—' },
        { k: 'Attention',     v: loc.attn || '—' },
        { k: 'Address',       v: [loc.street, `${loc.city}, ${loc.state} ${loc.zip}`].filter(Boolean).join('\n') || '—' },
        { k: 'Recv. hours',   v: loc.hours || '—' },
      ]);
    },
    billing: () => {
      const b = appData.billing_data || {};
      return [
        { k: 'Payment method',  v: b.method || '—' },
        ...(b.method === 'ACH' ? [
          { k: 'Account name',   v: b.accountName || '—' },
          { k: 'Routing number', v: b.routing || '—', mono: true },
          { k: 'Account (last 4)', v: b.accountLast4 ? `••••${b.accountLast4}` : '—', mono: true },
        ] : []),
        { k: 'Statement email', v: b.statementEmail || '—' },
        { k: 'Net terms',       v: b.netTerms || '—' },
      ];
    },
    ehr: () => {
      const e = appData.ehr_data || {};
      return [
        { k: 'EHR system',      v: e.system || '—' },
        { k: 'E-prescribing',   v: e.erxEnabled ? 'Yes — e-prescribes via Surescripts' : 'Fax / paper Rx only' },
        ...(e.erxEnabled ? [
          { k: 'Surescripts SPI', v: e.surescriptsId || '—', mono: true },
          { k: 'Inbound eFax',    v: e.eFax || '—' },
        ] : []),
      ];
    },
    staff: () => {
      const list = appData.staff_data || [];
      if (!list.length) return [{ k: 'Staff', v: 'None added' }];
      return list.map(m => ({ k: m.name, v: `${m.role || '—'}  ·  ${m.email || '—'}  ·  Access: ${m.access || '—'}` }));
    },
    attest: () => {
      const a = appData.attestations_data || {};
      const row = (label, key) => ({
        k: label,
        v: a[key] ? 'Acknowledged' : 'Not yet acknowledged',
        badge: a[key] ? <Badge kind="ok">Acknowledged</Badge> : <Badge kind="danger">Missing</Badge>,
      });
      return [
        row('Truth & accuracy',            'truthful'),
        row('Active license & good standing', 'boardStanding'),
        row('No federal exclusions',        'noSanctions'),
        row('HIPAA BAA',                   'hipaa'),
        row('USP <795>/<797>',             'usp'),
        row('Office use / dispensing',     'samHsa'),
        {
          k: 'Provider signature',
          v: a.signed ? `Signed by ${a.signedName} on ${a.signedDate}` : 'Not yet signed',
          badge: a.signed ? <Badge kind="ok">Signed</Badge> : <Badge kind="danger">Missing</Badge>,
        },
      ];
    },
  };

  const items = renders[sectionId] ? renders[sectionId]() : [];

  return (
    <div>
      {items.map((item, i) => {
        if (item.h) {
          return (
            <div key={i} style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 15, color: 'var(--ink)', marginTop: i === 0 ? 0 : 24, marginBottom: 2 }}>
              {item.h}
            </div>
          );
        }
        return (
          <div key={i} className="kv">
            <span className="k">{item.k}</span>
            <span className="v" style={{ fontFamily: item.mono ? 'var(--mono)' : 'inherit', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'pre-wrap', textAlign: 'right' }}>
              {item.v}{item.badge}
            </span>
          </div>
        );
      })}
    </div>
  );
}

window.PharmacyApp = PharmacyApp;
