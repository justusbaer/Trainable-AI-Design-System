export type DiagnosticSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface DiagnosticIssue {
  severity: DiagnosticSeverity;
  code: string;
  line: number;
  column?: number;
  message: string;
  remediation: string;
}

export interface EvaluationResult {
  certified: boolean;
  score: number; // 0 to 100
  summary: string;
  diagnostics: DiagnosticIssue[];
}
