# User flow

```mermaid
flowchart TD
    A[Landing / showcase<br/>"Use this design"] --> B{Logged in?}
    B -- no --> C[Sign up: email + password<br/>or Continue with Google]
    C --> D[Onboarding: mobile, city, consent]
    D --> E[OTP on mobile<br/>MockSMS shows it on screen in dev]
    B -- yes --> F
    E --> F[Dashboard: create popup<br/>business name + category]
    F --> G[Project created from the template<br/>status: draft, preview published]
    G --> H[Editor: 8 steps, live preview, autosave]
    H -->|phone + address filled| I[status: preview]
    I --> J[Preview URL in a new tab<br/>"Preview" ribbon, noindex]
    I --> K[Go live: choose a plan]
    K --> L1[Host with Devnixplus<br/>first year]
    K --> L2[Download<br/>one-time]
    L1 --> M[Razorpay / simulator<br/>status: pending_payment]
    L2 --> M
    M -->|paid, signature verified| N[status: pending_verification<br/>verification form: Maps link + proof]
    N --> O{Team decision<br/>/manage/verification/}
    O -- reject --> R[status: rejected<br/>full refund via API<br/>site shows unavailable page]
    O -- approve, hosted --> P[status: approved<br/>team clicks Go live]
    P --> Q[status: live<br/>DEMO_MODE off, indexable<br/>every edit published instantly]
    O -- approve, download --> S[status: download_ready<br/>signed ZIP link, free re-downloads]
    Q --> T{Expiry}
    T -- reminders 30/7/1/0 days --> U[Renew: +1 year from current expiry]
    U --> Q
    T -- not renewed + grace period --> V[status: expired<br/>unavailable page, data kept]
    V -- renew --> Q
```

## Status reference

| Status | Meaning | Owner sees |
|---|---|---|
| `draft` | Created, required basics (phone, address) missing | "Add your phone number and address" |
| `preview` | Basics filled; preview online with a "Preview" ribbon, noindex | Go live button |
| `pending_payment` | Checkout started, not paid | Go live button (pay again) |
| `pending_verification` | Paid; team checks the business | Verify form (if not sent) or "we will call you within 24 hours" |
| `approved` | Hosted plan approved; team makes it live | "Our team is making your website live" |
| `live` | Public, indexable, edits publish instantly | Renew (from 60 days before expiry) |
| `download_ready` | Download plan approved | Download button |
| `expired` | Hosting not renewed after the grace period | Renew |
| `suspended` | Taken down by the team | Contact support |
| `rejected` | Not verified; refunded | Reason |
