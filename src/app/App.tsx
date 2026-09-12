import { lazy, Suspense } from "react";
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
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<Spinner label="Loading…" className="py-24" />}>
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
    </BrowserRouter>
  );
}
