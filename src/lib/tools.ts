import { nanoid } from "nanoid";
import type { ToolInvocation } from "./types";

export type AgentIntent =
  | "research"
  | "strategy"
  | "build"
  | "analysis"
  | "assist";

export interface ToolContext {
  intent: AgentIntent;
  message: string;
  keywords: string[];
}

const curatedTrends: Record<string, string[]> = {
  ai: [
    "Lightweight on-device reasoning chips are enabling embedded copilots.",
    "Mixture-of-agents workflows are outperforming single LLM setups for operations.",
    "Autonomous evaluation loops are the new differentiator for AI products.",
  ],
  robotics: [
    "Low-latency vision transformers are unlocking sub-mm precision grasping.",
    "Composable motion stacks let teams iterate faster by swapping planners.",
    "Digital twin simulations cut robot testing time in half for top labs.",
  ],
  product: [
    "Adaptive UX that reacts to user intent increases activation conversion.",
    "Ops teams adopt AI-first war rooms to triage incidents in minutes.",
    "Multi-modal onboarding content lifts enterprise adoption by 20%+.",
  ],
  default: [
    "Teams that pair autonomous agents with human oversight stay compliant.",
    "Continuous knowledge distillation keeps AI copilots aligned with brand voice.",
    "Carving agentic workflows into atomic skills improves monitoring and testing.",
  ],
};

const patternLibrary: Record<string, string[]> = {
  roadmap: [
    "Define a north-star metric to anchor the outcome.",
    "Layer quick-win experiments before platform-level investments.",
    "Document guardrails and review cadence for autonomous loops.",
  ],
  engineering: [
    "Instrument every agent action with typed telemetry events.",
    "Use deterministic evaluation suites before production rollouts.",
    "Mirror prod-like sandboxes to test tool side-effects safely.",
  ],
  growth: [
    "Craft tiny in-product moments for the agent to prove value fast.",
    "Bundle recap emails so stakeholders trust autonomous workflows.",
    "Offer fallbacks to human experts to protect high-value accounts.",
  ],
};

const researchSnippets: Record<string, string> = {
  market:
    "VC focus pivots to vertically-integrated AI stacks; valuations favor proprietary data loops over generic wrappers.",
  security:
    "Runtime policy enforcement and action simulators reduce agent misfires by 35% in red-team benchmarks.",
  ux: "Adaptive feedback layers (ghost text, inline previews) increase completion for complex agent prompts.",
};

export function runToolset(context: ToolContext): ToolInvocation[] {
  const tools: ToolInvocation[] = [];
  const { intent, keywords, message } = context;

  tools.push({
    id: nanoid(),
    name: "Signal Scan",
    description: "Highlights dominant concepts and operational levers.",
    result: formatSignalScan(keywords, message),
    type: "analysis",
  });

  if (intent === "research" || intent === "analysis") {
    tools.push(runResearchDeck(keywords));
  }

  if (intent === "strategy" || intent === "assist") {
    tools.push(runPatternLibrary(keywords));
  }

  if (intent === "build") {
    tools.push(runBuildAccelerator(keywords));
  }

  return tools;
}

function formatSignalScan(keywords: string[], message: string): string {
  const normalizedKeywords =
    keywords.length > 0
      ? keywords.slice(0, 4).map((k) => `- ${k}`)
      : ["- intent discovery pending (message was too short)"];

  const coreNeed = message.length > 180 ? "multi-step support" : "fast response";

  return [
    "Key tokens:",
    ...normalizedKeywords,
    "",
    `Workflow appetite: ${coreNeed}`,
  ].join("\n");
}

function runResearchDeck(keywords: string[]): ToolInvocation {
  const focus = resolveFocus(keywords);
  const insight =
    researchSnippets[focus] ??
    "Teams that invest in evaluation harnesses keep agent drift under control.";

  const trendPool =
    curatedTrends[focus] ?? curatedTrends.default ?? curatedTrends.ai;

  const topTrends = trendPool.slice(0, 2).map((item, idx) => `${idx + 1}. ${item}`);

  return {
    id: nanoid(),
    name: "Trend Pulse",
    description: "Aggregates fast-moving market signals.",
    result: ["Signals:", ...topTrends, "", `Insight: ${insight}`].join("\n"),
    type: "analysis",
  };
}

function runPatternLibrary(keywords: string[]): ToolInvocation {
  const domain = resolvePatternDomain(keywords);
  const snippets = patternLibrary[domain] ?? patternLibrary.roadmap;

  return {
    id: nanoid(),
    name: "Strategy Weave",
    description: "Maps heuristics to recommended operating cadence.",
    result: snippets.map((item, idx) => `${idx + 1}. ${item}`).join("\n"),
    type: "action",
  };
}

function runBuildAccelerator(keywords: string[]): ToolInvocation {
  const focus = keywords.find((k) => /ui|interface|frontend/.test(k));
  const summary = focus
    ? `Design UI scaffolds highlighting ${focus} data hotspots.`
    : "Focus on deterministic evaluation harness and typed tool schema.";

  return {
    id: nanoid(),
    name: "Build Accelerator",
    description: "Turns build-focused intents into tactical traction.",
    result: [
      "Checklist:",
      "1. Draft agent skill graph (intent -> tools -> outcomes).",
      "2. Model telemetry events before wiring new actions.",
      `3. ${summary}`,
    ].join("\n"),
    type: "action",
  };
}

function resolveFocus(keywords: string[]): string {
  if (keywords.some((word) => /security|guardrail|safety/.test(word))) {
    return "security";
  }

  if (keywords.some((word) => /activation|north star|retention/.test(word))) {
    return "product";
  }

  if (keywords.some((word) => /market|competitor|landscape/.test(word))) {
    return "market";
  }

  if (keywords.some((word) => /ux|interface|onboarding/.test(word))) {
    return "ux";
  }

  if (keywords.some((word) => /robot|mechanical/.test(word))) {
    return "robotics";
  }

  return "ai";
}

function resolvePatternDomain(keywords: string[]): string {
  if (keywords.some((word) => /growth|marketing|conversion/.test(word))) {
    return "growth";
  }

  if (keywords.some((word) => /launch|roadmap|stakeholder/.test(word))) {
    return "roadmap";
  }

  return "engineering";
}
