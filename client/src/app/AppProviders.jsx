
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { SoundProvider } from "../context/SoundContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ThemeProvider } from "../themes/ThemeProvider";

function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SoundProvider>
            <SocketProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </SocketProvider>
          </SoundProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppProviders;
