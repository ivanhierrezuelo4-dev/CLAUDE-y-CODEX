export type Project = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  mode: 'claude' | 'team' | 'codex';
  folder: string;
  document_count: number;
  active_count: number;
  review_count: number;
};
export type Packet = {
  prompt: string;
  budget: number;
  estimatedTokens: number;
  selectedContextTokens: number;
  totalContextTokens: number;
  warnings: string[];
  sources: {
    documentId: string;
    name: string;
    position: number;
    hash: string;
    updatedAt: string;
  }[];
};
export type Task = {
  id: string;
  project_id: string;
  title: string;
  request: string;
  status: string;
  provider: 'claude' | 'codex';
  packet: Packet;
  output: string;
  error: string | null;
  usage: Record<string, number> | null;
  started_at: string;
  ended_at: string;
  created_at: string;
};
export type Doc = {
  id: string;
  name: string;
  pinned: number;
  characters: number;
  content?: string;
  updated_at: string;
};
export type Provider = {
  name: string;
  installed: boolean;
  authenticated: boolean;
  authType: string;
  message: string;
};
export type State = {
  preview?: boolean;
  projects: Project[];
  tasks: Task[];
  events: {
    id: string;
    project_id: string;
    task_id: string;
    type: string;
    message: string;
    created_at: string;
  }[];
  settings: { allowCli: boolean };
};
