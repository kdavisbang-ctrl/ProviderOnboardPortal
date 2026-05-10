/* global React, Field, Input, Select, Textarea, ChipGrid, RadioPills, Check, Badge, Ic, US_STATES */

// ─── Compounding preferences ───────────────────────
function CompoundingSection({ data, set }) {
  const c = data.compounding;
  const upd = (k, v) => set("compounding", { ...c, [k]: v });

  return (
    <>
      <div className="subsec">
        <h2>Therapeutic categories</h2>
        <p className="sub">Which compounded medication categories will you prescribe? Select all that apply.</p>
        <ChipGrid value={c.categories} onChange={(v) => upd("categories", v)} options={[
          "Hormone replacement (HRT/BHRT)",
          "Weight management (GLP-1, peptides)",
          "Pain management (topicals, troches)",
          "Dermatology (anti-aging, hair loss)",
          "Erectile dysfunction (Tri-mix, Bi-mix)",
          "Pediatrics (flavored, dye-free)",
          "Veterinary",
          "Hospice & palliative",
          "Sports & performance",
          "Mental health (low-dose naltrexone, ketamine)",
        ]} />
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Preferred formulations</h2>
        <p className="sub">Helps Atrium suggest the right base when you prescribe.</p>
        <ChipGrid value={c.formulations} onChange={(v) => upd("formulations", v)} options={[
          "Sublingual troches",
          "Topical creams",
          "Topical gels",
          "Injectable suspensions",
          "Capsules",
          "Suppositories",
          "Oral suspensions",
          "Nasal sprays",
          "Lozenges",
        ]} />
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Sterile compounding</h2>
        <p className="sub">USP &lt;797&gt; sterile preparations require pre-authorization.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Check on={c.sterileNeeded === true} onClick={() => upd("sterileNeeded", true)} label="Yes — I prescribe sterile preparations" desc="Injectables, ophthalmic, IV, sterile pellets" />
          <Check on={c.sterileNeeded === false} onClick={() => upd("sterileNeeded", false)} label="No — non-sterile only" desc="Capsules, troches, topicals, suspensions" />
        </div>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Preferred bases & flavors</h2>
        <p className="sub">Atrium will default to these when formulations are flexible.</p>
        <Field label="Preferred topical bases">
          <ChipGrid value={c.bases} onChange={(v) => upd("bases", v)} options={["VersaBase", "Lipoderm", "PCCA Pluronic", "Aquaphor", "Eucerin", "Pentravan"]} />
        </Field>
        <div style={{ marginTop: 16 }}>
          <Field label="Flavor preferences (oral/peds)">
            <ChipGrid value={c.flavorPrefs} onChange={(v) => upd("flavorPrefs", v)} options={["Bubblegum (peds)", "Cherry", "Grape", "Strawberry", "Bitter mask (adult)", "Mint", "Unflavored"]} />
          </Field>
        </div>
        <div style={{ marginTop: 16 }}>
          <Field label="Prescribing notes" hint="Anything our pharmacists should know about your patients or formulation preferences.">
            <Textarea value={c.notes} onChange={(v) => upd("notes", v)} placeholder="e.g. Prefers cyanocobalamin over methylcobalamin for B12 injections…" rows={3} />
          </Field>
        </div>
      </div>
    </>
  );
}

// ─── Patient population ────────────────────────────
function PatientSection({ data, set }) {
  const p = data.patient;
  const upd = (k, v) => set("patient", { ...p, [k]: v });
  return (
    <>
      <div className="subsec">
        <h2>Volume & population</h2>
        <p className="sub">Helps us right-size your account and stock formulations you prescribe most.</p>
        <Field label="Active patient panel" required>
          <RadioPills value={p.avgPatients} onChange={(v) => upd("avgPatients", v)} options={["<100", "100–200", "200–500", "500–1000", "1000+"]} />
        </Field>
        <div style={{ marginTop: 18 }}>
          <Field label="Estimated monthly Rx to Atrium" required hint="Compounded prescriptions only. We use this to plan inventory.">
            <Input type="number" value={p.monthlyRx} onChange={(v) => upd("monthlyRx", v)} placeholder="75" />
          </Field>
        </div>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Patient populations</h2>
        <p className="sub">What types of patients make up most of your panel?</p>
        <ChipGrid value={p.populations} onChange={(v) => upd("populations", v)} options={[
          "Pediatrics (under 18)", "Adults 18–30", "Adults 30–55", "Adults 55+",
          "Perimenopausal women", "Postmenopausal women", "Men's health",
          "Athletes / performance", "Chronic pain", "Hospice",
        ]} />
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Payment mix</h2>
        <p className="sub">Most compounding is cash-pay. Helps us prepare patient-facing pricing.</p>
        <div className="row-3">
          <Field label="% Cash pay"><Input type="number" value={p.cashPay} onChange={(v) => upd("cashPay", v)} placeholder="80" /></Field>
          <Field label="% Insurance"><Input type="number" value={p.insurancePay} onChange={(v) => upd("insurancePay", v)} placeholder="20" /></Field>
          <Field label="% Rush orders" hint="Same-day or overnight"><Input type="number" value={p.rushPercent} onChange={(v) => upd("rushPercent", v)} placeholder="15" /></Field>
        </div>
      </div>
    </>
  );
}

