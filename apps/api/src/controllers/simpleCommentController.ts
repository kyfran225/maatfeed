import { Request, Response } from "express";

type MockComment = {
  _id: string;
  contentId: string;
  userId: string | null;
  body: string;
  authorName?: string;
  authorAvatar?: string | null;
  aiPersona?: string | null;
  aiPersonaName?: string | null;
  aiPersonaAvatar?: string | null;
  aiGenerated: boolean;
  debateScore: number;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: MockComment[];
};

declare global {
  var userComments: MockComment[] | undefined;
}

export async function createCommentController(req: Request, res: Response) {
  try {
    const rawContentId = req.params.contentId;
    const contentId = Array.isArray(rawContentId) ? rawContentId[0] : rawContentId;
    const { body } = req.body;
    
    console.log(`[COMMENTS] Création de commentaire pour contentId: ${contentId}`);
    
    // Créer un nouveau commentaire utilisateur
    const newComment = {
      _id: `user-comment-${Date.now()}`,
      contentId: contentId,
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      body: body,
      authorName: "User",
      authorAvatar: null,
      aiPersona: null,
      aiPersonaName: null,
      aiPersonaAvatar: null,
      aiGenerated: false,
      debateScore: 0,
      likeCount: 0,
      replyCount: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    };
    
    // Stocker le commentaire dans la base de données simulée
    if (!global.userComments) {
      global.userComments = [];
    }
    global.userComments.push(newComment);
    
    console.log(`[COMMENTS] Commentaire créé avec succès: ${newComment._id}`);
    
    res.status(201).json({
      success: true,
      data: newComment,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[COMMENTS] Erreur création:', error);
    res.status(500).json({
      success: false,
      error: "Failed to create comment"
    });
  }
}

export async function listCommentsController(req: Request, res: Response) {
  try {
    const rawContentId = req.params.contentId;
    const contentId = Array.isArray(rawContentId) ? rawContentId[0] : rawContentId;
    const { ai_only } = req.query;
    
    console.log(`[COMMENTS] Requête pour contentId: ${contentId}, ai_only: ${ai_only}`);
    
    // Commentaires IA factices supprimés pour éviter la duplication
    // Les commentaires IA sont maintenant gérés par le service participativeAIService
    const mockAIComments: any[] = [];

    // Simuler une base de données simple pour stocker les commentaires utilisateur
    // Dans une vraie application, cela viendrait de MongoDB
    const userComments = global.userComments || [];
    const contentUserComments = userComments.filter((comment) => comment.contentId === contentId);
    
    // Combiner les commentaires IA et utilisateur
    const allComments = [...contentUserComments, ...mockAIComments];
    
    // Filtrer si seulement les commentaires IA sont demandés
    const filteredComments = ai_only === "true" 
      ? allComments.filter(comment => comment.aiGenerated)
      : allComments;
    
    console.log(`[COMMENTS] Retourne ${filteredComments.length} commentaires`);
    
    res.json({
      success: true,
      data: filteredComments,
      meta: {
        count: filteredComments.length,
        ai_only: ai_only === "true",
        contentId: contentId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[COMMENTS] Erreur:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments"
    });
  }
}
