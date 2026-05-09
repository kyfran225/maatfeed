import mongoose from 'mongoose';
import { Sponsor } from '../models/Sponsor.js';
import { env } from '../config/env.js';

// Script pour créer des sponsors réels pour MAATFEED
async function seedSponsors() {
  console.log('🚀 Démarrage du seeding des sponsors...');
  try {
    // Connexion à MongoDB avec la même configuration que l'API
    console.log('Connexion à MongoDB avec URI:', env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connecté à MongoDB, base:', mongoose.connection.name);

    // Vérifier si des sponsors existent déjà
    const existingSponsors = await Sponsor.countDocuments();
    if (existingSponsors > 0) {
      console.log(`${existingSponsors} sponsors existent déjà. Suppression...`);
      await Sponsor.deleteMany({});
    }

    // Dates dynamiques pour que les sponsors soient toujours actifs
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    // Créer des sponsors avec des liens publics vérifiés.
    const realSponsors = [
      {
        name: "African Leadership Academy",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center",
        description: "Institution panafricaine qui forme de jeunes leaders africains avec des programmes d'éducation, d'entrepreneuriat et d'impact social.",
        website: "https://www.africanleadershipacademy.org",
        ctaText: "Découvrir l'académie",
        isActive: true,
        priority: 100,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "MEST Africa",
        logo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center",
        description: "Programme panafricain de formation, incubation et investissement pour entrepreneurs tech, avec une communauté active sur plusieurs marchés africains.",
        website: "https://www.meltwater.org",
        ctaText: "Voir le programme",
        isActive: true,
        priority: 90,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "VC4A Startup Network",
        logo: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop&crop=center",
        description: "Réseau pour fondateurs, mentors et investisseurs actifs dans l'écosystème startup africain, avec opportunités, programmes et communautés.",
        website: "https://vc4a.com",
        ctaText: "Rejoindre le réseau",
        isActive: true,
        priority: 95,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "Tony Elumelu Foundation",
        logo: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop&crop=center",
        description: "Fondation dédiée à l'entrepreneuriat africain, avec programmes de formation, mentorat et financement pour entrepreneurs du continent.",
        website: "https://www.tonyelumelufoundation.org",
        ctaText: "Découvrir les programmes",
        isActive: true,
        priority: 85,
        startDate: now,
        endDate: nextYear,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "Orange Digital Centers",
        logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center",
        description: "Réseau de centres numériques pour la formation, l'accompagnement de startups et l'inclusion digitale dans plusieurs pays.",
        website: "https://www.orange.com/en/orange-digital-centers",
        ctaText: "Explorer les centres",
        isActive: true,
        priority: 80,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "Startupbootcamp AfriTech",
        logo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=center",
        description: "Accélérateur orienté startups africaines innovantes, avec accompagnement, mentorat et accès à un réseau international d'investisseurs.",
        website: "https://www.startupbootcamp.org/accelerator/afritech",
        ctaText: "Voir l'accélérateur",
        isActive: true,
        priority: 75,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "Seedstars",
        logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&crop=center",
        description: "Plateforme mondiale d'investissement et de programmes d'accélération pour entrepreneurs dans les marchés émergents, dont l'Afrique.",
        website: "https://www.seedstars.com",
        ctaText: "Découvrir Seedstars",
        isActive: true,
        priority: 70,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "AfricArena",
        logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center",
        description: "Sommet et réseau tech africain connectant startups, investisseurs et grandes entreprises autour de l'innovation sur le continent.",
        website: "https://www.africarena.com",
        ctaText: "Voir les événements",
        isActive: true,
        priority: 65,
        startDate: now,
        endDate: nextYear,
        stats: {
          impressions: 0,
          clicks: 0
        }
      }
    ];

    // Créer un utilisateur admin fictif pour les sponsors
    // En production, ceci devrait être l'ID d'un vrai admin
    const adminUserId = new mongoose.Types.ObjectId();

    // Insérer les sponsors
    const sponsorsToInsert = realSponsors.map(sponsor => ({
      ...sponsor,
      createdBy: adminUserId
    }));

    const insertedSponsors = await Sponsor.insertMany(sponsorsToInsert);

    console.log(`✅ ${insertedSponsors.length} sponsors créés avec succès:`);
    insertedSponsors.forEach((sponsor, index) => {
      console.log(`  ${index + 1}. ${sponsor.name} (ID: ${sponsor._id})`);
    });

    console.log('\n🎯 Sponsors actifs dans le feed:');
    const activeSponsors = await Sponsor.find({ isActive: true }).sort({ priority: -1 });
    activeSponsors.forEach((sponsor, index) => {
      console.log(`  ${index + 1}. ${sponsor.name} - Priorité: ${sponsor.priority}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du seeding des sponsors:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécuter le script
seedSponsors().catch(console.error);

export { seedSponsors };
