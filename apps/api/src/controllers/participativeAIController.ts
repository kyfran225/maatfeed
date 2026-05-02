import { Request, Response } from "express";
import { participativeAIService } from "../services/participativeAIService.js";
import { z } from "zod";

const interventionSchema = z.object({
  postId: z.string().min(1),
  type: z.enum(["comment", "debate_starter", "moderator", "expert", "synthesizer"]),
  trigger: z.enum(["new_comment", "low_engagement", "heated_debate", "request_expertise", "time_based"]).optional()
});

export async function triggerAIInterventionController(req: Request, res: Response) {
  try {
    const { postId, type, trigger } = interventionSchema.parse(req.body);
    
    if (!postId || !type) {
      return res.status(400).json({
        success: false,
        error: "postId and type are required"
      });
    }

    const intervention = await participativeAIService.generateAIIntervention({
      postId,
      type,
      trigger: trigger || "request_expertise"
    });

    if (!intervention) {
      return res.status(404).json({
        success: false,
        error: "Could not generate AI intervention"
      });
    }

    // Créer le commentaire IA
    const commentId = await participativeAIService.createAIComment(intervention);

    res.json({
      success: true,
      data: {
        intervention,
        commentId
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in triggerAIInterventionController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to trigger AI intervention"
    });
  }
}

export async function launchAutoDebateController(req: Request, res: Response) {
  try {
    const postId = await participativeAIService.launchAutoDebate();
    
    if (!postId) {
      return res.status(500).json({
        success: false,
        error: "Failed to launch auto debate"
      });
    }

    res.json({
      success: true,
      data: { postId },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in launchAutoDebateController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to launch auto debate"
    });
  }
}

export async function processAutomaticInterventionsController(req: Request, res: Response) {
  try {
    await participativeAIService.processAutomaticInterventions();
    
    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in processAutomaticInterventionsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process automatic interventions"
    });
  }
}

export async function checkInterventionNeedController(req: Request, res: Response) {
  try {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        error: "postId is required"
      });
    }

    const shouldIntervene = await participativeAIService.shouldIntervene(postId as string);
    
    res.json({
      success: true,
      data: { shouldIntervene },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in checkInterventionNeedController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check intervention need"
    });
  }
}
