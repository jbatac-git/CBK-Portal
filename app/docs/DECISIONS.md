# CBK Portal: Key decisions

- Project: internal employee portal (NOT an LMS)
- Stack: Laravel 12, PostgreSQL, React + TypeScript, Inertia, Tailwind
- Roles: Super Admin, Admin, HR, Diser
- Login: username (not email)
- Palette: maroon #7A1421, dark maroon #5C0F19, gold #C9973F, cream #FBF6F0
- Learning materials: private storage, view-only, watermark
- Careers: disabled in Phase 1
- Temporary access: 7 days, then Approve / Not approve
- Diser module access = DIRECT per-user permissions (portal.learning, portal.price-lists, portal.contact-us). Spatie cannot subtract role permissions, so the Diser role only has portal.access.
- Access checks use permissions, never role names.