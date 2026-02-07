import { nanoid } from "nanoid";
import type { AgentTurn, ChatMessage, MemoryShard } from "./types";
import { runToolset, type AgentIntent } from "./tools";

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "from",
  "this",
  "have",
  "what",
  "your",
  "about",
  "into",
  "their",
  "would",
  "there",
  "which",
  "could",
  "while",
  "where",
  "when",
]);

const INTENT_MATCHERS: { intent: AgentIntent; patterns: RegExp[] }[] = [
  {
    intent: "build",
    patterns: [
      /build|create|code|prototype|implement|ship/,
      /wireframe|ui|frontend|architecture/,
    ],
  },
  {
    intent: "research",
    patterns: [
      /research|investigate|survey|compare|market/,
      /trend|landscape|analysis/,
    ],
  },
  {
    intent: "strategy",
    patterns: [
      /plan|strategy|roadmap|launch|roll/,
      /scale|operationalize|align|stakeholder/,
    ],
  },
  {
    intent: "analysis",
    patterns: [
      /debug|explain|reason|evaluate|assess/,
      /breakdown|decompose|why|risk/,
    ],
  },
];

export class SyntheticAgent {
  process(messages: ChatMessage[]): AgentTurn {
    const userMessage = [...messages].reverse().find((msg) => msg.role === "user");

    if (!userMessage) {
      throw new Error("User message required");
    }

    const intent = detectIntent(userMessage.content);
    const keywords = extractKeywords(userMessage.content);
    const tasks = buildTaskGraph(intent, userMessage.content);
    const tools = runToolset({
      intent,
      keywords,
      message: userMessage.content,
    });
    const memory = extractMemories(messages);
    const reasoning = composeReasoning(intent, keywords, tasks, tools);
    const finalResponse = composeAssistantMessage({
      intent,
      tasks,
      tools,
      memory,
      keywords,
    });

    return {
      message: {
        id: nanoid(),
        role: "assistant",
        content: finalResponse,
        createdAt: new Date().toISOString(),
      },
      intent,
      reasoning,
      tools,
      tasks,
      memory,
    };
  }
}

function detectIntent(message: string): AgentIntent {
  const normalized = message.toLowerCase();

  for (const matcher of INTENT_MATCHERS) {
    if (matcher.patterns.some((pattern) => pattern.test(normalized))) {
      return matcher.intent;
    }
  }

  if (normalized.includes("launch") || normalized.includes("roadmap")) {
    return "strategy";
  }

  if (normalized.includes("how")) {
    return "assist";
  }

  return "analysis";
}

function extractKeywords(message: string): string[] {
  return Array.from(
    new Set(
      message
        .toLowerCase()
        .replace(/[^\w\s-]/g, " ")
        .split(/\s+/)
        .filter(
          (token) =>
            token.length > 3 && !STOP_WORDS.has(token) && isNaN(Number(token)),
        )
        .slice(0, 12),
    ),
  );
}

function buildTaskGraph(intent: AgentIntent, content: string) {
  const lower = content.toLowerCase();
  const baseTasks = [
    {
      id: nanoid(),
      title: "Clarify outcome",
      detail:
        "Capture the north-star metric or success definition before acting.",
      status: "pending" as const,
    },
    {
      id: nanoid(),
      title: "Assess constraints",
      detail: "Identify timeline, resources, and risk tolerance.",
      status: "pending" as const,
    },
  ];

  if (intent === "build") {
    baseTasks.push({
      id: nanoid(),
      title: "Draft implementation plan",
      detail:
        "Break the build into composable skills, tools, and verification hooks.",
      status: "pending" as const,
    });
  } else if (intent === "strategy") {
    baseTasks.push({
      id: nanoid(),
      title: "Sequence milestones",
      detail: "Map quick wins, core build, and reinforcement loops.",
      status: "pending" as const,
    });
  } else if (intent === "research") {
    baseTasks.push({
      id: nanoid(),
      title: "Aggregate competitive signals",
      detail: "Create a succinct brief with differentiators and threats.",
      status: "pending" as const,
    });
  } else if (intent === "analysis") {
    baseTasks.push({
      id: nanoid(),
      title: "Formulate diagnostics",
      detail: "List hypotheses and validation experiments.",
      status: "pending" as const,
    });
  }

  if (lower.includes("timeline") || lower.includes("deadline")) {
    baseTasks.push({
      id: nanoid(),
      title: "Timeline handshake",
      detail: "Outline delivery cadence and review checkpoints.",
      status: "pending" as const,
    });
  }

  return baseTasks;
}

