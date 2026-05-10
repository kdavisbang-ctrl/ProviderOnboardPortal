/* global React, SECTIONS, StatusBadge, Ic, Badge */

const STATUS_BANNERS = {
  submitted: {
    kind: 'brand', icon: '📋',
    title: 'Application submitted — awaiting review',
    desc: 'Athena Compounding will review your credentialing within 2 business days. You\'ll receive an email when a decision is made.',
  },
  in_review: {
    kind: 'warn', icon: '👀',
    title: 'Your application is under active review',
    desc: 'Athena is currently reviewing your sections. You may receive a request for changes or an approval notice by email shortly.',
  },
  approved: {
    kind: 'ok', icon: '✓',
    title: 'Application approved — welcome to Athena!',
    desc: 'Your provider portal is now active. You can begin sending compounded prescriptions to Athena Compounding.',
  },
  changes_requested: {
    kind: 'warn', icon: '✏',
    title: 'Changes requested — please review and resubmit',
    desc: 'Athena has reviewed your application and needs updates to certain sections. Sections marked below require your attention.',
  },
  rejected: {
    kind: 'danger', icon: '✕',
    title: 'Application not accepted',
    desc: 'Your application has been rejected. Please contact Athena Compounding directly for more information on next steps.',
  },
};

const REVIEW_BADGE = {
  approved:          { kind: 'ok',     label: 'Approved by Athena' },
  changes_requested: { kind: 'warn',   label: 'Changes needed' },
  rejected:          { kind: 'danger', label: 'Rejected' },
};

