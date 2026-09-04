import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";

// Structural match for the AI SDK's JSONValue/JSONObject, so provider options
// can flow through without importing internal types or per-provider option types.
type JsonValue = null | string | number | boolean | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };
type ProviderOptions = Record<string, JsonObject>;

/**
 * Provider-agnostic model factory.
 *
 * To add a provider, install its `@ai-sdk/*` package and add a new case below.
 * The route only ever consumes `{ model, providerOptions }`, so swapping a
 * provider never requires touching the route or the terminal UI.
 */
export interface AiConfig {
  model: LanguageModel;
  /**
   * Provider-specific options passed straight through to generateText/streamText.
   * Kept intentionally loose so we can mix providers without per-provider types
   * leaking into the route.
   */
  providerOptions?: ProviderOptions;
}

export function getAiConfig(): AiConfig {
  const provider = (process.env.AI_PROVIDER ?? "deepseek").toLowerCase();

  switch (provider) {
    case "deepseek": {
      const deepseek = createDeepSeek({
        // apiKey falls back to process.env.DEEPSEEK_API_KEY automatically.
        ...(process.env.DEEPSEEK_BASE_URL
          ? { baseURL: process.env.DEEPSEEK_BASE_URL }
          : {}),
      });

      const model = deepseek(
        process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      );

      return {
        model,
        providerOptions: {
          deepseek: {
            // V4 models default to thinking mode on. We disable it for a fast,
            // snappy terminal Q&A experience (also lets temperature/topP apply).
            thinking: { type: "disabled" },
          },
        },
      };
    }

    // Example of adding another provider later:
    // case "openai": {
    //   const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    //   return { model: openai(process.env.OPENAI_MODEL ?? "gpt-5-mini") };
    // }

    default:
      throw new Error(
        `Unknown AI_PROVIDER "${provider}". Add a case in src/lib/ai/model.ts.`,
      );
  }
}
