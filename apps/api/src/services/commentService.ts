import { Request, Response } from "express";
import { CommentModel } from "../models/Comment.js";
import { logger } from "../config/logger.js";

// Types simplifiés pour la nouvelle architecture
export type CommentData = {
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
  replies?: CommentData[];
};

// Service moderne et simplifié pour les commentaires
export class CommentService {
  /**
   * Créer un nouveau commentaire
   */
  static async createComment(contentId: string, commentData: Partial<CommentData>): Promise<CommentData> {
    try {
      const newComment = new CommentModel({
        contentId,
        body: commentData.body,
        userId: commentData.userId,
        aiGenerated: commentData.aiGenerated || false,
        aiPersona: commentData.aiPersona,
        debateScore: 0,
        likeCount: 0,
        replyCount: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedComment = await newComment.save();
      
      logger.info(`Commentaire créé: ${savedComment._id} pour contentId: ${contentId}`);
      
      return this.formatCommentData(savedComment);
    } catch (error) {
      logger.error({ message: 'Erreur création commentaire', error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Lister les commentaires pour un contenu
   */
  static async listComments(contentId: string, options: {
    aiOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ comments: CommentData[]; total: number }> {
    try {
      const { aiOnly, limit = 50, offset = 0 } = options;
      
      const query: any = { contentId, isDeleted: false };
      if (aiOnly) {
        query.aiGenerated = true;
      }

      const comments = await CommentModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      const total = await CommentModel.countDocuments(query);

      const formattedComments = comments.map(comment => this.formatCommentData(comment));

      logger.info(`Retourne ${formattedComments.length} commentaires pour contentId: ${contentId}`);

      return {
        comments: formattedComments,
        total
      };
    } catch (error) {
      logger.error({ message: 'Erreur listing commentaires', error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to fetch comments');
    }
  }

  /**
   * Mettre à jour un commentaire
   */
  static async updateComment(commentId: string, updateData: Partial<CommentData>): Promise<CommentData> {
    try {
      const updatedComment = await CommentModel.findByIdAndUpdate(
        commentId,
        { 
          ...updateData, 
          updatedAt: new Date() 
        },
        { new: true }
      ).lean();

      if (!updatedComment) {
        throw new Error('Comment not found');
      }

      logger.info(`Commentaire mis à jour: ${commentId}`);
      
      return this.formatCommentData(updatedComment);
    } catch (error) {
      logger.error({ message: 'Erreur mise à jour commentaire', error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to update comment');
    }
  }

  /**
   * Supprimer un commentaire (soft delete)
   */
  static async deleteComment(commentId: string): Promise<void> {
    try {
      await CommentModel.findByIdAndUpdate(
        commentId,
        { 
          isDeleted: true,
          updatedAt: new Date()
        }
      );

      logger.info(`Commentaire supprimé: ${commentId}`);
    } catch (error) {
      logger.error({ message: 'Erreur suppression commentaire', error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete comment');
    }
  }

  /**
   * Ajouter un like à un commentaire
   */
  static async likeComment(commentId: string, userId: string): Promise<CommentData> {
    try {
      const updatedComment = await CommentModel.findByIdAndUpdate(
        commentId,
        { 
          $inc: { likeCount: 1 },
          updatedAt: new Date()
        },
        { new: true }
      ).lean();

      if (!updatedComment) {
        throw new Error('Comment not found');
      }

      logger.info(`Like ajouté au commentaire: ${commentId} par user: ${userId}`);
      
      return this.formatCommentData(updatedComment);
    } catch (error) {
      logger.error({ message: 'Erreur like commentaire', error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to like comment');
    }
  }

  /**
   * Formatter les données du commentaire
   */
  static formatCommentData(comment: any): CommentData {
    return {
      _id: comment._id.toString(),
      contentId: comment.contentId,
      userId: comment.userId?.toString() || null,
      body: comment.body,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar,
      aiPersona: comment.aiPersona,
      aiPersonaName: comment.aiPersonaName,
      aiPersonaAvatar: comment.aiPersonaAvatar,
      aiGenerated: comment.aiGenerated || false,
      debateScore: comment.debateScore || 0,
      likeCount: comment.likeCount || 0,
      replyCount: comment.replyCount || 0,
      isDeleted: comment.isDeleted || false,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: []
    };
  }

  /**
   * Obtenir les statistiques des commentaires pour un contenu
   */
  static async getCommentStats(contentId: string): Promise<{
    total: number;
    aiGenerated: number;
    userGenerated: number;
    totalLikes: number;
  }> {
    try {
      const stats = await CommentModel.aggregate([
        { $match: { contentId, isDeleted: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            aiGenerated: { 
              $sum: { $cond: [{ $eq: ['$aiGenerated', true] }, 1, 0] } 
            },
            userGenerated: { 
              $sum: { $cond: [{ $eq: ['$aiGenerated', false] }, 1, 0] } 
            },
            totalLikes: { $sum: '$likeCount' }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        aiGenerated: 0,
        userGenerated: 0,
        totalLikes: 0
      };

      return result;
    } catch (error) {
      logger.error({ message: 'Erreur statistiques commentaires', error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to get comment stats');
    }
  }
}

export default CommentService;

// ==================== FONCTIONS COMPATIBLES POUR LE CONTROLLER ====================

// Post a comment (alias pour la compatibilité)
export async function postComment(data: {
  contentId: string;
  userId: string;
  body: string;
}) {
  return CommentService.createComment(data.contentId, {
    userId: data.userId,
    body: data.body,
    aiGenerated: false
  });
}

// Post a reply
export async function postReply(data: {
  commentId: string;
  userId: string;
  body: string;
  parentReplyId?: string;
  replyToCommentId?: string;
  replyToReplyId?: string;
  replyMode?: string;
}) {
  return CommentService.createComment(data.commentId, {
    userId: data.userId,
    body: data.body,
    aiGenerated: false
  });
}

// Edit a comment
export async function editComment(commentId: string, userId: string, body: string) {
  return CommentService.updateComment(commentId, { body });
}

// Edit a reply
export async function editReply(replyId: string, userId: string, body: string) {
  return CommentService.updateComment(replyId, { body });
}

// Delete a comment
export async function deleteComment(commentId: string, userId: string, reason?: string) {
  return CommentService.deleteComment(commentId);
}

// Delete a reply
export async function deleteReply(replyId: string, userId: string, reason?: string) {
  return CommentService.deleteComment(replyId);
}

// Like a comment
export async function likeComment(commentId: string, userId: string) {
  return CommentService.likeComment(commentId, userId);
}

// Unlike a comment
export async function unlikeComment(commentId: string, userId: string) {
  // Pour l'instant, on ne fait rien - à implémenter plus tard
  const comment = await getCommentById(commentId);
  if (comment) {
    return CommentService.updateComment(commentId, { likeCount: Math.max(0, comment.likeCount - 1) });
  }
  return CommentService.updateComment(commentId, { likeCount: 0 });
}

// Like a reply
export async function likeReply(replyId: string, userId: string) {
  return CommentService.likeComment(replyId, userId);
}

// Unlike a reply
export async function unlikeReply(replyId: string, userId: string) {
  const reply = await getCommentById(replyId);
  if (reply) {
    return CommentService.updateComment(replyId, { likeCount: Math.max(0, reply.likeCount - 1) });
  }
  return CommentService.updateComment(replyId, { likeCount: 0 });
}

// Report a comment
export async function reportComment(commentId: string, userId: string, reason: string, description?: string) {
  // Implémentation basique pour l'instant
  return { userId, reason, description, createdAt: new Date() };
}

// Report a reply
export async function reportReply(replyId: string, userId: string, reason: string, description?: string) {
  // Implémentation basique pour l'instant
  return { userId, reason, description, createdAt: new Date() };
}

// Get comment stats
export async function getCommentStats(contentId: string) {
  const stats = await CommentService.getCommentStats(contentId);
  return {
    totalComments: stats.total,
    totalLikes: stats.totalLikes,
    totalReports: 0
  };
}

// Get comments thread
export async function getCommentsThread(contentId: string, userId?: string) {
  const result = await CommentService.listComments(contentId);
  return result.comments;
}

// Get comments paginated
export async function getCommentsPaginated(contentId: string, options: {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  currentUserId?: string;
  aiOnly?: boolean;
}) {
  const { page, limit, aiOnly } = options;
  const offset = (page - 1) * limit;
  
  const result = await CommentService.listComments(contentId, {
    aiOnly,
    limit,
    offset
  });
  
  return {
    data: result.comments,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      hasNext: page * limit < result.total,
      hasPrev: page > 1
    }
  };
}

// Get nested replies
export async function getNestedReplies(replyId: string, userId?: string) {
  // Pour l'instant, retourne vide - à implémenter plus tard
  return [];
}

// Fonction helper pour obtenir un commentaire par ID
async function getCommentById(commentId: string) {
  try {
    const comment = await CommentModel.findById(commentId).lean();
    return comment ? CommentService.formatCommentData(comment) : null;
  } catch (error) {
    return null;
  }
}
