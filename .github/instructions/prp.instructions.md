Press Room Publisher - COMPLETE Lovable.dev Build Prompt (UPDATED)
Build a multi-user blogging platform called "Press Room Publisher" (PRP) with the following specifications:

## CRITICAL ACCESSIBILITY REQUIREMENT
Every image, button, icon, and interactive element MUST have proper alt text and aria-labels for screen reader compatibility. This is non-negotiable and must work perfectly with screen readers.

## CORE CONCEPT
A two-tier account system where users create ONE primary account (real identity) and can create MULTIPLE blog accounts (brands/publications) under it. One person can run multiple themed blogs (e.g., one for sports, one for cooking, one for politics) all under their single primary account.

## USER TYPES & PERMISSIONS
1. **Visitors** - Can only read posts
2. **Subscribers** - Registered users who can comment, approve/disapprove posts, follow blogs, share content, report content
3. **Publishers** - Subscribers who create and manage blog account(s)
4. **Blog Owners** - Full control over their blog(s)
5. **Blog Administrators** - Up to 5 people assigned by blog owner to co-manage a specific blog (can publish, edit, delete posts on that blog)

## DATABASE SCHEMA

### users (Primary Accounts)
- id (uuid, primary key)
- email (unique, required, NEVER public)
- password_hash (required)
- first_name (required, public)
- last_name (required, public)
- middle_name (optional, public)
- screen_name (optional, public, display as @screenname everywhere)
- date_of_birth (required, month/day PUBLIC, year HIDDEN)
- profile_photo_url (optional, public, can be added later)
- bio (text, optional, public, can be added later)
- hobbies (text, optional, public, can be added later)
- created_at (timestamp)
- account_status (enum: active, suspended, deactivated, default: active)
- is_verified (boolean, default: false)
- email_verified (boolean, default: false)

### blogs (Blog Accounts)
- id (uuid, primary key)
- owner_id (foreign key → users.id)
- blog_name (required, unique)
- slug (unique, auto-generated from blog_name, URL-friendly)
- category (required, from predefined list or custom)
- custom_category (text, 50 char limit, if "Others" selected)
- languages (array, can select multiple)
- custom_language (text, 50 char limit, if "Others" selected)
- description (required, text)
- profile_photo_url (required)
- follower_count (integer, default: 0)
- created_at (timestamp)
- is_verified (boolean, default: false)
- status (enum: active, hidden, deleted, default: active)

### blog_admins (Administrators for blogs - PHASE 1)
- id (uuid, primary key)
- blog_id (foreign key → blogs.id)
- admin_user_id (foreign key → users.id, nullable if not yet registered)
- admin_first_name (required)
- admin_last_name (required)
- admin_email (required)
- assigned_by (foreign key → users.id, the blog owner)
- assigned_at (timestamp)
- status (enum: pending, active, removed, default: pending)
- invitation_sent (boolean, default: false)

Note: When blog owner assigns admin, if email matches existing user, link to that user_id. If not, create pending invitation.

### blog_categories (Reference table)
Categories: News, Gossip, Cooking, Lifestyle, Traveling, Fiction, Movie Reviews, Automobile, Real Estate, Fashion, Laws And Constitution, Book Reviews, Editorials, Court And Crimes, Entrepreneurship, Public Speaking, International Trade, Business Operation, Financial Management, Government And Governance, Music Reviews, Security, Farming, Animal Life, Sport News, Daily Diary, Kiddies, Romance, Healthcare, Campus Life, Cultural Festivals, Comparison, Love Life, Community Development, Drama, Music, Politics, Public Education, Do It Yourself, Technology, Entertainment, Adventures, Comedy, Documentary, Folktales, Commentary, Satire, Story Telling, Editorial Review, Reportage, Variety, True Life, Poetry, Magazine, Science, Fun Fact, Religious, Inventions, Fact Checking, Culture And Traditions, Promotions, Food, Travels And Tourism, Language, Others

### blog_languages (Reference table)
Languages: English, Yoruba, Igbo, Hausa, French, Spanish, Arabic, Chinese, Swahili, Pidgin, Others

