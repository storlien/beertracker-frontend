import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { Navbar } from "./components/Navbar";
import AppRoutes from "./AppRoutes";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
