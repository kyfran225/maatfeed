import { CommunityPostModel } from "../models/CommunityPost.js";
import { CommentModel } from "../models/Comment.js";
import { ProfileModel } from "../models/Profile.js";
import { ContentModel } from "../models/Content.js";
import { ObjectId } from "mongodb";
import { generateWithAIRouter } from "./aiRouterService.js";
import { getAIAvatarById } from "@maat/shared";

// Interface pour les interventions IA
interface AIIntervention {
  type: "comment" | "debate_starter" | "moderator" | "expert" | "synthesizer";
  content: string;
  tone: "neutral" | "encouraging" | "challenging" | "educational" | "provocative";
  context: {
    postId?: string;
    commentId?: string;
    topic: string;
    sentiment: string;
    participants: string[];
  };
  priority: "low" | "medium" | "high" | "urgent";
}

// Interface pour les profils IA
interface AIPersona {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  personality: {
    tone: string;
    style: string;
    knowledge_level: number;
    engagement_style: string;
  };
  response_patterns: {
    debate_starter: string[];
    comment_response: string[];
    question_asker: string[];
    synthesis_generator: string[];
  };
}

class ParticipativeAIService {
  private aiPersonas: AIPersona[];

  constructor() {
    // Définir les personnalités IA
    this.aiPersonas = [
      {
        id: "maat_sage",
        name: "Maat Sage",
        avatar: getAIAvatarById("maat_sage")?.imageUrl64 || "/avatars/ai/maat_sage-64.png",
        expertise: ["philosophy", "history", "spirituality"],
        personality: {
          tone: "wise",
          style: "educational",
          knowledge_level: 0.9,
          engagement_style: "thoughtful"
        },
        response_patterns: {
          debate_starter: [
            "Cette question mérite une réflexion plus profonde sur {topic}...",
            "Selon la sagesse de Maat, {topic} nous enseigne que...",
            "Examinons les différentes perspectives sur {topic}...",
            "La sagesse africaine offre un éclairage unique sur {topic}, qui diffère parfois des approches occidentales..."
          ],
          comment_response: [
            "Votre perspective sur {topic} est intéressante. Considérons aussi...",
            "Cela me rappelle les enseignements anciens sur {topic}...",
            "Je vous invite à explorer plus loin cette idée de {topic}...",
            "La tradition africaine voit {topic} différemment des traditions monothéistes classiques..."
          ],
          question_asker: [
            "Comment {topic} s'applique-t-il à notre réalité moderne?",
            "Quelles leçons pouvons-nous tirer de {topic} aujourd'hui?",
            "En quoi {topic} peut-il nous guider dans nos vies?",
            "Comment la vision africaine de {topic} dialogue-t-elle avec les perspectives religieuses organisées?"
          ],
          synthesis_generator: [
            "En synthétisant nos échanges sur {topic}, je vois émerger plusieurs pistes...",
            "La discussion sur {topic} révèle une tension fondamentale entre...",
            "Les perspectives partagées sur {topic} dessinent un tableau complexe...",
            "Je note des divergences profondes entre les traditions spirituelles sur {topic}..."
          ]
        }
      },
      {
        id: "kemet_expert",
        name: "Kemet Expert",
        avatar: getAIAvatarById("kemet_expert")?.imageUrl64 || "/avatars/ai/kemet_expert-64.png",
        expertise: ["egyptology", "archaeology", "ancient_civilizations"],
        personality: {
          tone: "academic",
          style: "analytical",
          knowledge_level: 0.95,
          engagement_style: "researcher"
        },
        response_patterns: {
          debate_starter: [
            "Les recherches récentes sur {topic} remettent en question...",
            "L'analyse archéologique de {topic} révèle des surprises...",
            "Les textes anciens nous parlent de {topic} d'une manière inattendue..."
          ],
          comment_response: [
            "Les données historiques sur {topic} confirment votre analyse...",
            "Les fouilles récentes apportent un éclairage nouveau sur {topic}...",
            "La comparaison avec d'autres civilisations enrichit notre compréhension de {topic}..."
          ],
          question_asker: [
            "Quelles sources primaires pouvons-nous consulter sur {topic}?",
            "Comment les découvertes récentes changent notre vision de {topic}?",
            "Quels parallèles pouvons-nous établir avec d'autres cultures sur {topic}?"
          ],
          synthesis_generator: [
            "L'analyse des sources sur {topic} converge vers plusieurs conclusions...",
            "Les preuves archéologiques et textuelles sur {topic} suggèrent...",
            "La synthèse interdisciplinaire de {topic} ouvre nouvelles perspectives..."
          ]
        }
      },
      {
        id: "community_builder",
        name: "Community Builder",
        avatar: getAIAvatarById("community_builder")?.imageUrl64 || "/avatars/ai/community_builder-64.png",
        expertise: ["community", "engagement", "dialogue"],
        personality: {
          tone: "friendly",
          style: "collaborative",
          knowledge_level: 0.7,
          engagement_style: "connector"
        },
        response_patterns: {
          debate_starter: [
            "J'aimerais entendre vos expériences personnelles avec {topic}...",
            "Comment {topic} a-t-il impacté votre vie ou votre communauté?",
            "Partageons ensemble nos différentes perspectives sur {topic}..."
          ],
          comment_response: [
            "Merci pour ce partage ! Votre expérience avec {topic} résonne avec...",
            "C'est fascinant de voir comment {topic} se manifeste différemment pour chacun...",
            "Votre perspective sur {topic} enrichit notre discussion collective..."
          ],
          question_asker: [
            "Comment pouvons-nous appliquer {topic} dans notre quotidien?",
            "Quelles actions concrètes {topic} nous inspire-t-il?",
            "Comment {topic} peut-il renforcer nos liens communautaires?"
          ],
          synthesis_generator: [
            "Nos échanges sur {topic} montrent la richesse de nos expériences diverses...",
            "La discussion sur {topic} révèle des points de convergence intéressants...",
            "En écoutant vos partages sur {topic}, j'identifie plusieurs thèmes récurrents..."
          ]
        }
      },
      {
        id: "catholic_theologian",
        name: "Théologien Catholique",
        avatar: getAIAvatarById("catholic_theologian")?.imageUrl64 || "/avatars/ai/catholic_theologian-64.png",
        expertise: ["theology", "christianism", "religious_philosophy", "ethics", "scripture"],
        personality: {
          tone: "wise",
          style: "scholarly",
          knowledge_level: 0.85,
          engagement_style: "pastoral"
        },
        response_patterns: {
          debate_starter: [
            "Selon la tradition catholique, {topic} nous invite à réfléchir sur...",
            "Les Écritures nous éclairent sur {topic} de manière profonde...",
            "Comment la doctrine chrétienne peut-elle nous guider dans notre compréhension de {topic}?",
            "Je reconnais que la vision chrétienne de {topic} peut différer de celle des traditions africaines..."
          ],
          comment_response: [
            "Votre perspective sur {topic} rappelle les enseignements du Christ sur...",
            "La tradition de l'Église offre un éclairage intéressant sur {topic}...",
            "En tant que théologien, je vois dans {topic} un appel à la compassion et à la vérité...",
            "Je respecte la divergence entre la perspective chrétienne et les traditions spirituelles africaines sur {topic}..."
          ],
          question_asker: [
            "Comment {topic} s'inscrit-il dans le message d'amour et de fraternité?",
            "Quelle lumière la foi chrétienne peut-elle apporter sur {topic}?",
            "Comment les principes évangéliques s'appliquent-ils à {topic} aujourd'hui?",
            "Comment la théologie chrétienne dialogue-t-elle avec les autres traditions spirituelles?"
          ],
          synthesis_generator: [
            "Notre discussion sur {topic} révèle la richesse de la pensée chrétienne...",
            "En synthétisant nos échanges, je vois émerger des valeurs chrétiennes fondamentales sur {topic}...",
            "Les perspectives partagées sur {topic} dessinent un chemin vers une compréhension plus profonde de la foi...",
            "Je note les points de convergence et de divergence entre les traditions sur {topic}..."
          ]
        }
      },
      {
        id: "muslim_scholar",
        name: "Érudit Musulman",
        avatar: getAIAvatarById("muslim_scholar")?.imageUrl64 || "/avatars/ai/muslim_scholar-64.png",
        expertise: ["islam", "quran", "hadith", "islamic_philosophy", "sharia", "sufism"],
        personality: {
          tone: "respectful",
          style: "scholarly",
          knowledge_level: 0.9,
          engagement_style: "educational"
        },
        response_patterns: {
          debate_starter: [
            "Selon la sagesse islamique, {topic} nous invite à la méditation...",
            "Le Coran nous enseigne sur {topic} des paroles de guidance divine...",
            "Comment la tradition prophétique peut-elle éclairer notre compréhension de {topic}?",
            "Je reconnais que la perspective islamique sur {topic} peut différer des traditions africaines..."
          ],
          comment_response: [
            "Votre perspective sur {topic} résonne avec les enseignements de l'Islam...",
            "La sagesse du Prophète Muhammad (paix et bénédictions sur lui) offre un éclairage sur {topic}...",
            "En tant qu'érudit musulman, je vois dans {topic} une invitation à la compassion et à la justice",
            "Je respecte les divergences entre la tradition islamique et les autres traditions spirituelles sur {topic}..."
          ],
          question_asker: [
            "Comment {topic} s'aligne-t-il avec les principes de l'Islam?",
            "Quelle lumière la foi musulmane peut-elle apporter sur {topic}?",
            "Comment les valeurs islamiques peuvent-elles nous guider dans {topic} aujourd'hui?",
            "Comment la perspective islamique dialogue-t-elle avec les autres traditions religieuses?"
          ],
          synthesis_generator: [
            "Notre discussion sur {topic} révèle la richesse de la pensée islamique...",
            "En synthétisant nos échanges, je vois émerger des valeurs islamiques fondamentales sur {topic}...",
            "Les perspectives partagées sur {topic} dessinent un chemin vers une compréhension plus profonde de l'Islam...",
            "Je note les points de convergence et de divergence respectueuse entre les traditions sur {topic}..."
          ]
        }
      },
      {
        id: "jewish_scholar",
        name: "Érudit Juif",
        avatar: getAIAvatarById("jewish_scholar")?.imageUrl64 || "/avatars/ai/jewish_scholar-64.png",
        expertise: ["judaism", "torah", "talmud", "jewish_philosophy", "kabbalah", "jewish_history"],
        personality: {
          tone: "thoughtful",
          style: "analytical",
          knowledge_level: 0.88,
          engagement_style: "scholarly"
        },
        response_patterns: {
          debate_starter: [
            "Selon la tradition juive, {topic} nous invite à l'étude et à la réflexion...",
            "La Torah nous enseigne sur {topic} à travers les générations...",
            "Comment la sagesse des prophètes d'Israël peut-elle éclairer notre compréhension de {topic}?",
            "Je reconnais que la perspective juive sur {topic} peut différer des approches chrétiennes ou islamiques..."
          ],
          comment_response: [
            "Votre perspective sur {topic} rappelle les enseignements de nos sages...",
            "La tradition du Talmud offre un éclairage profond sur {topic}...",
            "En tant qu'érudit juif, je vois dans {topic} un appel à la justice et à l'étude",
            "Je respecte les divergences entre la tradition juive et les autres traditions spirituelles sur {topic}..."
          ],
          question_asker: [
            "Comment {topic} s'inscrit-il dans les principes de la Torah?",
            "Quelle lumière la tradition juive peut-elle apporter sur {topic}?",
            "Comment les valeurs du judaïsme peuvent-elles nous guider dans {topic} aujourd'hui?",
            "Comment la perspective hébraïque sur {topic} dialogue-t-elle avec les autres traditions monothéistes?"
          ],
          synthesis_generator: [
            "Notre discussion sur {topic} révèle la richesse de la pensée juive...",
            "En synthétisant nos échanges, je vois émerger des valeurs juives fondamentales sur {topic}...",
            "Les perspectives partagées sur {topic} dessinent un chemin vers une compréhension plus profonde du judaïsme...",
            "Je note les points de convergence et de divergence respectueuse entre les traditions monothéistes sur {topic}..."
          ]
        }
      }
    ];
  }