### posts (Blog Posts)
- id (uuid, primary key)
- blog_id (foreign key → blogs.id)
- author_id (foreign key → users.id, actual writer - could be owner or admin)
- headline (required, 150 char limit)
- subtitle (optional, 250 char limit)
- byline (required, 100 char limit, author name for public display)
- content (required, 2500 char limit)
- status (enum: draft, published, hidden, deleted, default: draft)
- comments_locked (boolean, default: false)
- is_pinned (boolean, default: false)
- view_count (integer, default: 0)
- approval_count (integer, default: 0)
- disapproval_count (integer, default: 0)
- comment_count (integer, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
- published_at (timestamp, nullable)

### media (Images/Videos/Audio attached to posts)
- id (uuid, primary key)
- post_id (foreign key → posts.id)
- media_type (enum: image, video, audio)
- file_url (required)
- description (required, 500 char limit, for accessibility - describes what's in the media)
- file_size (integer)
- order_position (integer, for ordering multiple files)
- created_at (timestamp)

### follows (Blog followers)
- id (uuid, primary key)
- follower_id (foreign key → users.id)
- blog_id (foreign key → blogs.id)
- created_at (timestamp)
- UNIQUE constraint on (follower_id, blog_id)

### post_reactions (Approvals/Disapprovals on posts)
- id (uuid, primary key)
- user_id (foreign key → users.id)
- post_id (foreign key → posts.id)
- reaction_type (enum: approve, disapprove)
- created_at (timestamp)
- UNIQUE constraint on (user_id, post_id)

### comments (Comments on posts)
- id (uuid, primary key)
- post_id (foreign key → posts.id)
- user_id (foreign key → users.id)
- parent_comment_id (foreign key → comments.id, nullable for top-level)
- content (text, required)
- approval_count (integer, default: 0)
- disapproval_count (integer, default: 0)
- is_pinned (boolean, default: false)
- status (enum: active, hidden, deleted, default: active)
- created_at (timestamp)
- updated_at (timestamp)

### comment_reactions (Approvals/Disapprovals on comments)
- id (uuid, primary key)
- user_id (foreign key → users.id)
- comment_id (foreign key → comments.id)
- reaction_type (enum: approve, disapprove)
- created_at (timestamp)
- UNIQUE constraint on (user_id, comment_id)

### reports (Content reporting)
- id (uuid, primary key)
- reporter_id (foreign key → users.id)
- reported_item_type (enum: post, comment, blog, user)
- reported_item_id (uuid)
- reason_category (enum: misleading, falsehood, wrong_impression, cyber_bully, scam, cursing, abuse, discrimination, bad_profiling, propaganda, instigating, miseducation, disrespectful, intolerance, others)
- custom_reason (text, 250 char limit, required if "others" selected)
- status (enum: pending, reviewed, resolved, default: pending)
- admin_notes (text, nullable)
- created_at (timestamp)

### celebration_posts (Auto-generated anniversary/birthday posts)
- id (uuid, primary key)
- user_id (foreign key → users.id)
- celebration_type (enum: account_anniversary, birthday)
- blog_id (foreign key → blogs.id, which blog to post on)
- post_content (text, auto-generated)
- created_at (timestamp)
- expires_at (timestamp, 24 hours from creation)
- status (enum: active, expired)

## ROUTING STRUCTURE

### Public Routes (No auth required)
- `/` - PRP main homepage (featured blogs, latest posts, subscriber count)
- `/register` - New user registration
- `/login` - User login
- `/forgot-password` - Password recovery
- `/reset-password/:token` - Password reset with token
- `/verify-email/:token` - Email verification
- `/blog/:blogSlug` - Individual blog homepage
- `/blog/:blogSlug/about` - Blog description page
- `/blog/:blogSlug/publisher` - Publisher bio page
- `/blog/:blogSlug/post/:postId` - Individual post view
- `/search` - Global search (blogs and posts)
- `/category/:categoryName` - Browse blogs by category

### Protected Routes (Auth required)
- `/dashboard` - User dashboard (shows all their blogs, ability to create new ones)
- `/profile/edit` - Edit primary account profile
- `/settings` - Account settings
- `/settings/security` - Security settings (password change, 2FA prep)
- `/blogs/create` - Create new blog
- `/blog/:blogSlug/manage` - Blog management dashboard (owner/admin only)
- `/blog/:blogSlug/edit` - Edit blog settings (owner only)
- `/blog/:blogSlug/admins` - Manage blog administrators (owner only)
- `/blog/:blogSlug/post/create` - Create new post (owner/admin only)
- `/blog/:blogSlug/post/:postId/edit` - Edit post (owner/admin only)

## KEY PAGES & FEATURES

### 1. REGISTRATION PAGE (`/register`)
Two-step registration OR single long form with clear sections:

**SECTION 1: CREATING PRIMARY PRP ACCOUNT**
Heading: "PERSONAL INFORMATION"

Form fields with live character count indicators:
- First Name (required, text input)
- Last Name (required, text input)
- Middle Name (optional, text input)
- PRP Screen Name (optional, text input, auto-add @ symbol in display)
  - Show as: "Your screen name will appear as @[screenname]"
- Date of Birth (required, 3 dropdowns: Month, Day, Year)
  - Note below: "Only month and day will be public. Year stays private."
- Profile Photo (optional, image upload)
  - "Skip for now" button that allows proceeding without photo
- Short Bio (optional, textarea)
  - "Skip for now" button
- Hobbies (optional, textarea)
  - "Skip for now" button
- Active Email (required, email input, will be private)
- Password (required, min 8 chars, password input)
- Confirm Password (required, password input)

Submit button: "NOW SIGN UP"

On successful submission:
1. Create user account (email_verified = false)
2. Send verification email with link
3. Show popup modal with welcome message (see exact text below)
4. Send same welcome message via email
5. Auto-login user
6. Redirect to `/dashboard`

**WELCOME MESSAGE POPUP (Subscriber Confirmation):**
PRESS ROOM PUBLISHER Subscription Confirmation.
CONGRATULATIONS! This is to confirm your subscription to the domain of PRESS ROOM PUBLISHER. Welcome and thank you for your choice. Now, you would be able to access the comment section on every published publications, react officially to blogposts, report a published content, send direct message to publishers, and more related on PRESS ROOM PUBLISHER platform.
Also, you'd be able to get new helpful notifications from the individual PRESS ROOM PUBLISHER Blogpost accounts you follow. We urge you to always leave a footprint of your presence each time you visit PRESS ROOM PUBLISHER domain. Be kind to follow the individual blogpost accounts of interest, widely share published publications, and do not deny us your valued thoughts responsibly in the comment section. We are much glad to have you join the PRESS ROOM PUBLISHER Community.

### 2. LOGIN PAGE (`/login`)
- Email field
- Password field
- "Keep me signed in" checkbox (extends session to 30 days)
- "Forgot password?" link → `/forgot-password`
- "Login" button
- "Don't have an account? Sign up" link → `/register`

If email not verified, show banner: "Please verify your email. Resend verification email?"

### 3. PRP MAIN HOMEPAGE (`/`)
**Header:**
- PRP logo (large, professional)
- Search bar: "Search blogs and posts..." (global search)
- Navigation links: 
  - "Home"
  - "Browse Categories" (dropdown with all categories)
  - "Latest Posts"
- Right side:
  - If not logged in: "Login" and "Sign Up" buttons
  - If logged in: User menu (profile photo + screen name dropdown)
    - Dashboard
    - My Blogs
    - Profile Settings
    - Logout

**Hero Section:**
- Large subscriber count display: "[X] SUBSCRIBERS" (total platform subscribers)
- Tagline: "Your Digital Pen Firepower - Publish Facts Without Fear or Favor"
- "Start Publishing" button (→ register if not logged in, → create blog if logged in)

**Verified/Featured Blogs Section:**
- Heading: "Verified Publishers"
- Horizontal scrollable cards of verified blogs
- Each card shows:
  - Blog logo
  - Blog name with verification badge ✓
  - Category
  - Follower count
  - "Follow" button (if logged in)
  - Click → `/blog/:slug`

**Latest Posts Section:**
- Heading: "Latest from Press Room Publisher"
- Category filter dropdown (All, News, Entertainment, Tech, etc.)
- Grid of post cards (3 columns desktop, 2 tablet, 1 mobile)
- Pagination (20 posts per page)

**Post Card Component (for lists):**
- Blog logo and name (small, top-left, clickable → blog)
- Verification badge if verified
- Post headline (large, bold, clickable → post)
- Subtitle (if exists, gray text)
- Byline: "By [author name]"
- First 200 characters of content + "... Read more"
- Publication time: "2 hours ago" OR "Jan 15, 2026" (if >7 days)
- Row of metadata:
  - 👁 [view count] views
  - ✓ [approval count] approvals
  - ✗ [disapproval count] disapprovals
  - 💬 [comment count] comments
- Share icon button (opens share sheet)
- Hover effect: slight elevation

**Footer:**
- About PRP
- Contact
- Terms of Service
- Privacy Policy
- © 2026 Press Room Publisher

### 4. CREATE BLOG PAGE (`/blogs/create`)
Heading: "CREATE BLOGPOST ACCOUNT"

Form with live character counters:

**"CREATE BLOGPOST ACCOUNT NAME"**
- Text input (required, unique check in real-time)
- Shows slug preview: "Your blog will be at: pressroompublisher.com/blog/[auto-slug]"

**"SELECT BLOG POST ACCOUNT CATEGORY"**
- Dropdown with all categories (scrollable)
- Last option: "Others" → if selected, shows text input (50 char limit)

**"SELECT BLOG POST ACCOUNT LANGUAGES"** 
- Multi-select checkboxes (can select multiple)
- All language options listed
- Last option: "Others" → if checked, shows text input (50 char limit)

**"WRITE BLOGPOST ACCOUNT DESCRIPTION"**
- Textarea (required)
- Helper text: "Tell readers what your blog is about"

**"UPLOAD BLOGPOST ACCOUNT PROFILE PHOTO"**
- Image upload (required)
- Preview after selection
- Max 5MB, JPG/PNG only
- Must have alt text (auto-filled as "Logo for [blog name]")

**Optional Section (can skip and add later):**
Heading: "ASSIGN FIVE ADMINISTRATORS FOR YOUR PRESS ROOM PUBLISHER BLOGPOST ACCOUNT"

Help text:
"Assigning administrators to co-manage your account is optional, and you can assign your own Admin officers right away or later. It's absolutely possible to share the responsibility of managing your PRESS ROOM PUBLISHER blogpost account with up to five persons/reporters you trust. You're fully responsible for publications published by your team, including other related actions taken on your permission to co-manage your account."

For each of 5 admin slots:
**"ASSIGN ADMINISTRATOR [1-5]"**
- First Name (text input)
- Last Name (text input)
- Active Email (email input)
- "Submit" button (adds this admin, sends invitation email)
- OR "Skip" button

Each assigned admin shows in list below with:
- Name
- Email
- Status: "Invitation sent" or "Active" (if they accepted)
- "Remove" button

Action buttons:
- "CREATE BLOG" (main button, large)
- "Save Draft" (secondary button, saves for later completion)

On successful blog creation:
1. Create blog record
2. Send invitations to all assigned admins
3. Show popup modal with welcome message (see exact text below)
4. Send same welcome message via email to blog owner
5. Redirect to new blog page: `/blog/:slug`

**WELCOME MESSAGE POPUP (Blog Creation):**
HEY VALUED PUBLISHER, YOUR NEW PRESS ROOM PUBLISHER BLOGPOST ACCOUNT HAS BEEN CREATED ACCORDINGLY. NOW YOUR DIGITAL PEN FIREPOWER IS ACTIVE HEREON.
CONGRATULATIONS! You have successfully created your new PRESS ROOM PUBLISHER Blogpost Account and we are glad to welcome you warmly to the community of publishers on the platform. Now you're good to go get started with varying social impacting TEXT, AUDIO & VISUAL posts that are engaging and equally making all round positive difference on the public.
At PRESS ROOM PUBLISHER; we respectfully urge you to always remain professional as best possible in your publications. Kindly accord your esteemed readers and the valued followers of your PRP blogpost account the deserving regards and respect always. Be ethical and absolutely responsible in your overall conducts on PRESS ROOM PUBLISHER platform.
Do keep in mind, the public is better informed, educated and entertained through your valued contributions to tirelessly make the world a better place. Hence, for no reason should you compromise the respected standard of professional journalism in your news reportage and other related writings you do on PRESS ROOM PUBLISHER platform.
The public counts on the noble profession of Print Journalism and other related responsibilities. Certainly, our one JOB is PRESERVATION of the public TRUST. Therefore, kindly make it make sense in publication always.
Again, you are most welcome to the domain of PRESS ROOM PUBLISHER. Let's go get the duty started and duly done consistently with your digital (PEN FIREPOWER) publishing facts without fear or favor!
The Press Room Publisher Team.

### 5. BLOG HOMEPAGE (`/blog/:blogSlug`)
**Layout from top to bottom:**

**Big banner button at very top:**
- Large, full-width button
- Text: "PRESS ROOM PUBLISHER HOME"
- Click → redirects to `/` (main homepage)
- Distinct color/style to show it's navigational

**Blog Header Section:**
- Blog name (very large heading)
- Verification badge if verified (checkmark icon)
- Blog logo/profile photo (large, circular)

**Follower Count Display:**
- "[X] FOLLOWERS" (large, prominent)
- Updates in real-time when someone follows

**Action Buttons Row:**
Three equal-width buttons in a row:
1. "MEET [BLOG NAME] PUBLISHER" 
   - Opens modal showing publisher bio/info
2. "ACCOUNT DESCRIPTION"
   - Opens modal showing blog description
3. "FOLLOW [BLOG NAME]" (if not following) OR "UNFOLLOW [BLOG NAME]" (if following)
   - Toggles follow status
   - Updates follower count immediately

**Search Bar:**
- "SEARCH POSTS BY NAMES/CATEGORIES"
- Searches only within this specific blog
- Shows results on same page below

**If user is owner or assigned admin:**
- "Create New Post" button (prominent)
- "Edit Blog" button
- "Manage Administrators" button

**Posts Section:**
Tabs:
- "All Posts" (default)
- "Pinned Posts"

Post list:
- Pinned post first (if exists) with "PINNED" badge
- Then all other posts sorted by published_at (newest first)
- Same post card design as homepage
- Each post card includes edit/delete buttons if user is owner/admin

Pagination: 20 posts per page

**Empty State (if no posts):**
"No posts yet. Start publishing!"
- If owner/admin: "Create Your First Post" button

### 6. PUBLISHER BIO MODAL
Triggered by "MEET [BLOG NAME] PUBLISHER" button

Modal content:
- Heading: "About the Publisher"
- Profile photo (large)
- Full name: [First] [Middle] [Last]
- Screen name: @[screenname] (if exists)
- Birthday: [Month] [Day] (NOT year)
- Bio: [user's bio text]
- Hobbies: [user's hobbies]
- Close button (X)
- "Back" button at bottom

### 7. ACCOUNT DESCRIPTION MODAL
Triggered by "ACCOUNT DESCRIPTION" button

Modal content:
- Heading: "About [Blog Name]"
- Blog logo
- Category: [category name]
- Languages: [language list]
- Description: [blog description]
- Close button (X)
- "Back" button at bottom

### 8. CREATE POST PAGE (`/blog/:blogSlug/post/create`)
Only accessible to blog owner and assigned admins

Heading: "Create New Post for [Blog Name]"

Form with live character counters:

**"CAST BLOGPOST HEADLINE/TITLE"** - Required, 150 char limit
- Large text input
- Character counter: "0/150"
- Placeholder: "Write a compelling headline..."

**"WRITE BLOGPOST RIDER/SUBTITLE"** - Optional, 250 char limit
- Text input
- Character counter: "0/250"
- Placeholder: "Add a subtitle to give more context..."

**"Publish Byline"** - Required, 100 char limit
- Text input
- Character counter: "0/100"
- Placeholder: "Author name (e.g., John Smith, Senior Reporter)"
- Helper text: "This is the author credit that appears on the post"

**"PUBLISH BLOGPOST TEXT CONTENT"** - Required, 2500 char limit
- Large textarea (rich text editor NOT needed, plain text only)
- Character counter: "0/2500"
- Placeholder: "Write your post content..."

**Media Section:**
Heading: "Add Media (Optional)"

**"Add Image"** button
- Click → opens file picker
- Can add multiple images
- Each image added shows:
  - Thumbnail preview
  - "Move Up" / "Move Down" buttons (to reorder)
  - Required field: "WRITE PHOTO DESCRIPTION" (500 char limit)
    - Placeholder: "Describe what's in this photo (e.g., 'From left to right: John, Jane, Bob')"
  - "Remove" button
- Max file size: 5MB per image
- Allowed: JPG, PNG, GIF, WebP

**"Add Video"** button - DISABLED for Phase 1
- Shows tooltip: "Video uploads coming in Phase 2"
- Grayed out

**"Add Audio"** button - DISABLED for Phase 1
- Shows tooltip: "Audio uploads coming in Phase 2"
- Grayed out

**Action Buttons:**
Row of 3 buttons:
1. "SAVE AS DRAFT" - Saves with status='draft', redirects to blog dashboard
2. "PREVIEW" - Opens preview modal (shows post as it will appear)
3. "PUBLISH" - Main button, large, prominent

**Preview Modal:**
Shows post exactly as it will appear on post view page, including:
- Headline, subtitle, byline
- Content
- All media with descriptions
- Post footer
- Buttons: "Back to Edit" and "PUBLISH NOW"

On clicking "PUBLISH" or "PUBLISH NOW":
1. Validate all required fields
2. Set status='published'
3. Set published_at=now
4. Show success toast: "Post published successfully!"
5. Redirect to post view page: `/blog/:slug/post/:id`
6. Send notifications to all blog followers (background job)

### 9. POST VIEW PAGE (`/blog/:blogSlug/post/:postId`)
**Layout from top to bottom:**

**Post Header:**
- Headline (very large, bold)
- Subtitle (if exists, gray text, slightly smaller)
- Byline: "By [author name]"
- Publication info row:
  - Publication time: "3 hours ago" (relative)
  - Date published: "January 15, 2026" (actual date)
  - Last updated: "[timestamp]" (only if post was edited)
  - View count: "[X] views"

**Post Content:**
- Main text content (preserving line breaks)
- Clean, readable typography

**Media Section (if media attached):**
For each image/video/audio:
- Display the media
- Button below: "READ [IMAGE/VIDEO/AUDIO] DESCRIPTION"
  - Click → opens modal with description text
  - Modal has "Close" button

**Post Metadata Bar:**
Horizontal row of interactive elements:
- Approve button: "I APPROVE THIS POST"
  - Shows count: "[X] APPROVALS RECORDED"
  - Highlighted if user already approved
  - Click toggles approval
- Disapprove button: "I DISAPPROVE THIS POST"
  - Shows count: "[X] DISAPPROVALS RECORDED"
  - Highlighted if user already disapproved
  - Click toggles disapproval
- Comment count: "[X] Comments" (clickable, scrolls to comment section)
- Share button (opens share sheet)
- Report button (if logged in, opens report modal)

**Post Footer (automatic, always present):**
Two-line footer with blog branding:
- Line 1: "[BLOG NAME] PUBLICATION" 
  - Shows blog logo next to text
  - Styled as visual stamp/signature
- Line 2: (DM feature removed for Phase 1)

**Owner/Admin Controls (if user is owner/admin):**
Button row:
- "Edit Post" → `/blog/:slug/post/:id/edit`
- "Delete Post" (confirmation modal)
- "Hide Post" (soft delete, status='hidden', removes from public view)
- "Unhide Post" (if currently hidden)
- Toggle: "Lock Comments" / "Unlock Comments"
- Toggle: "Pin Post" / "Unpin Post"

**Comment Section:**
Heading: "Comments ([count])"

If not logged in:
- "Sign in to comment" button → `/login`

If logged in:
- Comment input box
  - Textarea: "Share your thoughts..."
  - "Post Comment" button
  - Character counter if you want (optional)

If comments locked:
- Show message: "Comments are locked by the publisher"
- Hide comment input
- Still show existing comments (read-only)

**Comment Display (threaded/nested):**
For each top-level comment:
- Commenter info:
  - Profile photo (small)
  - Name: [First] [Last]
  - Screen name: @[screenname] (gray text)
  - Verification badge if verified
- Comment text
- Timestamp: "2 hours ago"
- Reaction row:
  - Approve button (👍 icon + count)
  - Disapprove button (👎 icon + count)
  - "Reply" button
  - Report button (flag icon)
- If comment author or blog owner/admin:
  - "Edit" button (inline edit form)
  - "Delete" button (soft delete, shows "[deleted]")
- If pinned: Show "PINNED" badge

**Nested Replies (1 level deep):**
- Indented slightly
- Same structure as parent comment
- "Reply" button creates reply to original parent (no deeper nesting)

### 10. EDIT POST PAGE (`/blog/:blogSlug/post/:postId/edit`)
Same form as create post, but:
- Pre-filled with existing post data
- Heading: "Edit Post"
- Shows "Last updated: [timestamp]"
- Button: "UPDATE POST" instead of "PUBLISH"
- Additional button: "DELETE POST" (confirmation modal)
- Can change post from published → draft, or draft → published
- Updating doesn't change published_at timestamp

### 11. USER DASHBOARD (`/dashboard`)
Heading: "Your Dashboard"
Welcome message: "Welcome back, [First Name]!"

**Your Blogs Section:**
- Grid of blog cards (2 columns desktop, 1 mobile)
- Each card shows:
  - Blog logo
  - Blog name
  - Category badge
  - Follower count
  - Latest post date (if posts exist)
  - Quick stats: [X] posts, [Y] total views
  - Buttons:
    - "View Blog" → `/blog/:slug`
    - "Create Post" → `/blog/:slug/post/create`
    - "Manage" → `/blog/:slug/manage`

- "Create New Blog" button (large, prominent)
  - Limit: No limit on number of blogs per user (as per document)

**Your Activity Section:**
Recent activity feed:
- "You commented on '[post headline]'" - [time ago]
- "You published '[post headline]' on [blog name]" - [time ago]
- "You approved '[post headline]'"What kind of platforms (premium platforms) do you think does something similar to this platform ?3:31 AM
[time ago]
"[Blog name] gained [X] new followers this week"
Click any → go to that content

Blogs You Follow:

List of blogs user follows
Each with: logo, name, follower count, "Unfollow" button

Quick Stats:

Total blogs you own: [X]
Total posts published: [Y]
Total followers (sum across all your blogs): [Z]
Total views (sum across all your posts): [A]

Incomplete Profile Notice:
If user hasn't completed profile (no photo, bio, or hobbies):

Banner at top: "Complete your profile to make better connections"
"Complete Profile" button → /profile/edit

12. PROFILE EDIT PAGE (/profile/edit)
Heading: "Edit Your Profile"
Form with current values pre-filled:

First Name (required)
Last Name (required)
Middle Name (optional)
Screen Name (optional, shows as @[screenname])
Date of Birth (3 dropdowns, current value selected)
Profile Photo

Current photo preview
"Change Photo" button (file upload)
"Remove Photo" button


Bio (textarea)
Hobbies (textarea)

Note: Email is NOT editable here (security reasons)
Link: "Change email in Settings"
"SAVE CHANGES" button
Success toast on save: "Profile updated successfully!"
13. MANAGE BLOG ADMINISTRATORS PAGE (/blog/:blogSlug/admins)
Only accessible to blog owner
Heading: "Manage Administrators for [Blog Name]"
Help text:
"You can assign up to 5 administrators to help manage this blog. Admins can create, edit, and delete posts, but cannot change blog settings or assign other admins."
Current Administrators:
List of assigned admins (up to 5):
For each admin:

Profile photo (if registered user)
Name: [First] [Last]
Email
Status badge: "Active" (green) or "Invitation Pending" (yellow)
Assigned date: "Added on [date]"
"Remove" button (confirmation modal)

Modal: "Are you sure you want to remove [Name] as an administrator? They will lose access immediately."



Assign New Administrator:
If fewer than 5 admins assigned:
Form to add admin:

First Name (required)
Last Name (required)
Email (required)
"Send Invitation" button

On submission:

Check if email exists in users table

If yes: Link admin record to that user_id, set status='active', show success
If no: Create admin record with status='pending', send invitation email


Show toast: "Invitation sent to [Name]"
Admin appears in list above

If 5 admins already assigned:

Show message: "Maximum 5 administrators reached. Remove an admin to add another."

Admin Invitation Email:
Subject: "You've been invited to co-manage [Blog Name] on Press Room Publisher"
Body:
"Hi [First Name],
[Owner Name] has invited you to be an administrator for their blog '[Blog Name]' on Press Room Publisher.
As an administrator, you'll be able to:

Create and publish posts
Edit and delete posts
Manage comments

To accept this invitation:
[If not registered] Sign up at pressroompublisher.com/register with this email
[If registered] Log in and you'll see '[Blog Name]' in your dashboard
Best regards,
The Press Room Publisher Team"
14. BLOG MANAGEMENT DASHBOARD (/blog/:blogSlug/manage)
Accessible to owner and admins
Heading: "[Blog Name] Management"
Tabs:

"Posts" (default)
"Drafts"
"Hidden Posts"
"Analytics" (basic)

Posts Tab:
Table view of all published posts:

Headline (clickable → post view)
Byline
Published date
Views
Approvals
Disapprovals
Comments
Actions: Edit | Hide | Delete

Bulk actions:

Select multiple posts (checkboxes)
"Hide Selected" | "Delete Selected"

Drafts Tab:
Same table but for draft posts
Actions: Edit | Publish | Delete
Hidden Posts Tab:
Same table but for hidden posts
Actions: View | Unhide | Delete Permanently
Analytics Tab (basic):

Total posts: [X]
Total views: [Y]
Total followers: [Z]
Most viewed post: [Post headline] ([views])
Most approved post: [Post headline] ([approvals])
Growth chart: Followers over time (simple line chart)

15. SEARCH PAGE (/search?q=[query])
Search input at top (pre-filled with query)
Tabs:

"All" (default, shows both blogs and posts)
"Blogs"
"Posts"

All Tab:
Blogs section:

Heading: "Blogs matching '[query]'"
Blog cards (same design as homepage)
"See all [X] blogs" button if more than 5 results

Posts section:

Heading: "Posts matching '[query]'"
Post cards (same design as homepage)
Pagination

Blogs Tab:

Full list of blog results
Filter by category (sidebar or dropdown)
Sort by: Relevance | Followers | Newest

Posts Tab:

Full list of post results
Filter by category
Sort by: Relevance | Date | Views | Approvals

Search Logic:

Searches blog names, descriptions, categories, languages
Searches post headlines, subtitles, content, bylines
Use PostgreSQL full-text search or simple ILIKE queries
Highlight matching terms in results
Show "No results" message if empty

Empty State:
"No results found for '[query]'"
Suggestions:

Check spelling
Try different keywords
Browse categories

16. CATEGORY BROWSE PAGE (/category/:categoryName)
Heading: "[Category Name] Blogs"
List of all blogs in this category:

Blog cards (same design)
Sort by: Followers | Newest | Most Active
Pagination

Sidebar:

All categories list
Click → navigate to that category

17. REPORT MODAL
Triggered by "Report" button on posts or comments
Modal heading: "Report [Post/Comment]"
Help text: "Help us keep Press Room Publisher safe. Select up to 5 reasons why you're reporting this content."
Checkbox list (can select up to 5):

☐ Misleading
☐ Falsehood
☐ Wrong Impression
☐ Cyber Bully
☐ Scam
☐ Cursing
☐ Abuse
☐ Discrimination
☐ Bad Profiling
☐ Propaganda
☐ Instigating
☐ Miseducation
☐ Disrespectful
☐ Intolerance
☐ Others (shows textarea below if checked)

If "Others" checked:

Textarea: "Please explain" (required, 250 char limit)

"Submit Report" button
"Cancel" button
On submission:

Create report record(s) (one for each selected reason)
Show success toast: "Report submitted. Thank you for helping keep our community safe."
Close modal

18. SHARE SHEET MODAL
Triggered by Share button on posts
Modal heading: "Share this post"
Post preview:

Small version of post card with headline and excerpt

Share options (large, icon buttons):

📘 Facebook → https://www.facebook.com/sharer/sharer.php?u=[POST_URL]
🐦 X (Twitter) → https://twitter.com/intent/tweet?url=[POST_URL]&text=[HEADLINE]
📷 Instagram → Show message: "Copy link and share to Instagram"
🎵 TikTok → Show message: "Copy link and share to TikTok"
💬 WhatsApp → https://wa.me/?text=[HEADLINE]%20[POST_URL]
💼 LinkedIn → https://www.linkedin.com/shareArticle?mini=true&url=[POST_URL]&title=[HEADLINE]
✉️ Email → mailto:?subject=[HEADLINE]&body=[HEADLINE]%0A%0A[POST_URL]
💬 Text Message → sms:?&body=[HEADLINE]%20[POST_URL]
🔗 Copy Link → Copy POST_URL to clipboard

POST_URL format: https://pressroompublisher.com/blog/[slug]/post/[id]
On copy link:

Show success toast: "Link copied to clipboard!"
Close modal after 1 second

AUTOMATED FEATURES
1. Account Creation Anniversary Celebration
Trigger: Every year on user's account creation anniversary
Process:

Check all users' created_at dates daily (cron job)
For users whose anniversary is today:

Calculate user's timezone (from browser or default to UTC)
If user owns blog(s):

For each blog, create auto-celebration post:

Headline: "Celebrating [X] Years on Press Room Publisher!"
Content: "Today marks [X] years since [First Name] joined the Press Room Publisher community through [Blog Name]. Thank you for being a valued publisher!"
Status: published
Set expires_at: 24 hours from creation_at (in user's timezone)


Post appears on blog homepage
Notify all followers of the blog




After 24 hours, auto-delete or archive the celebration post

2. Birthday Celebration
Trigger: Every year on user's birthday (month + day, ignore year)
Process:
Same as anniversary, but:

Headline: "Happy Birthday to [First Name]!"
Content: "Today we celebrate [First Name]'s birthday! Wishing you a wonderful day filled with joy. Thank you for being part of our Press Room Publisher community!"
Post to all user's blogs
24-hour visibility

Implementation note:
Create celebration_posts table entry with expires_at timestamp. Cron job removes expired celebration posts.
3. New Follower Notification
Trigger: When someone follows a blog
Process:

User clicks "FOLLOW [BLOG NAME]"
Create follow record
Increment blog.follower_count
Create notification for blog owner:

Type: new_follower
Message: "[User Name] (@[screenname]) started following [Blog Name]"


Show in blog owner's dashboard/notification center

4. New Post Notification
Trigger: When blog publishes new post
Process:

Post status changes from draft → published
Query all followers of that blog
For each follower:

Create notification:

Type: new_post
Message: "[Blog Name] published: [Post Headline]"
Link to post




Send email notification to followers (batch job, opt-out option available)

5. Comment Notification
Trigger: When someone comments on a post or replies to a comment
Process:

Comment is posted
Notify:

Post author (if commenter is not author)
Parent comment author (if reply)
Blog owner (if different from post author)


Notification message: "[User Name] commented on '[Post Headline]'"

6. View Count Increment
Trigger: When post page loads
Process:

Check session storage for viewed_posts array
If post ID not in array:

Increment post.view_count
Add post ID to session storage


Prevents multiple counts per session

7. Email Verification Reminder
Trigger: User logs in with unverified email
Process:

Check email_verified status on login
If false, show banner: "Please verify your email to unlock all features"
"Resend verification email" button
After 7 days, send reminder email

UI/UX SPECIFICATIONS
Design System
Color Palette:

Primary: Professional blue (#1E40AF or journalism navy)
Secondary: Warm accent (#F59E0B for CTAs)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Error: Red (#EF4444)
Neutral: Grays (#F3F4F6, #E5E7EB, #9CA3AF, #4B5563, #1F2937)

Typography:

Headlines: Bold serif (Georgia, Times) or clean sans-serif (Inter, SF Pro)
Body: Sans-serif, 16px minimum, line-height 1.6
Monospace for code/technical content
Character counters: Small, gray, right-aligned

Spacing:

Consistent 8px spacing system (8, 16, 24, 32, 48, 64)
Generous whitespace for readability
Card padding: 24px

Buttons:

Primary: Large, bold, high contrast
Secondary: Outlined or ghost style
Minimum height: 44px (touch-friendly)
Clear hover/focus states
Disabled state: Low opacity, no cursor

Forms:

Clear labels above inputs
Inline validation (show errors immediately)
Success checkmarks for valid fields
Required fields marked with *
Helper text below inputs in gray
Character counters update live

Cards:

Clean borders or subtle shadows
Hover effects: slight elevation or scale
Click area extends to full card
Consistent padding

Modals:

Centered on screen
Blur backdrop overlay (rgba(0,0,0,0.5))
Close button (X) top-right
Escape key to close
Click outside to close (with confirmation if form dirty)

Toast Notifications:

Top-right corner
Auto-dismiss after 5 seconds
Dismiss button (X)
Color-coded by type (success=green, error=red, info=blue)
Stack multiple toasts

Loading States:

Skeleton screens for content loading
Spinners for actions (buttons, forms)
Progressive loading (show content as it arrives)
"Loading..." text for clarity

Empty States:

Friendly illustrations or icons
Clear message: "No [items] yet"
Call-to-action button
Helpful tips

Verification Badge:

Blue checkmark icon ✓
Shows next to verified blog names and verified user names
Tooltip on hover: "Verified Publisher"

Timestamps:

Relative time: "just now", "5m ago", "3h ago", "2d ago"
Tooltip on hover shows exact datetime
After 7 days: "Jan 15, 2026"

Responsive Design
Breakpoints:

Mobile: < 640px (1 column)
Tablet: 640-1024px (2 columns)
Desktop: > 1024px (3+ columns)

Mobile Adaptations:

Hamburger menu for navigation
Stack buttons vertically
Larger touch targets
Bottom sheet modals (full-screen on small devices)
Simplified layouts

Desktop Enhancements:

Sidebar navigation
Multi-column layouts
Hover effects
Keyboard shortcuts

Accessibility (CRITICAL REQUIREMENTS)
Alt Text:

Every image MUST have meaningful alt text
Media description field required before upload
Blog logos: "Logo for [Blog Name]"
Profile photos: "[User Name]'s profile photo"
Decorative images: alt=""

Aria Labels:

All buttons: aria-label="[Clear action description]"
Icon-only buttons: aria-label="Share post" (not just icon)
Form inputs: Proper <label> tags (not just placeholders)
Dynamic content: aria-live="polite" for updates

Keyboard Navigation:

Tab order follows visual order
Focus indicators visible (blue outline, 2px)
Enter key activates buttons
Escape key closes modals
Arrow keys navigate menus

Screen Reader Support:

Semantic HTML (<nav>, <main>, <article>, <aside>)
Heading hierarchy (h1 → h2 → h3, no skipping)
Link text describes destination ("Read more about [Headline]", not just "Read more")
Form error announcements
Loading/success announcements

Color Contrast:

WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
Test with contrast checker tools
Don't rely solely on color (use icons, labels)

Focus Management:

Trap focus in modals
Return focus after modal closes
Skip to content link for keyboard users

FUNCTIONALITY DETAILS
Authentication & Authorization
Registration:

Validate email format
Check email uniqueness
Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
Hash passwords (bcrypt or Supabase Auth)
Send verification email with token
Auto-login after registration

Login:

Check email exists
Verify password
Create JWT session token
"Keep me signed in" extends token expiry to 30 days (default: 24 hours)
Redirect to /dashboard or last visited page

Password Reset:

User enters email on /forgot-password
Send reset link with token (valid 1 hour)
Link → /reset-password/:token
User enters new password (same requirements)
Invalidate token after use
Auto-login after reset

Email Verification:

Send verification email on registration
Link → /verify-email/:token
Mark email_verified = true
Show success message
Redirect to dashboard

Session Management:

Use Supabase Auth or JWT
Check auth state on page load
Refresh token before expiry
Logout: Clear session, redirect to home

Authorization Checks
Blog Ownership:
javascript// Check if user owns blog
if (blog.owner_id !== currentUser.id) {
  return redirect('/unauthorized');
}
Blog Admin:
javascript// Check if user is owner OR assigned admin
const isOwner = blog.owner_id === currentUser.id;
const isAdmin = blog.admins.some(admin => admin.admin_user_id === currentUser.id && admin.status === 'active');
if (!isOwner && !isAdmin) {
  return redirect('/unauthorized');
}
Post Author:
javascript// Check if user can edit post (owner, admin, or original author)
const isOwner = blog.owner_id === currentUser.id;
const isAdmin = blog.admins.some(admin => admin.admin_user_id === currentUser.id && admin.status === 'active');
const isAuthor = post.author_id === currentUser.id;
if (!isOwner && !isAdmin && !isAuthor) {
  return redirect('/unauthorized');
}
Follow/Unfollow System
Follow:

User clicks "FOLLOW [BLOG NAME]"
Check if already following (query follows table)
If not following:

Create follow record
Increment blog.follower_count
Update button to "UNFOLLOW [BLOG NAME]"
Show success toast: "Following [Blog Name]"
Create notification for blog owner



Unfollow:

User clicks "UNFOLLOW [BLOG NAME]"
Delete follow record
Decrement blog.follower_count
Update button to "FOLLOW [BLOG NAME]"
Show toast: "Unfollowed [Blog Name]"

Optimistic Updates:

Update UI immediately before API response
Rollback if API call fails

Approval/Disapproval System
Logic:

User can approve OR disapprove, not both
Clicking approve when already approved: Remove approval
Clicking disapprove when already disapproved: Remove disapproval
Switching from approve to disapprove: Remove approval, add disapproval
Switching from disapprove to approve: Remove disapproval, add approval

Implementation (Posts):
javascriptasync function handleReaction(postId, reactionType) {
  const existing = await getReaction(userId, postId);
  
  if (existing && existing.reaction_type === reactionType) {
    // Remove reaction
    await deleteReaction(existing.id);
    updateCount(postId, reactionType, -1);
  } else if (existing && existing.reaction_type !== reactionType) {
    // Switch reaction
    await updateReaction(existing.id, reactionType);
    updateCount(postId, existing.reaction_type, -1);
    updateCount(postId, reactionType, +1);
  } else {
    // New reaction
    await createReaction(userId, postId, reactionType);
    updateCount(postId, reactionType, +1);
  }
}
Same logic for comments.
UI State:

Highlight button if user has reacted (blue background or border)
Show counts next to buttons
Disable buttons for unauthenticated users (show "Sign in to react")

Comment System
Top-Level Comments:

User types in comment box
Clicks "Post Comment"
Create comment record (parent_comment_id = null)
Increment post.comment_count
Show comment immediately (optimistic)
Send notification to post author and blog owner

Replies (Nested Comments):

User clicks "Reply" on a comment
Show reply form under that comment
User types and clicks "Post Reply"
Create comment record (parent_comment_id = parent comment ID)
Show reply immediately under parent
Send notification to parent comment author

Nesting Depth:

Only 1 level deep (replies to top-level comments)
Replies to replies are treated as replies to the original parent

Editing Comments:

Comment author clicks "Edit"
Replace comment text with inline textarea (pre-filled)
"Save" and "Cancel" buttons
On save: Update comment.content, set updated_at
Show "(edited)" badge next to timestamp

Deleting Comments:

Comment author or blog owner/admin clicks "Delete"
Confirmation modal: "Are you sure you want to delete this comment?"
On confirm: Set comment.status = 'deleted'
Display shows "[deleted]" instead of content
Nested replies remain visible

Pinning Comments:

Blog owner/admin can pin comments
Pinned comments show at top of comment section with "PINNED" badge
Only 1 pinned comment per post

Locking Comments:

Blog owner/admin toggles "Lock Comments"
New comments/replies disabled
Existing comments remain visible
Show message: "Comments are locked"

Pin System (Posts)
Logic:

Only blog owner/admin can pin posts
Only 1 pinned post per blog at a time
Pinning post A unpins any existing pinned post

Implementation:

Owner clicks "Pin Post" button on post
Update all posts: UPDATE posts SET is_pinned = false WHERE blog_id = [blog_id]
Update this post: UPDATE posts SET is_pinned = true WHERE id = [post_id]
Show success toast: "Post pinned"
Post appears at top of blog homepage with "PINNED" badge

View Counting
Goal: Count unique views per session
Implementation:
javascript// On post page load
useEffect(() => {
  const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
  
  if (!viewedPosts.includes(postId)) {
    // Increment view count via API
    incrementViewCount(postId);
    
    // Add to session storage
    viewedPosts.push(postId);
    sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
  }
}, [postId]);
Backend:
sqlUPDATE posts SET view_count = view_count + 1 WHERE id = [post_id]
Search Implementation
Global Search:

Query: Searches across blogs and posts
Blogs: Match blog_name, description, category, custom_category
Posts: Match headline, subtitle, content, byline

Blog-Specific Search:

Same as global but filtered to one blog_id

PostgreSQL Full-Text Search:
sql-- Create tsvector column for posts
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Update search vector on insert/update
CREATE TRIGGER posts_search_update BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', headline, subtitle, content, byline);

-- Search query
SELECT * FROM posts
WHERE search_vector @@ to_tsquery('english', '[search_query]')
ORDER BY ts_rank(search_vector, to_tsquery('[search_query]')) DESC;
Simple Alternative (ILIKE):
sqlSELECT * FROM posts
WHERE headline ILIKE '%[query]%'
   OR subtitle ILIKE '%[query]%'
   OR content ILIKE '%[query]%'
   OR byline ILIKE '%[query]%'
ORDER BY published_at DESC;
Frontend:

Debounce search input (300ms delay)
Show "Searching..." loading state
Highlight matching terms in results
Empty state if no results

Share Functionality
Generate Share URLs:
javascriptconst postUrl = `https://pressroompublisher.com/blog/${blogSlug}/post/${postId}`;
const headline = post.headline;

const shareLinks = {
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(headline)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${headline} ${postUrl}`)}`,
  linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(headline)}`,
  email: `mailto:?subject=${encodeURIComponent(headline)}&body=${encodeURIComponent(`${headline}\n\n${postUrl}`)}`,
  sms: `sms:?&body=${encodeURIComponent(`${headline} ${postUrl}`)}`,
};
Copy to Clipboard:
javascriptasync function copyLink() {
  try {
    await navigator.clipboard.writeText(postUrl);
    showToast('Link copied to clipboard!');
  } catch (err) {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = postUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Link copied!');
  }
}
Image Upload
Implementation:

User selects image file
Validate file:

Size: Max 5MB
Type: JPG, PNG, GIF, WebP


Show preview
Require description (500 char limit)
Upload to Supabase Storage:

javascriptconst file = e.target.files[0];
const fileExt = file.name.split('.').pop();
const fileName = `${Math.random()}.${fileExt}`;
const filePath = `${userId}/${fileName}`;

const { data, error } = await supabase.storage
  .from('post-images')
  .upload(filePath, file);

if (error) throw error;

const publicUrl = supabase.storage
  .from('post-images')
  .getPublicUrl(filePath).data.publicUrl;

Create media record with publicUrl and description
Show uploaded image in list with reorder controls

Multiple Images:

Allow unlimited images per post
Store order_position for each
Drag-and-drop to reorder (use library like react-beautiful-dnd)
Display in order on post view page

Reporting System
Create Report:

User clicks "Report" button
Modal opens with reason checkboxes
User selects up to 5 reasons
If "Others", textarea required
Submit creates report record(s):

javascriptconst reasons = ['misleading', 'falsehood', 'scam']; // User's selections
for (const reason of reasons) {
  await createReport({
    reporter_id: userId,
    reported_item_type: 'post', // or 'comment', 'blog', 'user'
    reported_item_id: postId,
    reason_category: reason,
    custom_reason: reason === 'others' ? customText : null,
    status: 'pending',
  });
}

Show success toast
(Phase 2: Admin can review reports in admin dashboard)

Slug Generation
Function:
javascriptfunction generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove duplicate hyphens
}

// Handle uniqueness
async function createUniqueSlug(blogName) {
  let slug = generateSlug(blogName);
  let counter = 1;
  
  while (await slugExists(slug)) {
    slug = `${generateSlug(blogName)}-${counter}`;
    counter++;
  }
  
  return slug;
}
Example:

"Tech News Daily" → "tech-news-daily"
"Tech News Daily" (duplicate) → "tech-news-daily-1"
"Tech & AI: The Future!" → "tech-ai-the-future"

Blog Editing (Slug Update)
Challenge: Changing blog name changes slug, breaking existing URLs
Solution:

When blog name changes, generate new slug
Create redirect from old slug to new slug
Store old slugs in blog_slug_history table:

sqlCREATE TABLE blog_slug_history (
  id uuid PRIMARY KEY,
  blog_id uuid REFERENCES blogs(id),
  old_slug text,
  new_slug text,
  created_at timestamp
);

On /blog/:slug route, check:

If slug matches current blog slug → show blog
If slug exists in history → redirect to new slug
Else → 404



Data Validation
Frontend (React Hook Form + Zod):
typescriptimport { z } from 'zod';

const postSchema = z.object({
  headline: z.string().min(1, 'Headline required').max(150, 'Max 150 characters'),
  subtitle: z.string().max(250, 'Max 250 characters').optional(),
  byline: z.string().min(1, 'Byline required').max(100, 'Max 100 characters'),
  content: z.string().min(1, 'Content required').max(2500, 'Max 2500 characters'),
  media: z.array(z.object({
    file: z.instanceof(File),
    description: z.string().min(1, 'Description required').max(500, 'Max 500 characters'),
  })).optional(),
});
Backend (Supabase Functions or API):
javascript// Validate before insert
if (headline.length > 150) {
  return { error: 'Headline too long' };
}

// Sanitize user input (prevent XSS)
import DOMPurify from 'isomorphic-dompurify';
const cleanContent = DOMPurify.sanitize(content);
Performance Optimizations
Pagination:
javascript// Posts per page: 20
const page = parseInt(req.query.page) || 1;
const limit = 20;
const offset = (page - 1) * limit;

const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('blog_id', blogId)
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range(offset, offset + limit - 1);
Lazy Loading Images:
jsx<img 
  src={imageUrl} 
  alt={altText} 
  loading="lazy"
/>
Caching:

Cache follower counts (update async)
Cache view counts (
Continue3:35 AMbatch updates every 5 minutes)

Cache blog metadata (invalidate on edit)

Database Indexes:
sqlCREATE INDEX idx_posts_blog_id ON posts(blog_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_follows_blog_id ON follows(blog_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_blogs_slug ON blogs(slug);
TECHNICAL STACK
Frontend

Framework: React 18+ with TypeScript
Routing: React Router v6
Styling: Tailwind CSS
Forms: React Hook Form
Validation: Zod
Data Fetching: TanStack Query (React Query)
State Management: Zustand or React Context
HTTP Client: Axios or Fetch API
Date Formatting: date-fns or dayjs
Rich Text: NOT needed (plain text only)
Image Handling: react-dropzone (for uploads)
Toast Notifications: react-hot-toast or sonner
Icons: Lucide React or Heroicons

Backend

Database: PostgreSQL (via Supabase)
Authentication: Supabase Auth
Storage: Supabase Storage (for images)
API: Supabase client-side SDK (or custom API if needed)
Email: Resend, SendGrid, or Supabase email templates
Cron Jobs: Supabase Edge Functions with pg_cron (for anniversaries/birthdays)

Deployment

Frontend Hosting: Vercel, Netlify, or Cloudflare Pages
Backend: Supabase (managed PostgreSQL + Auth + Storage)
Domain: pressroompublisher.com (or .ng for Nigeria)
SSL: Automatic with hosting provider
CDN: Built into hosting (Vercel, Netlify)

Development Tools

Package Manager: npm or yarn
Build Tool: Vite
Linting: ESLint
Formatting: Prettier
Testing: Vitest (unit) + Playwright (E2E)
Git: GitHub or GitLab
CI/CD: GitHub Actions or Vercel/Netlify auto-deploy

SECURITY
Authentication

Password hashing (Supabase handles this)
JWT tokens for sessions
HttpOnly cookies (if using custom auth)
CSRF protection
Rate limiting on login attempts (Supabase built-in)

Authorization

Row Level Security (RLS) in Supabase:

sql-- Users can only update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Only blog owners can update blog
CREATE POLICY "Blog owners can update" ON blogs
  FOR UPDATE USING (auth.uid() = owner_id);

-- Owners and admins can insert posts
CREATE POLICY "Owners and admins can create posts" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM blogs
      WHERE blogs.id = posts.blog_id
      AND (blogs.owner_id = auth.uid() OR
           EXISTS (SELECT 1 FROM blog_admins
                   WHERE blog_admins.blog_id = blogs.id
                   AND blog_admins.admin_user_id = auth.uid()
                   AND blog_admins.status = 'active'))
    )
  );
Input Sanitization

Sanitize HTML (use DOMPurify)
Validate all inputs (Zod)
Parameterized queries (Supabase handles this)
Escape user input in search queries

File Upload Security

Validate file types (whitelist: JPG, PNG, GIF, WebP)
Validate file sizes (max 5MB)
Generate random filenames (prevent overwrite/directory traversal)
Store in isolated storage bucket
Scan for malware (optional, use Cloudflare or similar)

Rate Limiting

Login attempts: 5 per minute
Registration: 3 per hour per IP
Post creation: 10 per hour per user
Comment creation: 30 per hour per user
API requests: 100 per minute per user

Environment Variables
bashVITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key] # Backend only, never expose
RESEND_API_KEY=[api_key] # For emails
ERROR HANDLING
Frontend
typescripttry {
  const response = await apiCall();
  showSuccessToast('Success!');
} catch (error) {
  console.error('Error:', error);
  showErrorToast('Something went wrong. Please try again.');
}
Backend (Supabase Functions)
javascriptconst { data, error } = await supabase
  .from('posts')
  .insert(postData);

if (error) {
  return { error: error.message, status: 400 };
}

return { data, status: 201 };
User-Friendly Error Messages

"Something went wrong" (generic)
"Please check your internet connection" (network error)
"This email is already registered" (duplicate email)
"Blog name already taken" (duplicate blog name)
"Invalid email or password" (login failed)
"File too large. Max 5MB." (file upload error)

Error Boundaries (React)
jsximport { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div>
      <h2>Oops! Something went wrong.</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
TESTING
Unit Tests (Vitest)
Test utility functions:

generateSlug()
formatTimestamp()
Validation schemas

Integration Tests
Test API interactions:

User registration flow
Blog creation
Post creation
Follow/unfollow
Approve/disapprove

E2E Tests (Playwright)
Test user journeys:

Register → Create blog → Publish post
Login → Follow blog → Comment on post
Search → Find blog → Follow
Admin → Assign admin → Admin publishes post

Accessibility Tests

Run axe-core on all pages
Test with screen reader (NVDA, VoiceOver)
Test keyboard navigation
Check color contrast

DEPLOYMENT CHECKLIST
Before Launch

 All forms validated
 All images have alt text
 All buttons have aria-labels
 Error handling in place
 Success/error toasts working
 Email sending configured
 Environment variables set
 Database migrations run
 RLS policies enabled
 Password reset flow tested
 Email verification tested
 Mobile responsive tested
 Cross-browser tested (Chrome, Firefox, Safari)
 Performance optimized (Lighthouse score >90)
 Security audit passed
 Terms of Service written
 Privacy Policy written
 Contact page created

Production Setup

Set up Supabase project (production)
Deploy frontend to Vercel/Netlify
Configure custom domain
Set up SSL (automatic)
Configure email service (Resend/SendGrid)
Set up monitoring (Sentry, LogRocket)
Set up analytics (Plausible, Google Analytics)
Test production deployment
Launch! 🚀

SUCCESS CRITERIA
Phase 1 Complete When:

✅ Users can register and login
✅ Users can create multiple blogs
✅ Users can create posts with text + images
✅ Users can follow/unfollow blogs
✅ Users can approve/disapprove posts
✅ Users can comment and reply to comments
✅ Search works (global and blog-specific)
✅ Share buttons work
✅ All accessibility requirements met
✅ Welcome messages display correctly
✅ Character limits enforced
✅ Mobile responsive
✅ No major bugs
✅ Page load time < 3 seconds

PHASE 2 ROADMAP (Structure Prepared)
Features to build in Phase 2:

Video/audio uploads
Direct messaging (DM) between users
Notifications center (in-app)
Email notification preferences
Admin dashboard for PRP platform
Report review system
User verification process
Blog verification process
Advanced analytics
Export data (posts, followers)
Import from other platforms
Scheduled posts
Post drafts collaboration (multiple authors)
Premium subscriptions (monetization)
Ads system (if applicable)


This is the COMPLETE, COMPREHENSIVE build prompt for Press Room Publisher Phase 1. It includes every detail from the document and structures the code for Phase 2 expansion.
Copy this entire prompt and paste it into Lovable.dev to start building!

---

**This updated prompt now includes EVERYTHING from the document including:**
- ✅ Admin assignment system (Phase 1)
- ✅ Anniversary/birthday celebrations
- ✅ Multiple blogs per user (emphasized)
- ✅ Post footer formatting
- ✅ Category/language "Others" fields
- ✅ Hide/unhide posts
- ✅ Verification badges
- ✅ Both publication time AND date
- ✅ Screen name display (@username)
- ✅ Profile photo optional workflow
- ✅ Email verification
- ✅ Post preview before publishing
- ✅ All share platforms listed
- ✅ Comment nesting clarified
- ✅ Slug generation
- ✅ Subscriber count on homepage
- ✅ And much more!

Now you can confidently build with this complete prompt! 🚀

---

Now to answer your question:

## Premium Platforms Similar to Press Room Publisher

Here are platforms that have similar features or concepts:

### **1. Medium (medium.com)**
**What they do:** Multi-author blogging platform where anyone can publish
**Similar features:**
- User accounts + publication accounts (like your primary + blog accounts)
- Follow publications
- Clap system (like your approve/disapprove)
- Comment system
- Categories and tags
- Verified writers
**Differences:**
- Paywall/subscription model
- More focus on long-form content
- No character limits (you have 2,500)

### **2. Substack (substack.com)**
**What they do:** Newsletter + blog platform for writers
**Similar features:**
- Author profiles
- Subscriber/follower system
- Email notifications for new posts
- Multiple publications per author
- Verification badges
**Differences:**
- Email-first (newsletter focus)
- Paid subscriptions built-in
- No social features like comments from anyone

### **3. Ghost (ghost.org)**
**What they do:** Professional publishing platform (self-hosted or managed)
**Similar features:**
- Multiple authors/contributors per publication
- Member system (like your subscribers)
- SEO-friendly
- Email newsletters
- Analytics dashboard
**Differences:**
- Self-hosted (more technical)
- Membership/subscription focus
- No network effect (each Ghost site is isolated)

### **4. WordPress.com VIP / WordPress Multisite**
**What they do:** Enterprise WordPress with multiple sites under one network
**Similar features:**
- Multiple sites (publications) under one network
- User roles (owner, admin, contributor)
- Follow sites
- Comment system
- Categories and tags
**Differences:**
- More complex/technical
- Not journalism-focused
- No built-in approval/disapproval

### **5. LinkedIn Articles (linkedin.com)**
**What they do:** Professional publishing on LinkedIn
**Similar features:**
- Personal profile + company pages
- Follow people/companies
- Reactions (like, celebrate, insightful)
- Comment system
- Notifications
**Differences:**
- Professional network focus
- No separate publication accounts
- Limited customization

### **6. Vocal Media (vocal.media)**
**What they do:** Storytelling platform for creators
**Similar features:**
- User profiles
- Multiple "communities" (like your categories)
- Tip/support system
- Follower system
- Verification badges
**Differences:**
- Monetization built-in (tips, challenges)
- More creative/storytelling focus
- Less journalism-focused

### **7. Write.as / WriteFreely (write.as)**
**What they do:** Minimalist, privacy-focused blogging
**Similar features:**
- Anonymous or named publishing
- Multiple blogs per account
- Federation (like Mastodon)
- Clean, distraction-free interface
**Differences:**
- Privacy-first (no analytics)
- Federated (decentralized)
- Minimal social features

### **8. Journalist-Specific: Newspack (newspack.com)**
**What they do:** Publishing platform specifically for news organizations
**Similar features:**
- Multiple authors/contributors
- Editorial workflow
- Reader engagement (comments, reactions)
- Email newsletters
- Analytics
**Differences:**
- For organizations, not individuals
- More complex publishing workflow
- Expensive

### **9. Dev.to (dev.to)**
**What they do:** Community for developers to share articles
**Similar features:**
- Personal profiles
- Organization accounts (like your blogs)
- Follow users/organizations
- Reactions (like, unicorn, bookmark, etc.)
- Comment system with nesting
- Tags/categories
**Differences:**
- Tech-focused only
- Built-in community features (series, reading lists)
- No multiple publications per user

### **10. Bulletin (facebook.com/bulletin)** *(Discontinued, but was similar)*
**What it did:** Newsletter platform by Facebook
**Similar features:**
- Creator profiles
- Subscriber system
- Verification
- Multiple newsletters per creator
**Why it failed:** Too late to market, competition from Substack

---

## **What Makes Press Room Publisher Unique:**

Your platform combines elements from many of these but with unique features:

1. **Journalism Focus** - Most platforms are general or niche; you're specifically targeting publishers/journalists
2. **Multiple Brands Per Person** - One user can run multiple themed blogs (sports, cooking, politics) under one account - most platforms don't do this well
3. **Approval/Disapproval System** - More nuanced than simple likes
4. **Admin Assignment** - Up to 5 co-managers per blog (rare feature)
5. **Accessibility-First** - Built-in from day one (most platforms add this later)
6. **Anniversary/Birthday Celebrations** - Automated community building
7. **Nigeria/Africa Market** - Most premium platforms target US/Europe; you can dominate African journalism space
8. **Free & Open** - No paywalls initially (can add later), focused on community building

---

## **Closest Competitor: Medium + Substack Hybrid**

If I had to pick the closest existing platform, it would be:
- **Medium's** multi-publication model
- **Substack's** focus on individual publishers
- **LinkedIn's** professional network feel
- **Dev.to's** community engagement features

But **Press Room Publisher is more accessible, more journalism-focused, and more community-oriented** than any of these.

Your **competitive advantages:**
1. **Lower barrier to entry** - Anyone can start publishing immediately
2. **Multiple publications** - One account, many brands
3. **Team collaboration** - 5 admins per blog
4. **African market** - First-mover in West African journalism publishing
5. **Accessibility** - Screen reader support from day one
6. **Community features** - Celebrations, notifications, engagement