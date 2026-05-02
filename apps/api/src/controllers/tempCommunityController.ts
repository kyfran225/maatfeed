import { Request, Response } from "express";

// Contrôleur temporaire pour éviter les erreurs 500
export async function getTopDebatesController(req: Request, res: Response) {
  try {
    // Retourner des données factices pour que l'interface fonctionne
    const mockDebates = [
      {
        id: "mock-1",
        contentId: "mock-1",
        title: "Débat IA: La sagesse de Kemet dans le monde moderne",
        description: "Comment les enseignements de la civilisation kemet peuvent-ils nous guider aujourd'hui?",
        debateScore: 85,
        participantCount: 12,
        topComments: [],
        tags: ["kemet", "sagesse", "philosophie"],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      },
      {
        id: "mock-2", 
        contentId: "mock-2",
        title: "Discussion: Spiritualité ancienne vs modernité",
        description: "Les pratiques spirituelles anciennes ont-elles encore leur place dans notre société technologique?",
        debateScore: 72,
        participantCount: 8,
        topComments: [],
        tags: ["spiritualité", "modernité", "tradition"],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        lastActivity: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: "mock-3",
        contentId: "mock-3", 
        title: "Débat: L'héritage égyptien dans la culture africaine",
        description: "Comment l'Égypte ancienne a-t-elle influencé les cultures africaines contemporaines?",
        debateScore: 68,
        participantCount: 6,
        topComments: [],
        tags: ["egypte", "culture", "histoire"],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        lastActivity: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockDebates,
      meta: {
        count: mockDebates.length,
        limit: 50,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getTopDebatesController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch top debates"
    });
  }
}

export async function getDebateThreadController(req: Request, res: Response) {
  try {
    const { contentId } = req.params;
    
    const mockThread = {
      id: contentId,
      contentId: contentId,
      title: "Débat IA: La sagesse de Kemet dans le monde moderne",
      description: "Comment les enseignements de la civilisation kemet peuvent-ils nous guider aujourd'hui?",
      isActive: true,
      debateScore: 85,
      participantCount: 12,
      topComments: [
        {
          commentId: "comment-1",
          score: 15,
          position: 1
        },
        {
          commentId: "comment-2", 
          score: 12,
          position: 2
        }
      ],
      tags: ["kemet", "sagesse", "philosophie"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockThread,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch debate thread"
    });
  }
}

export async function createDebateThreadController(req: Request, res: Response) {
  try {
    const { contentId, title, description, tags } = req.body;
    
    const mockNewThread = {
      id: "new-mock-" + Date.now(),
      contentId: contentId,
      title: title,
      description: description,
      isActive: true,
      debateScore: 0,
      participantCount: 1,
      topComments: [],
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: mockNewThread,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in createDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create debate thread"
    });
  }
}
