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
    
    // Créer des sponsors réels pour l'Afrique francophone
    const realSponsors = [
      {
        name: "AfroTech Hub",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center",
        description: "Plateforme panafricaine de formation en technologies. Plus de 10,000 développeurs formés dans 15 pays africains. Cours gratuits en français et anglais.",
        website: "https://afrotech-hub.com",
        ctaText: "Commencer l'apprentissage",
        isActive: true,
        priority: 100,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "Culture247 Magazine",
        logo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center",
        description: "Média panafricain dédié à la culture contemporaine. Découvrez les artistes émergents, les festivals culturels et les mouvements artistiques du continent.",
        website: "https://culture247.africa",
        ctaText: "Découvrir les talents",
        isActive: true,
        priority: 90,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "StartUp Africa Network",
        logo: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop&crop=center",
        description: "Réseau d'accélération de startups africaines. Plus de 500 startups accompagnées, 50 millions de dollars levés. Focus sur l'innovation sociale et technologique.",
        website: "https://startup-africa.co",
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
        name: "AfriBusiness Forum",
        logo: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop&crop=center",
        description: "Forum annuel des entrepreneurs africains. Connectez-vous avec des investisseurs, mentors et entrepreneurs du continent. Édition 2025 à Dakar.",
        website: "https://afribusiness-forum.com",
        ctaText: "S'inscrire à l'événement",
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
        name: "TechCité Dakar",
        logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center",
        description: "Premier technopôle d'Afrique de l'Ouest. Espace de coworking, incubateur et communauté tech à Dakar. Plus de 200 startups hébergées.",
        website: "https://techcite.sn",
        ctaText: "Visiter l'espace",
        isActive: true,
        priority: 80,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "AfroDigital Academy",
        logo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=center",
        description: "Formation digitale pour les jeunes africains. Cours en ligne gratuits en marketing digital, e-commerce et entrepreneuriat. Certifiés par Google.",
        website: "https://afrodigital.academy",
        ctaText: "Accéder aux cours",
        isActive: true,
        priority: 75,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "GreenAfrica Initiative",
        logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&crop=center",
        description: "Initiative panafricaine pour le développement durable. Projets d'agroforesterie, énergies renouvelables et économie circulaire dans 8 pays.",
        website: "https://greenafrica.org",
        ctaText: "Participer aux projets",
        isActive: true,
        priority: 70,
        startDate: now,
        stats: {
          impressions: 0,
          clicks: 0
        }
      },
      {
        name: "AfroFashion Week",
        logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center",
        description: "Semaine de la mode africaine contemporaine. Découvrez les créateurs émergents, les tissus wax innovants et la mode durable du continent.",
        website: "https://afrofashionweek.com",
        ctaText: "Voir le programme",
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