

# Fix Build Errors Blocking Admin Login

## Root Cause
Both admin accounts ARE active in the database. The "inactive" error is caused by **build failures** — the TypeScript compiler rejects `check_is_admin` RPC calls because the function isn't in the auto-generated types. The app can't build properly, so the admin auth hook fails silently.

There are 4 build errors to fix:

## Fix 1: `useAdminAuth.ts` — `check_is_admin` not in types
Cast the supabase client to `any` for this specific RPC call since `check_is_admin` exists in the DB but not in the auto-generated types file.

**File:** `src/hooks/useAdminAuth.ts`
- Change `supabase.rpc("check_is_admin")` → `(supabase.rpc as any)("check_is_admin")`

## Fix 2: `AdminLogin.tsx` — same `check_is_admin` type error + null check
Same cast fix, plus add a null guard on `rows`.

**File:** `src/pages/AdminLogin.tsx`
- Same `(supabase.rpc as any)("check_is_admin")` cast
- Add `if (!rows)` guard before accessing array

## Fix 3: `Search.tsx` — variable used before declaration
`searchQuery` is referenced in `useSeo()` on line 42, but declared on line 48.

**File:** `src/pages/Search.tsx`
- Move the `useSeo()` call below the `useState` declarations

## Fix 4: `BlogManagement.tsx` — status filter type mismatch
`statusFilter` is a `string` but `.eq("status", statusFilter)` expects the enum type.

**File:** `src/pages/BlogManagement.tsx`
- Cast `statusFilter` as the correct blog_status enum type

## Fix 5: `send-password-reset-email/index.ts` — Resend import
The Deno edge function uses `npm:resend@2.0.0` which needs a different import approach.

**File:** `supabase/functions/send-password-reset-email/index.ts`
- Change import to use `https://esm.sh/resend@2.0.0` (ESM CDN, works in Deno without node_modules)

## Summary
These are all type-level / import fixes. No database changes needed. Once fixed, the admin login will correctly call `check_is_admin`, get back `is_active: true`, and grant access.

