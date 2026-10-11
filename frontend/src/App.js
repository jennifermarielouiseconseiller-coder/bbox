import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/Login";
import FirstConnection from "@/pages/FirstConnection";
import ForgotPassword from "@/pages/ForgotPassword";
import FindIdentifier from "@/pages/FindIdentifier";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/premiere-connexion" element={<FirstConnection />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/retrouver-identifiant" element={<FindIdentifier />} />
            <Route path="/espace-client" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;
