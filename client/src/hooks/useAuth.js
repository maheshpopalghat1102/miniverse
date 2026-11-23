
import { useAuth as useAuthContext } from "../context/AuthContext";

export default function useAuth() {
  const auth = useAuthContext();

  if (!auth) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return {
    ...auth,
    user: auth.user || null,
    isAuthenticated: Boolean(auth.user),
    isLoading: Boolean(auth.isLoading),
  };
}