  /**
   * Valide si un ID est un ObjectId MongoDB valide
   */
  private isValidObjectId(id: string): boolean {
    try {
      return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
    } catch {
      return false;
    }
  }

  /**
   * Génère une intervention IA contextuelle
   */
  async generateAIIntervention(context: {
    postId?: string;
    commentId?: string;
    type: "comment" | "debate_starter" | "moderator" | "expert" | "synthesizer";
    trigger: "new_comment" | "low_engagement" | "heated_debate" | "request_expertise" | "time_based";
  }): Promise<AIIntervention | null> {
    try {
      // Analyser le contexte
      const analysis = await this.analyzeContext(context);
      if (!analysis) return null;

      // Sélectionner la personnalité IA appropriée
      const persona = this.selectPersona(analysis.topic, analysis.sentiment, context.type);
      
      // Générer le contenu avec GPT
      const content = await this.generateAIContent(persona, analysis, context);
      
      return {
        type: context.type,
        content,
        tone: this.determineTone(analysis.sentiment, context.type),
        context: analysis,
        priority: this.calculatePriority(analysis, context)
      };
    } catch (error) {
      console.error("Error generating AI intervention:", error);
      return null;
    }
  }

  /**
   * Analyse le contexte pour déterminer l'intervention appropriée
   */
  private async analyzeContext(context: any): Promise<any> {
    let post: any = null;
    let comments: any[] = [];

    if (context.postId) {
      // Valider que le postId est un ObjectId MongoDB valide
      if (!this.isValidObjectId(context.postId)) {
        console.error(`Invalid postId format: ${context.postId}`);
        return null;
      }

      post = await CommunityPostModel.findById(context.postId)
        .populate("author", "username")
        .lean();
      
      if (post) {
        comments = await CommentModel.find({ contentId: context.postId })
          .populate("userId", "username")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
      }
    }

    if (!post) return null;

    // Analyser les thèmes principaux
    const topics = [...(post.tags || []), ...(post.aiTopics || [])];
    const mainTopic = topics[0] || "general";

    // Analyser le sentiment global
    const sentiments = comments.map((c: any) => this.analyzeSentiment(c.body));
    const avgSentiment = this.calculateAverageSentiment(sentiments);

    // Identifier les participants
    const participants = comments
      .filter((c: any) => c.userId && !c.aiGenerated) // Uniquement les commentaires humains
      .map((c: any) => (c.userId as any).username)
      .filter(Boolean);

    return {
      postId: post._id,
      title: post.title,
      content: post.content,
      topic: mainTopic,
      topics,
      sentiment: avgSentiment,
      participants,
      commentCount: comments.length,
      lastActivity: post.lastActivityAt,
      viralityScore: post.viralityScore,
      recentComments: comments.slice(0, 3)
    };
  }

