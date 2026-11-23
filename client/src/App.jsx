
import AppProviders from "./context/AppProviders";
import AppRouter from "./app/AppRouter";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
