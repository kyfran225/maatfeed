import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { RequireAuth } from "../components/layout/RequireAuth";
import { AuthPage } from "../features/auth/AuthPage";
import { FeedPage } from "../features/feed/FeedPage";
import { MaintenancePage } from "../pages/MaintenancePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { isMaintenanceMode } from "../config/runtime";

// Lazy load heavy pages
const AdminOpsPage = lazy(() => import("../pages/AdminOpsPage"));
const AdminIngestionPage = lazy(() => import("../pages/AdminIngestionPage"));
const AdminSponsorsPage = lazy(() => import("../pages/AdminSponsorsPage"));
const AudioPage = lazy(() => import("../features/audio/AudioPage"));
const CommunityPage = lazy(() => import("../pages/CommunityPage"));
const ContentDetailPage = lazy(() => import("../pages/ContentDetailPage"));
const DemoSectionTitlePage = lazy(() => import("../pages/DemoSectionTitlePage"));
const ListenPage = lazy(() => import("../features/listen/ListenPage"));
const TikTokDemoPage = lazy(() => import("../pages/TikTokDemoPage"));
const YouTubeDemoPage = lazy(() => import("../pages/YouTubeDemoPage"));
const ExplorePage = lazy(() => import("../pages/ExplorePage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const OnboardingPage = lazy(() => import("../pages/OnboardingPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const PremiumPage = lazy(() => import("../pages/PremiumPage"));
const ProfilePage = lazy(() => import("../features/profile/ProfilePage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const UploadPage = lazy(() => import("../features/upload/UploadPage"));
const SeoTopicPage = lazy(() => import("../pages/SeoTopicPage"));
const SponsorPage = lazy(() => import("../pages/SponsorPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicy"));
const LegalNoticePage = lazy(() => import("../pages/LegalNotice"));
const TermsOfServicePage = lazy(() => import("../pages/TermsOfService"));
const DataManagementPage = lazy(() => import("../pages/DataManagement"));
const AnalyticsDashboard = lazy(() => import("../pages/AnalyticsDashboard"));
const CreatorAnalytics = lazy(() => import("../pages/CreatorAnalytics"));
const SeriesListPage = lazy(() => import("../features/series/SeriesListPage"));
const SeriesDetailPage = lazy(() => import("../features/series/SeriesDetailPage"));
const DesktopPage = lazy(() => import("../pages/DesktopPage"));

// Simple fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
  </div>
);

// Wrapper for lazy pages
const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter(isMaintenanceMode ? [
  {
    path: "*",
    element: <MaintenancePage />,
    errorElement: <MaintenancePage />
  }
] : [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: "enhanced-feed", element: <FeedPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      {
        path: "onboarding",
        element: (
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        )
      },
      { path: "explore", element: <ExplorePage /> },
      { path: ":slug", element: <LazyPage><SeoTopicPage /></LazyPage> },
      {
        path: "notifications",
        element: (
          <RequireAuth>
            <LazyPage><NotificationsPage /></LazyPage>
          </RequireAuth>
        )
      },
      { path: "content/:contentId", element: <ContentDetailPage /> },
      { path: "community", element: <LazyPage><CommunityPage /></LazyPage> },
      { path: "debate/:contentId", element: <ContentDetailPage /> },
      { path: "audio", element: <AudioPage /> },
      { path: "listen", element: <LazyPage><ListenPage /></LazyPage> },
      { path: "series", element: <LazyPage><SeriesListPage /></LazyPage> },
      { path: "series/:id", element: <LazyPage><SeriesDetailPage /></LazyPage> },
      { path: "premium", element: <LazyPage><PremiumPage /></LazyPage> },
      { path: "sponsor", element: <LazyPage><SponsorPage /></LazyPage> },
      { path: "demo-section-title", element: <DemoSectionTitlePage /> },
      { path: "tiktok-demo", element: <LazyPage><TikTokDemoPage /></LazyPage> },
      { path: "youtube-demo", element: <LazyPage><YouTubeDemoPage /></LazyPage> },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        )
      },
      {
        path: "upload",
        element: (
          <RequireAuth>
            <LazyPage><UploadPage /></LazyPage>
          </RequireAuth>
        )
      },
      {
        path: "data-management",
        element: (
          <RequireAuth>
            <LazyPage><DataManagementPage /></LazyPage>
          </RequireAuth>
        )
      },
      { path: "privacy-policy", element: <LazyPage><PrivacyPolicyPage /></LazyPage> },
      { path: "legal-notice", element: <LazyPage><LegalNoticePage /></LazyPage> },
      { path: "terms-of-service", element: <LazyPage><TermsOfServicePage /></LazyPage> },
      {
        path: "analytics",
        element: (
          <RequireAuth>
            <LazyPage><AnalyticsDashboard /></LazyPage>
          </RequireAuth>
        )
      },
      {
        path: "creator-analytics",
        element: (
          <RequireAuth>
            <LazyPage><CreatorAnalytics /></LazyPage>
          </RequireAuth>
        )
      },
      { path: "desktop", element: <LazyPage><DesktopPage /></LazyPage> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOpsPage /> },
          { path: "ingestion", element: <AdminIngestionPage /> },
          { path: "sponsors", element: <AdminSponsorsPage /> }
        ]
      }
    ]
  }
]);
