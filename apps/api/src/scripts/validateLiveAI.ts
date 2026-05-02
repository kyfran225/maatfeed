#!/usr/bin/env tsx

import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

async function validateLiveAI() {
  logger.info("🔍 Validating Live AI Multi-Personality System");

  const results = {
    apiKeys: {
      groq: !!env.GROQ_API_KEY,
      gemini: !!env.GEMINI_API_KEY,
      openrouter: !!env.OPENROUTER_API_KEY
    },
    endpoints: [] as string[],
    liveTests: [] as string[]
  };

  // Check API Keys
  logger.info("🔑 Checking API Keys...");
  Object.entries(results.apiKeys).forEach(([service, hasKey]) => {
    logger.info(`${service}: ${hasKey ? '✅' : '❌'}`);
  });

  // Test API endpoints
  logger.info("🌐 Testing API Endpoints...");
  
  const baseUrl = `http://localhost:${env.PORT || 4000}`;
  const endpoints = [
    "/api/ai/v2/personalities",
    "/api/health",
    "/api/readiness"
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (response.ok) {
        logger.info(`✅ ${endpoint} - ${response.status}`);
        results.endpoints.push(`${endpoint}: OK`);
      } else {
        logger.warn(`⚠️ ${endpoint} - ${response.status}`);
        results.endpoints.push(`${endpoint}: ${response.status}`);
      }
    } catch (error) {
      logger.error(`❌ ${endpoint} - ${error}`);
      results.endpoints.push(`${endpoint}: ERROR`);
    }
  }

  // Test live AI functionality
  logger.info("🤖 Testing Live AI Functionality...");
  
  try {
    // Test content classification
    const classifyResponse = await fetch(`${baseUrl}/api/ai/v2/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Quelle est la différence entre la spiritualité Kemet et les religions monothéistes ?"
      })
    });

    if (classifyResponse.ok) {
      const classification = await classifyResponse.json();
      logger.info("✅ Content Classification - Working", classification.data);
      results.liveTests.push("Content Classification: OK");
    } else {
      logger.warn("⚠️ Content Classification - Failed");
      results.liveTests.push("Content Classification: FAILED");
    }

    // Test moderation
    const moderateResponse = await fetch(`${baseUrl}/api/ai/v2/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Ceci est un commentaire spirituel intéressant"
      })
    });

    if (moderateResponse.ok) {
      const moderation = await moderateResponse.json();
      logger.info("✅ Content Moderation - Working", moderation.data);
      results.liveTests.push("Content Moderation: OK");
    } else {
      logger.warn("⚠️ Content Moderation - Failed");
      results.liveTests.push("Content Moderation: FAILED");
    }

    // Test personality routing
    const routeResponse = await fetch(`${baseUrl}/api/ai/v2/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Pouvez-vous m'expliquer la philosophie de Kemet ?",
        recentCommentCount: 3,
        discussionActive: true,
        lastAIResponses: []
      })
    });

    if (routeResponse.ok) {
      const routing = await routeResponse.json();
      logger.info("✅ Personality Routing - Working", routing.data);
      results.liveTests.push("Personality Routing: OK");
    } else {
      logger.warn("⚠️ Personality Routing - Failed");
      results.liveTests.push("Personality Routing: FAILED");
    }

  } catch (error) {
    logger.error({ message: "❌ Live AI Tests Failed", error });
    results.liveTests.push("Live Tests: ERROR");
  }

  // Check for mocks or static responses
  logger.info("🔍 Checking for Mocks or Static Responses...");
  
  try {
    const testResponse = await fetch(`${baseUrl}/api/ai/v2/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `test-${Date.now()}-${Math.random()}`
      })
    });

    if (testResponse.ok) {
      const result = await testResponse.json();
      
      // Check if response is dynamic (contains timestamps, scores, etc.)
      const isDynamic = result.data && 
        typeof result.data.topics === 'object' &&
        typeof result.data.confidence === 'number' &&
        JSON.stringify(result.data).includes(Date.now().toString().slice(0, 6)) === false;

      if (isDynamic) {
        logger.info("✅ Dynamic Responses - No Mocks Detected");
        results.liveTests.push("Dynamic Responses: OK");
      } else {
        logger.warn("⚠️ Static Responses - Possible Mocks");
        results.liveTests.push("Static Responses: MOCKS DETECTED");
      }
    }
  } catch (error) {
    logger.error({ message: "❌ Mock Detection Failed", error });
  }

  // Summary
  const allAPIKeysPresent = Object.values(results.apiKeys).every(Boolean);
  const allEndpointsWorking = results.endpoints.every(e => e.includes('OK'));
  const allLiveTestsWorking = results.liveTests.every(t => t.includes('OK'));

  const overallStatus = allAPIKeysPresent && allEndpointsWorking && allLiveTestsWorking;

  logger.info("\n" + "=".repeat(60));
  logger.info("🎯 LIVE AI VALIDATION RESULTS");
  logger.info("=".repeat(60));
  logger.info(`API Keys: ${allAPIKeysPresent ? '✅ ALL PRESENT' : '❌ MISSING'}`);
  logger.info(`Endpoints: ${allEndpointsWorking ? '✅ ALL WORKING' : '❌ SOME FAILED'}`);
  logger.info(`Live Tests: ${allLiveTestsWorking ? '✅ ALL WORKING' : '❌ SOME FAILED'}`);
  logger.info(`Overall Status: ${overallStatus ? '✅ SYSTEM READY' : '❌ ISSUES DETECTED'}`);
  logger.info("=".repeat(60));

  return {
    success: overallStatus,
    summary: {
      apiKeys: results.apiKeys,
      endpoints: results.endpoints,
      liveTests: results.liveTests,
      overallStatus: overallStatus ? 'READY' : 'NEEDS_FIXES'
    }
  };
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateLiveAI()
    .then((result) => {
      console.log("\n" + "=".repeat(60));
      console.log("🔍 LIVE AI VALIDATION SUMMARY");
      console.log("=".repeat(60));
      console.log(JSON.stringify(result, null, 2));
      console.log("=".repeat(60));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Validation failed:", error);
      process.exit(1);
    });
}

export { validateLiveAI };
