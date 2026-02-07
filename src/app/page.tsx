"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import { nanoid } from "nanoid";
import {
  Activity,
  Bot,
  Brain,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AgentTurn, ChatMessage } from "@/lib/types";

type ConversationItem =
  | { id: string; type: "user"; message: ChatMessage }
  | { id: string; type: "agent"; turn: AgentTurn };

type MarkdownProps = {
  className?: string;
  children: string;
  remarkPlugins?: any[];
};

const MarkdownRenderer = ReactMarkdown as unknown as (
  props: MarkdownProps,
) => ReactElement;

const introTurn: AgentTurn = {
  message: {
    id: nanoid(),
    role: "assistant",
    content: [
      "### Mode: Prime Assist",
      "",
      "**Focus tokens:** launch, positioning, automation",
      "",
      "Welcome to the OpenClawbot-inspired cockpit. Drop a mission, and I'll dissect it into skills, tools, and experiments you can deploy immediately.",
      "",
      "Ask me to plan GTM motions, draft agent skills, or synthesize market intel. If you need assets (scripts, decks, briefs) just call it out.",
    ].join("\n"),
    createdAt: new Date().toISOString(),
  },
  reasoning: [
    "Bootstrapped intro experience with Prime Assist mode.",
    "No external tools required for the primer.",
    "Ready to stack-playbooks as soon as the initial request arrives.",
  ],
  intent: "assist",
  tools: [],
  tasks: [],
  memory: [],
};

export default function Home() {
  const [items, setItems] = useState<ConversationItem[]>([
    { id: introTurn.message.id, type: "agent", turn: introTurn },
  ]);
  const [history, setHistory] = useState<ChatMessage[]>([introTurn.message]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamAnchor = useRef<HTMLDivElement | null>(null);

  const totalInteractions = useMemo(
    () => items.filter((item) => item.type === "agent").length,
    [items],
  );

  useEffect(() => {
    streamAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [items, isLoading]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setInput("");
    setError(null);
    setItems((prev) => [...prev, { id: userMessage.id, type: "user", message: userMessage }]);
    setHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Agent failed to respond");
      }

      const turn = (await response.json()) as AgentTurn;
      setItems((prev) => [...prev, { id: turn.message.id, type: "agent", turn }]);
      setHistory((prev) => [...prev, turn.message]);
    } catch (err) {
      const fallback: AgentTurn = {
        message: {
          id: nanoid(),
          role: "assistant",
          content:
            "### Mode: Recovery\n\nI hit turbulence reaching the reasoning engine. Try again or adjust the request — I'll keep monitoring.",
          createdAt: new Date().toISOString(),
        },
        intent: "analysis",
        reasoning: ["Captured error path and returned safe fallback."],
        tools: [],
        tasks: [],
      };
      setError((err as Error).message);
      setItems((prev) => [...prev, { id: fallback.message.id, type: "agent", turn: fallback }]);
      setHistory((prev) => [...prev, fallback.message]);
    } finally {
      setIsLoading(false);
    }
  }, [history, input, isLoading]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
              Agent stack
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              OpenClawbot Replica Workspace
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Drop missions, orchestrate tools, and watch the agent stitch plans,
              tasks, and knowledge briefs in real time.
            </p>
          </div>
          <div className="flex w-full flex-row gap-3 text-sm md:w-auto">
            <MetricPill
              icon={<MessageSquare className="size-4" />}
              label="Agent turns"
              value={totalInteractions}
            />
            <MetricPill
              icon={<Activity className="size-4" />}
              label="Runway"
              value="Live"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:grid lg:grid-cols-[320px_1fr]">
        <aside className="hidden h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-sky-500/10 lg:flex">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            <Sparkles className="size-4" />
            Agent status
          </h2>
          <p className="mt-4 text-sm text-slate-300">
            Operating on synthetic cognition stack with curated tooling (signal
            scan, trend pulse, build accelerator).
          </p>
          <div className="mt-6 space-y-3 text-xs">
            <StatusBadge icon={<Brain className="size-3" />} label="Scenario" value="Autonomous" />
            <StatusBadge icon={<Bot className="size-3" />} label="Mode" value="Prime assist" />
            <StatusBadge icon={<Sparkles className="size-3" />} label="Tooling" value="Adaptive" />
          </div>
          <div className="mt-8 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 text-xs text-sky-100">
            <p className="font-semibold uppercase tracking-[0.2em] text-sky-200">
              Pro Tip
            </p>
            <p className="mt-3">
              Ask for a synthesis + asset in one message (e.g. &ldquo;outline the
              launch plan and draft kickoff memo&rdquo;). The agent will split into
              tasks automatically.
            </p>
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-sky-500/10">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {items.map((item) =>
              item.type === "user" ? (
                <UserBubble key={item.id} message={item.message} />
              ) : (
                <AgentTurnCard key={item.id} turn={item.turn} />
              ),
            )}
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-300">
                <Loader2 className="size-4 animate-spin text-sky-300" />
                Agent weaving response...
              </div>
            ) : null}
            <div ref={streamAnchor} />
          </div>

          <div className="border-t border-white/10 bg-slate-900/60 p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
              className="flex flex-row items-end gap-3"
            >
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Launch mission…"
                  rows={2}
                  className="min-h-[52px] w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-sky-500/10 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
                <span className="pointer-events-none absolute bottom-2 right-4 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  Shift + Enter for newline
                </span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/20 text-sky-100 shadow-lg shadow-sky-500/30 transition hover:bg-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </form>
            {error ? (
              <p className="mt-3 text-xs text-sky-200">
                Recovery fallback engaged: {error}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left shadow-lg shadow-sky-500/10 md:flex-auto">
      <span className="grid size-9 place-items-center rounded-xl border border-sky-500/40 bg-sky-500/20 text-sky-100">
        {icon}
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
          {label}
        </p>
        <p className="text-base font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="grid size-6 place-items-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-200">
          {icon}
        </span>
        {label}
      </span>
      <span className="text-xs uppercase tracking-[0.25em] text-sky-200">
        {value}
      </span>
    </div>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="ml-auto max-w-xl">
      <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
        <span>{formatTime(message.createdAt)}</span>
        <User className="size-4 text-sky-200" />
      </div>
      <div className="mt-2 rounded-3xl rounded-br-md border border-sky-500/40 bg-sky-500/20 p-4 text-sm text-sky-50 shadow-lg shadow-sky-500/20">
        {message.content}
      </div>
    </div>
  );
}