// ─── Shipping ──────────────────────────────────────
function ShippingSection({ data, set }) {
  const s = data.shipping;

  const setAll = (next) => set("shipping", next);
  const add = () => setAll([...s, { label: "", name: "", attn: "", street: "", city: "", state: "", zip: "", hours: "", primary: s.length === 0 }]);
  const upd = (i, k, v) => {
    const next = [...s];
    next[i] = { ...next[i], [k]: v };
    setAll(next);
  };
  const del = (i) => {
    const next = s.filter((_, ix) => ix !== i);
    if (!next.some((x) => x.primary) && next[0]) next[0].primary = true;
    setAll(next);
  };
  const makePrimary = (i) => setAll(s.map((x, ix) => ({ ...x, primary: ix === i })));

  const [editing, setEditing] = React.useState(null);

  return (
    <>
      <div className="subsec">
        <h2>Where should we ship?</h2>
        <p className="sub">Add every location that should receive compounded medications. Mark one as primary.</p>

        {s.length === 0 && (
          <div style={{ padding: 32, border: "1.5px dashed var(--line-2)", borderRadius: "var(--r-3)", textAlign: "center", color: "var(--ink-3)", background: "var(--panel-2)" }}>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 10 }}>No ship-to locations yet.</div>
            <button className="btn btn--brand btn--sm" onClick={add}><Ic.plus />Add your first location</button>
          </div>
        )}

        {s.map((loc, i) => editing === i ? (
          <ShipForm key={i} value={loc} onSave={(v) => { upd(i, "label", v.label); ["name","attn","street","city","state","zip","hours"].forEach(k => upd(i, k, v[k])); setEditing(null); }} onCancel={() => setEditing(null)} />
        ) : (
          <div key={i} className={"ship-card" + (loc.primary ? " primary" : "")}>
            <div>
              <h4>{loc.label || "Untitled location"} {loc.primary && <Badge kind="brand">Primary</Badge>}</h4>
              <div className="addr">
                {loc.name}<br/>
                {loc.attn && <>Attn: {loc.attn}<br/></>}
                {loc.street}<br/>
                {loc.city}{loc.city && loc.state ? ", " : ""}{loc.state} {loc.zip}<br/>
                {loc.hours && <span style={{ color: "var(--ink-3)" }}>Receiving hours: {loc.hours}</span>}
              </div>
            </div>
            <div className="ship-act">
              {!loc.primary && <button className="btn btn--ghost btn--sm" onClick={() => makePrimary(i)}>Make primary</button>}
              <button className="btn btn--icon" onClick={() => setEditing(i)}><Ic.edit /></button>
              <button className="btn btn--icon" onClick={() => del(i)}><Ic.trash /></button>
            </div>
          </div>
        ))}

        {s.length > 0 && (
          <button className="add-row" onClick={add} style={{ marginTop: 10 }}>
            <Ic.plus style={{ verticalAlign: "middle", marginRight: 6 }} />Add another ship-to location
          </button>
        )}
      </div>
    </>
  );
}

