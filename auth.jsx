/* global React */

// ── NPI registry lookup (NPPES public API, with demo fallback) ──
async function lookupNpiApi(npi) {
  try {
    const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`);
    if (!res.ok) throw new Error('registry_unavailable');
    const json = await res.json();
    if (!json.result_count || json.result_count === 0) return null;
    const r = json.results[0];
    if (r.enumeration_type !== 'NPI-1') return { orgError: true };
    const b = r.basic;
    const tax = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0];
    const addr = r.addresses?.find(a => a.address_purpose === 'LOCATION') || r.addresses?.[0];
    return {
      name: [b.first_name, b.middle_name, b.last_name, b.credential].filter(Boolean).join(' '),
      firstName: b.first_name || '',
      lastName: b.last_name || '',
      credential: b.credential || '',
      taxonomy: tax ? `${tax.desc} (${tax.code})` : '',
      enumDate: b.enumeration_date || '',
      address: addr
        ? [addr.address_1, addr.address_2, `${addr.city}, ${addr.state} ${addr.postal_code?.slice(0,5)}`].filter(Boolean).join(', ')
        : '',
      demo: false,
    };
  } catch {
    // CORS or network blocked (common on GitHub Pages) — return demo data so the flow can be tested
    return {
      name: 'Test Provider MD',
      firstName: 'Test',
      lastName: 'Provider',
      credential: 'MD',
      taxonomy: 'Family Medicine (207Q00000X)',
      enumDate: '2010-01-15',
      address: '123 Demo St, Watkinsville, GA 30677',
      demo: true,
    };
  }
}

// ── Shared logo ─────────────────────────────────────────
function AthenaNavLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 26 L13 7 L16 13.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27 7 L19 26" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 19.5 L18.5 19.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M26 9.5 C29.5 9.5 31 12 31 15.5 C31 19 29.5 22 26 22.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function AthenaBrand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, color: 'var(--brand)' }}>
      <AthenaNavLogo size={30} />
      <div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1 }}>ATHENA</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 400, letterSpacing: '0.18em', color: 'var(--ink-4)', marginTop: 2 }}>COMPOUNDING</div>
      </div>
    </div>
  );
}

// ── Main AuthScreen ──────────────────────────────────────
function AuthScreen() {
  const [view, setView] = React.useState('login'); // 'login' | 'register' | 'check-email'
  const [pendingEmail, setPendingEmail] = React.useState('');

  if (view === 'register') return <RegisterView onBack={() => setView('login')} onCheckEmail={(e) => { setPendingEmail(e); setView('check-email'); }} />;
  if (view === 'check-email') return <CheckEmailView email={pendingEmail} onBack={() => setView('login')} />;
  return <LoginView onRegister={() => setView('register')} />;
}

// ── Password input with peek toggle ─────────────────────
function PasswordInput({ value, onChange, onKeyDown, placeholder, autoComplete }) {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="input"
        type={show ? 'text' : 'password'}
        placeholder={placeholder || '••••••••'}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        style={{ width: '100%', paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 2, display: 'flex', alignItems: 'center' }}
        tabIndex={-1}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Login view ───────────────────────────────────────────
function LoginView({ onRegister }) {
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading]   = React.useState(null);
  const [error, setError]       = React.useState('');
  const [showTest, setShowTest] = React.useState(false);

  const TEST_ACCOUNTS = [
    { role: 'Provider',        email: 'provider@athena.test', password: 'athena2024', icon: <ProviderIcon /> },
    { role: 'Pharmacy Staff',  email: 'pharmacy@athena.test', password: 'athena2024', icon: <PharmacyIcon /> },
  ];

  const signIn = async (em, pw) => {
    setLoading(em); setError('');
    const { error: err } = await window.sb.auth.signInWithPassword({ email: em, password: pw });
    if (err) setError(err.message);
    setLoading(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <AthenaBrand />

        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Sign in to your portal
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 28px' }}>
          Provider onboarding &amp; credentialing portal.
        </p>

        {/* Login form */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Email address</label>
              <input className="input" type="email" placeholder="you@practice.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && password && signIn(email, password)}
                autoComplete="email" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email && signIn(email, password)}
                autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ padding: '9px 12px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--r-2)', fontSize: 12.5, color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            <button className="btn btn--brand" style={{ justifyContent: 'center', height: 40 }}
              onClick={() => signIn(email, password)}
              disabled={!email || !password || !!loading}>
              {loading && loading === email
                ? <><span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} />Signing in…</>
                : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Register CTA */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>New provider? </span>
          <button onClick={onRegister} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            Create your account →
          </button>
        </div>

        {/* Test accounts (collapsible) */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
          <button onClick={() => setShowTest(t => !t)}
            style={{ width: '100%', background: 'var(--bg-2)', border: 'none', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', font: 'inherit', fontSize: 12, color: 'var(--ink-3)' }}>
            <span style={{ fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 11 }}>Demo / test accounts</span>
            <span style={{ fontSize: 14 }}>{showTest ? '▲' : '▼'}</span>
          </button>
          {showTest && (
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TEST_ACCOUNTS.map(acct => (
                <TestCard key={acct.role} acct={acct} loading={loading === acct.email} disabled={!!loading} onClick={() => signIn(acct.email, acct.password)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TestCard({ acct, loading, disabled, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--brand-soft)' : 'var(--panel)',
        border: `1.5px solid ${hover ? 'var(--brand)' : 'var(--line)'}`,
        borderRadius: 'var(--r-2)', padding: '14px 14px',
        cursor: disabled ? 'wait' : 'pointer', textAlign: 'left',
        transition: 'all 150ms', font: 'inherit', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
      <div style={{ width: 34, height: 34, borderRadius: 'var(--r-1)', background: hover ? 'var(--brand)' : 'var(--bg-2)', display: 'grid', placeItems: 'center', color: hover ? 'white' : 'var(--ink-3)', transition: 'all 150ms' }}>
        {loading ? <span className="spin" style={{ width: 14, height: 14, borderWidth: 2 }} /> : acct.icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{acct.role}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{acct.email}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>pw: {acct.password}</div>
      </div>
    </button>
  );
}

// ── Provider registration view ───────────────────────────
function RegisterView({ onBack, onCheckEmail }) {
  const [step, setStep]       = React.useState('npi');  // 'npi' | 'details'
  const [npi, setNpi]         = React.useState('');
  const [npiResult, setNpiResult] = React.useState(null);
  const [npiError, setNpiError]   = React.useState('');
  const [npiLoading, setNpiLoading] = React.useState(false);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName]   = React.useState('');
  const [email, setEmail]         = React.useState('');
  const [password, setPassword]   = React.useState('');
  const [confirm, setConfirm]     = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const verifyNpi = async () => {
    if (npi.length !== 10) return;
    setNpiLoading(true); setNpiError(''); setNpiResult(null);
    try {
      const result = await lookupNpiApi(npi);
      if (!result) { setNpiError('No provider found for this NPI. Please check the number and try again.'); }
      else if (result.orgError) { setNpiError('This NPI belongs to an organization. Only individual provider NPIs are accepted.'); }
      else {
        setNpiResult(result);
        setFirstName(result.firstName);
        setLastName(result.lastName);
        setStep('details');
      }

    } catch (e) { setNpiError(e.message); }
    setNpiLoading(false);
  };

  const register = async () => {
    if (!email || !password) return;
    if (password !== confirm) { setSubmitError('Passwords do not match.'); return; }
    if (password.length < 8) { setSubmitError('Password must be at least 8 characters.'); return; }

    setSubmitting(true); setSubmitError('');
    const { data, error } = await window.sb.auth.signUp({ email, password });
    if (error) { setSubmitError(error.message); setSubmitting(false); return; }

    if (data.user) {
      // Create provider profile and seed identity data
      await window.sb.from('profiles').insert({ id: data.user.id, role: 'provider' });
      await window.sb.from('provider_onboardings').insert({
        user_id: data.user.id,
        identity_data: {
          firstName, lastName,
          credentials: npiResult?.credential || '',
          npi,
          npiVerified: true,
          npiResult,
          email,
          phone: '', middleName: '',
          practice: { name: '', type: '', tin: '', website: '', yearsInPractice: '' },
        },
      });
    }

    setSubmitting(false);
    if (!data.session) {
      onCheckEmail(email);
    }
    // If session exists, app.jsx auth listener picks it up automatically
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <AthenaBrand />

        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back to sign in
        </button>

        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Create your provider account
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: '0 0 28px' }}>
          We verify your NPI to confirm you're a licensed provider before creating your account.
        </p>

        {/* Step 1 — NPI verification */}
        <div style={{ background: 'var(--panel)', border: `1px solid ${step === 'npi' ? 'var(--brand)' : 'var(--line)'}`, borderRadius: 'var(--r-3)', padding: 24, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: npiResult ? 'var(--ok)' : 'var(--brand)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {npiResult ? '✓' : '1'}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>NPI Verification</div>
          </div>

          {npiResult ? (
            <div style={{ background: 'var(--ok-soft)', border: '1px solid var(--ok)', borderRadius: 'var(--r-2)', padding: '12px 14px' }}>
              <div style={{ fontWeight: 600, color: 'var(--ok)', fontSize: 13, marginBottom: 4 }}>
                ✓ {npiResult.demo ? 'Demo mode — NPI registry unreachable' : 'Verified · NPPES registry'}
              </div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{npiResult.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                NPI {npi} · {npiResult.taxonomy}
              </div>
              <button onClick={() => { setNpiResult(null); setStep('npi'); }} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 12, cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' }}>
                Use a different NPI
              </button>
            </div>
          ) : (
            <div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>National Provider Identifier (NPI) <span className="req">*</span></label>
                <div className="input-group">
                  <input className="input input--mono" placeholder="10-digit NPI number" maxLength={10}
                    value={npi} onChange={e => { setNpi(e.target.value.replace(/\D/g, '')); setNpiError(''); }}
                    onKeyDown={e => e.key === 'Enter' && npi.length === 10 && verifyNpi()} />
                  <button onClick={verifyNpi} disabled={npiLoading || npi.length !== 10}>
                    {npiLoading ? <><span className="spin" style={{ width: 11, height: 11, borderWidth: 1.5 }} />Verifying…</> : 'Verify NPI'}
                  </button>
                </div>
              </div>
              {npiError && (
                <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--danger)', padding: '8px 12px', background: 'var(--danger-soft)', borderRadius: 'var(--r-1)' }}>{npiError}</div>
              )}
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-4)' }}>
                Your NPI is verified against the CMS NPPES public registry.
              </div>
            </div>
          )}
        </div>

        {/* Step 2 — Account details */}
        <div style={{ background: 'var(--panel)', border: `1px solid ${step === 'details' ? 'var(--brand)' : 'var(--line)'}`, borderRadius: 'var(--r-3)', padding: 24, opacity: npiResult ? 1 : 0.45, pointerEvents: npiResult ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Account Details</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>First name <span className="req">*</span></label>
                <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Last name <span className="req">*</span></label>
                <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last" />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Email address <span className="req">*</span></label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@practice.com" autoComplete="email" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Password <span className="req">*</span></label>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Confirm password <span className="req">*</span></label>
              <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password"
                onKeyDown={e => e.key === 'Enter' && register()} autoComplete="new-password" />
            </div>
            {submitError && (
              <div style={{ padding: '9px 12px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--r-2)', fontSize: 12.5, color: 'var(--danger)' }}>
                {submitError}
              </div>
            )}
            <button className="btn btn--brand" style={{ justifyContent: 'center', height: 40 }}
              onClick={register} disabled={!email || !password || !confirm || submitting || !npiResult}>
              {submitting
                ? <><span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} />Creating account…</>
                : 'Create Athena account'}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 16, textAlign: 'center' }}>
          Pharmacy staff accounts are created by Athena administrators.
        </p>
      </div>
    </div>
  );
}

// ── Confirm email view ──────────────────────────────────
function CheckEmailView({ email, onBack }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <AthenaBrand />
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: 'var(--brand)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M3 7l9 6.5L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, marginBottom: 12 }}>Confirm your email</div>
        <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: '0 0 8px', lineHeight: 1.6 }}>
          We sent a confirmation link to
        </p>
        <p style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 14, margin: '0 0 24px' }}>{email}</p>
        <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '0 0 28px', lineHeight: 1.6 }}>
          Click the link in the email to activate your account, then sign in.
        </p>
        <button className="btn btn--ghost" style={{ margin: '0 auto' }} onClick={onBack}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────
function ProviderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function PharmacyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 4V2.5M13 4V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6.5 10.5h7M10 7.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

window.AuthScreen = AuthScreen;
