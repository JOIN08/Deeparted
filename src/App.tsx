import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import { Dashboard } from "./components/Dashboard";
import { VesselTable } from "./components/VesselTable";
import { PortsManager } from "./components/PortsManager";
import { Routes } from "./components/Routes";
import { Reports } from "./components/Reports";
import { Users } from "./components/Users";
import { Voyages } from "./components/Voyages";
import { Bookings } from "./components/Bookings";
import { APP_ROUTE_PATHS, SESSION_TIMEOUT_SECONDS } from "./config/appConfig";
import { NAV_ITEMS } from "./data/mockData";
import { apiRequest, type AuthenticatedUser } from "./data/api";
import type { PermissionModule } from "../shared/access";
import {
  EMPTY_USER_ACCESS,
  isPermissionModule,
} from "./data/userAccess";

const BookingRecordsPage = lazy(() =>
  import("./components/BookingRecords").then((module) => ({
    default: module.BookingRecords,
  })),
);

const VesselLayoutPage = lazy(() =>
  import("./components/VesselLayoutPage").then((module) => ({
    default: module.VesselLayoutPage,
  })),
);

const DecommissionedVesselsPage = lazy(() =>
  import("./components/DecommissionedVessels").then((module) => ({
    default: module.DecommissionedVessels,
  })),
);

type TabName =
  | "Dashboard"
  | "Vessels"
  | "Voyages"
  | "Bookings"
  | "Ports Manager"
  | "Routes"
  | "Reports"
  | "Users";

export default function App() {
  const [sessionUser, setSessionUser] = useState<AuthenticatedUser | null>();
  const [sessionError, setSessionError] = useState("");
  const [sessionCheck, setSessionCheck] = useState(0);

  useEffect(() => {
    let isActive = true;
    apiRequest<{ user: AuthenticatedUser | null }>("/api/auth/session")
      .then(({ user }) => {
        if (isActive) {
          setSessionUser(user);
          setSessionError("");
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setSessionError(
            error instanceof Error
              ? error.message
              : "Unable to connect to the Deeparted API.",
          );
        }
      });
    return () => {
      isActive = false;
    };
  }, [sessionCheck]);

  if (sessionUser === undefined && !sessionError) {
    return (
      <p className="p-8 text-sm text-slate-500 dark:text-github-muted">
        Connecting to Deeparted...
      </p>
    );
  }
  if (sessionError) {
    return (
      <main className="min-h-screen bg-ui-canvas px-6 py-12 font-sans text-ui-ink dark:bg-github-canvas dark:text-github-text">
        <div className="mx-auto max-w-xl space-y-3">
          <h1 className="text-xl font-bold">Unable to connect</h1>
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {sessionError}
          </p>
          <button
            type="button"
            onClick={() => {
              setSessionError("");
              setSessionUser(undefined);
              setSessionCheck((attempt) => attempt + 1);
            }}
            className="bg-ui-sea px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <MainApplication
        currentUser={null}
        onSessionUserChange={setSessionUser}
      />
    );
  }

  const pathname = window.location.pathname.replace(/\/+$/, "");

  if (pathname === APP_ROUTE_PATHS.decommissionedVessels) {
    if (!canAccess(sessionUser, "Vessels", "view")) {
      return <AccessDenied />;
    }
    return (
      <Suspense
        fallback={
          <p className="p-8 text-sm text-slate-500">
            Loading decommissioned ships...
          </p>
        }
      >
        <DecommissionedVesselsPage />
      </Suspense>
    );
  }

  if (pathname === APP_ROUTE_PATHS.vesselLayout) {
    if (!canAccess(sessionUser, "Vessels", "view")) {
      return <AccessDenied />;
    }
    return (
      <Suspense
        fallback={
          <p className="p-8 text-sm text-slate-500">Loading ship layout...</p>
        }
      >
        <VesselLayoutPage
          canEdit={canAccess(sessionUser, "Vessels", "edit")}
        />
      </Suspense>
    );
  }

  if (pathname === APP_ROUTE_PATHS.bookingRecords) {
    return (
      <div className="min-h-screen bg-ui-canvas px-4 py-8 font-sans text-ui-ink dark:bg-github-canvas dark:text-github-text sm:px-8">
        <main className="mx-auto w-full max-w-[1200px]">
          <Suspense
            fallback={
              <p className="text-sm text-slate-500">Loading past records...</p>
            }
          >
            <BookingRecordsPage />
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <MainApplication
      currentUser={sessionUser}
      onSessionUserChange={setSessionUser}
    />
  );
}

function canAccess(
  user: AuthenticatedUser,
  module: PermissionModule,
  permission: "view" | "edit",
): boolean {
  return user.isAdmin || user.access[module][permission];
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-ui-canvas px-6 py-12 font-sans text-ui-ink dark:bg-github-canvas dark:text-github-text">
      <div className="mx-auto max-w-xl space-y-3">
        <h1 className="text-xl font-bold">Access not granted</h1>
        <p className="text-sm text-slate-500 dark:text-github-muted">
          Your account does not have permission to view this page.
        </p>
        <a href="/" className="inline-flex text-sm font-semibold text-blue-600">
          Return to Deeparted
        </a>
      </div>
    </main>
  );
}