function ShipForm({ value, onSave, onCancel }) {
  const [v, setV] = React.useState(value);
  const upd = (k, x) => setV({ ...v, [k]: x });
  return (
    <div style={{ border: "1px solid var(--brand)", borderRadius: "var(--r-3)", padding: 18, background: "var(--brand-soft)" }}>
      <div className="form">
        <div className="row-12">
          <Field label="Label"><Input value={v.label} onChange={(x) => upd("label", x)} placeholder="Main office" /></Field>
          <Field label="Practice name"><Input value={v.name} onChange={(x) => upd("name", x)} placeholder="Bayview Wellness Medical Group" /></Field>
        </div>
        <Field label="Attention to (optional)" hint="Who should sign for the package?"><Input value={v.attn} onChange={(x) => upd("attn", x)} placeholder="Maria Lopez, Pharm Tech" /></Field>
        <Field label="Street address" required><Input value={v.street} onChange={(x) => upd("street", x)} placeholder="2240 Lombard St, Suite 4" /></Field>
        <div className="row-3">
          <Field label="City"><Input value={v.city} onChange={(x) => upd("city", x)} /></Field>
          <Field label="State"><Select value={v.state} onChange={(x) => upd("state", x)} placeholder="—" options={US_STATES} /></Field>
          <Field label="ZIP"><Input mono value={v.zip} onChange={(x) => upd("zip", x)} maxLength={5} /></Field>
        </div>
        <Field label="Receiving hours" hint="When can someone accept a delivery?"><Input value={v.hours} onChange={(x) => upd("hours", x)} placeholder="M–F 8a–6p" /></Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
        <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--brand" onClick={() => onSave(v)}>Save location</button>
      </div>
    </div>
  );
}

// ─── Billing ───────────────────────────────────────
function BillingSection({ data, set }) {
  const b = data.billing;
  const upd = (k, v) => set("billing", { ...b, [k]: v });
  return (
    <>
      <div className="subsec">
        <h2>Payment method</h2>
        <p className="sub">How will the practice pay Atrium for compounded medications?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Check on={b.method === "ACH"} onClick={() => upd("method", "ACH")} label="ACH bank transfer" desc="Lowest fees · Net 30 default" />
          <Check on={b.method === "Card"} onClick={() => upd("method", "Card")} label="Credit card on file" desc="3% surcharge · charged on ship" />
          <Check on={b.method === "Wire"} onClick={() => upd("method", "Wire")} label="Wire transfer" desc="For volume accounts · prepaid" />
        </div>
      </div>

      {b.method === "ACH" && (
        <>
          <hr className="divider" />
          <div className="subsec">
            <h2>Bank account</h2>
            <p className="sub">Encrypted at rest. Atrium uses Plaid for instant verification.</p>
            <div className="form">
              <Field label="Account holder name" required><Input value={b.accountName} onChange={(v) => upd("accountName", v)} placeholder="Practice legal name" /></Field>
              <div className="row-2">
                <Field label="Routing number" required><Input mono value={b.routing} onChange={(v) => upd("routing", v)} placeholder="000000000" maxLength={9} /></Field>
                <Field label="Account number" required hint="Will be masked after save"><Input mono value={b.accountLast4 ? `••••${b.accountLast4}` : ""} onChange={(v) => upd("accountLast4", v.slice(-4))} placeholder="0000000000" /></Field>
              </div>
            </div>
          </div>
        </>
      )}

      <hr className="divider" />

      <div className="subsec">
        <h2>Statements & terms</h2>
        <div className="form">
          <Field label="Statements email" required hint="Monthly invoice & shipment summaries"><Input value={b.statementEmail} onChange={(v) => upd("statementEmail", v)} placeholder="billing@practice.com" /></Field>
          <Field label="Net terms"><RadioPills value={b.netTerms} onChange={(v) => upd("netTerms", v)} options={["Due on receipt", "Net 15", "Net 30", "Net 45"]} /></Field>
        </div>
      </div>
    </>
  );
}