  /**
   * Sélectionne la personnalité IA appropriée selon le sujet
   */
  private selectPersonaForTopic(topic: string): AIPersona {
    // Basé sur le topic
    if (topic.includes("kemet") || topic.includes("egypt") || topic.includes("history")) {
      return this.aiPersonas.find(p => p.id === "kemet_expert")!;
    }
    
    if (topic.includes("philosophy") || topic.includes("spirituality") || topic.includes("wisdom")) {
      return this.aiPersonas.find(p => p.id === "maat_sage")!;
    }

    // Sujets religieux chrétiens - théologien catholique
    if (topic.includes("christian") || topic.includes("catholic") || topic.includes("church") ||
        topic.includes("bible") || topic.includes("scripture") || topic.includes("theology") ||
        topic.includes("prayer") || topic.includes("jesus") || topic.includes("evangelical")) {
      return this.aiPersonas.find(p => p.id === "catholic_theologian")!;
    }

    // Sujets islamiques - érudit musulman
    if (topic.includes("islam") || topic.includes("muslim") || topic.includes("quran") ||
        topic.includes("prophet") || topic.includes("muhammad") || topic.includes("allah") ||
        topic.includes("sharia") || topic.includes("sufism") || topic.includes("hadith")) {
      return this.aiPersonas.find(p => p.id === "muslim_scholar")!;
    }

    // Sujets juifs - érudit juif
    if (topic.includes("jewish") || topic.includes("judaism") || topic.includes("torah") ||
        topic.includes("talmud") || topic.includes("kabbalah") || topic.includes("israel") ||
        topic.includes("synagogue") || topic.includes("rabbi") || topic.includes("moses") ||
        topic.includes("hebrew") || topic.includes("mitzvah")) {
      return this.aiPersonas.find(p => p.id === "jewish_scholar")!;
    }

    // Sujets religieux généraux - détection plus large
    if (topic.includes("religion") || topic.includes("god") || topic.includes("faith") ||
        topic.includes("divine") || topic.includes("spiritual") || topic.includes("sacred")) {
      // Par défaut, utiliser le théologien catholique pour les sujets religieux généraux
      return this.aiPersonas.find(p => p.id === "catholic_theologian")!;
    }

    // Par défaut, utiliser le community builder
    return this.aiPersonas.find(p => p.id === "community_builder")!;
  }

