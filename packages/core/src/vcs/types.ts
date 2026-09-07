/**
 * Design System Version Control System (DS-VCS) Core Types
 */

export interface BranchInfo {
  name: string;
  headCommitId: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  isDefault?: boolean;
}

export interface CommitRecord {
  id: string;
  parentId: string | null;
  branch: string;
  message: string;
  timestamp: string;
  author: string;
  changesSummary: string;
  snapshotHash: string;
}

export interface DesignSystemSnapshot {
  tokens: Record<string, any>;
  components: Record<string, any>;
  guidelines?: string;
  fonts?: Record<string, any>;
  icons?: any[];
}

export interface TokenConflict {
  path: string;
  baseValue: unknown;
  ourValue: unknown;
  theirValue: unknown;
  resolvedValue?: unknown;
  status: "conflict" | "resolved";
}

export interface ComponentConflict {
  componentName: string;
  field: string;
  baseValue: unknown;
  ourValue: unknown;
  theirValue: unknown;
  resolvedValue?: unknown;
  status: "conflict" | "resolved";
}

export interface MergeGateCheck {
  passed: boolean;
  score: number;
  violations: string[];
  warnings: string[];
}

export interface SemanticMergeResult {
  success: boolean;
  mergedSnapshot: DesignSystemSnapshot;
  tokenConflicts: TokenConflict[];
  componentConflicts: ComponentConflict[];
  evaluationGate?: MergeGateCheck;
  summary: string;
}
