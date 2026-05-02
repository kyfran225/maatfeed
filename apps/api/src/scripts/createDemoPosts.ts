import mongoose from 'mongoose';
import { CommunityPostModel } from '../models/CommunityPost.js';

// Script pour créer des posts de démonstration
async function createDemoPosts() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maat-feed');
    console.log('Connecté à MongoDB');

    // Créer des posts de démonstration
    const demoPosts = [
      {
        type: "discussion",
        title: "Débat IA: La sagesse de Kemet dans le monde moderne",
        content: "Comment les enseignements de la civilisation kemet peuvent-ils nous guider aujourd'hui? Quels principes anciens peuvent-ils nous aider à naviguer dans notre société technologique?",
        author: new mongoose.Types.ObjectId(), // ID factice
        tags: ["kemet", "sagesse", "philosophie", "modernité"],
        upvotes: 15,
        participantCount: 8,
        viralityScore: 75,
        viralityStatus: "hot",
        badges: [{ type: "trending", level: 1 }],
        aiTopics: ["kemet", "sagesse"],
        sentiment: "positive",
        controversy: 0.3,
        quality: 0.8,
        engagementMetrics: {
          views: 120,
          shares: 15,
          bookmarks: 8,
          averageReadTime: 45,
          bounceRate: 0.3,
          conversionRate: 0.15
        },
        transformedToFeed: false,
        transformationScore: 0,
        reports: 0,
        isHidden: false,
        lastActivityAt: new Date(),
        bumpedAt: new Date()
      },
      {
        type: "question",
        title: "Question: Comment intégrer la spiritualité ancienne dans notre vie quotidienne?",
        content: "Je cherche des conseils pratiques pour intégrer des principes spirituels anciens dans ma routine moderne. Quelles pratiques simples avez-vous adoptées?",
        author: new mongoose.Types.ObjectId(),
        tags: ["spiritualité", "pratique", "quotidien"],
        upvotes: 12,
        participantCount: 6,
        viralityScore: 60,
        viralityStatus: "warm",
        badges: [],
        aiTopics: ["spiritualité", "pratique"],
        sentiment: "neutral",
        controversy: 0.2,
        quality: 0.7,
        engagementMetrics: {
          views: 85,
          shares: 8,
          bookmarks: 5,
          averageReadTime: 30,
          bounceRate: 0.4,
          conversionRate: 0.12
        },
        transformedToFeed: false,
        transformationScore: 0,
        reports: 0,
        isHidden: false,
        lastActivityAt: new Date(Date.now() - 3600000),
        bumpedAt: new Date(Date.now() - 3600000)
      },
      {
        type: "post",
        title: "Réflexion: L'héritage égyptien dans la culture africaine contemporaine",
        content: "Les symboles et principes de l'Égypte ancienne continuent d'influencer profondément les cultures africaines modernes, de l'art aux systèmes de valeurs.",
        author: new mongoose.Types.ObjectId(),
        tags: ["egypte", "culture", "histoire", "influence"],
        upvotes: 8,
        participantCount: 3,
        viralityScore: 45,
        viralityStatus: "cold",
        badges: [],
        aiTopics: ["culture", "histoire"],
        sentiment: "positive",
        controversy: 0.1,
        quality: 0.6,
        engagementMetrics: {
          views: 60,
          shares: 4,
          bookmarks: 3,
          averageReadTime: 25,
          bounceRate: 0.5,
          conversionRate: 0.08
        },
        transformedToFeed: false,
        transformationScore: 0,
        reports: 0,
        isHidden: false,
        lastActivityAt: new Date(Date.now() - 7200000),
        bumpedAt: new Date(Date.now() - 7200000)
      }
    ];

    // Insérer les posts
    for (const postData of demoPosts) {
      const post = new CommunityPostModel(postData);
      await post.save();
      console.log(`Post créé: ${post.title}`);
    }

    console.log('Posts de démonstration créés avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

createDemoPosts();
