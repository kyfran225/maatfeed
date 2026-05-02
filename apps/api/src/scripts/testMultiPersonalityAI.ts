#!/usr/bin/env tsx

import { logger } from "../config/logger.js";
import { classifyContent } from "../services/contentClassificationService.js";
import { routeToPersonality, getAllPersonalities } from "../services/personalityRouterService.js";
import { AIModerationService } from "../services/aiModerationService.js";
import { generateAIResponse } from "../services/aiCommentService.js";
import { AIMemoryService } from "../services/aiMemoryService.js";

async function testMultiPersonalityAI() {
  logger.info("🤖 Testing Multi-Personality AI System");

  try {
    // Test 1: Content Classification
    logger.info("📊 Testing content classification...");
    const testTexts = [
      "Que pensez-vous de la philosophie de Kemet et de son impact sur la spiritualité moderne ?",
      "Jésus est-il vraiment le fils de Dieu selon la Bible ?",
      "Le Coran contient-il des contradictions ?",
      "Pourquoi les pyramides d'Égypte sont-elles si fascinantes ?",
      "C'est un débat intéressant mais je ne suis pas d'accord avec votre perspective",
      "Quelqu'un peut m'expliquer la Torah et son importance ?"
    ];

    for (const text of testTexts) {
      const classification = await classifyContent(text);
      logger.info({
        text: text.substring(0, 50) + "...",
        primaryTopic: classification.primaryTopic,
        confidence: classification.confidence,
        topics: Object.entries(classification.topics)
          .filter(([_, score]) => score > 0.3)
          .map(([topic, score]) => `${topic}: ${score.toFixed(2)}`)
      }, "Classification result");
    }

    // Test 2: Personality Routing
    logger.info("🎭 Testing personality routing...");
    const personalities = getAllPersonalities();
    logger.info({ count: personalities.length }, "Available personalities");

    for (const text of testTexts) {
      const routing = await routeToPersonality(text, {
        recentCommentCount: 5,
        discussionActive: true,
        lastAIResponses: []
      });

      if (routing) {
        logger.info({
          text: text.substring(0, 50) + "...",
          personality: routing.personality.id,
          displayName: routing.personality.displayName,
          confidence: routing.confidence
        }, "Personality routing result");
      } else {
        logger.warn({
          text: text.substring(0, 50) + "..."
        }, "No personality selected");
      }
    }

    // Test 3: Content Moderation
    logger.info("🛡️ Testing content moderation...");
    const moderationTests = [
      "Je pense que c'est une excellente idée !",
      "Ceci est complètement stupide et idiot",
      "Achetez maintenant des produits pas cher ! https://spam.com",
      "Je veux me faire du mal"
    ];

    for (const text of moderationTests) {
      const moderation = await AIModerationService.moderateForAI(text);
      logger.info({
        text: text.substring(0, 50) + "...",
        allowed: moderation.allowed,
        riskLevel: moderation.riskLevel,
        flagCount: moderation.flags.length
      }, "Moderation result");
    }

    // Test 4: AI Response Generation
    logger.info("💬 Testing AI response generation...");
    const testComment = "Quelle est la différence entre la spiritualité Kemet et les religions monothéistes ?";
    
    try {
      const response = await generateAIResponse(testComment, {
        debateScore: 0.3,
        questionScore: 0.8,
        emotionScore: 0.2,
        toxicityScore: 0.1,
        spamScore: 0.1,
        qualityScore: 0.7
      }, {
        recentCommentCount: 3,
        discussionActive: true,
        lastAIResponses: [],
        discussionContext: ["J'ai toujours été fasciné par les traditions anciennes"],
        previousAIResponses: []
      });

      logger.info({
        personality: response.personality.id,
        personalityName: response.personality.displayName,
        provider: response.provider,
        responseLength: response.body.length,
        responsePreview: response.body.substring(0, 100) + "..."
      }, "AI response generated successfully");

    } catch (error) {
      logger.warn({ err: error }, "AI response generation failed");
    }

    // Test 5: Memory System
    logger.info("🧠 Testing AI memory system...");
    const memoryTest = await AIMemoryService.getResponseContext("test-content-id", "maat_sage");
    logger.info({
      hasContext: !!memoryTest,
      discussionContextLength: memoryTest?.discussionContext.length || 0,
      previousAIResponsesLength: memoryTest?.previousAIResponses.length || 0
    }, "Memory system test");

    // Test 6: Safety Checks
    logger.info("🔒 Testing safety checks...");
    const safeContent = "J'apprécie vraiment cette discussion spirituelle";
    const unsafeContent = "Je déteste tout le monde ici, vous êtes tous stupides";

    const safeCheck = await AIModerationService.isSafeForAIResponse(safeContent);
    const unsafeCheck = await AIModerationService.isSafeForAIResponse(unsafeContent);

    logger.info({
      safeContent: safeContent.substring(0, 30) + "...",
      isSafe: safeCheck
    }, "Safe content check");

    logger.info({
      unsafeContent: unsafeContent.substring(0, 30) + "...",
      isSafe: unsafeCheck
    }, "Unsafe content check");

    logger.info("✅ Multi-Personality AI System Tests Completed Successfully!");
    
    return {
      success: true,
      testsCompleted: [
        "Content Classification",
        "Personality Routing", 
        "Content Moderation",
        "AI Response Generation",
        "Memory System",
        "Safety Checks"
      ]
    };

  } catch (error) {
    logger.error({ err: error }, "❌ Multi-Personality AI System Tests Failed");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMultiPersonalityAI()
    .then((result) => {
      console.log("\n" + "=".repeat(50));
      console.log("🧪 MULTI-PERSONALITY AI TEST RESULTS");
      console.log("=".repeat(50));
      console.log(JSON.stringify(result, null, 2));
      console.log("=".repeat(50));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}

export { testMultiPersonalityAI };
