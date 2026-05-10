/* global React */

function RoleSelectScreen({ user, onRole }) {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  const choose = async (role) => {
    setLoading(true);
    setErr('');
    const { error } = await window.sb.from('profiles').insert({ id: user.id, role });
    if (error) { setErr(error.message); setLoading(false); }
    else onRole(role);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 580, padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, color: 'var(--brand)' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M5 26 L13 7 L16 13.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M27 7 L19 26" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 19.5 L18.5 19.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M26 9.5 C29.5 9.5 31 12 31 15.5 C31 19 29.5 22 26 22.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
          </svg>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 600, letterSpacing: '0.01em', color: 'var(--brand)' }}>
            ATHENA <span style={{ fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '0.12em', fontSize: 12 }}>COMPOUNDING</span>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 10 }}>
          How will you use Athena Compounding?
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 32, margin: '0 0 32px' }}>
          Select your role to continue. You'll see a different experience based on what you choose.
        </p>

        {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'var(--danger-soft)', borderRadius: 'var(--r-2)' }}>{err}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <RoleCard
            title="Provider"
            sub="I prescribe medications"
            desc="Complete your credentialing to start prescribing compounded medications through Athena Compounding."
            icon={<ProviderIcon />}
            onClick={() => choose('provider')}
            disabled={loading}
          />
          <RoleCard
            title="Pharmacy Staff"
            sub="I work at Athena"
            desc="Review and approve provider applications, manage credentialing, and monitor active provider accounts."
            icon={<PharmacyIcon />}
            onClick={() => choose('pharmacy')}
            disabled={loading}
          />
        </div>

        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 24, textAlign: 'center' }}>
          Athena Compounding · Signed in as {user.email} ·{' '}
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.sb.auth.signOut()}>Sign out</span>
        </p>
      </div>
    </div>
  );
}

function RoleCard({ title, sub, desc, icon, onClick, disabled }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--brand-soft)' : 'var(--panel)',
        border: `1.5px solid ${hover ? 'var(--brand)' : 'var(--line)'}`,
        borderRadius: 'var(--r-4)', padding: '28px 24px',
        cursor: disabled ? 'wait' : 'pointer',
        textAlign: 'left', transition: 'all 150ms', font: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-2)',
        background: hover ? 'var(--brand)' : 'var(--bg-2)',
        display: 'grid', placeItems: 'center',
        color: hover ? 'white' : 'var(--ink-3)', transition: 'all 150ms',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{sub}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </button>
  );
}

function ProviderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PharmacyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 4V2.5M13 4V2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 10.5h7M10 7.5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

window.RoleSelectScreen = RoleSelectScreen;
