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
        name: "African Leadership Academy",
        logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop",
        description: "Institution panafricaine qui forme de jeunes leaders africains avec des programmes d'éducation, d'entrepreneuriat et d'impact social.",
        website: "https://www.africanleadershipacademy.org",
        ctaText: "Découvrir l'académie",
        isActive: true,
        priority: 100,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "VC4A Startup Network",
        logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
        description: "Réseau pour fondateurs, mentors et investisseurs actifs dans l'écosystème startup africain, avec opportunités, programmes et communautés.",
        website: "https://vc4a.com",
        ctaText: "Rejoindre le réseau",
        isActive: true,
        priority: 95,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "MEST Africa",
        logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
        description: "Programme panafricain de formation, incubation et investissement pour entrepreneurs tech, avec une communauté active sur plusieurs marchés africains.",
        website: "https://www.meltwater.org",
        ctaText: "Voir le programme",
        isActive: true,
        priority: 90,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Tony Elumelu Foundation",
        logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop",
        description: "Fondation dédiée à l'entrepreneuriat africain, avec programmes de formation, mentorat et financement pour entrepreneurs du continent.",
        website: "https://www.tonyelumelufoundation.org",
        ctaText: "Découvrir les programmes",
        isActive: true,
        priority: 85,
        startDate: now,
        endDate: nextYear,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Orange Digital Centers",
        logo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&fit=crop",
        description: "Réseau de centres numériques pour la formation, l'accompagnement de startups et l'inclusion digitale dans plusieurs pays.",
        website: "https://www.orange.com/en/orange-digital-centers",
        ctaText: "Explorer les centres",
        isActive: true,
        priority: 80,
        startDate: now,
        createdBy: admin._id,
        stats: { impressions: 0, clicks: 0 }
      },
      {
        name: "Startupbootcamp AfriTech",
        logo: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop",
        description: "Accélérateur orienté startups africaines innovantes, avec accompagnement, mentorat et accès à un réseau international d'investisseurs.",
        website: "https://www.startupbootcamp.org/accelerator/afritech",
        ctaText: "Voir l'accélérateur",
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
