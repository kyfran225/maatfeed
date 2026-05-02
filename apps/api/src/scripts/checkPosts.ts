import mongoose from 'mongoose';
import { CommunityPostModel } from '../models/CommunityPost.js';

// Script pour vérifier les posts dans MongoDB
async function checkPosts() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maat-feed');
    console.log('Connecté à MongoDB');

    // Vérifier tous les posts
    const allPosts = await CommunityPostModel.find({}).lean();
    console.log(`\n=== TOUS LES POSTS (${allPosts.length}) ===`);
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.type} - ${post.title} (ID: ${post._id})`);
      console.log(`   Tags: ${post.tags?.join(', ') || 'aucun'}`);
      console.log(`   Virality: ${post.viralityScore} (${post.viralityStatus})`);
      console.log(`   Hidden: ${post.isHidden}`);
      console.log('');
    });

    // Vérifier les posts de type discussion
    const discussions = await CommunityPostModel.find({ type: 'discussion' }).lean();
    console.log(`\n=== DISCUSSIONS SEULEMENT (${discussions.length}) ===`);
    discussions.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
    });

    // Vérifier les posts non cachés
    const visiblePosts = await CommunityPostModel.find({ isHidden: false }).lean();
    console.log(`\n=== POSTS VISIBLES (${visiblePosts.length}) ===`);
    visiblePosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.type} - ${post.title}`);
    });

    // Test de la requête exacte du contrôleur
    const controllerQuery = await CommunityPostModel.find({
      type: "discussion",
      isHidden: false
    })
    .sort({ debateScore: -1, participantCount: -1, createdAt: -1 })
    .limit(50)
    .populate("author", "username avatar")
    .lean();

    console.log(`\n=== RÉSULTAT REQUÊTE CONTRÔLEUR (${controllerQuery.length}) ===`);
    controllerQuery.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
    });

    console.log('\n=== DÉTAIL D\'UN POST ===');
    if (allPosts.length > 0) {
      const samplePost = allPosts[0];
      console.log('Post complet:', JSON.stringify(samplePost, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkPosts();
