# Provider Onboarding Portal

_Started 2026-05-10 05:13 UTC_

---

## User

i want to create an app that allows a compound pharmacy to onboard providers into their provider portal system. Make sure all the appropriate information is collected

## Assistant

_[tool: questions_v2]_

## User

Questions answered:
- platform: Desktop web app
- user_persona: Decide for me
- depth: Decide for me
- flow_style: Decide for me
- save_resume: Decide for me
- verification: Decide for me
- brand: No — invent something appropriate
- compound_focus: Decide for me
- variations: Decide for me
- tweaks: Demo data on/off
- aesthetic: Decide for me

## Assistant

_[tool: update_todos]_

Locking in decisions and building a polished hi-fi prototype.

**Decisions I'm making:**
- Brand: **Atrium Compounding Pharmacy** (invented — clinical, modern)
- User persona: provider's office admin completing on behalf, with provider e-sign at end
- Depth: **deep** — full credentialing (NPI, DEA, malpractice, state licensure, supervising MDs)
- Flow: **hub + spokes** — dashboard of tasks completable in any order, with auto-save
- Verification: collect-then-verify with status badges (NPI auto-lookup feels real)
- Aesthetic: refined modern SaaS with clinical sensibility — Newsreader (serif display) + Geist (UI sans), warm cream paper background, deep teal accent
- Compound focus: general (HRT, GLP-1/weight, pain, vet) — most realistic for a modern compounding pharmacy
- Tweak: Demo data on/off (per your request)

_[tool: copy_starter_component]_

_[tool: write_file]_

Building this in pieces. Start with the design system CSS.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now the section detail views — this is the big one. Let me split into two files to keep it manageable.

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

Now the app shell + section detail wrapper + main entry.

_[tool: write_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: snip]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Built **Atrium Compounding's** provider onboarding portal — a desktop hub-and-spokes flow for office admins to credential a new provider.

**What's in it:**
- **Hub dashboard** with hero, progress meter, 10 task tiles (filterable: All / To do / Verified)
- **10 sections** — Identity & Practice, Licenses & DEA, Malpractice, Compounding Preferences, Patient Population, Ship-to Locations, Billing, EHR/E-Prescribe, Delegated Staff, Compliance & Signature
- **Real interactions** — NPI lookup with simulated NPPES verification, multi-row state license editor, file upload for COI, multi-location ship-to with primary toggle, staff invite flow with access levels, scribble e-signature pad, attestation checklist
- **Auto-save** indicator, sticky side nav with per-section completion ticks, conditional fields (ACH bank details, Surescripts SPI when e-prescribe enabled)
- **Tweak**: Demo data on/off (resets the form between Dr. Castellano's pre-filled scenario and a blank slate)

**Visual system**: Newsreader serif for display + Geist sans for UI, warm cream paper background, deep teal accent — clinical but not sterile.

**Caveats / next steps:** the NPI lookup is mocked (returns a canned result); real implementation would call NPPES API. DEA verification, license verification, and Plaid bank linking are similarly simulated. If you want, I can add: a **submission/review screen** showing the full summary before submit, **conditional veterinary fields**, or a **pharmacy admin "approve provider"** view.

