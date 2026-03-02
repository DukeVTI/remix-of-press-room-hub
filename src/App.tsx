import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import CreateBlog from "./pages/CreateBlog";
import BlogView from "./pages/BlogView";
import BlogAbout from "./pages/BlogAbout";
import PublisherProfile from "./pages/PublisherProfile";
import BlogManage from "./pages/BlogManage";
import EditBlog from "./pages/EditBlog";
import ManageBlogAdmins from "./pages/ManageBlogAdmins";
import CreatePost from "./pages/CreatePost";
import PostView from "./pages/PostView";
import EditPost from "./pages/EditPost";
import ProfileEdit from "./pages/ProfileEdit";
import Settings from "./pages/Settings";
import SecuritySettings from "./pages/SecuritySettings";
import Search from "./pages/Search";
import CategoryBrowse from "./pages/CategoryBrowse";
import About from "./pages/About";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NewsCircle from "./pages/NewsCircle";
import Career from "./pages/Career";
import ConnectPage from "./pages/ConnectPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ReportsModeration from "./pages/ReportsModeration";
import UserManagement from "./pages/UserManagement";
import ContentOverview from "./pages/ContentOverview";
import BlogManagement from "./pages/BlogManagement";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import ActivityLog from "./pages/ActivityLog";
import AdminSettings from "./pages/AdminSettings";
import FlaggedWatchList from "./pages/FlaggedWatchList";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminLogin from "./pages/AdminLogin";

import SkipToContent from "@/components/SkipToContent";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => {
  // Prevent browser extensions (e.g. MetaMask) from crashing the app with unhandled rejections
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("MetaMask") || event.reason?.toString()?.includes("MetaMask")) {
        event.preventDefault();
        console.warn("Suppressed MetaMask extension error:", event.reason);
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SkipToContent />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
          <Route path="/blogs/create" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
          <Route path="/blog/:blogSlug/manage" element={<ProtectedRoute><BlogManage /></ProtectedRoute>} />
          <Route path="/blog/:blogSlug/edit" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
          <Route path="/blog/:blogSlug/admins" element={<ProtectedRoute><ManageBlogAdmins /></ProtectedRoute>} />
          <Route path="/blog/:blogSlug/post/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/blog/:blogSlug/post/:postId/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />

          {/* Public blog/post routes */}
          <Route path="/blog/:blogSlug" element={<BlogView />} />
          <Route path="/blog/:blogSlug/about" element={<BlogAbout />} />
          <Route path="/blog/:blogSlug/publisher" element={<PublisherProfile />} />
          <Route path="/blog/:blogSlug/post/:postId" element={<PostView />} />
          <Route path="/search" element={<Search />} />
          <Route path="/category/:categorySlug" element={<CategoryBrowse />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/news-circle" element={<NewsCircle />} />
          <Route path="/career" element={<Career />} />
          <Route path="/connect" element={<ConnectPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/reports" element={<ProtectedAdminRoute><ReportsModeration /></ProtectedAdminRoute>} />
          <Route path="/admin/users" element={<ProtectedAdminRoute><UserManagement /></ProtectedAdminRoute>} />
          <Route path="/admin/content" element={<ProtectedAdminRoute><ContentOverview /></ProtectedAdminRoute>} />
          <Route path="/admin/blogs" element={<ProtectedAdminRoute><BlogManagement /></ProtectedAdminRoute>} />
          <Route path="/admin/analytics" element={<ProtectedAdminRoute><PlatformAnalytics /></ProtectedAdminRoute>} />
          <Route path="/admin/activity-log" element={<ProtectedAdminRoute><ActivityLog /></ProtectedAdminRoute>} />
          <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
          <Route path="/admin/watchlist" element={<ProtectedAdminRoute><FlaggedWatchList /></ProtectedAdminRoute>} />
          <Route path="/admin/announcements" element={<ProtectedAdminRoute><AdminAnnouncements /></ProtectedAdminRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
