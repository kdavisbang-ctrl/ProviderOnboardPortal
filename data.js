// Demo seed data for Athena Compounding provider onboarding

window.DEMO_DATA = {
  identity: {
    firstName: "Marina",
    middleName: "E.",
    lastName: "Castellano",
    credentials: "MD",
    email: "m.castellano@bayviewwellness.com",
    phone: "(415) 555-0188",
    npi: "1437129854",
    npiVerified: true,
    npiResult: {
      name: "MARINA E CASTELLANO MD",
      taxonomy: "Family Medicine (207Q00000X)",
      enumDate: "2009-04-12",
      address: "2240 Lombard St, San Francisco, CA 94123",
    },
    practice: {
      name: "Bayview Wellness Medical Group",
      type: "Group practice",
      tin: "82-4419372",
      website: "bayviewwellness.com",
      yearsInPractice: 14,
    },
  },
  credentials: {
    dea: "BC4582197",
    deaExp: "2027-03-31",
    deaSchedules: ["II", "III", "IV", "V"],
    licenses: [
      { state: "CA", number: "A-128340", expires: "2026-11-30" },
      { state: "NV", number: "MD-19284", expires: "2026-08-15" },
      { state: "OR", number: "MD-30192", expires: "2027-02-01" },
    ],
    boardCert: "American Board of Family Medicine",
    boardYear: "2011",
    csrStates: ["CA", "NV"],
  },
  malpractice: {
    carrier: "The Doctors Company",
    policyNumber: "TDC-9082-44218",
    perOccurrence: 1000000,
    aggregate: 3000000,
    effective: "2025-01-01",
    expires: "2026-01-01",
    fileName: "Malpractice_COI_2025.pdf",
    fileSize: "412 KB",
  },
  compounding: {
    categories: [
      "Hormone replacement (HRT/BHRT)",
      "Weight management (GLP-1, peptides)",
      "Pain management (topicals, troches)",
    ],
    formulations: ["Sublingual troches", "Topical creams", "Injectable suspensions", "Capsules"],
    bases: ["VersaBase", "Lipoderm", "PCCA Pluronic"],
    sterileNeeded: true,
    flavorPrefs: ["Bubblegum (peds)", "Bitter mask (adult)"],
    notes: "Prefers semaglutide 2.5mg/mL with B12 (cyanocobalamin) — patients tolerate better than methylcobalamin.",
  },
  patient: {
    avgPatients: "200–500",
    monthlyRx: 75,
    rushPercent: 15,
    cashPay: 80,
    insurancePay: 20,
    populations: ["Adults 30–55", "Perimenopausal women", "Athletes / performance"],
  },
  shipping: [
    {
      label: "Bayview Wellness — Lombard",
      name: "Bayview Wellness Medical Group",
      attn: "Maria Lopez, Pharm Tech",
      street: "2240 Lombard St, Suite 4",
      city: "San Francisco",
      state: "CA",
      zip: "94123",
      hours: "M–F 8a–6p",
      primary: true,
    },
    {
      label: "Bayview Wellness — Marin",
      name: "Bayview Wellness Marin",
      attn: "Front Desk",
      street: "100 Drakes Landing Rd",
      city: "Greenbrae",
      state: "CA",
      zip: "94904",
      hours: "T/Th 9a–5p",
      primary: false,
    },
  ],
  billing: {
    method: "ACH",
    accountName: "Bayview Wellness Medical Group LLC",
    routing: "121000248",
    accountLast4: "8821",
    statementEmail: "billing@bayviewwellness.com",
    netTerms: "Net 30",
  },
  ehr: {
    system: "Athena",
    erxEnabled: true,
    surescriptsId: "SPI-848291",
    eFax: "(415) 555-0107",
  },
  staff: [
    { name: "Marina Castellano", role: "Provider — Owner", email: "m.castellano@bayviewwellness.com", access: "Full" },
    { name: "Daniel Reyes", role: "Office Manager", email: "d.reyes@bayviewwellness.com", access: "Full" },
    { name: "Maria Lopez", role: "Pharmacy Tech", email: "m.lopez@bayviewwellness.com", access: "Order entry" },
    { name: "Jenna Park, NP", role: "Nurse Practitioner", email: "j.park@bayviewwellness.com", access: "Prescribe" },
  ],
  attestations: {
    truthful: true,
    boardStanding: true,
    noSanctions: true,
    hipaa: true,
    usp: true,
    samHsa: true,
    signed: false,
    signedName: "",
    signedDate: "",
  },
};

window.EMPTY_DATA = {
  identity: {
    firstName: "", middleName: "", lastName: "", credentials: "",
    email: "", phone: "",
    npi: "", npiVerified: false, npiResult: null,
    practice: { name: "", type: "", tin: "", website: "", yearsInPractice: "" },
  },
  credentials: { dea: "", deaExp: "", deaSchedules: [], licenses: [], boardCert: "", boardYear: "", csrStates: [] },
  malpractice: { carrier: "", policyNumber: "", perOccurrence: "", aggregate: "", effective: "", expires: "", fileName: "", fileSize: "" },
  compounding: { categories: [], formulations: [], bases: [], sterileNeeded: false, flavorPrefs: [], notes: "" },
  patient: { avgPatients: "", monthlyRx: "", rushPercent: "", cashPay: "", insurancePay: "", populations: [] },
  shipping: [],
  billing: { method: "", accountName: "", routing: "", accountLast4: "", statementEmail: "", netTerms: "" },
  ehr: { system: "", erxEnabled: false, surescriptsId: "", eFax: "" },
  staff: [],
  attestations: { truthful: false, boardStanding: false, noSanctions: false, hipaa: false, usp: false, samHsa: false, signed: false, signedName: "", signedDate: "" },
};