function MainApplication({
  currentUser,
  onSessionUserChange,
}: {
  currentUser: AuthenticatedUser | null;
  onSessionUserChange: (user: AuthenticatedUser | null) => void;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>(() =>
    new URLSearchParams(window.location.search).get("tab") === "Vessels"
      ? "Vessels"
      : "Dashboard",
  );
  const [timeLeft, setTimeLeft] = useState(SESSION_TIMEOUT_SECONDS);
  const lastActivitySync = useRef(0);
  const logoutStarted = useRef(false);
  const isLoggedIn = currentUser !== null;
  const activeUsername = currentUser?.username ?? "";
  const userAccess = currentUser?.access ?? EMPTY_USER_ACCESS;
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "";
  const allowedNavigation = NAV_ITEMS.filter(
    (item) =>
      item.name === "Dashboard" ||
      item.name === "Bookings" ||
      (isPermissionModule(item.name) && userAccess[item.name].view),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (
      activeTab !== "Dashboard" &&
      activeTab !== "Bookings" &&
      (!isPermissionModule(activeTab) ||
      !currentUser ||
      !canAccess(currentUser, activeTab, "view"))
    ) {
      setActiveTab("Dashboard");
    }
  }, [activeTab, currentUser]);

  const resetTimer = useCallback(() => {
    if (!currentUser) return;
    setTimeLeft(SESSION_TIMEOUT_SECONDS);

    const now = Date.now();
    if (now - lastActivitySync.current < 30_000) return;
    lastActivitySync.current = now;
    apiRequest<{ user: AuthenticatedUser | null }>("/api/auth/session")
      .then(({ user }) => onSessionUserChange(user))
      .catch((error: unknown) => {
      setAuthError(
        error instanceof Error ? error.message : "Could not refresh your session.",
      );
      });
  }, [currentUser, onSessionUserChange]);

  const handleLogout = useCallback(async () => {
    if (logoutStarted.current) return;
    logoutStarted.current = true;

    try {
      await apiRequest<void>("/api/auth/logout", { method: "POST" });
      setAuthError("");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to end the server session.",
      );
    } finally {
      setPassword("");
      setTimeLeft(0);
      onSessionUserChange(null);
    }
  }, [onSessionUserChange]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    const interval = window.setInterval(() => {
      setTimeLeft((previous) => {
        return Math.max(0, previous - 1);
      });
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.clearInterval(interval);
    };
  }, [isLoggedIn, resetTimer]);

  useEffect(() => {
    if (isLoggedIn && timeLeft === 0) void handleLogout();
  }, [handleLogout, isLoggedIn, timeLeft]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await apiRequest<{ user: AuthenticatedUser }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username: username.trim(), password }),
        },
      );
      setUsername(result.user.username);
      setPassword("");
      setActiveTab("Dashboard");
      logoutStarted.current = false;
      setTimeLeft(SESSION_TIMEOUT_SECONDS);
      onSessionUserChange(result.user);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Sign-in failed. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-ui-canvas font-sans text-ui-ink transition-colors duration-300 dark:bg-github-canvas dark:text-github-text">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        navItems={allowedNavigation}
        displayName={displayName}
        username={activeUsername}
      />
      <div
        className={`h-full min-h-0 min-w-0 flex-1 overflow-y-auto transition-all duration-500 ${!isLoggedIn ? "blur-md pointer-events-none select-none" : ""}`}
      >
        <Header
          timeLeft={timeLeft}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          handleLogout={() => void handleLogout()}
        />
        <main className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {authError && isLoggedIn && (
            <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {authError}
            </p>
          )}
          {activeTab === "Dashboard" && (
            <Dashboard
              onNavigate={setActiveTab}
              canViewVoyages={userAccess.Voyages.view}
            />
          )}
          {activeTab === "Vessels" && userAccess.Vessels.view && (
            <VesselTable canEdit={userAccess.Vessels.edit} />
          )}
          {activeTab === "Voyages" && userAccess.Voyages.view && (
            <Voyages
              currentUser={activeUsername}
              canEdit={userAccess.Voyages.edit}
            />
          )}
          {activeTab === "Bookings" && (
            <Bookings currentUser={username} />
          )}
          {activeTab === "Ports Manager" && userAccess["Ports Manager"].view && (
            <PortsManager canEdit={userAccess["Ports Manager"].edit} />
          )}
          {activeTab === "Routes" && userAccess.Routes.view && (
            <Routes canEdit={userAccess.Routes.edit} />
          )}
          {activeTab === "Reports" && userAccess.Reports.view && (
            <Reports canEdit={userAccess.Reports.edit} />
          )}
          {activeTab === "Users" && userAccess.Users.view && (
            <Users canEdit={userAccess.Users.edit} />
          )}
        </main>
      </div>
      {!isLoggedIn && (
        <LoginModal
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleLogin={handleLogin}
          error={authError}
          isSubmitting={isSubmitting}
          timeLeft={timeLeft}
        />
      )}
    </div>
  );
}
