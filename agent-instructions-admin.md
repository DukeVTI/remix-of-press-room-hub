# Agent Instructions: Comprehensive Admin Page Build Plan

## 1. Planning & Requirements
- List all admin features: reports moderation, user management, content/blog management, analytics, activity log, settings.
- Define admin roles: super_admin, moderator, support.
- Map permissions for each role.
- Detail workflows for each feature (e.g., report review, user suspension, blog featuring).
- Create user journey maps for each admin type.
- Confirm all required tables and columns exist (platform_admins, admin_activity_log, admin_alerts, reports, etc.).
- List all API endpoints needed for admin actions (fetch reports, resolve report, suspend user, etc.).
- Define request/response shapes for each endpoint.
- Specify row-level security policies for each admin table.
- Ensure only platform admins can access admin data/actions.
- Plan for audit logging of all admin actions.
- Prioritize MVP vs. advanced features.

## 2. UI/UX Design
- Create wireframes for dashboard, moderation, user/content/blog management, analytics, and settings.
- Design a modern, accessible, responsive admin theme (light/dark mode).
- Build UX flows for all actions (bulk, modals, confirmations).
- Validate with sample data and user feedback.

## 3. Development: Core Dashboard & Navigation
- Implement AdminLayout with sidebar, header, notifications.
- Add dashboard cards for key metrics and quick links.
- Integrate ProtectedAdminRoute and useAdminAuth for security.

## 4. Reports Moderation
- Build reports queue: table, filters, search, grouping.
- Implement report detail modal with context, actions, and admin notes.
- Add moderation actions: resolve, dismiss, warn, suspend, escalate.
- Record all actions in admin_activity_log.

## 5. User Management
- Develop user directory: search, filter, sort.
- User detail page: stats, moderation history, actions.
- Implement suspend, verify, delete, warn, and email actions.

## 6. Content Overview
- Real-time feed of posts/comments.
- Flagged content detection and review.
- Quick moderation actions (hide, delete, feature).
- Content stats and trends.

## 7. Blog Management
- Directory of all blogs: search, filter, sort.
- Blog actions: feature, verify, suspend, delete, recategorize.
- Category management UI (CRUD, merge, reorder).

## 8. Analytics
- Metrics dashboard: users, blogs, posts, engagement, growth.
- Charts: line, bar, pie, heatmap (Recharts/Chart.js).
- Trending content and user behavior insights.

## 9. Activity Log
- Audit log table: filter by admin, action, target, date.
- Export to CSV.
- Immutable, tamper-proof records.

## 10. Admin Settings
- Permissions management (role-based).
- Auto-moderation rules.
- Category/language management.
- Email template editor.

## 11. Testing
- Unit tests for hooks, components, and actions.
- Integration tests for workflows (Cypress/Playwright).
- E2E tests for critical admin flows.
- Accessibility (a11y) and UX testing.

## 12. Polish & Launch
- Responsive/mobile optimization.
- Dark mode and theme polish.
- Performance tuning (virtualization, lazy loading).
- Documentation for admin workflows and onboarding.

---

**Every step must be built, tested, and visually polished for a world-class experience.**
