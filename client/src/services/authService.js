
import api, { refreshAccessToken } from "./api";
import { setAccessToken } from "./accessToken";

const authService = {
  register(userData) {
    return api.post("/auth/register", userData);
  },

  login(credentials) {
    return api.post("/auth/login", credentials).then((data) => {
      setAccessToken(data.accessToken);
      return data;
    });
  },

  logout() {
    return api.post("/auth/logout", {}).finally(() => setAccessToken(null));
  },

  getCurrentUser() {
    return api.get("/auth/me");
  },

  verifyEmail(token) {
    return api.post("/auth/verify-email", { token });
  },

  forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  resetPassword(token, password) {
    return api.post("/auth/reset-password", {
      token,
      newPassword: password,
    });
  },

  refreshSession() {
    return refreshAccessToken();
  },
};

export default authService;
