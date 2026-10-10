import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute";
import { Spinner } from "@/components/ui/Spinner";

const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() =>
  import("@/pages/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage }))
);
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const TopicsPage = lazy(() => import("@/pages/TopicsPage").then((m) => ({ default: m.TopicsPage })));
const NewGamePage = lazy(() => import("@/pages/NewGamePage").then((m) => ({ default: m.NewGamePage })));
const GamePage = lazy(() => import("@/pages/GamePage").then((m) => ({ default: m.GamePage })));
const ResultsPage = lazy(() => import("@/pages/ResultsPage").then((m) => ({ default: m.ResultsPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </MotionConfig>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-orange px-4 py-3 font-bold text-on-orange focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        انتقل إلى المحتوى
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        <Suspense fallback={<Spinner label="بنجهّز قهوة…" className="py-24" />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Not gated by auth state on purpose — a host could click this
              link from an email while already signed in elsewhere. */}
            <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/games/new" element={<NewGamePage />} />
              <Route path="/games/:sessionId" element={<GamePage />} />
              <Route path="/games/:sessionId/results" element={<ResultsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