  /**
   * Sélectionne la personnalité IA appropriée (méthode originale)
   */
  private selectPersona(topic: string, sentiment: string, interventionType: string): AIPersona {
    // Basé sur le topic et le type d'intervention
    if (topic.includes("kemet") || topic.includes("egypt") || topic.includes("history")) {
      return this.aiPersonas.find(p => p.id === "kemet_expert")!;
    }
    
    if (topic.includes("philosophy") || topic.includes("spirituality") || topic.includes("wisdom")) {
      return this.aiPersonas.find(p => p.id === "maat_sage")!;
    }

    // Sujets religieux chrétiens - théologien catholique
    if (topic.includes("christian") || topic.includes("catholic") || topic.includes("church") ||
        topic.includes("bible") || topic.includes("scripture") || topic.includes("theology") ||
        topic.includes("prayer") || topic.includes("jesus") || topic.includes("evangelical")) {
      return this.aiPersonas.find(p => p.id === "catholic_theologian")!;
    }

    // Sujets islamiques - érudit musulman
    if (topic.includes("islam") || topic.includes("muslim") || topic.includes("quran") ||
        topic.includes("prophet") || topic.includes("muhammad") || topic.includes("allah") ||
        topic.includes("sharia") || topic.includes("sufism") || topic.includes("hadith")) {
      return this.aiPersonas.find(p => p.id === "muslim_scholar")!;
    }

    // Sujets juifs - érudit juif
    if (topic.includes("jewish") || topic.includes("judaism") || topic.includes("torah") ||
        topic.includes("talmud") || topic.includes("kabbalah") || topic.includes("israel") ||
        topic.includes("synagogue") || topic.includes("rabbi") || topic.includes("moses") ||
        topic.includes("hebrew") || topic.includes("mitzvah")) {
      return this.aiPersonas.find(p => p.id === "jewish_scholar")!;
    }

    // Sujets religieux généraux - détection plus large
    if (topic.includes("religion") || topic.includes("god") || topic.includes("faith") ||
        topic.includes("divine") || topic.includes("spiritual") || topic.includes("sacred")) {
      // Par défaut, utiliser le théologien catholique pour les sujets religieux généraux
      return this.aiPersonas.find(p => p.id === "catholic_theologian")!;
    }

    // Par défaut, utiliser le community builder
    return this.aiPersonas.find(p => p.id === "community_builder")!;
  }

