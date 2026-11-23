
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "../themes/ThemeProvider";
import { SoundProvider } from "./SoundContext";
import { SocketProvider } from "./SocketContext";
import { NotificationProvider } from "./NotificationContext";

function AppProviders({ children }) {
  return (
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
  );
}

export { AppProviders };
export default AppProviders;
