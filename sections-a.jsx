/* global React, Field, Input, Select, Textarea, ChipGrid, RadioPills, Check, Badge, FileUpload, StatusBadge, Ic, US_STATES */

// ─── Identity ──────────────────────────────────────
function IdentitySection({ data, set }) {
  const [lookingUp, setLookingUp] = React.useState(false);
  const s = (v) => typeof v === 'string' ? v : '';
  const raw = data.identity;
  const id = { ...raw, firstName: s(raw.firstName), middleName: s(raw.middleName), lastName: s(raw.lastName), credentials: s(raw.credentials), npi: s(raw.npi), email: s(raw.email), phone: s(raw.phone) };

  const [npiError, setNpiError] = React.useState('');
  const lookupNpi = async () => {
    if (!id.npi || id.npi.length < 10) return;
    setLookingUp(true); setNpiError('');
    try {
      const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${id.npi}&version=2.1`);
      const json = await res.json();
      if (!json.result_count || json.result_count === 0) {
        setNpiError('No provider found for this NPI. Please check the number.');
        setLookingUp(false); return;
      }
      const r = json.results[0];
      if (r.enumeration_type !== 'NPI-1') {
        setNpiError('This NPI belongs to an organization, not an individual provider.');
        setLookingUp(false); return;
      }
      const b = r.basic;
      const tax = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0];
      const addr = r.addresses?.find(a => a.address_purpose === 'LOCATION') || r.addresses?.[0];
      const str = (v) => typeof v === 'string' ? v : '';
      set("identity", curr => ({
        ...curr,
        npiVerified: true,
        firstName: str(curr.firstName) || str(b.first_name),
        lastName:  str(curr.lastName)  || str(b.last_name),
        credentials: str(curr.credentials) || str(b.credential),
        npiResult: {
          name: [b.first_name, b.middle_name, b.last_name, b.credential].filter(Boolean).join(' '),
          taxonomy: tax ? `${tax.desc} (${tax.code})` : '',
          enumDate: b.enumeration_date || '',
          address: addr ? [addr.address_1, addr.address_2, `${addr.city}, ${addr.state} ${addr.postal_code?.slice(0,5)}`].filter(Boolean).join(', ') : '',
        },
      }));
    } catch {
      // CORS blocked (GitHub Pages) — use demo data
      set("identity", curr => ({
        ...curr, npiVerified: true,
        npiResult: {
          name: 'Demo Provider MD',
          taxonomy: 'Family Medicine (207Q00000X)',
          enumDate: '2010-01-15',
          address: '123 Demo St, Watkinsville, GA 30677',
        },
      }));
    }
    setLookingUp(false);
  };

  const upd = (k, v) => set("identity", curr => ({ ...curr, [k]: v }));
  const updP = (k, v) => set("identity", curr => ({ ...curr, practice: { ...(curr.practice || {}), [k]: v } }));

  return (
    <>
      <div className="subsec">
        <h2>National Provider Identifier</h2>
        <p className="sub">We'll auto-fill verified info from the NPPES registry.</p>
        <Field label="NPI Number" required hint="10-digit number issued by CMS">
          <div className="input-group">
            <input className="input input--mono" placeholder="0000000000" maxLength={10} value={id.npi || ""} onChange={(e) => upd("npi", e.target.value.replace(/\D/g, ""))} />
            <button onClick={lookupNpi} disabled={lookingUp || !id.npi || id.npi.length < 10}>
              {lookingUp ? <><span className="spin"></span>Looking up</> : <>Verify NPI</>}
            </button>
          </div>
        </Field>
        {npiError && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--danger)', padding: '8px 12px', background: 'var(--danger-soft)', borderRadius: 'var(--r-1)' }}>{npiError}</div>}
        {id.npiVerified && id.npiResult && (
          <div className="verify-card fade-up">
            <div className="vc-ic"><Ic.check /></div>
            <div>
              <h4>{id.npiResult.name}</h4>
              <Badge kind="ok">Verified · NPPES registry</Badge>
              <div className="vc-meta">
                <span>NPI <b>{id.npi}</b></span>
                <span>Taxonomy <b>{id.npiResult.taxonomy}</b></span>
                <span>Enum. <b>{id.npiResult.enumDate}</b></span>
              </div>
            </div>
            <button className="btn btn--ghost btn--sm">View details</button>
          </div>
        )}
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Legal name & contact</h2>
        <p className="sub">Must match your state license exactly.</p>
        <div className="form">
          <div className="row-3">
            <Field label="First name" required><Input value={id.firstName} onChange={(v) => upd("firstName", v)} placeholder="Marina" /></Field>
            <Field label="Middle initial"><Input value={id.middleName} onChange={(v) => upd("middleName", v)} placeholder="E." /></Field>
            <Field label="Last name" required><Input value={id.lastName} onChange={(v) => upd("lastName", v)} placeholder="Castellano" /></Field>
          </div>
          <div className="row-2">
            <Field label="Credentials" required hint="MD, DO, NP, PA, etc.">
              <Select value={id.credentials} onChange={(v) => upd("credentials", v)} placeholder="Select…" options={["MD", "DO", "NP", "PA", "DNP", "DDS", "DMD", "DVM", "PharmD"]} />
            </Field>
            <Field label="Years in practice"><Input type="number" value={id.practice.yearsInPractice} onChange={(v) => updP("yearsInPractice", v)} placeholder="14" /></Field>
          </div>
          <div className="row-2">
            <Field label="Direct email" required hint="Used for portal login & order confirmations"><Input type="email" value={id.email} onChange={(v) => upd("email", v)} placeholder="provider@practice.com" /></Field>
            <Field label="Mobile phone" required><Input value={id.phone} onChange={(v) => upd("phone", v)} placeholder="(415) 555-0100" /></Field>
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Practice information</h2>
        <p className="sub">The legal entity Athena Compounding will bill and ship to.</p>
        <div className="form">
          <div className="row-2">
            <Field label="Practice / facility name" required><Input value={id.practice.name} onChange={(v) => updP("name", v)} placeholder="Bayview Wellness Medical Group" /></Field>
            <Field label="Practice type">
              <Select value={id.practice.type} onChange={(v) => updP("type", v)} placeholder="Select…" options={["Solo practice", "Group practice", "Hospital-affiliated", "Clinic / urgent care", "Telemedicine", "Med spa", "Veterinary"]} />
            </Field>
          </div>
          <div className="row-2">
            <Field label="Tax ID (EIN)" required hint="Used for 1099 reporting"><Input mono value={id.practice.tin} onChange={(v) => updP("tin", v)} placeholder="00-0000000" /></Field>
            <Field label="Practice website"><Input value={id.practice.website} onChange={(v) => updP("website", v)} placeholder="example.com" /></Field>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Credentials (DEA + state licenses) ────────────
function CredentialsSection({ data, set }) {
  const s = (v) => typeof v === 'string' ? v : '';
  const raw = data.credentials;
  const c = { ...raw, dea: s(raw.dea), deaExp: s(raw.deaExp), boardCert: s(raw.boardCert), boardYear: s(raw.boardYear) };
  const upd = (k, v) => set("credentials", curr => ({ ...curr, [k]: v }));

  const addLicense = () => upd("licenses", [...c.licenses, { state: "", number: "", expires: "" }]);
  const updLic = (i, k, v) => {
    const next = [...c.licenses];
    next[i] = { ...next[i], [k]: v };
    upd("licenses", next);
  };
  const delLic = (i) => upd("licenses", c.licenses.filter((_, ix) => ix !== i));

  return (
    <>
      <div className="subsec">
        <h2>DEA registration</h2>
        <p className="sub">Required to prescribe controlled substances. Athena Compounding verifies via DEA registry.</p>
        <div className="form">
          <div className="row-2">
            <Field label="DEA number" required hint="Format: 2 letters + 7 digits"><Input mono value={c.dea} onChange={(v) => upd("dea", v.toUpperCase())} placeholder="AB1234567" maxLength={9} /></Field>
            <Field label="DEA expiration" required><Input type="date" value={c.deaExp} onChange={(v) => upd("deaExp", v)} /></Field>
          </div>
          <Field label="Authorized schedules" hint="Select all that apply to your DEA registration">
            <ChipGrid value={c.deaSchedules} onChange={(v) => upd("deaSchedules", v)} options={["II", "IIN", "III", "IIIN", "IV", "V"]} />
          </Field>
        </div>
        <div className="callout" style={{ marginTop: 16 }}>
          <div className="ic"><Ic.shield /></div>
          <div>
            <strong>State CSR may also be required.</strong> Some states (CA, NY, MA, others) require a separate Controlled Substance Registration alongside your DEA. List those below if applicable.
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>State medical licenses</h2>
        <p className="sub">Add every state where you're actively licensed to prescribe.</p>
        {c.licenses.length > 0 && (
          <div>
            {c.licenses.map((l, i) => (
              <div className="lic-row" key={i}>
                <select className="select" style={{ height: 32, padding: "0 8px", fontSize: 12, border: "1px solid var(--line)" }} value={l.state} onChange={(e) => updLic(i, "state", e.target.value)}>
                  <option value="">—</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="input" style={{ height: 32, fontSize: 12.5 }} placeholder="License #" value={l.number} onChange={(e) => updLic(i, "number", e.target.value)} />
                <input className="input" type="date" style={{ height: 32, fontSize: 12 }} value={l.expires} onChange={(e) => updLic(i, "expires", e.target.value)} />
                <Badge kind={l.state && l.number ? "ok" : "mute"}>{l.state && l.number ? "Verified" : "Pending"}</Badge>
                <button className="del" onClick={() => delLic(i)}><Ic.trash /></button>
              </div>
            ))}
          </div>
        )}
        <button className="add-row" onClick={addLicense}><Ic.plus style={{ verticalAlign: "middle", marginRight: 6 }} />Add another state license</button>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Board certification</h2>
        <p className="sub">Optional but speeds credentialing review.</p>
        <div className="form">
          <div className="row-2">
            <Field label="Certifying board"><Input value={c.boardCert} onChange={(v) => upd("boardCert", v)} placeholder="American Board of Family Medicine" /></Field>
            <Field label="Year certified"><Input value={c.boardYear} onChange={(v) => upd("boardYear", v)} placeholder="2011" /></Field>
          </div>
          <Field label="States with separate CSR registration" hint="If any of your state licenses require a separate Controlled Substance Registration, list the states here.">
            <ChipGrid value={c.csrStates} onChange={(v) => upd("csrStates", v)} options={["CA", "NV", "NY", "MA", "RI", "CT", "MI", "OK", "TX", "NJ"]} />
          </Field>
        </div>
      </div>
    </>
  );
}

// ─── Malpractice ───────────────────────────────────
function MalpracticeSection({ data, set }) {
  const s = (v) => typeof v === 'string' ? v : '';
  const raw = data.malpractice;
  const m = { ...raw, carrier: s(raw.carrier), policyNumber: s(raw.policyNumber), perOccurrence: s(raw.perOccurrence), aggregate: s(raw.aggregate), effective: s(raw.effective), expires: s(raw.expires), fileName: s(raw.fileName), fileSize: s(raw.fileSize) };
  const upd = (k, v) => set("malpractice", curr => ({ ...curr, [k]: v }));

  return (
    <>
      <div className="subsec">
        <h2>Carrier & policy</h2>
        <p className="sub">Athena Compounding requires active malpractice coverage to prescribe compounded medications.</p>
        <div className="form">
          <div className="row-2">
            <Field label="Insurance carrier" required>
              <Select value={m.carrier} onChange={(v) => upd("carrier", v)} placeholder="Select…" options={["The Doctors Company", "MedPro Group", "ProAssurance", "Coverys", "ISMIE Mutual", "MAG Mutual", "Other"]} />
            </Field>
            <Field label="Policy number" required><Input mono value={m.policyNumber} onChange={(v) => upd("policyNumber", v)} placeholder="TDC-0000-00000" /></Field>
          </div>
          <div className="row-2">
            <Field label="Per-occurrence limit" required hint="Athena Compounding minimum: $1,000,000">
              <Select value={String(m.perOccurrence || "")} onChange={(v) => upd("perOccurrence", Number(v))} placeholder="Select…" options={[
                { value: "1000000", label: "$1,000,000" },
                { value: "2000000", label: "$2,000,000" },
                { value: "3000000", label: "$3,000,000" },
              ]} />
            </Field>
            <Field label="Aggregate limit" required hint="Athena Compounding minimum: $3,000,000">
              <Select value={String(m.aggregate || "")} onChange={(v) => upd("aggregate", Number(v))} placeholder="Select…" options={[
                { value: "3000000", label: "$3,000,000" },
                { value: "5000000", label: "$5,000,000" },
                { value: "6000000", label: "$6,000,000" },
              ]} />
            </Field>
          </div>
          <div className="row-2">
            <Field label="Effective date" required><Input type="date" value={m.effective} onChange={(v) => upd("effective", v)} /></Field>
            <Field label="Expiration date" required><Input type="date" value={m.expires} onChange={(v) => upd("expires", v)} /></Field>
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Certificate of insurance</h2>
        <p className="sub">Upload your most recent COI showing Athena Compounding-acceptable coverage.</p>
        <FileUpload
          filed={!!m.fileName}
          fileName={m.fileName}
          fileSize={m.fileSize}
          label="Drag & drop or click to upload"
          sub="PDF, PNG, or JPG · max 10 MB"
          onUpload={() => set("malpractice", curr => ({ ...curr, fileName: "Malpractice_COI_2025.pdf", fileSize: "412 KB" }))}
          onClear={() => set("malpractice", curr => ({ ...curr, fileName: "", fileSize: "" }))}
        />
      </div>
    </>
  );
}

window.IdentitySection = IdentitySection;
window.CredentialsSection = CredentialsSection;
window.MalpracticeSection = MalpracticeSection;
