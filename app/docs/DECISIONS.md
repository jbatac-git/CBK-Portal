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
- Role hierarchy: Super Admin > Admin > HR > Diser (RoleName::rank()). A user may create/edit only accounts ranked below their own; Super Admin may manage anyone.
- Username = first initial + last name + last 2 digits of Employee ID (lowercase, a-z0-9). On collision, widen to 3, 4... digits. Never regenerated.
- Temporary access = 7 days (config/portal.php). Password = 12 random chars, stored hashed, emailed via encrypted queued mail.
- Only users with users.manage-access (Admin, Super Admin) choose Diser modules. HR gets defaults on create and cannot change them.
- Role changes after creation are NOT part of Phase 2.
- Known gap (closed in Phase 3): a temporary Diser still sees all assigned modules; the "learning only" restriction is enforced in Phase 3.