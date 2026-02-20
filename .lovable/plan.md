
# Integration-First Architecture Refactor

## Understanding the Brief

Yes, completely understood. The core requirement is:

- `pressroompublisher.broadcasterscommunity.com` is the PRIMARY public website (already built on WordPress/external). It remains the central interface.
- This Lovable system must NOT behave as a competing standalone website.
- Instead, it must function as a set of **embedded modules**: authentication (signup/login), publishing management, and reading/post interaction — all reachable from the main site's buttons.
- Several specific functional changes are also required alongside the architecture refactor.

---

## What Changes, and Why

### 1. Remove the Standalone Homepage (`/` route)

The current `Index.tsx` acts as a full marketing/landing page with a hero, feature grid, and CTAs. This duplicates the main site's role.

**New behaviour:** The `/` route should redirect intelligently:
- If **not logged in** → redirect to `/login` (the main site's Login button will point here)
- If **logged in** → redirect to `/dashboard`

This makes our system behave purely as a functional module, not a website.

### 2. Login and Signup as Entry Points (not embedded pages)

The main site's **Sign Up** and **Login** buttons will point to URLs on our system:
- Sign Up → `[our-domain]/register`
- Login → `[our-domain]/login`

These pages already exist and work. What changes:
- Their headers must NOT behave like a standalone website header (no "Our Story" nav, no footer nav to About/Privacy which duplicates the main site).
- They should have a **minimal, clean header** — just the PRP logo + a link back to `pressroompublisher.broadcasterscommunity.com` (the main site), not back to `/`.
- The "Back to home" link on Login currently points to `/` — it should point to the **main site URL**.

### 3. Footer Simplification

The current Footer links to `/about` and `/privacy` internally. Per the brief:
- **About** page must align with the main site (avoid duplication) → Footer's "About" link should point to `pressroompublisher.broadcasterscommunity.com/#about` or the main site's about section.
- **Privacy** must align with the main site → Footer's "Privacy" link should point to the main site's privacy policy.
- **Help** and **Terms** remain internal (they differ per subdomain).

Footer update: Replace About and Privacy links with external links to the main site.

### 4. Rename "New Story" / "Create a new publication" → "Publish New Post"

Currently in multiple places:
- `PRPHeader` (authenticated state): Button says "New Story" → links to `/blogs/create` (which is blog/account creation, not post creation)
- `Dashboard.tsx`: Button says "New publication" → links to `/blogs/create`
- `BlogManage.tsx`: "Create a new publication" link

**Requirement:** The "Publish New Post" button should open the **post creation interface** (`/blog/:blogSlug/post/create`), not blog account creation.

**Challenge:** Post creation requires a `blogSlug`. If a user has multiple blogs, we need to handle blog selection. The flow should be:
- If user has **one blog** → go directly to `/blog/{slug}/post/create`
- If user has **multiple blogs** → show a quick blog-picker modal/dialog, then navigate to the correct post creation route
- If user has **no blogs** → prompt to create a blog first (the existing flow)

### 5. YouTube-Style Collapsible Comments

Currently `CommentSection.tsx` renders all comments inline, always visible, beneath every post in `PostView.tsx`.

**Required:** Comments hidden by default. A button shows the comment count and expands/collapses the section on click — identical to YouTube's UX.

**Implementation:** Wrap the entire `<CommentSection />` in `PostView.tsx` with a toggle state. The trigger button shows:
- `💬 View 42 Comments` (collapsed)
- `💬 Hide Comments` (expanded)

The `CommentSection` component itself does not need to change — only how it is rendered in `PostView.tsx`.

### 6. Share Post Button (already exists but needs surfacing)

`ShareSheet.tsx` already exists and is already imported in `PostView.tsx`. The `handleShare` function currently uses the native Web Share API with a clipboard fallback. The `ShareSheet` component has full social sharing options.

**What's missing:** The Share button in `PostView.tsx` exists but needs to be made more prominent and consistently placed. Also, a **Share Account/Profile** button is needed on `BlogView.tsx` to share the blog's public URL.

### 7. About and Privacy Page Alignment

Per the brief, About and Privacy should not duplicate the main site. The action:
- Keep the `/about` and `/privacy` routes but have them redirect externally to the main site's pages, OR
- Update their content to acknowledge the main site and provide a link to it rather than being full standalone pages.

The cleaner approach: update the pages to redirect to the main site's URLs immediately on load.

---

## Files to Modify

### `src/pages/Index.tsx`
Replace the full marketing page with a smart redirect component:
- No session → navigate to `/login`
- Session → navigate to `/dashboard`

### `src/components/ui/prp-header.tsx`
- In **unauthenticated mode**: "Get started" button links to `/register`, "Sign In" to `/login` — these are correct. Remove "Our story" nav link (points to `/about` which duplicates main site).
- In **authenticated mode**: Rename "New Story" button label to "Publish New Post". Change link logic to use the blog-picker modal approach described above.
- Logo/home link: keep pointing to `/` (which now redirects to login/dashboard).

### `src/pages/Login.tsx`
- "Back to home" link: change from `to="/"` to an external `href="https://pressroompublisher.broadcasterscommunity.com"`.
- Minimal header: replace `<PRPHeader>` with a simple logo-only header that links back to the main site.

### `src/pages/Register.tsx`
- Same minimal header treatment as Login.
- Keep all existing functionality.

### `src/components/Footer.tsx`
- "About" link → external: `https://pressroompublisher.broadcasterscommunity.com/about`
- "Privacy" link → external: `https://pressroompublisher.broadcasterscommunity.com/privacy-policy`
- Keep "Help" → `/help` (internal)
- Keep "Terms" → `/terms` (internal)

### `src/pages/Dashboard.tsx`
- "New publication" button: rename to "Publish New Post", update link/modal logic (if one blog → go straight to post create; if multiple → show picker; if none → go to `/blogs/create`).

### `src/pages/PostView.tsx`
- Wrap `<CommentSection />` with a collapse toggle (YouTube-style).
- Make the Share button more prominent and consistently placed.

### `src/pages/BlogView.tsx`
- Add a "Share this blog" button that copies the blog URL or opens a share sheet with the blog's public link and name.

### `src/pages/About.tsx`
- Replace content with an immediate redirect to `https://pressroompublisher.broadcasterscommunity.com` (or a bridge page that links there).

### `src/pages/Privacy.tsx`
- Replace content with an immediate redirect to the main site's privacy policy.

---

## New Component

### `src/components/BlogPickerModal.tsx` (new)
A small dialog that appears when "Publish New Post" is clicked and the user has multiple blogs. Lists the user's blogs with their logos/names. Selecting one navigates to `/blog/{slug}/post/create`.

---

## Architecture Summary

```text
pressroompublisher.broadcasterscommunity.com  (MAIN SITE - unchanged)
  │
  ├── Sign Up button ──────────────────────► [our-domain]/register
  │                                               │
  │                                          Register form
  │                                          (minimal header, back to main site)
  │                                               │
  │                                          → /dashboard
  │
  └── Login button  ──────────────────────► [our-domain]/login
                                                  │
                                             Login form
                                             (minimal header, back to main site)
                                                  │
                                             → /dashboard
                                                  │
                                         ┌────────┴────────┐
                                     /dashboard        /blog/:slug
                                   (publisher hub)   (public blog view)
                                         │
                              "Publish New Post"
                                   ├── 1 blog → /blog/:slug/post/create
                                   ├── N blogs → BlogPickerModal
                                   └── 0 blogs → /blogs/create
```

---

## Technical Details

### Collapsible Comments (PostView.tsx)
```text
const [commentsExpanded, setCommentsExpanded] = useState(false);

// Replace current <CommentSection /> render with:
<div>
  <button onClick={() => setCommentsExpanded(!commentsExpanded)}>
    {commentsExpanded ? "Hide Comments" : `View ${post.comment_count} Comments`}
  </button>
  {commentsExpanded && <CommentSection ... />}
</div>
```

### Blog Picker Modal
Fetches user's blogs from the database on mount inside `Dashboard.tsx` / `PRPHeader`. Since blogs are already fetched on Dashboard, the picker reuses that data. In the header, it fetches on-demand when the button is clicked.

### External Redirects for About/Privacy
```text
// In About.tsx and Privacy.tsx:
useEffect(() => {
  window.location.href = "https://pressroompublisher.broadcasterscommunity.com/about";
}, []);
```

### Share Blog Button (BlogView.tsx)
A button that calls `navigator.share()` with the blog name + URL, with clipboard fallback — consistent with how `PostView.tsx` currently handles sharing.

---

## What is NOT Changing

- All authentication logic, RLS policies, and database structure remain intact.
- All publishing, editing, admin management, celebration, and notification features remain intact.
- `/help` and `/terms` remain as internal pages.
- The `/blog/:slug`, `/blog/:slug/post/:id`, `/search`, `/category/:slug` public routes remain as-is.
- No database migrations needed for any of these changes.
