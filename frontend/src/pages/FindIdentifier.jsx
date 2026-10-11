import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Smartphone, Mail, CreditCard } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const tips = [
  {
    icon: Smartphone,
    title: "Votre numéro de mobile",
    text: "Utilisez le numéro de la ligne Bouygues Telecom associée à votre compte.",
  },
  {
    icon: Mail,
    title: "Votre adresse e-mail",
    text: "L'e-mail renseigné lors de la souscription peut servir d'identifiant.",
  },
  {
    icon: CreditCard,
    title: "Votre numéro client",
    text: "Il figure en haut de vos factures et dans vos e-mails de bienvenue.",
  },
];

export default function FindIdentifier() {
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
          <h1 className="text-center text-[#17334d] font-extrabold text-3xl mb-6">
            Comment retrouver mon identifiant ?
          </h1>
          <div className="space-y-4">
            {tips.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex gap-4 items-start rounded-xl bg-[#f3f7fa] p-4"
              >
                <div className="shrink-0 w-11 h-11 rounded-full bg-[#1aa3dd]/10 flex items-center justify-center">
                  <t.icon size={22} className="text-[#164194]" />
                </div>
                <div>
                  <h2 className="text-[#17334d] font-bold text-lg">{t.title}</h2>
                  <p className="text-[#5a6b7a] text-sm mt-1">{t.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
