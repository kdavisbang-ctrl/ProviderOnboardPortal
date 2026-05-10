/* global React, Ic */

const REPORT_STATUS_LABELS = {
  draft:             'Draft',
  submitted:         'Submitted',
  in_review:         'In Review',
  approved:          'Approved',
  changes_requested: 'Changes Requested',
  rejected:          'Rejected',
};

function rName(app) {
  const id = app.identity_data || {};
  return [id.firstName, id.lastName, id.credentials].filter(Boolean).join(' ') || app.onboarding_id || '—';
}

// ─── Canned Report Definitions ────────────────────
const REPORT_DEFS = [
  {
    id: 'provider_roster',
    title: 'Approved Provider Roster',
    desc: 'Contact info, NPI, and credentials for every credentialed provider.',
    tag: 'Providers',
    getData: (apps) =>
      apps
        .filter(a => a.status === 'approved')
        .map(a => {
          const id = a.identity_data || {};
          return {
            name:        rName(a),
            credentials: id.credentials || '—',
            npi:         id.npi || '—',
            practice:    id.practice?.name || '—',
            email:       id.email || '—',
            phone:       id.phone || '—',
          };
        }),
    columns: [
      { key: 'name',        label: 'Provider' },
      { key: 'credentials', label: 'Type' },
      { key: 'npi',         label: 'NPI',      mono: true },
      { key: 'practice',    label: 'Practice' },
      { key: 'email',       label: 'Email' },
      { key: 'phone',       label: 'Phone' },
    ],
  },

  {
    id: 'application_pipeline',
    title: 'Application Pipeline',
    desc: 'Status and age of every credentialing application in the system.',
    tag: 'Pipeline',
    getData: (apps) =>
      apps.map(a => {
        const sub  = a.submitted_at ? new Date(a.submitted_at) : null;
        const days = sub ? Math.round((Date.now() - sub) / 86400000) : null;
        return {
          appId:     a.onboarding_id || '—',
          name:      rName(a),
          practice:  a.identity_data?.practice?.name || '—',
          submitted: sub ? sub.toLocaleDateString() : 'Not submitted',
          age:       days != null ? `${days}d` : '—',
          status:    REPORT_STATUS_LABELS[a.status] || a.status || '—',
        };
      }),
    columns: [
      { key: 'appId',     label: 'App ID',    mono: true },
      { key: 'name',      label: 'Provider' },
      { key: 'practice',  label: 'Practice' },
      { key: 'submitted', label: 'Submitted' },
      { key: 'age',       label: 'Age' },
      { key: 'status',    label: 'Status' },
    ],
  },

  {
    id: 'credential_expiry',
    title: 'Credential Expiry',
    desc: 'DEA registrations and malpractice policies expiring within 180 days.',
    tag: 'Compliance',
    getData: (apps) => {
      const now    = Date.now();
      const cutoff = now + 180 * 86400000;
      return apps
        .map(a => {
          const cred  = a.credentials_data  || {};
          const mal   = a.malpractice_data  || {};
          const deaTs = cred.deaExp   ? new Date(cred.deaExp).getTime()  : null;
          const malTs = mal.expires   ? new Date(mal.expires).getTime()  : null;
          const daysLeft = (ts) => ts < now ? 'EXPIRED' : `${Math.round((ts - now) / 86400000)}d`;
          return {
            name:      rName(a),
            dea:       cred.dea || '—',
            deaExp:    cred.deaExp || '—',
            deaStatus: deaTs ? daysLeft(deaTs) : '—',
            carrier:   mal.carrier || '—',
            malExp:    mal.expires || '—',
            malStatus: malTs ? daysLeft(malTs) : '—',
            _sort:     Math.min(deaTs || Infinity, malTs || Infinity),
            _show:     (deaTs && deaTs < cutoff) || (malTs && malTs < cutoff),
          };
        })
        .filter(r => r._show)
        .sort((a, b) => a._sort - b._sort)
        .map(({ _sort, _show, ...rest }) => rest);
    },
    columns: [
      { key: 'name',      label: 'Provider' },
      { key: 'dea',       label: 'DEA #',        mono: true },
      { key: 'deaExp',    label: 'DEA Expires' },
      { key: 'deaStatus', label: 'DEA Status' },
      { key: 'carrier',   label: 'Ins. Carrier' },
      { key: 'malExp',    label: 'Ins. Expires' },
      { key: 'malStatus', label: 'Ins. Status' },
    ],
  },

  {
    id: 'malpractice_summary',
    title: 'Malpractice Coverage',
    desc: 'Carrier, policy numbers, and coverage limits for all providers.',
    tag: 'Insurance',
    getData: (apps) =>
      apps
        .filter(a => a.malpractice_data?.carrier)
        .map(a => {
          const m = a.malpractice_data || {};
          const fmt = (n) => n ? `$${Number(n).toLocaleString()}` : '—';
          return {
            name:      rName(a),
            carrier:   m.carrier || '—',
            policy:    m.policyNumber || '—',
            perOcc:    fmt(m.perOccurrence),
            aggregate: fmt(m.aggregate),
            effective: m.effective || '—',
            expires:   m.expires || '—',
            coi:       m.fileName ? 'On file' : 'Missing',
          };
        }),
    columns: [
      { key: 'name',      label: 'Provider' },
      { key: 'carrier',   label: 'Carrier' },
      { key: 'policy',    label: 'Policy #',       mono: true },
      { key: 'perOcc',    label: 'Per Occurrence' },
      { key: 'aggregate', label: 'Aggregate' },
      { key: 'effective', label: 'Effective' },
      { key: 'expires',   label: 'Expires' },
      { key: 'coi',       label: 'COI' },
    ],
  },

  {
    id: 'state_licenses',
    title: 'State License Coverage',
    desc: 'Active state medical licenses and DEA schedules per provider.',
    tag: 'Licensing',
    getData: (apps) =>
      apps
        .filter(a => (a.credentials_data?.licenses?.length) || a.credentials_data?.dea)
        .map(a => {
          const cred   = a.credentials_data || {};
          const lics   = (cred.licenses || []).filter(l => l.state && l.number);
          return {
            name:      rName(a),
            type:      (a.identity_data || {}).credentials || '—',
            count:     lics.length,
            states:    lics.map(l => l.state).join(', ') || '—',
            dea:       cred.dea || '—',
            schedules: (cred.deaSchedules || []).join(', ') || '—',
          };
        })
        .sort((a, b) => b.count - a.count),
    columns: [
      { key: 'name',      label: 'Provider' },
      { key: 'type',      label: 'Type' },
      { key: 'count',     label: '# States' },
      { key: 'states',    label: 'Licensed States', wrap: true },
      { key: 'dea',       label: 'DEA #',            mono: true },
      { key: 'schedules', label: 'Schedules' },
    ],
  },

  {
    id: 'monthly_activity',
    title: 'Monthly Submission Activity',
    desc: 'Application volume and outcomes grouped by calendar month.',
    tag: 'Activity',
    getData: (apps) => {
      const byMonth = {};
      apps.forEach(a => {
        const d   = new Date(a.submitted_at || a.created_at || Date.now());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth[key]) byMonth[key] = { key, total: 0, approved: 0, rejected: 0, changes: 0, pending: 0 };
        byMonth[key].total++;
        if      (a.status === 'approved')          byMonth[key].approved++;
        else if (a.status === 'rejected')           byMonth[key].rejected++;
        else if (a.status === 'changes_requested')  byMonth[key].changes++;
        else                                        byMonth[key].pending++;
      });
      return Object.values(byMonth)
        .sort((a, b) => b.key.localeCompare(a.key))
        .map(r => ({
          month:    new Date(r.key + '-02').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          total:    r.total,
          approved: r.approved,
          changes:  r.changes,
          rejected: r.rejected,
          pending:  r.pending,
        }));
    },
    columns: [
      { key: 'month',    label: 'Month' },
      { key: 'total',    label: 'Total' },
      { key: 'approved', label: 'Approved' },
      { key: 'changes',  label: 'Changes Req.' },
      { key: 'rejected', label: 'Rejected' },
      { key: 'pending',  label: 'Pending' },
    ],
  },
];