  /**
   * Sélectionne la personnalité IA appropriée selon le type d'intervention et le contexte
   */
  private selectPersonaForIntervention(intervention: AIIntervention): AIPersona {
    const topic = intervention.context.topic.toLowerCase();
    
    // Pour les lanceurs de débat, utiliser le kemet expert ou maat sage
    if (intervention.type === "debate_starter") {
      if (topic.includes("kemet") || topic.includes("egypt") || topic.includes("ancient")) {
        return this.aiPersonas.find(p => p.id === "kemet_expert")!;
      }
      return this.aiPersonas.find(p => p.id === "maat_sage")!;
    }
    
    // Pour la modération, utiliser le community builder
    if (intervention.type === "moderator") {
      return this.aiPersonas.find(p => p.id === "community_builder")!;
    }
    
    // Pour les réponses expertes, utiliser la logique de sujet existante
    if (intervention.type === "expert") {
      return this.selectPersonaForTopic(topic);
    }
    
    // Pour les commentaires et synthèses, utiliser la logique de sujet
    return this.selectPersonaForTopic(topic);
  }

  /**
   * Génère le contenu de l'intervention avec le routeur IA principal
   */
  private async generateAIContent(persona: AIPersona, analysis: any, context: any): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(persona, context.type);
      const userPrompt = this.buildUserPrompt(persona, analysis, context);
      const response = await generateWithAIRouter({
        fast: context.type === "comment",
        complex: context.type === "expert" || context.type === "synthesizer",
        maxTokens: 300,
        temperature: 0.7,
        systemPrompt,
        userPrompt
      });

