/* global React */

function AuthScreen() {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const send = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    const redirectTo = window.location.origin + window.location.pathname;
    const { error: err } = await window.sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 420, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-4)', padding: '40px 36px', boxShadow: 'var(--sh-3)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--brand)', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '1.5px solid white', display: 'block' }} />
          </div>
          Atrium
        </div>

        {!sent ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.015em', marginBottom: 8 }}>
              Sign in to your portal
            </div>
            <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: '0 0 28px' }}>
              Enter your email and we'll send a secure magic link — no password needed.
            </p>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>Email address <span className="req">*</span></label>
              <input
                className="input"
                type="email"
                placeholder="you@practice.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                autoFocus
              />
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</div>
            )}

            <button
              className="btn btn--brand"
              style={{ width: '100%', justifyContent: 'center', height: 40 }}
              onClick={send}
              disabled={loading || !email}
            >
              {loading
                ? <><span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} />Sending…</>
                : 'Send magic link'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 20, marginBottom: 0, textAlign: 'center', lineHeight: 1.6 }}>
              New provider? We'll create your account automatically.<br />
              Returning? You'll be taken straight to your onboarding.
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--ok-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: 'var(--ok)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 12.5 9 17l10.5-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Check your email</div>
            <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: '0 0 28px', lineHeight: 1.6 }}>
              We sent a magic link to<br />
              <b style={{ color: 'var(--ink)' }}>{email}</b>.<br />
              Click it to sign in — the link expires in 1 hour.
            </p>
            <button className="btn btn--ghost btn--sm" style={{ margin: '0 auto' }} onClick={() => setSent(false)}>
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;