// ─── PDF print ────────────────────────────────────
function printReport(report, rows) {
  const now  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const cols = report.columns;
  const thead = `<tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr>`;
  const tbody = rows.map(row =>
    `<tr>${cols.map(c =>
      `<td style="${c.mono ? 'font-family:monospace;font-size:10.5px' : ''};${c.wrap ? 'white-space:normal;max-width:260px' : ''}">${row[c.key] ?? '—'}</td>`
    ).join('')}</tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.title} — Athena Compounding</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,system-ui,sans-serif;font-size:11.5px;color:#1a1a1a;padding:28px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #4e7d9e;padding-bottom:14px;margin-bottom:18px}
    .eyebrow{font-size:9px;color:#4e7d9e;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px}
    h1{font-size:19px;font-weight:600;color:#111;margin-bottom:3px}
    .desc{font-size:11px;color:#777;margin-top:3px}
    .meta{font-size:10px;color:#aaa;text-align:right;line-height:1.7}
    .count{font-size:10.5px;color:#888;margin-bottom:12px}
    table{width:100%;border-collapse:collapse}
    th{background:#f3f6f9;text-align:left;padding:8px 11px;font-size:9.5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#555;border-bottom:1px solid #dde2ea;white-space:nowrap}
    td{padding:8px 11px;border-bottom:1px solid #eef0f4;vertical-align:top}
    tr:nth-child(even) td{background:#fafbfd}
    tr:last-child td{border-bottom:none}
    @page{margin:15mm}
    @media print{body{padding:0}}
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <div class="eyebrow">Athena Compounding · Admin Report</div>
      <h1>${report.title}</h1>
      <div class="desc">${report.desc}</div>
    </div>
    <div class="meta">
      Generated ${now}<br>
      ${rows.length} record${rows.length !== 1 ? 's' : ''}
    </div>
  </div>
  <table>
    <thead>${thead}</thead>
    <tbody>${tbody}</tbody>
  </table>
  <script>window.onload=function(){window.print()}<\/script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=960,height=720');
  if (!w) { alert('Allow pop-ups to download the PDF.'); return; }
  w.document.write(html);
  w.document.close();
}

// ─── Tag colour map ───────────────────────────────
const TAG_COLORS = {
  Providers:  { bg: '#edf3fb', color: '#2b6fa3' },
  Pipeline:   { bg: '#f0f4ff', color: '#3750c2' },
  Compliance: { bg: '#fff8ec', color: '#b56e0a' },
  Insurance:  { bg: '#fff0f6', color: '#ae2a6e' },
  Licensing:  { bg: '#f0fdf4', color: '#1a7a40' },
  Activity:   { bg: '#f5f0ff', color: '#6535b5' },
};

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1.5v7M3.5 5.5l3 3 3-3M1.5 9.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Report card ──────────────────────────────────
function ReportCard({ report, onClick }) {
  const tag = TAG_COLORS[report.tag] || { bg: 'var(--bg-2)', color: 'var(--ink-3)' };
  return (
    <div className="report-card" onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <span className="report-tag" style={{ background: tag.bg, color: tag.color }}>
          {report.tag}
        </span>
        <Ic.arrow style={{ color: 'var(--ink-4)', flexShrink: 0, marginTop: 1 }} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 5, color: 'var(--ink)' }}>{report.title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{report.desc}</div>
    </div>
  );
}

// ─── Report detail ────────────────────────────────
function ReportDetail({ report, apps, onBack }) {
  const rows = React.useMemo(() => report.getData(apps), [report, apps]);
  const now  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page page--full">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <button className="btn btn--ghost btn--sm" onClick={onBack} style={{ marginBottom: 14 }}>
            <Ic.back />All reports
          </button>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>
            {report.tag}
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, letterSpacing: '-0.015em', margin: '0 0 6px' }}>
            {report.title}
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: 0 }}>{report.desc}</p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>Generated {now}</span>
          <button className="btn btn--brand btn--sm" style={{ gap: 6 }} onClick={() => printReport(report, rows)}>
            <DownloadIcon />Download PDF
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--ink-3)', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', fontSize: 13.5 }}>
          No records match this report's criteria yet.
        </div>
      ) : (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 18px', background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              {rows.length} record{rows.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  {report.columns.map(c => (
                    <th key={c.key} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.07em',
                      textTransform: 'uppercase', color: 'var(--ink-3)',
                      background: 'var(--panel-2)', borderBottom: '1px solid var(--line)',
                      whiteSpace: 'nowrap',
                    }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {report.columns.map(c => (
                      <td key={c.key} style={{
                        padding: '11px 14px',
                        fontSize: 13,
                        color: 'var(--ink-2)',
                        fontFamily: c.mono ? 'var(--mono)' : 'inherit',
                        borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                        whiteSpace: c.wrap ? 'normal' : 'nowrap',
                        maxWidth: c.wrap ? 260 : 'none',
                      }}>
                        {row[c.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports hub ──────────────────────────────────
function PharmacyReports() {
  const [apps, setApps]           = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [activeReport, setActive] = React.useState(null);

  React.useEffect(() => {
    window.sb.from('provider_onboardings').select('*').then(({ data }) => {
      setApps(data || []);
      setLoading(false);
    });
  }, []);

  if (activeReport) {
    return <ReportDetail report={activeReport} apps={apps} onBack={() => setActive(null)} />;
  }

  return (
    <div className="page page--full">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--brand-ink)', marginBottom: 10 }}>
          Athena Compounding · Admin Portal
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Reports
        </h1>
        <p style={{ color: 'var(--ink-3)', margin: 0, fontSize: 14 }}>
          Generate and export credentialing and compliance reports as PDF.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 13 }}>
          <span className="spin" style={{ width: 14, height: 14, borderWidth: 1.5, color: 'var(--ink-3)' }} />
          Loading data…
        </div>
      ) : (
        <div className="reports-grid">
          {REPORT_DEFS.map(r => (
            <ReportCard key={r.id} report={r} onClick={() => setActive(r)} />
          ))}
        </div>
      )}
    </div>
  );
}

window.PharmacyReports = PharmacyReports;
