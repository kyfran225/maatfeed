/**
 * Script pour créer des sponsors réels + un admin par défaut
 * Usage: npx tsx seed-sponsors-with-admin.ts [admin-email]
 * 
 * Si aucun email n'est fourni, crée un admin par défaut:
 * Email: admin@maatfeed.com / Password: Admin123!
 */
import mongoose from 'mongoose';
import { Sponsor } from '../../apps/api/src/models/Sponsor.js';
import { UserModel } from '../../apps/api/src/models/User.js';
import { env } from '../../apps/api/src/config/env.js';
import bcrypt from 'bcryptjs';

const DEFAULT_ADMIN_EMAIL = 'admin@maatfeed.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

async function getOrCreateAdmin(email?: string) {
  const targetEmail = email || DEFAULT_ADMIN_EMAIL;
  
  // Chercher l'admin existant
  let admin = await UserModel.findOne({ email: targetEmail.toLowerCase() });
  
  if (admin) {
    // S'assurer qu'il a le rôle admin
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log(`✓ ${targetEmail} promu admin`);
    }
    console.log(`✓ Admin existant trouvé: ${targetEmail}`);
    return admin;
  }
  
  // Créer un nouvel admin
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  admin = new UserModel({
    email: targetEmail.toLowerCase(),
    passwordHash,
    username: 'admin',
    role: 'admin',
    emailVerified: true,
    isActive: true,
    profileCompleted: true,
    gdprConsent: {
      analytics: true,
      marketing: true,
      givenAt: new Date()
    }
  });
  
  await admin.save();
  console.log(`✓ Admin créé: ${targetEmail} / ${DEFAULT_ADMIN_PASSWORD}`);
  return admin;
}

async function seedSponsors() {
  const adminEmail = process.argv[2];
  
  console.log('🚀 Démarrage du seeding des sponsors...');
  console.log(`Admin cible: ${adminEmail || DEFAULT_ADMIN_EMAIL + ' (défaut)'}`);
  
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✓ Connecté à MongoDB:', mongoose.connection.name);
    
    // Obtenir ou créer l'admin
    const admin = await getOrCreateAdmin(adminEmail);
    
    // Vérifier les sponsors existants
    const existingCount = await Sponsor.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  ${existingCount} sponsors existent déjà`);
      console.log('Pour les remplacer, supprimez-les d\'abord via l\'admin ou: db.sponsors.deleteMany({})');
      console.log('\n📊 Sponsors actuels:');
      const existing = await Sponsor.find({ isActive: true }).sort({ priority: -1 });
      existing.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} (priorité: ${s.priority})`));
      return;
    }
    
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    const sponsors = [
      {
        name: "Wave",
        logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop",
        description: "Mobile Money simplifié pour l'Afrique. Transferts instantanés, paiements sans frais. Disponible au Sénégal, Côte d'Ivoire, Mali, Burkina.",
        website: "https://www.wave.com",
        ctaText: "Télécharger l'app",
        isActive: true,
        priority: 100,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Paystack",
        logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
        description: "Paiements en ligne pour l'Afrique. Acceptez les paiements par mobile money, carte bancaire. Intégration simple, commissions réduites.",
        website: "https://paystack.com",
        ctaText: "Commencer gratuitement",
        isActive: true,
        priority: 95,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Andela",
        logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
        description: "Formez les meilleurs développeurs d'Afrique. Bootcamps intensifs, placement international. Plus de 100,000 développeurs formés.",
        website: "https://andela.com",
        ctaText: "Postuler au bootcamp",
        isActive: true,
        priority: 90,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Afrique Innovation",
        logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop",
        description: "Incubateur de startups tech en Afrique francophone. Accompagnement de 6 mois, accès aux investisseurs, mentors expérimentés.",
        website: "https://afriqueinnovation.com",
        ctaText: "Candidater",
        isActive: true,
        priority: 85,
        startDate: now,
        endDate: nextYear,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Orange Digital Academy",
        logo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&fit=crop",
        description: "Formations digitales gratuites par Orange. Coding, data, cloud, cybersecurity. Certification reconnue par les entreprises.",
        website: "https://digitalacademy.orange.com",
        ctaText: "S'inscrire gratuitement",
        isActive: true,
        priority: 80,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "MooV Africa",
        logo: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop",
        description: "Transport et logistique digitalisés. Bus entre villes, livraison express, marchandises. Application disponible sur iOS et Android.",
        website: "https://moov.africa",
        ctaText: "Réserver un trajet",
        isActive: true,
        priority: 75,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      }
    ];
    
    const inserted = await Sponsor.insertMany(sponsors);
    
    console.log(`\n✅ ${inserted.length} sponsors créés avec succès !`);
    console.log('\n📊 Liste des sponsors:');
    inserted.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (priorité: ${s.priority})`);
    });
    
    console.log(`\n🔗 Accès admin: /admin/sponsors`);
    console.log(`📧 Email: ${admin.email}`);
    if (!adminEmail) {
      console.log(`🔑 Mot de passe par défaut: ${DEFAULT_ADMIN_PASSWORD}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedSponsors();
