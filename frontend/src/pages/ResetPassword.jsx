import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/apiClient";
import { BrandLogo } from "@/components/BrandLogo";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Lien invalide. Veuillez refaire une demande.");
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
      const res = await api.post("/auth/reset-password", { token, password });
      setDone(true);
      toast.success(res.data.message);
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
        className="relative w-full max-w-[440px] bg-white md:rounded-3xl md:shadow-[0_20px_60px_rgba(22,65,148,0.12)] px-6 pt-10 pb-12 md:px-10"
      >
        <div className="pb-2">
          <BrandLogo markSize={58} />
        </div>

        <div className="mt-4 rounded-2xl border border-[#e3e9ef] px-5 py-7 md:px-7">
          {done ? (
            <div className="text-center py-6" data-testid="reset-success">
              <CheckCircle2 size={56} className="mx-auto text-[#1aa3dd] mb-4" />
              <h1 className="text-[#17334d] font-extrabold text-2xl mb-3">
                Mot de passe modifié
              </h1>
              <p className="text-[#5a6b7a] text-base mb-6">
                Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.
              </p>
              <button
                data-testid="go-login"
                onClick={() => navigate("/")}
                className="w-full rounded-full bg-[#c4521f] hover:bg-[#a9441a] active:scale-[0.99] text-white font-extrabold text-xl py-4 transition-all shadow-[0_6px_18px_rgba(196,82,31,0.35)]"
              >
                Me connecter
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-center text-[#17334d] font-extrabold text-3xl mb-2">
                Nouveau mot de passe
              </h1>
              <p className="text-center text-[#5a6b7a] text-base mb-6">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
              <form onSubmit={onSubmit} noValidate>
                <label htmlFor="pwd" className="block text-[#17334d] font-bold text-lg mb-2">
                  Mot de passe <span className="text-[#e45c1e]">*</span>
                </label>
                <div className="relative mb-5">
                  <input
                    id="pwd"
                    data-testid="reset-password-input"
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
                  data-testid="reset-confirm-input"
                  type={showPwd ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#c7d1da] focus:border-[#1aa3dd] outline-none px-4 py-3.5 text-[#17334d] text-lg transition-colors mb-6"
                />

                {error && (
                  <p data-testid="reset-error" className="text-[#c0392b] text-sm mb-4 font-semibold">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  data-testid="reset-submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#c4521f] hover:bg-[#a9441a] active:scale-[0.99] text-white font-extrabold text-xl py-4 transition-all disabled:opacity-60 shadow-[0_6px_18px_rgba(196,82,31,0.35)]"
                >
                  {loading ? "Enregistrement..." : "Réinitialiser"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-[#17334d] font-bold text-lg underline underline-offset-[6px] decoration-2 hover:text-[#164194]"
          >
            Revenir à la connexion
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