// ─── EHR ───────────────────────────────────────────
function EhrSection({ data, set }) {
  const e = data.ehr;
  const upd = (k, v) => set("ehr", { ...e, [k]: v });
  return (
    <>
      <div className="subsec">
        <h2>EHR system</h2>
        <p className="sub">If you e-prescribe, we'll route refill requests back into your EHR via Surescripts.</p>
        <Field label="Primary EHR" required>
          <Select value={e.system} onChange={(v) => upd("system", v)} placeholder="Select…" options={["Athena", "Epic", "Cerner", "eClinicalWorks", "Practice Fusion", "DrChrono", "Kareo", "AdvancedMD", "NextGen", "None / paper"]} />
        </Field>
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>E-prescribing</h2>
        <p className="sub">Atrium accepts e-prescriptions via Surescripts. Faxed Rx is also supported.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <Check on={e.erxEnabled} onClick={() => upd("erxEnabled", true)} label="Yes — I e-prescribe" desc="Faster turnaround, fewer transcription errors" />
          <Check on={!e.erxEnabled} onClick={() => upd("erxEnabled", false)} label="Fax / paper Rx only" desc="We'll provide our compound-specific fax form" />
        </div>
        {e.erxEnabled && (
          <div className="form fade-up">
            <div className="row-2">
              <Field label="Surescripts SPI" required hint="Service Provider Identifier"><Input mono value={e.surescriptsId} onChange={(v) => upd("surescriptsId", v)} placeholder="SPI-000000" /></Field>
              <Field label="Inbound eFax (refills)"><Input value={e.eFax} onChange={(v) => upd("eFax", v)} placeholder="(415) 555-0100" /></Field>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Staff ─────────────────────────────────────────
function StaffSection({ data, set }) {
  const list = data.staff;
  const setAll = (n) => set("staff", n);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: "", role: "", email: "", access: "Order entry" });

  const initials = (n) => n.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const accessBadge = (a) => a === "Full" ? "ok" : a === "Prescribe" ? "brand" : "mute";

  return (
    <>
      <div className="subsec">
        <h2>Team members</h2>
        <p className="sub">Add staff who will place orders, manage refills, or receive shipment notifications.</p>

        {list.length > 0 ? (
          <div className="staff-table">
            <div className="th">
              <div>Name</div>
              <div>Role</div>
              <div>Email</div>
              <div>Access level</div>
              <div></div>
            </div>
            {list.map((m, i) => (
              <div className="td" key={i}>
                <div className="name">
                  <div className={"av" + (i === 0 ? " brand" : "")}>{initials(m.name)}</div>
                  <div>
                    <b>{m.name}</b>
                  </div>
                </div>
                <div className="role">{m.role}</div>
                <div style={{ color: "var(--ink-2)" }}>{m.email}</div>
                <div><Badge kind={accessBadge(m.access)}>{m.access}</Badge></div>
                <div><button className="del" onClick={() => setAll(list.filter((_, ix) => ix !== i))}><Ic.trash /></button></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 32, border: "1.5px dashed var(--line-2)", borderRadius: "var(--r-3)", textAlign: "center", color: "var(--ink-3)", background: "var(--panel-2)" }}>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 10 }}>No staff added yet.</div>
            <button className="btn btn--brand btn--sm" onClick={() => setOpen(true)}><Ic.plus />Add a team member</button>
          </div>
        )}

        {list.length > 0 && !open && (
          <button className="add-row" onClick={() => setOpen(true)} style={{ marginTop: 10 }}>
            <Ic.plus style={{ verticalAlign: "middle", marginRight: 6 }} />Invite another team member
          </button>
        )}

        {open && (
          <div style={{ marginTop: 12, border: "1px solid var(--brand)", borderRadius: "var(--r-3)", padding: 18, background: "var(--brand-soft)" }}>
            <div className="form">
              <div className="row-2">
                <Field label="Full name" required><Input value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Daniel Reyes" /></Field>
                <Field label="Role"><Input value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} placeholder="Office Manager" /></Field>
              </div>
              <Field label="Email" required hint="Used for portal invitation"><Input value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} placeholder="name@practice.com" /></Field>
              <Field label="Access level" required>
                <RadioPills value={draft.access} onChange={(v) => setDraft({ ...draft, access: v })} options={["View only", "Order entry", "Prescribe", "Full"]} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button className="btn btn--ghost" onClick={() => { setOpen(false); setDraft({ name: "", role: "", email: "", access: "Order entry" }); }}>Cancel</button>
              <button className="btn btn--brand" disabled={!draft.name || !draft.email} onClick={() => { setAll([...list, draft]); setOpen(false); setDraft({ name: "", role: "", email: "", access: "Order entry" }); }}>Send invitation</button>
            </div>
          </div>
        )}

        <div className="callout" style={{ marginTop: 16 }}>
          <div className="ic"><Ic.info /></div>
          <div>
            <strong>Access levels:</strong> View only sees orders; Order entry can place orders for existing patients; Prescribe requires NPI on file; Full grants admin access including billing.
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Attestation ───────────────────────────────────
function AttestSection({ data, set }) {
  const a = data.attestations;
  const upd = (k, v) => set("attestations", { ...a, [k]: v });
  const padRef = React.useRef(null);

  // Simple "scribble" signature — track pointer paths
  const [paths, setPaths] = React.useState([]);
  const [drawing, setDrawing] = React.useState(false);

  React.useEffect(() => { if (!a.signed) setPaths([]); }, [a.signed]);

  const start = (e) => {
    setDrawing(true);
    const r = padRef.current.getBoundingClientRect();
    setPaths([...paths, [{ x: e.clientX - r.left, y: e.clientY - r.top }]]);
  };
  const move = (e) => {
    if (!drawing) return;
    const r = padRef.current.getBoundingClientRect();
    const last = paths[paths.length - 1];
    last.push({ x: e.clientX - r.left, y: e.clientY - r.top });
    setPaths([...paths.slice(0, -1), last]);
  };
  const end = () => {
    setDrawing(false);
    if (paths.length > 0 && paths.some((p) => p.length > 4)) {
      upd("signed", true);
      if (!a.signedDate) upd("signedDate", new Date().toISOString().slice(0, 10));
    }
  };
  const clear = () => { setPaths([]); upd("signed", false); upd("signedDate", ""); };

  const items = [
    { k: "truthful", h: "Truth & accuracy", b: "I attest that all information provided in this onboarding is true and accurate to the best of my knowledge, and I will notify Atrium within 30 days of any material change." },
    { k: "boardStanding", h: "Active license & good standing", b: "I am currently licensed and in good standing in every state listed, with no pending or unresolved disciplinary actions by any state medical board." },
    { k: "noSanctions", h: "No federal exclusions", b: "I am not currently excluded, debarred, or otherwise ineligible to participate in any federal healthcare program, and I am not listed on the OIG LEIE or GSA SAM exclusion lists." },
    { k: "hipaa", h: "HIPAA Business Associate Agreement", b: "I have read and agree to Atrium's Business Associate Agreement and will safeguard PHI in accordance with HIPAA Privacy and Security Rules." },
    { k: "usp", h: "USP <795> & <797> awareness", b: "I understand that compounded medications are prepared per USP <795> (non-sterile) and <797> (sterile) standards, are not FDA-approved, and are intended for the specific patient on each prescription." },
    { k: "samHsa", h: "Office use only / dispensing", b: "I will not redistribute, resell, or dispense compounded medications received from Atrium except in accordance with applicable state and federal law (office-use thresholds, in-office administration where permitted)." },
  ];

  return (
    <>
      <div className="subsec">
        <h2>Compliance attestations</h2>
        <p className="sub">Please review and acknowledge each statement below.</p>
        {items.map((it) => (
          <div key={it.k} className={"attest" + (a[it.k] ? " on" : "")} onClick={() => upd(it.k, !a[it.k])}>
            <div className="box"><Ic.check /></div>
            <div>
              <h4>{it.h}</h4>
              <p>{it.b}</p>
            </div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="subsec">
        <h2>Provider signature</h2>
        <p className="sub">By signing below, I confirm I am the prescriber identified above and acknowledge all attestations.</p>
        <div className="form">
          <div className="row-2">
            <Field label="Print full name" required><Input value={a.signedName} onChange={(v) => upd("signedName", v)} placeholder="Marina E. Castellano, MD" /></Field>
            <Field label="Date" required><Input type="date" value={a.signedDate} onChange={(v) => upd("signedDate", v)} /></Field>
          </div>
          <Field label="Signature" hint="Use your mouse or trackpad to sign in the box below.">
            <div className={"signpad" + (a.signed ? " signed" : "")} ref={padRef}
              onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}>
              <div className="ph">Sign here</div>
              <div className="baseline"></div>
              <div className="x">×</div>
              <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                {paths.map((p, i) => (
                  <polyline key={i}
                    points={p.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                    fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                ))}
              </svg>
            </div>
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={clear}>Clear signature</button>
            {a.signed && <Badge kind="ok">Signed {a.signedDate}</Badge>}
          </div>
        </div>
      </div>
    </>
  );
}

window.CompoundingSection = CompoundingSection;
window.PatientSection = PatientSection;
window.ShippingSection = ShippingSection;
window.BillingSection = BillingSection;
window.EhrSection = EhrSection;
window.StaffSection = StaffSection;
window.AttestSection = AttestSection;
