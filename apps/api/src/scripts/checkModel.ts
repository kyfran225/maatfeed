import mongoose from 'mongoose';
import { CommunityPostModel } from '../models/CommunityPost.js';

// Script pour vérifier la structure exacte du modèle
async function checkModel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maat-feed');
    console.log('Connecté à MongoDB');

    // Récupérer un post et voir sa structure exacte
    const post = await CommunityPostModel.findOne({ type: 'discussion' }).lean();
    
    if (!post) {
      console.log('Aucun post de type discussion trouvé');
      process.exit(0);
    }

    console.log('\n=== STRUCTURE COMPLÈTE DU POST ===');
    console.log('Toutes les propriétés:', Object.keys(post));
    console.log('\n=== DÉTAIL DES CHAMPS ===');
    
    Object.entries(post).forEach(([key, value]) => {
      console.log(`${key}: ${JSON.stringify(value)} (${typeof value})`);
    });

    // Test de la requête exacte du contrôleur
    console.log('\n=== TEST REQUÊTE EXACTE ===');
    const testQuery = await CommunityPostModel.find({
      type: "discussion",
      isHidden: false
    }).lean();
    
    console.log(`Résultat: ${testQuery.length} posts trouvés`);
    testQuery.forEach((p, i) => {
      console.log(`${i+1}. ${p.title} - debateScore: ${p.debateScore}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkModel();
