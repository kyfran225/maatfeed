import { chatComplete } from "./llmClient.js";

export async function enrichContent(input: { title: string; description: string; tags?: string[] }) {
  const raw = await chatComplete({
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that extracts structured enrichment data for cultural educational media. Return ONLY valid JSON."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "enrich_content",
          constraints: {
            summaryMaxChars: 380,
            keyIdeasMax: 5,
            thematicTagsMax: 8
          },
          input
        })
      }
    ],
    temperature: 0.3,
    maxTokens: 700
  });

  const parsed = JSON.parse(raw) as {
    summary?: unknown;
    keyIdeas?: unknown;
    debatePrompt?: unknown;
    thematicTags?: unknown;
  };

  const summary = typeof parsed.summary === "string" ? parsed.summary : `${input.title}. ${input.description}`.trim();
  const keyIdeas = Array.isArray(parsed.keyIdeas) ? (parsed.keyIdeas.map((v) => String(v)).slice(0, 5) as string[]) : [];
  const debatePrompt = typeof parsed.debatePrompt === "string" ? parsed.debatePrompt : "";
  const thematicTags = Array.isArray(parsed.thematicTags)
    ? (parsed.thematicTags.map((v) => {
        if (typeof v === 'string') return v;
        if (typeof v === 'object' && v !== null && 'name' in v && typeof v.name === 'string') return v.name;
        return String(v);
      }).slice(0, 8) as string[])
    : [...new Set([...(input.tags ?? []), ...keyIdeas])].slice(0, 8);

  return {
    summary: summary.slice(0, 1000),
    keyIdeas,
    debatePrompt: debatePrompt.slice(0, 600),
    thematicTags
  };
}