function AgentTurnCard({ turn }: { turn: AgentTurn }) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Bot className="size-4 text-sky-300" />
        <span>Agent · {formatTime(turn.message.createdAt)}</span>
      </div>
      <div className="mt-2 rounded-3xl rounded-bl-md border border-white/10 bg-slate-900/80 p-5 text-sm shadow-lg shadow-sky-500/10">
        <MarkdownRenderer
          remarkPlugins={[remarkGfm]}
          className="prose prose-invert prose-sm max-w-none text-slate-100"
        >
          {turn.message.content}
        </MarkdownRenderer>

        {turn.reasoning && turn.reasoning.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-xs text-sky-100">
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-sky-200">
              Chain of Thought
            </p>
            <ul className="space-y-2">
              {turn.reasoning.map((step) => (
                <li key={step} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-sky-200" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {turn.tools && turn.tools.length > 0 ? (
          <div className="mt-5 space-y-3">
            {turn.tools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  {tool.name} · {tool.type === "analysis" ? "Signal" : "Action"}
                </p>
                <p className="mt-2 text-xs text-slate-400">{tool.description}</p>
                <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-200">
                  {tool.result}
                </pre>
              </div>
            ))}
          </div>
        ) : null}

        {turn.tasks && turn.tasks.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-200">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Task Graph
            </p>
            <ul className="mt-3 space-y-2">
              {turn.tasks.map((task) => (
                <li key={task.id} className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                  <p className="text-slate-100">{task.title}</p>
                  <p className="mt-1 text-[13px] text-slate-400">{task.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {turn.memory && turn.memory.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-200">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Memory Candidates
            </p>
            <ul className="mt-2 space-y-2">
              {turn.memory.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2">
                  <span>{item.summary}</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatTime(input?: string) {
  if (!input) return "Just now";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
