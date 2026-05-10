/* global React */

const TEST_ACCOUNTS = [
  {
    role: 'Provider',
    sub: 'I prescribe medications',
    email: 'provider@atrium.test',
    password: 'atrium2024',
    icon: <ProviderAuthIcon />,
  },
  {
    role: 'Pharmacy Staff',
    sub: 'I work at Atrium',
    email: 'pharmacy@atrium.test',
    password: 'atrium2024',
    icon: <PharmacyAuthIcon />,
  },
];

function AuthScreen() {
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading]   = React.useState(null); // email string while loading
  const [error, setError]       = React.useState('');

  const signIn = async (em, pw) => {
    setLoading(em);
    setError('');
    const { error: err } = await window.sb.auth.signInWithPassword({ email: em, password: pw });
    if (err) setError(err.message);
    setLoading(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--brand)', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '1.5px solid white', display: 'block' }} />
          </div>
          Atrium
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Provider Onboarding Portal
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 32px' }}>
          Sign in to continue. Use a test account below or enter your credentials.
        </p>

        {/* Test account cards */}
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-4)', fontFamily: 'var(--mono)', marginBottom: 10 }}>
          Quick access — test accounts
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {TEST_ACCOUNTS.map(acct => (
            <TestCard
              key={acct.role}
              acct={acct}
              loading={loading === acct.email}
              disabled={!!loading}
              onClick={() => signIn(acct.email, acct.password)}
            />
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ fontSize: 12, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>or sign in with your credentials</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        {/* Manual form */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@practice.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && password && signIn(email, password)}
                autoComplete="email"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email && signIn(email, password)}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div style={{ padding: '9px 12px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--r-2)', fontSize: 12.5, color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            <button
              className="btn btn--brand"
              style={{ justifyContent: 'center', height: 40 }}
              onClick={() => signIn(email, password)}
              disabled={!email || !password || !!loading}
            >
              {loading && loading !== 'provider@atrium.test' && loading !== 'pharmacy@atrium.test'
                ? <><span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} />Signing in…</>
                : 'Sign in'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function TestCard({ acct, loading, disabled, onClick }) {
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
        borderRadius: 'var(--r-3)', padding: '18px 16px',
        cursor: disabled ? 'wait' : 'pointer',
        textAlign: 'left', transition: 'all 150ms', font: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r-2)',
        background: hover ? 'var(--brand)' : 'var(--bg-2)',
        display: 'grid', placeItems: 'center',
        color: hover ? 'white' : 'var(--ink-3)', transition: 'all 150ms', flexShrink: 0,
      }}>
        {loading
          ? <span className="spin" style={{ width: 15, height: 15, borderWidth: 2 }} />
          : acct.icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{acct.role}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 6 }}>{acct.sub}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)', marginBottom: 1 }}>{acct.email}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>pw: {acct.password}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: hover ? 'var(--brand)' : 'var(--ink-3)', transition: 'color 150ms' }}>
        {loading ? 'Signing in…' : `Enter as ${acct.role} →`}
      </div>
    </button>
  );
}

function ProviderAuthIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PharmacyAuthIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 4V2.5M13 4V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 10.5h7M10 7.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

window.AuthScreen = AuthScreen;
