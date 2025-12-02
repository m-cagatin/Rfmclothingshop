# Auth & Role-Based Access To‑Do

## Backend (new Express/Prisma service)
- [ ] Scaffold `server/` (Express + Prisma + argon2 + jsonwebtoken + rate limit)
- [ ] Define Prisma schema: users (role, email_verified), refresh_tokens
- [ ] Seed one admin user manually (script/seed)
- [ ] Implement endpoints: signup, login, google, me, logout, refresh, verify-email
- [ ] Implement Google ID token verification (server-side) and email_verified check
- [ ] Add email verification mailer (SMTP/SendGrid) for password signups
- [ ] Enforce refresh rotation + revocation on logout

## Security & Config
- [ ] Move DB/PayMongo secrets out of Vite `.env` into backend `.env`
- [ ] Set cookies httpOnly + Secure (prod) + SameSite=Lax/Strict
- [ ] Add rate limiting for login/signup and lockout/backoff on repeated failures
- [ ] Enforce password strength validation

## Frontend Integration
- [ ] Replace dummy `AuthContext` login/signup with API calls (credentials include)
- [ ] Add `/auth/me` hydration on app load for session persistence
- [ ] Add Google button: get `idToken` via Google Identity Services, POST `/auth/google`, handle cancel/error toasts
- [ ] Add `ProtectedRoute` and `AdminRoute` wrappers; remove email equality admin check
- [ ] Fix auth redirects to real routes (e.g., `/` or `/account`, admins to `/admin/payment-verification`)
- [ ] Handle duplicate email on Google/signup with clear message

## UX/Error Handling
- [ ] Show specific errors: email exists, bad password, unverified email, network error, Google canceled
- [ ] Show verification-required flow with resend option
- [ ] Clarify social buttons until fully wired (hide or wire)

## Optional/Follow-ups
- [ ] Password reset flow (request + reset)
- [ ] Cloudinary: add server-side delete/signing if needed
