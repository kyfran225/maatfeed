import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { RequireAuth } from "../components/layout/RequireAuth";
import { AuthPage } from "../pages/AuthPage";
import { FeedPage } from "../pages/FeedPage";
import { NotFoundPage } from "../pages/NotFoundPage";

// Lazy load heavy pages
const AdminOpsPage = lazy(() => import("../pages/AdminOpsPage"));
const AdminIngestionPage = lazy(() => import("../pages/AdminIngestionPage"));
const AudioPage = lazy(() => import("../pages/AudioPage"));
const CommunityPage = lazy(() => import("../pages/CommunityPage"));
const ContentDetailPage = lazy(() => import("../pages/ContentDetailPage"));
const DebateDetailPage = lazy(() => import("../pages/DebateDetailPage"));
const DemoSectionTitlePage = lazy(() => import("../pages/DemoSectionTitlePage"));
const ExplorePage = lazy(() => import("../pages/ExplorePage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const OnboardingPage = lazy(() => import("../pages/OnboardingPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const PremiumPage = lazy(() => import("../pages/PremiumPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicy"));
const LegalNoticePage = lazy(() => import("../pages/LegalNotice"));
const TermsOfServicePage = lazy(() => import("../pages/TermsOfService"));
const DataManagementPage = lazy(() => import("../pages/DataManagement"));

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

export const router = createBrowserRouter([
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
      { path: "debate/:contentId", element: <LazyPage><DebateDetailPage /></LazyPage> },
      { path: "audio", element: <AudioPage /> },
      { path: "premium", element: <LazyPage><PremiumPage /></LazyPage> },
      { path: "demo-section-title", element: <DemoSectionTitlePage /> },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <ProfilePage />
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
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOpsPage /> },
          { path: "ingestion", element: <AdminIngestionPage /> }
        ]
      }
    ]
  }
]);