      return response.text.trim() || this.generateFallbackContent(persona, analysis, context);
    } catch (error) {
      console.error("Error generating AI content:", error);
      return this.generateFallbackContent(persona, analysis, context);
    }
  }

  /**
   * Construit le prompt système pour la personnalité IA
   */
  private buildSystemPrompt(persona: AIPersona, interventionType: string): string {
    const basePrompt = `Tu es ${persona.name}, une intelligence artificielle spécialisée dans ${persona.expertise.join(", ")}. 
    Ta personnalité est ${persona.personality.tone} et ton style est ${persona.personality.style}. 
    Niveau de connaissance: ${persona.personality.knowledge_level * 100}%. 
    Style d'engagement: ${persona.personality.engagement_style}.`;

    const typeSpecificPrompt = {
      comment: "Réponds à un commentaire de manière pertinente et constructive. Sois concis mais profond.",
      debate_starter: "Lance un nouveau débat ou relance la discussion avec une question provocatrice mais respectueuse.",
      moderator: "Modère la discussion de manière constructive, en encourageant le dialogue respectueux.",
      expert: "Apporte une expertise approfondie sur le sujet avec des informations précises et contextuelles.",
      synthesizer: "Synthétise les points clés de la discussion et propose des pistes de réflexion."
    };

    return basePrompt + "\n\n" + (typeSpecificPrompt[interventionType as keyof typeof typeSpecificPrompt] || "");
  }

  /**
   * Construit le prompt utilisateur
   */
  private buildUserPrompt(persona: AIPersona, analysis: any, context: any): string {
    const recentComments = analysis.recentComments
      .map((c: any) => `${(c.userId as any)?.username || "Anonyme"}: ${c.body}`)
      .join("\n");

    return `Contexte:
- Titre: ${analysis.title}
- Sujet principal: ${analysis.topic}
- Sentiment général: ${analysis.sentiment}
- Nombre de commentaires: ${analysis.commentCount}
- Participants: ${analysis.participants.join(", ")}

Commentaires récents:
${recentComments}

Génère une intervention pertinente en tant que ${persona.name} qui enrichit la discussion.`;
  }

  /**
   * Génère un contenu de repli si GPT échoue
   */
  private generateFallbackContent(persona: AIPersona, analysis: any, context: any): string {
    // Utiliser toujours les patterns contextuels existants
    const patterns = persona.response_patterns[context.type as keyof typeof persona.response_patterns];
    if (patterns && patterns.length > 0) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      return pattern.replace(/{topic}/g, analysis.topic);
    }

    // Si pas de pattern disponible, générer un message contextuel basé sur les commentaires récents
    const recentComments = analysis.recentComments || [];
    if (recentComments.length > 0) {
      const lastComment = recentComments[0];
      const lastUser = (lastComment.userId as any)?.username || "Quelqu'un";
      return `${persona.name} répond à ${lastUser}: ${this.generateContextualResponse(lastComment.body, analysis.topic)}`;
    }

    // Fallback ultime avec plus de variété
    const fallbackMessages = [
      `En tant que ${persona.name}, je trouve cette discussion sur ${analysis.topic} vraiment intéressante et j'aimerais partager ma perspective.`,
      `Cette conversation sur ${analysis.topic} est enrichissante ! ${persona.name} apprécie l'ouverture des échanges.`,
      `Excellent débat sur ${analysis.topic} ! ${persona.name} pense que nous pourrions explorer encore plus de pistes.`,
      `Je suis impressionné par la qualité de cet échange sur ${analysis.topic}. ${persona.name} aimerait contribuer à la réflexion.`,
      `Cette discussion sur ${analysis.topic} mérite d'être approfondie. ${persona.name} propose quelques pistes de réflexion.`
    ];

    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }

  private generateContextualResponse(commentBody: string, topic: string): string {
    // Générer une réponse contextuelle basée sur le commentaire utilisateur
    if (commentBody.toLowerCase().includes("question") || commentBody.includes("?")) {
      return `C'est une excellente question sur ${topic}. Permettez-moi d'explorer plusieurs angles de cette problématique.`;
    }
    if (commentBody.toLowerCase().includes("pensée") || commentBody.toLowerCase().includes("idée")) {
      return `Votre réflexion sur ${topic} est très pertinente. Je voudrais ajouter une perspective complémentaire à votre analyse.`;
    }
    if (commentBody.toLowerCase().includes("histoire") || commentBody.toLowerCase().includes("passé")) {
      return `Votre analyse historique de ${topic} est intéressante. Les sources anciennes nous offrent en effet des éclairages précieux sur ce sujet.`;
    }
    
    return `Merci pour votre contribution sur ${topic}. Votre perspective enrichit notre discussion collective.`;
  }

  /**
   * Détermine le ton approprié
   */
  private determineTone(sentiment: string, interventionType: string): any {
    const toneMap: Record<string, Record<string, string>> = {
      positive: {
        comment: "encouraging",
        debate_starter: "challenging",
        moderator: "neutral",
        expert: "educational",
        synthesizer: "neutral"
      },
      neutral: {
        comment: "neutral",
        debate_starter: "provocative",
        moderator: "neutral",
        expert: "educational",
        synthesizer: "neutral"
      },
      negative: {
        comment: "encouraging",
        debate_starter: "neutral",
        moderator: "neutral",
        expert: "educational",
        synthesizer: "neutral"
      }
    };

    return toneMap[sentiment]?.[interventionType] || "neutral";
  }

  /**
   * Calcule la priorité de l'intervention
   */
  private calculatePriority(analysis: any, context: any): any {
    let score = 0;

    // Basé sur l'engagement
    if (analysis.commentCount < 3) score += 3; // Faible engagement = priorité haute
    if (analysis.viralityScore > 70) score += 2; // Contenu viral = priorité haute

    // Basé sur le temps depuis dernière activité
    const hoursSinceLastActivity = (Date.now() - new Date(analysis.lastActivityAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastActivity > 2) score += 2; // Discussion stagnante

    // Basé sur le type d'intervention
    const typePriority = {
      moderator: 3,
      debate_starter: 2,
      expert: 2,
      comment: 1,
      synthesizer: 1
    };

    score += typePriority[context.type as keyof typeof typePriority] || 1;

    if (score >= 4) return "urgent";
    if (score >= 3) return "high";
    if (score >= 2) return "medium";
    return "low";
  }

  /**
   * Crée un commentaire IA dans la base de données
   */
  async createAIComment(intervention: AIIntervention): Promise<string | null> {
    try {
      // Sélectionner la personnalité IA appropriée selon le type d'intervention et le contexte
      const persona = this.selectPersonaForIntervention(intervention);

      const comment = new CommentModel({
        contentId: intervention.context.postId,
        userId: null, // Marquer comme commentaire IA
        body: intervention.content,
        aiGenerated: true,
        aiPersona: persona.id,
        aiPersonaName: persona.name,
        aiPersonaAvatar: persona.avatar,
        debateScore: Math.random() * 10, // Score initial
        likeCount: 0,
        replyCount: 0,
        mentions: [],
        createdAt: new Date()
      });

      await comment.save();

      // Mettre à jour les stats du post
      await CommunityPostModel.findByIdAndUpdate(intervention.context.postId, {
        $inc: { participantCount: 1 },
        $set: { lastActivityAt: new Date() }
      });

      return comment._id.toString();
    } catch (error) {
      console.error("Error creating AI comment:", error);
      return null;
    }
  }

  /**
   * Lance automatiquement des débats
   */
  async launchAutoDebate(): Promise<string | null> {
    try {
      // Trouver les sujets tendances
      const trendingTopics = await this.getTrendingTopics();
      if (trendingTopics.length === 0) return null;

      const topic = trendingTopics[0];

      // Créer un post de débat IA
      const debateContent = await this.generateDebateStarter(topic);

      const post = new CommunityPostModel({
        type: "discussion",
        title: `Débat IA: ${topic}`,
        content: debateContent,
        author: null, // Marquer comme post IA
        aiGenerated: true,
        aiPersona: "maat_sage",
        tags: [topic, "ai-debate", "discussion"],
        upvotes: 0,
        participantCount: 0,
        viralityScore: 0,
        viralityStatus: "cold",
        badges: [],
        aiTopics: [topic],
        sentiment: "neutral",
        controversy: 0.5,
        quality: 0.8,
        engagementMetrics: {
          views: 0,
          shares: 0,
          bookmarks: 0,
          averageReadTime: 0,
          bounceRate: 1.0,
          conversionRate: 0
        },
        transformedToFeed: false,
        transformationScore: 0,
        reports: 0,
        isHidden: false,
        lastActivityAt: new Date(),
        bumpedAt: new Date()
      });

      await post.save();
      return post._id.toString();
    } catch (error) {
      console.error("Error launching auto debate:", error);
      return null;
    }
  }

  /**
   * Génère un lanceur de débat
   */
  private async generateDebateStarter(topic: string): Promise<string> {
    try {
      const response = await generateWithAIRouter({
        complex: true,
        maxTokens: 200,
        temperature: 0.8,
        systemPrompt:
          "Tu es un expert en philosophie africaine et en civilisation kemet. Génère un débat provocateur mais respectueux sur un sujet donné. Le débat doit inviter à la réflexion et à la discussion.",
        userPrompt: `Génère un lanceur de débat sur le sujet: ${topic}`
      });

      return response.text.trim() || `Je vous invite à réfléchir sur ${topic} et ses implications dans notre monde moderne. Quelles sont vos perspectives sur ce sujet fondamental?`;
    } catch (error) {
      console.error("Error generating debate starter:", error);
      return `Je vous invite à réfléchir sur ${topic} et ses implications dans notre monde moderne. Quelles sont vos perspectives sur ce sujet fondamental?`;
    }
  }

  /**
   * Obtient les sujets tendances
   */
  private async getTrendingTopics(): Promise<string[]> {
    // Pour l'instant, retourner des sujets prédéfinis
    return [
      "kemet",
      "philosophy africaine",
      "spiritualité ancienne",
      "sagesse égyptienne",
      "civilisation"
    ];
  }

  /**
   * Analyse le sentiment d'un texte
   */
  private analyzeSentiment(text: string): string {
    // Analyse simple de sentiment
    const positiveWords = ["bon", "excellent", "amour", "paix", "harmonie", "sagesse", "beau"];
    const negativeWords = ["mauvais", "haine", "guerre", "conflit", "colère", "triste"];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  /**
   * Calcule le sentiment moyen
   */
  private calculateAverageSentiment(sentiments: string[]): string {
    if (sentiments.length === 0) return "neutral";
    
    const counts = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(counts));
    return Object.keys(counts).find(key => counts[key] === maxCount) || "neutral";
  }

  /**
   * Vérifie si une intervention IA est nécessaire
   */
  async shouldIntervene(postId: string): Promise<boolean> {
    try {
      // Valider que le postId est un ObjectId MongoDB valide
      if (!this.isValidObjectId(postId)) {
        console.error(`Invalid postId format in shouldIntervene: ${postId}`);
        return false;
      }

      const post = await CommunityPostModel.findById(postId);
      if (!post) return false;

      // Si le post est IA, ne pas intervenir
      if (post.aiGenerated) return false;

      const hoursSinceLastActivity = (Date.now() - new Date(post.lastActivityAt).getTime()) / (1000 * 60 * 60);
      
      // Intervenir si:
      // 1. Pas d'activité depuis 2 heures et peu de commentaires
      // 2. Discussion stagnante avec potentiel
      // 3. Débat qui relance

      return (hoursSinceLastActivity > 2 && post.participantCount < 5) ||
             (post.viralityScore > 30 && post.participantCount < 10);
    } catch (error) {
      console.error("Error checking intervention need:", error);
      return false;
    }
  }

  /**
   * Traite les interventions IA automatiques
   */
  async processAutomaticInterventions(): Promise<void> {
    try {
      // 1. Lancer des débats automatiques
      if (Math.random() < 0.1) { // 10% de chance
        await this.launchAutoDebate();
      }

      // 2. Intervenir dans les discussions stagnantes
      const postsNeedingIntervention = await this.findPostsNeedingIntervention();
      
      for (const post of postsNeedingIntervention) {
        const intervention = await this.generateAIIntervention({
          postId: post._id,
          type: "comment",
          trigger: "low_engagement"
        });

        if (intervention && (intervention.priority === "high" || intervention.priority === "urgent")) {
          await this.createAIComment(intervention);
        }
      }
    } catch (error) {
      console.error("Error processing automatic interventions:", error);
    }
  }

  /**
   * Trouve les posts nécessitant une intervention
   */
  private async findPostsNeedingIntervention(): Promise<any[]> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    return await CommunityPostModel.find({
      isHidden: false,
      aiGenerated: { $ne: true }, // Exclure les posts IA
      lastActivityAt: { $lt: twoHoursAgo },
      participantCount: { $lt: 10 },
      viralityScore: { $gt: 20 }
    })
    .sort({ viralityScore: -1 })
    .limit(5)
    .lean();
  }
}

export const participativeAIService = new ParticipativeAIService();
