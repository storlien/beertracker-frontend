import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { Navbar } from "./components/Navbar";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background text-text">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