function Hub({ data, onOpen, onboardingId, status = 'draft', sectionReviews = {}, onSubmit }) {
  const stats      = SECTIONS.map(s => ({ s, complete: s.isComplete(data), progress: s.progress(data) }));
  const done       = stats.filter(x => x.complete).length;
  const inProg     = stats.filter(x => !x.complete && x.progress > 0).length;
  const notStarted = stats.filter(x => x.progress === 0).length;
  const total      = SECTIONS.length;
  const totalMin   = SECTIONS.filter(s => !s.isComplete(data)).reduce((a, s) => a + s.minutes, 0);

  const [filter, setFilter]       = React.useState('all');
  const [confirming, setConfirming] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const isDraft     = status === 'draft';
  const isEditable  = status === 'draft' || status === 'changes_requested';
  const canEdit     = isEditable;

  const visible = stats.filter(({ complete, progress }) => {
    if (filter === 'all')  return true;
    if (filter === 'todo') return !complete;
    if (filter === 'done') return complete;
    return true;
  });

  const statusOf = ({ complete, progress }) =>
    complete ? 'complete' : progress > 0 ? 'progress' : 'notstarted';

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit();
    setSubmitting(false);
    setConfirming(false);
  };

  const banner = STATUS_BANNERS[status];
  const bannerColors = {
    brand:  { bg: 'var(--brand-soft)', border: 'var(--brand-line)', title: 'var(--brand-ink)', icon: 'var(--brand)' },
    ok:     { bg: 'var(--ok-soft)',    border: 'var(--ok)',          title: 'var(--ok)',         icon: 'var(--ok)' },
    warn:   { bg: 'var(--warn-soft)',  border: 'var(--warn)',        title: 'var(--warn)',        icon: 'var(--warn)' },
    danger: { bg: 'var(--danger-soft)',border: 'var(--danger)',      title: 'var(--danger)',      icon: 'var(--danger)' },
  };

  // Sections that have a review flag from pharmacy
  const needsAttention = SECTIONS.filter(s => sectionReviews[s.id]?.status === 'changes_requested' || sectionReviews[s.id]?.status === 'rejected');

  return (
    <div className="page">
      {/* Application status banner */}
      {banner && (() => {
        const c = bannerColors[banner.kind] || bannerColors.brand;
        return (
          <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--r-3)', padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.icon, color: 'white', display: 'grid', placeItems: 'center', fontSize: 15, flexShrink: 0 }}>
              {banner.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: c.title, fontSize: 14, marginBottom: 4 }}>{banner.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{banner.desc}</div>
              {status === 'changes_requested' && needsAttention.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {needsAttention.map(s => (
                    <button key={s.id} onClick={() => onOpen(s.id)} style={{ background: 'var(--warn)', color: 'white', border: 0, borderRadius: 999, padding: '3px 10px', fontSize: 11.5, fontWeight: 500, cursor: 'pointer' }}>
                      {s.num} · {s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Hero */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="eyebrow">Provider Onboarding · Athena Compounding</div>
          <h1>
            {status === 'approved'
              ? <>Your practice is <em>active and ready</em> to prescribe.</>
              : status === 'changes_requested'
              ? <>Please review the <em>requested changes</em> below.</>
              : <>Where Science Meets <em>Precision.</em></>}
          </h1>
          <p>
            {status === 'approved'
              ? 'Your credentialing is complete. Contact Athena Compounding at any time to update your information.'
              : 'Complete each section to activate your practice. Your progress saves automatically.'}
          </p>
          <div className="meta">
            {isEditable && <><span><b>{totalMin} min</b> remaining</span><span className="pip"></span></>}
            <span>Onboarding ID <b style={{ fontFamily: 'var(--mono)' }}>{onboardingId}</b></span>
          </div>
        </div>
        <div className="hero-progress">
          <div className="label">Progress</div>
          <div className="ratio">{done}<span>/{total}</span></div>
          <div className="stack">
            {stats.map(({ s, complete, progress }) => (
              <div key={s.id} className={'seg' + (complete ? ' done' : progress > 0 ? ' partial' : '')} />
            ))}
          </div>
          <div className="breakdown">
            <div className="row"><span>Complete</span><b>{done}</b></div>
            <div className="row"><span>In progress</span><b>{inProg}</b></div>
            <div className="row"><span>Not started</span><b>{notStarted}</b></div>
          </div>
        </div>
      </section>

      {/* Tasks */}
      <div className="section-head">
        <h2>Onboarding tasks</h2>
        {canEdit && (
          <div className="filter">
            <button className={filter === 'all'  ? 'on' : ''} onClick={() => setFilter('all')}>All {total}</button>
            <button className={filter === 'todo' ? 'on' : ''} onClick={() => setFilter('todo')}>To do {total - done}</button>
            <button className={filter === 'done' ? 'on' : ''} onClick={() => setFilter('done')}>Complete {done}</button>
          </div>
        )}
      </div>

      <div className="tasks">
        {visible.map(({ s, complete, progress }) => {
          const review = sectionReviews[s.id];
          const rb = review ? REVIEW_BADGE[review.status] : null;
          return (
            <button key={s.id} className="task" onClick={() => canEdit ? onOpen(s.id) : null}
              style={{ cursor: canEdit ? 'pointer' : 'default' }}>
              <div className="num">{s.num}</div>
              <div className="body">
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                {review?.notes && review.status !== 'approved' && (
                  <div style={{ marginTop: 8, padding: '7px 10px', background: 'var(--warn-soft)', border: '1px solid var(--warn)', borderRadius: 'var(--r-1)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                    <b style={{ color: 'var(--warn)' }}>Pharmacy note:</b> {review.notes}
                  </div>
                )}
                <div className="fields">
                  <span>{s.fields} fields</span>
                  <span className="pip"></span>
                  <span>~{s.minutes} min</span>
                </div>
              </div>
              <div className="right-col">
                {rb
                  ? <Badge kind={rb.kind}>{rb.label}</Badge>
                  : <StatusBadge status={statusOf({ complete, progress })} />}
                <div className="progress-mini"><div style={{ width: (progress * 100).toFixed(0) + '%' }} /></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit / status footer */}
      {isEditable && (
        <div style={{ marginTop: 36, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
          {/* Incomplete warning */}
          {done < total && (
            <div style={{ padding: '12px 24px', background: 'var(--warn-soft)', borderBottom: '1px solid var(--warn)', fontSize: 12.5, color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ic.info />
              <span><b>{total - done} section{total - done !== 1 ? 's' : ''} incomplete.</b> You can still submit, but Athena may request them during review.</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500, marginBottom: 2 }}>
                {status === 'changes_requested' ? 'Ready to resubmit?' : 'Ready to submit for credentialing review?'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                {status === 'changes_requested'
                  ? 'Once you\'ve addressed the requested changes, resubmit for Athena to review.'
                  : 'Athena typically completes credentialing review within 2 business days.'}
              </div>
            </div>
            <button className="btn btn--brand" onClick={() => setConfirming(true)}>
              {status === 'changes_requested' ? 'Resubmit application' : 'Submit for review'}
              <Ic.arrow />
            </button>
          </div>
        </div>
      )}

      {/* Submission confirm modal */}
      {confirming && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,20,18,0.45)', display: 'grid', placeItems: 'center', zIndex: 100 }} onClick={() => setConfirming(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--r-4)', padding: '32px 36px', width: 460, boxShadow: 'var(--sh-3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 12 }}>
              {status === 'changes_requested' ? 'Resubmit your application?' : 'Submit your application?'}
            </div>
            <p style={{ color: 'var(--ink-3)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 10px' }}>
              {done < total
                ? `You have ${total - done} incomplete section${total - done !== 1 ? 's' : ''}. Athena may request them during review, which could delay approval.`
                : 'All sections are complete. Athena will review your application within 2 business days.'}
            </p>
            <p style={{ color: 'var(--ink-3)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 24px' }}>
              You can continue editing while under review if Athena requests changes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn--ghost" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn btn--brand" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><span className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} />Submitting…</> : 'Confirm & submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.Hub = Hub;
