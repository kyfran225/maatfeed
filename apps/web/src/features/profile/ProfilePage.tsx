import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, FileText, Scale, ShieldCheck } from "lucide-react";
import { SEO } from "../../components/SEO";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

const LEGAL_LINKS = [
  { to: "/privacy-policy", label: "Confidentialité", Icon: ShieldCheck },
  { to: "/terms-of-service", label: "CGU", Icon: FileText },
  { to: "/legal-notice", label: "Mentions légales", Icon: Scale },
  { to: "/data-management", label: "Mes données", Icon: Database },
];

export default function ProfilePage() {
  const { profile: authProfile, logoutUser } = useAuth();
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!authProfile) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <SEO pageKey="profile" />
      <div className="min-h-screen bg-black text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gold mb-2">Profil</h1>
            <p className="text-sand/72">Gérez votre profil et vos préférences</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-sand/60">Email</p>
                <p className="text-white">{authProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-sand/60">Nom d'affichage</p>
                <p className="text-white">{profile?.displayName || "Non défini"}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                Modifier le profil
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                Préférences
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Liens légaux</h2>
            <div className="space-y-2">
              {LEGAL_LINKS.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gold" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button
              variant="primary"
              onClick={logoutUser}
              className="px-8"
            >
              Se déconnecter
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