// Section catalog — drives nav, hub tiles, completion calc
window.SECTIONS = [
  {
    id: "identity",
    num: "01",
    title: "Provider Identity & Practice",
    blurb: "Legal name, NPI, contact, and the practice you bill under.",
    fields: 11,
    minutes: 3,
    isComplete: (d) => !!(d.identity?.firstName && d.identity?.lastName && d.identity?.npi && d.identity?.npiVerified && d.identity?.email && d.identity?.practice?.name),
    progress: (d) => {
      const f = [d.identity?.firstName, d.identity?.lastName, d.identity?.email, d.identity?.phone, d.identity?.npi, d.identity?.practice?.name, d.identity?.practice?.tin];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "credentials",
    num: "02",
    title: "Licenses & DEA",
    blurb: "State medical licenses, DEA registration, and board certification.",
    fields: 8,
    minutes: 4,
    isComplete: (d) => !!(d.credentials?.dea && d.credentials?.licenses?.length > 0 && d.credentials?.boardCert),
    progress: (d) => {
      const f = [d.credentials?.dea, d.credentials?.deaExp, (d.credentials?.licenses?.length ?? 0) > 0, d.credentials?.boardCert];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "malpractice",
    num: "03",
    title: "Malpractice Insurance",
    blurb: "Carrier, policy limits, and certificate of insurance upload.",
    fields: 6,
    minutes: 2,
    isComplete: (d) => !!(d.malpractice?.carrier && d.malpractice?.policyNumber && d.malpractice?.fileName),
    progress: (d) => {
      const f = [d.malpractice?.carrier, d.malpractice?.policyNumber, d.malpractice?.perOccurrence, d.malpractice?.expires, d.malpractice?.fileName];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "compounding",
    num: "04",
    title: "Compounding Preferences",
    blurb: "What you prescribe, preferred bases, sterile vs. non-sterile.",
    fields: 5,
    minutes: 3,
    isComplete: (d) => (d.compounding?.categories?.length ?? 0) > 0 && (d.compounding?.formulations?.length ?? 0) > 0,
    progress: (d) => {
      const f = [(d.compounding?.categories?.length ?? 0) > 0, (d.compounding?.formulations?.length ?? 0) > 0, (d.compounding?.bases?.length ?? 0) > 0];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "patient",
    num: "05",
    title: "Patient Population & Volume",
    blurb: "Estimated monthly Rx volume, populations, and payment mix.",
    fields: 5,
    minutes: 2,
    isComplete: (d) => !!(d.patient?.avgPatients && d.patient?.monthlyRx),
    progress: (d) => {
      const f = [d.patient?.avgPatients, d.patient?.monthlyRx, (d.patient?.populations?.length ?? 0) > 0];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "shipping",
    num: "06",
    title: "Ship-to Locations",
    blurb: "Where finished compounds are delivered. Add as many as needed.",
    fields: 4,
    minutes: 2,
    isComplete: (d) => (d.shipping?.length ?? 0) > 0 && d.shipping.some((s) => s.primary),
    progress: (d) => ((d.shipping?.length ?? 0) > 0 ? 1 : 0),
  },
  {
    id: "billing",
    num: "07",
    title: "Payment & Billing",
    blurb: "Payment method, terms, and statement delivery.",
    fields: 5,
    minutes: 2,
    isComplete: (d) => !!(d.billing?.method && d.billing?.statementEmail),
    progress: (d) => {
      const f = [d.billing?.method, d.billing?.accountName, d.billing?.statementEmail, d.billing?.netTerms];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "ehr",
    num: "08",
    title: "EHR & E-Prescribe",
    blurb: "Surescripts SPI, EHR system, and eFax for refill requests.",
    fields: 4,
    minutes: 1,
    isComplete: (d) => !!(d.ehr?.system && d.ehr?.surescriptsId),
    progress: (d) => {
      const f = [d.ehr?.system, d.ehr?.surescriptsId, d.ehr?.eFax];
      return f.filter(Boolean).length / f.length;
    },
  },
  {
    id: "staff",
    num: "09",
    title: "Delegated Staff",
    blurb: "Team members who can place orders or view patient records.",
    fields: 3,
    minutes: 2,
    isComplete: (d) => (d.staff?.length ?? 0) > 0,
    progress: (d) => ((d.staff?.length ?? 0) > 0 ? 1 : 0),
  },
  {
    id: "attest",
    num: "10",
    title: "Compliance & Signature",
    blurb: "HIPAA, USP <795>/<797> attestations, and provider e-signature.",
    fields: 7,
    minutes: 3,
    isComplete: (d) => !!(d.attestations?.truthful && d.attestations?.boardStanding && d.attestations?.hipaa && d.attestations?.usp && d.attestations?.signed),
    progress: (d) => {
      const a = d.attestations ?? {};
      const f = [a.truthful, a.boardStanding, a.noSanctions, a.hipaa, a.usp, a.samHsa, a.signed];
      return f.filter(Boolean).length / f.length;
    },
  },
];

window.US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
