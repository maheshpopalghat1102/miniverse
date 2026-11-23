
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuestRoute() {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const loading = Boolean(isLoading);
  const authenticated = isAuthenticated ?? Boolean(user);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

          <p className="text-sm text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default GuestRoute;
