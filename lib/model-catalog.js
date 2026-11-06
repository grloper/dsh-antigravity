/**
 * The Antigravity model catalog: pure data, no host imports.
 *
 * Kept separate from lib/index.js so the catalog and its routing can be tested without
 * the harness packages. Only models verified to serve inference through the Cloud Code
 * Assist gateway for this subscription appear here; everything else is an alias that
 * resolves to one of them.
 */

export const ROUTING = {
  "gemini-3.8-flash": {
    off: "gemini-3.8-flash-tiered",
    routing: {
      minimal: "gemini-3.8-flash-tiered",
      low: "gemini-3.8-flash-tiered",
      medium: "gemini-3.8-flash-tiered",
      high: "gemini-3.8-flash-tiered",
      xhigh: "gemini-3.8-flash-tiered",
    },
    defaultRequestId: "gemini-3.8-flash-tiered",
  },
  "gemini-2.5-pro": {
    // Measured live: google returns 503 "No capacity available" for this model on both
    // daily hosts, so it is not offered. Kept as a routing alias so a stored session
    // naming it still resolves to a model that serves.
    off: "gemini-3.8-flash-tiered",
    routing: {
      minimal: "gemini-3.8-flash-tiered",
      low: "gemini-3.8-flash-tiered",
      medium: "gemini-3.8-flash-tiered",
      high: "gemini-3.8-flash-tiered",
      xhigh: "gemini-3.8-flash-tiered",
    },
    defaultRequestId: "gemini-3.8-flash-tiered",
  },
  "claude-opus-5-5": {
    off: "claude-opus-5-5-high",
    routing: {
      minimal: "claude-opus-5-5-low",
      low: "claude-opus-5-5-low",
      medium: "claude-opus-5-5-medium",
      high: "claude-opus-5-5-high",
      xhigh: "claude-opus-5-5-high",
    },
    defaultRequestId: "claude-opus-5-5-high",
  },
  "claude-sonnet-5-5": {
    off: "claude-sonnet-5-5-high",
    routing: {
      minimal: "claude-sonnet-5-5-low",
      low: "claude-sonnet-5-5-low",
      medium: "claude-sonnet-5-5-medium",
      high: "claude-sonnet-5-5-high",
      xhigh: "claude-sonnet-5-5-high",
    },
    defaultRequestId: "claude-sonnet-5-5-high",
  },
  // Backward compatibility & user-friendly aliases
  "gemini-3.8-pro": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", medium: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "argon": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", medium: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "argon-3.8": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", medium: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "argon-3.8-pro": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", medium: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "argon-4": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", medium: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "gemini-pro": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "gemini-3.1-pro": { off: "gemini-3.8-flash-tiered", routing: { low: "gemini-3.8-flash-tiered", high: "gemini-3.8-flash-tiered" }, defaultRequestId: "gemini-3.8-flash-tiered" },
  "claude-opus-4-6": { off: "claude-opus-5-5-high", routing: { low: "claude-opus-5-5-low", medium: "claude-opus-5-5-medium", high: "claude-opus-5-5-high" }, defaultRequestId: "claude-opus-5-5-high" },
  "claude-sonnet-4-6": { off: "claude-sonnet-5-5-high", routing: { low: "claude-sonnet-5-5-low", medium: "claude-sonnet-5-5-medium", high: "claude-sonnet-5-5-high" }, defaultRequestId: "claude-sonnet-5-5-high" },
};

export const RUNTIME_MAX_OUTPUT_TOKENS = {
  "gemini-3.8-flash": 65536,
  "gemini-3.8-flash-tiered": 65536,
  "gemini-2.5-pro": 65536,
  "claude-opus-5-5": 128000,
  "claude-opus-5-5-low": 128000,
  "claude-opus-5-5-medium": 128000,
  "claude-opus-5-5-high": 128000,
  "claude-sonnet-5-5": 128000,
  "claude-sonnet-5-5-low": 128000,
  "claude-sonnet-5-5-medium": 128000,
  "claude-sonnet-5-5-high": 128000,
};

export const MODELS = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash (Argon)",
    inputModalities: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 65536,
    reasoningEfforts: ["low", "medium", "high"],
    defaultEffort: "medium",
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    inputModalities: ["text", "image"],
    contextWindow: 1000000,
    maxTokens: 128000,
    reasoningEfforts: ["low", "medium", "high"],
    defaultEffort: "high",
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    inputModalities: ["text", "image"],
    contextWindow: 1000000,
    maxTokens: 128000,
    reasoningEfforts: ["low", "medium", "high"],
    defaultEffort: "high",
  },
];

export const VALID_MODEL_IDS = new Set(MODELS.map((m) => m.id));
export const DEFAULT_ENABLED_MODEL_IDS = MODELS.map((m) => m.id);

export function resolveWireModel(modelId, effort) {
  const route = ROUTING[modelId];
  if (!route) return modelId;
  if (effort === undefined || effort === "off") {
    return route.off ?? route.routing?.high ?? route.defaultRequestId ?? modelId;
  }
  return (
    route.routing?.[effort] ??
    route.routing?.high ??
    route.routing?.medium ??
    route.routing?.low ??
    route.off ??
    route.defaultRequestId ??
    modelId
  );
}
