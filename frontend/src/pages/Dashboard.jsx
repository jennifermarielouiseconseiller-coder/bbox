import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Smartphone, Wifi, Receipt } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";

const cards = [
  { icon: Smartphone, title: "Mon forfait mobile", value: "Forfait Sensation 100 Go" },
  { icon: Wifi, title: "Ma Bbox", value: "Bbox Fibre — connectée" },
  { icon: Receipt, title: "Ma dernière facture", value: "34,99 € — prélevée" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user === false) navigate("/");
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#eef3f7] flex items-center justify-center font-nunito text-[#17334d]">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#eef3f7] font-nunito">
      <header className="bg-white shadow-sm px-5 py-3 flex items-center justify-between">
        <BrandLogo markSize={40} />
        <button
          data-testid="logout-button"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
          className="flex items-center gap-2 text-[#17334d] font-semibold hover:text-[#c4521f] transition-colors"
        >
          <LogOut size={20} /> Déconnexion
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#17334d] font-extrabold text-3xl md:text-4xl"
        >
          Bonjour {user.name || user.email} 👋
        </motion.h1>
        <p className="text-[#5a6b7a] mt-2 mb-8" data-testid="dashboard-welcome">
          Bienvenue dans votre espace client Bouygues Telecom.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-[0_8px_24px_rgba(22,65,148,0.08)]"
            >
              <div className="w-11 h-11 rounded-full bg-[#1aa3dd]/10 flex items-center justify-center mb-3">
                <c.icon size={22} className="text-[#164194]" />
              </div>
              <h2 className="text-[#17334d] font-bold">{c.title}</h2>
              <p className="text-[#5a6b7a] text-sm mt-1">{c.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-2xl p-5 shadow-[0_8px_24px_rgba(22,65,148,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#17334d] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">C+</span>
            </div>
            <div>
              <h2 className="text-[#17334d] font-bold">Option CANAL+ Ciné Séries</h2>
              <p className="text-[#5a6b7a] text-sm">24,99 €/mois · abonnement actif</p>
            </div>
          </div>
          <button
            data-testid="goto-cancel-canal"
            onClick={() => navigate("/resiliation-canal")}
            className="rounded-full border-2 border-[#c4521f] text-[#c4521f] font-bold px-6 py-2.5 hover:bg-[#c4521f] hover:text-white transition-colors whitespace-nowrap"
          >
            Résilier mon abonnement
          </button>
        </motion.div>
      </main>
    </div>
  );
}
