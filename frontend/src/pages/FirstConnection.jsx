import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/apiClient";
import { BrandLogo } from "@/components/BrandLogo";

export default function FirstConnection() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifiant.trim() || !password) {
      setError("Veuillez renseigner tous les champs obligatoires.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const data = await register(identifiant.trim(), password);
      toast.success(data.message || "Compte créé");
      navigate("/espace-client");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef3f7] flex items-stretch justify-center md:items-center md:py-10 font-nunito">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px] bg-white md:rounded-3xl md:shadow-[0_20px_60px_rgba(22,65,148,0.12)] px-6 pt-6 pb-12 md:px-10"
      >
        <Link
          to="/"
          data-testid="back-link"
          className="absolute left-5 top-5 flex items-center gap-1 text-[#17334d] hover:text-[#164194] font-semibold"
        >
          <ArrowLeft size={22} /> Retour
        </Link>

        <div className="pt-10 pb-2">
          <BrandLogo markSize={58} />
        </div>

        <div className="mt-4 rounded-2xl border border-[#e3e9ef] px-5 py-7 md:px-7">
          <h1 className="text-center text-[#17334d] font-extrabold text-3xl mb-2">
            Première connexion
          </h1>
          <p className="text-center text-[#5a6b7a] text-base mb-6">
            Créez vos identifiants pour accéder à votre espace client.
          </p>

          <p className="text-[#17334d] text-sm mb-5">
            <span className="text-[#e45c1e]">*</span> champs obligatoires
          </p>

          <form onSubmit={onSubmit} noValidate>
            <label htmlFor="id" className="block text-[#17334d] font-bold text-lg mb-2">
              Identifiant (n°mobile, e-mail ...) <span className="text-[#e45c1e]">*</span>
            </label>
            <input
              id="id"
              data-testid="register-identifiant-input"
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              className="w-full rounded-lg border-2 border-[#c7d1da] focus:border-[#1aa3dd] outline-none px-4 py-3.5 text-[#17334d] text-lg transition-colors mb-5"
            />

            <label htmlFor="pwd" className="block text-[#17334d] font-bold text-lg mb-2">
              Mot de passe <span className="text-[#e45c1e]">*</span>
            </label>
            <div className="relative mb-5">
              <input
                id="pwd"
                data-testid="register-password-input"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-[#c7d1da] focus:border-[#1aa3dd] outline-none px-4 py-3.5 pr-12 text-[#17334d] text-lg transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#17334d]"
                aria-label="Afficher le mot de passe"
              >
                {showPwd ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>

            <label htmlFor="confirm" className="block text-[#17334d] font-bold text-lg mb-2">
              Confirmer le mot de passe <span className="text-[#e45c1e]">*</span>
            </label>
            <input
              id="confirm"
              data-testid="register-confirm-input"
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border-2 border-[#c7d1da] focus:border-[#1aa3dd] outline-none px-4 py-3.5 text-[#17334d] text-lg transition-colors mb-6"
            />

            {error && (
              <p data-testid="register-error" className="text-[#c0392b] text-sm mb-4 font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              data-testid="register-submit"
              disabled={loading}
              className="w-full rounded-full bg-[#c4521f] hover:bg-[#a9441a] active:scale-[0.99] text-white font-extrabold text-xl py-4 transition-all disabled:opacity-60 shadow-[0_6px_18px_rgba(196,82,31,0.35)]"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-[#17334d] font-bold text-lg underline underline-offset-[6px] decoration-2 hover:text-[#164194]"
          >
            J'ai déjà un compte
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
