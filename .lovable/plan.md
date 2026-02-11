

# Resend Email Integration for Press Room Publisher

## Overview

This plan adds professional, beautifully designed email delivery to PRP using Resend, covering welcome emails, password reset emails, and email verification -- all sent from `prp.broadcasterscommunity.com`.

---

## Step 1: Store the Resend API Key

Before any code changes, we'll securely store your `RESEND_API_KEY` as a backend secret so the edge functions can access it.

---

## Step 2: Create Edge Functions

### Edge Function 1: `send-welcome-email`
- Triggered after successful registration (called from the frontend)
- Sends a professionally designed HTML welcome email with the PRP branding
- Witty, warm copy welcoming the user to the PRP community
- Sender: `noreply@prp.broadcasterscommunity.com`

### Edge Function 2: `send-password-reset-email`
- Called from the `ForgotPassword.tsx` page instead of relying on the default auth email
- Sends a branded password reset email with a secure link
- Professional copy with clear instructions
- Sender: `noreply@prp.broadcasterscommunity.com`

### Edge Function 3: `send-verification-email`
- Called after registration to send a branded email verification link
- Clean design with a prominent "Verify Email" button
- Sender: `noreply@prp.broadcasterscommunity.com`

Each function will include:
- CORS headers for browser requests
- Resend SDK (`npm:resend@2.0.0`)
- Professional HTML email templates with inline CSS
- Error handling with meaningful responses

---

## Step 3: Email Template Design

All emails will share a consistent PRP-branded design:
- Dark header with "PRESS ROOM PUBLISHER" branding
- Clean white content area with professional typography
- Accent-colored call-to-action buttons
- Footer with "The Press Room Publisher Team" sign-off
- Fully accessible (alt text, semantic HTML, sufficient color contrast)

### Welcome Email Copy (witty + professional):
- Subject: "Your Digital Pen is Ready -- Welcome to Press Room Publisher"
- Warm congratulations, overview of what they can do (comment, react, follow, share)
- Encouragement to explore and engage

### Password Reset Email Copy:
- Subject: "Reset Your Password -- Press Room Publisher"
- Clear instructions, prominent reset button, expiry notice
- Reassurance if they didn't request it

### Email Verification Copy:
- Subject: "Verify Your Email -- Press Room Publisher"
- Quick verification CTA, explanation of why verification matters

---

## Step 4: Update Frontend Pages

### `src/pages/Register.tsx`
- After successful signup, call the `send-welcome-email` and `send-verification-email` edge functions with the user's name and email
- Update the success toast to mention checking their email

### `src/pages/ForgotPassword.tsx`
- Instead of using the default auth reset email, call the `send-password-reset-email` edge function
- Still use `supabase.auth.resetPasswordForEmail()` for the actual token generation, but send the branded email through Resend

### `src/pages/ResetPassword.tsx`
- Minor fix: handle the token from the auth redirect URL properly (Supabase uses hash fragments, not query params for the access token)

---

## Step 5: Auth Configuration

- Update `supabase/config.toml` to set `verify_jwt = false` for the three new edge functions so they can be called from the frontend without authentication (registration happens before login)

---

## Technical Details

### Edge Function File Structure
```text
supabase/functions/
  send-welcome-email/index.ts
  send-password-reset-email/index.ts  
  send-verification-email/index.ts
```

### Email HTML Template Structure (shared pattern)
```html
<!-- Inline-styled responsive email -->
<div style="max-width:600px; margin:0 auto; font-family:Georgia,serif;">
  <header> PRP Logo / Name </header>
  <main> Content + CTA Button </main>
  <footer> Team sign-off + unsubscribe note </footer>
</div>
```

### Frontend Integration Pattern
```typescript
// Example: calling edge function after registration
await supabase.functions.invoke('send-welcome-email', {
  body: { email, firstName }
});
```

### Secret Required
- `RESEND_API_KEY` -- your Resend API key

### Sender Address
- `noreply@prp.broadcasterscommunity.com` (using your verified domain)

