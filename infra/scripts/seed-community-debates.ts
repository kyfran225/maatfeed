import mongoose from 'mongoose';
import { DebateThreadModel } from '../../apps/api/src/models/DebateThread.js';
import { ContentModel } from '../../apps/api/src/models/Content.js';
import { loadEnv } from '../../apps/api/src/bootstrap/loadEnv.js';

async function seedCommunityDebates() {
  try {
    // Load environment variables
    loadEnv();
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maat-feed';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get some sample content to create debates for
    const contents = await ContentModel.find({ 
      processingStatus: 'published',
      title: { $exists: true, $ne: '' }
    }).limit(10);

    if (contents.length === 0) {
      console.log('No published content found. Please run ingestion first.');
      return;
    }

    // Sample debate data based on Kemet and African philosophy themes
    const debateTemplates = [
      {
        title: "L'héritage de Kemet dans la philosophie moderne",
        description: "Comment les principes de la civilisation égyptienne antique influencent-ils la pensée contemporaine ?",
        tags: ["kemet", "philosophie", "histoire", "spiritualité"]
      },
      {
        title: "La spiritualité africaine: traditions et modernité",
        description: "Les pratiques spirituelles africaines traditionnelles peuvent-elles coexister avec la vie moderne ?",
        tags: ["spiritualité", "traditions", "modernité", "culture"]
      },
      {
        title: "L'éducation décoloniale: necessity or utopia ?",
        description: "Faut-il décoloniser nos systèmes éducatifs et comment y parvenir concrètement ?",
        tags: ["éducation", "décolonialisme", "société", "réforme"]
      },
      {
        title: "La renaissance culturelle africaine au 21ème siècle",
        description: "Comment les nouvelles technologies peuvent-elles servir la renaissance des cultures africaines ?",
        tags: ["technologie", "culture", "renaissance", "innovation"]
      },
      {
        title: "Les mathématiques africaines: histoire et reconnaissance",
        description: "Pourquoi les contributions mathématiques africaines sont-elles si peu reconnues mondialement ?",
        tags: ["mathématiques", "histoire", "reconnaissance", "science"]
      }
    ];

    console.log(`Found ${contents.length} published content items`);
    console.log('Creating sample debate threads...');

    // Create debate threads
    for (let i = 0; i < Math.min(debateTemplates.length, contents.length); i++) {
      const content = contents[i];
      const template = debateTemplates[i];

      // Check if debate already exists for this content
      const existingDebate = await DebateThreadModel.findOne({ contentId: content._id });
      if (existingDebate) {
        console.log(`Debate already exists for content: ${content.title}`);
        continue;
      }

      const debateThread = new DebateThreadModel({
        contentId: content._id,
        title: template.title,
        description: template.description,
        tags: template.tags,
        debateScore: Math.floor(Math.random() * 50) + 10, // Random score between 10-60
        participantCount: Math.floor(Math.random() * 20) + 5, // Random participants between 5-25
        isActive: true
      });

      await debateThread.save();
      console.log(`Created debate: "${template.title}" for content: ${content.title}`);
    }

    console.log('Community debates seeding completed successfully!');

    // Display created debates
    const createdDebates = await DebateThreadModel.find({ isActive: true })
      .populate('contentId', 'title')
      .sort({ debateScore: -1 });

    console.log('\n=== Created Debates ===');
    createdDebates.forEach((debate, index) => {
      const contentTitle = (debate as any).contentId?.title || 'Unknown Content';
      console.log(`${index + 1}. ${debate.title}`);
      console.log(`   Content: ${contentTitle}`);
      console.log(`   Score: ${debate.debateScore}, Participants: ${debate.participantCount}`);
      console.log(`   Tags: ${debate.tags.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error seeding community debates:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding
seedCommunityDebates().catch(console.error);
