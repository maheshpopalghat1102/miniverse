
import {
  Suspense,
  lazy
} from "react";

import {
  Routes,
  Route
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import NotFoundHandler from "./NotFoundHandler";
import ErrorBoundary from "./ErrorBoundary";

// ==========================================
// LOADING COMPONENT
// ==========================================

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

        <p className="text-sm text-slate-400">
          Loading MiniVerse...
        </p>
      </div>
    </div>
  );
}

// ==========================================
// AUTH PAGES
// ==========================================

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const VerifySuccess = lazy(() => import("../pages/auth/VerifySuccess"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// ==========================================
// PUBLIC PAGES
// ==========================================

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Help = lazy(() => import("../pages/Help"));
const Contact = lazy(() => import("../pages/Contact"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/Terms"));

// ==========================================
// DASHBOARD AND GAME PAGES
// ==========================================

const Dashboard = lazy(() => import("../pages/Dashboard"));

const Games = lazy(() => import("../pages/Games"));
const GameDetails = lazy(() => import("../pages/GameDetails"));
const GamePlay = lazy(() => import("../pages/GamePlay"));

const Multiplayer = lazy(() => import("../pages/Multiplayer"));
const SinglePlayer = lazy(() => import("../pages/SinglePlayer"));
const TurnByTurn = lazy(() => import("../pages/TurnByTurn"));

// ==========================================
// ROOM PAGES
// ==========================================

const CreateRoom = lazy(() => import("../pages/CreateRoom"));
const JoinRoom = lazy(() => import("../pages/JoinRoom"));
const Room = lazy(() => import("../pages/Room"));

// ==========================================
// USER AND SOCIAL PAGES
// ==========================================

const Profile = lazy(() => import("../pages/Profile"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const Friends = lazy(() => import("../pages/Friends"));
const Notifications = lazy(() => import("../pages/Notifications"));

// ==========================================
// PROGRESSION PAGES
// ==========================================

const Leaderboard = lazy(() => import("../pages/Leaderboard"));
const Achievements = lazy(() => import("../pages/Achievements"));
const GameHistory = lazy(() => import("../pages/GameHistory"));

// ==========================================
// SETTINGS
// ==========================================

const Settings = lazy(() => import("../pages/Settings"));

// ==========================================
// ROUTER
// ==========================================

function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ==================================
              PUBLIC ROUTES
          ================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/help"
            element={<Help />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms"
            element={<Terms />}
          />

          {/* ==================================
              GUEST ONLY ROUTES
          ================================== */}

          <Route element={<GuestRoute />}>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

          </Route>

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* EMAIL VERIFICATION */}

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/verify-success"
            element={<VerifySuccess />}
          />

          {/* ==================================
              PROTECTED ROUTES
          ================================== */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* GAME DISCOVERY */}

            <Route
              path="/games"
              element={<Games />}
            />

            <Route
              path="/games/:gameId"
              element={<GameDetails />}
            />

            <Route
              path="/games/multiplayer"
              element={<Multiplayer />}
            />

            <Route
              path="/games/single-player"
              element={<SinglePlayer />}
            />

            <Route
              path="/games/turn-by-turn"
              element={<TurnByTurn />}
            />

            {/* ==================================
                GAMEPLAY ROUTE
            ================================== */}

            <Route
              path="/play/:gameId"
              element={<GamePlay />}
            />

            {/* ==================================
                ROOM ROUTES
            ================================== */}

            <Route
              path="/rooms/create"
              element={<CreateRoom />}
            />

            <Route
              path="/rooms/join"
              element={<JoinRoom />}
            />

            <Route
              path="/rooms/:roomCode"
              element={<Room />}
            />

            {/* ==================================
                PROFILE
            ================================== */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/profile/edit"
              element={<EditProfile />}
            />

            <Route
              path="/profile/:username"
              element={<Profile />}
            />

            {/* ==================================
                SOCIAL
            ================================== */}

            <Route
              path="/friends"
              element={<Friends />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* ==================================
                GAME PROGRESSION
            ================================== */}

            <Route
              path="/leaderboard"
              element={<Leaderboard />}
            />

            <Route
              path="/achievements"
              element={<Achievements />}
            />

            <Route
              path="/game-history"
              element={<GameHistory />}
            />

            {/* ==================================
                SETTINGS
            ================================== */}

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>

          {/* ==================================
              UNKNOWN ROUTES
          ================================== */}

          <Route
            path="*"
            element={<NotFoundHandler />}
          />

        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRouter;
