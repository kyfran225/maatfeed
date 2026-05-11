import dotenv from "dotenv";
import { UserModel } from "../models/User.js";

dotenv.config();

async function checkUserRole() {
  try {
    const user = await UserModel.findOne({ email: "kyfran6@gmail.com" }).lean();
    
    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return;
    }

    console.log("📧 Email:", user.email);
    console.log("👤 Nom:", user.displayName);
    console.log("🔑 Rôle:", user.role || "⚠️ NON DÉFINI");
    console.log("🆔 ID:", user._id);
    
    // Si le rôle n'est pas défini, on peut le définir
    if (!user.role) {
      console.log("\n⚠️  L'utilisateur n'a pas de rôle défini.");
      console.log("Pour définir le rôle admin, exécutez:");
      console.log(`node -e "
import { UserModel } from './models/User.js';
await UserModel.updateOne(
  { email: 'kyfran6@gmail.com' }, 
  { \$set: { role: 'admin' } }
);
console.log('✅ Rôle admin défini pour kyfran6@gmail.com');
"`);
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

checkUserRole();