function extractMemories(messages: ChatMessage[]): MemoryShard[] | undefined {
  const userFacts = messages.filter((msg) => msg.role === "user").flatMap((msg) =>
    detectFacts(msg.content),
  );

  const uniqueFacts = new Map<string, MemoryShard>();

  for (const fact of userFacts) {
    if (!uniqueFacts.has(fact.summary)) {
      uniqueFacts.set(fact.summary, fact);
    }
  }

  return uniqueFacts.size > 0 ? Array.from(uniqueFacts.values()) : undefined;
}

function detectFacts(content: string): MemoryShard[] {
  const memories: MemoryShard[] = [];
  const normalized = content.toLowerCase();

  const nameMatch = normalized.match(/my name is\s+([a-z\s]+)/);
  if (nameMatch) {
    const name = capitalizeWords(nameMatch[1].trim());
    memories.push({
      id: nanoid(),
      label: "user-profile",
      confidence: 0.7,
      summary: `User is ${name}`,
    });
  }

  const companyMatch = normalized.match(/we (?:run|have|built)\s+([a-z\s]+)/);
  if (companyMatch) {
    const company = capitalizeWords(companyMatch[1].trim());
    memories.push({
      id: nanoid(),
      label: "org-focus",
      confidence: 0.65,
      summary: `Company context: ${company}`,
    });
  }

  if (normalized.includes("deadline") || normalized.includes("launch")) {
    memories.push({
      id: nanoid(),
      label: "cadence",
      confidence: 0.5,
      summary: "User is sensitive to deadlines / launch timing.",
    });
  }

  return memories;
}

function composeReasoning(
  intent: AgentIntent,
  keywords: string[],
  tasks: ReturnType<typeof buildTaskGraph>,
  tools: ReturnType<typeof runToolset>,
): string[] {
  const primaryKeywords = keywords.slice(0, 3).join(", ") || "insufficient data";
  const toolLabels = tools.map((tool) => tool.name).join(", ");

  return [
    `Intent classification: ${intent.toUpperCase()} (signals: ${primaryKeywords}).`,
    `Toolkit assembled: ${toolLabels || "baseline response only"}.`,
    `Execution ready across ${tasks.length} structured tasks.`,
  ];
}

function composeAssistantMessage(input: {
  intent: AgentIntent;
  tasks: ReturnType<typeof buildTaskGraph>;
  tools: ReturnType<typeof runToolset>;
  memory?: MemoryShard[];
  keywords: string[];
}): string {
  const { intent, tasks, tools, memory, keywords } = input;
  const humanIntent =
    intent === "assist"
      ? "Fast assist"
      : intent.charAt(0).toUpperCase() + intent.slice(1);

  const taskList = tasks
    .map((task, idx) => `${idx + 1}. ${task.title} — ${task.detail}`)
    .join("\n");

  const toolNarrative = tools
    .map(
      (tool) =>
        `**${tool.name}** (${tool.type}):\n${indentBlock(tool.result, 2)}`,
    )
    .join("\n\n");

  const memoryLines =
    memory && memory.length > 0
      ? memory.map((item) => `- ${item.summary} (${Math.round(item.confidence * 100)}% confidence)`).join("\n")
      : undefined;

  const focus = keywords.length > 0 ? keywords.slice(0, 5).join(", ") : "TBD";

  return [
    `### Mode: ${humanIntent}`,
    "",
    `**Focus tokens:** ${focus}`,
    "",
    "### Operating Plan",
    taskList,
    "",
    "### Tooling Output",
    toolNarrative || "_No specialised tools invoked; relying on reasoning._",
    memoryLines ? "\n### Memory Hooks\n" + memoryLines : "",
    "",
    "### Next Steps",
    "- Confirm the most urgent lane and I will extend the playbook.",
    "- Share constraints (team size, tech stack) to tighten the recommendation.",
    "- Ask for artefacts (pitch, deck, code scaffold) and I'll draft them.",
  ]
    .filter(Boolean)
    .join("\n");
}

function indentBlock(text: string, spaces: number) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim().length === 0 ? "" : `${pad}${line}`))
    .join("\n");
}

function capitalizeWords(input: string) {
  return input.replace(/\b\w/g, (char) => char.toUpperCase());
}
