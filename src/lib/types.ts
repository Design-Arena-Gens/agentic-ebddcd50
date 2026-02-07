export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt?: string;
}

export interface ToolInvocation {
  id: string;
  name: string;
  description: string;
  result: string;
  type: "analysis" | "action";
}

export interface AgentTask {
  id: string;
  title: string;
  detail: string;
  status: "pending" | "complete";
}

export interface MemoryShard {
  id: string;
  label: string;
  confidence: number;
  summary: string;
}

export interface AgentTurn {
  message: ChatMessage;
  reasoning: string[];
  intent: string;
  tools: ToolInvocation[];
  tasks: AgentTask[];
  memory?: MemoryShard[];
}
