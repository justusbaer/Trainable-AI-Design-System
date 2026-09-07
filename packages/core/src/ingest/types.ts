/**
 * Universal Multi-Modal Ingestion Core Types
 */

export type IngestSourceType = "web" | "vision" | "document" | "table" | "conversation";

export interface ProvenanceRecord {
  source: string;
  sourceType: IngestSourceType;
  confidence: number;
  timestamp: string;
  method?: string;
  notes?: string;
}

export interface TokenPatch {
  path: string;
  value: unknown;
  type?: string;
  description?: string;
  tier?: "ref" | "sys" | "comp";
  confidence?: number;
  provenance?: ProvenanceRecord;
  locked?: boolean;
}

export interface ComponentPatch {
  componentName: string;
  path?: string;
  family?: string;
  description?: string;
  anatomy?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  props?: Record<string, unknown>;
  a11y?: Record<string, unknown>;
  rules?: string[];
  examples?: string[];
  code?: string;
  authoritativeSource?: {
    type: "generated" | "authoritative-library" | "custom";
    package?: string;
    component?: string;
    exportName?: string;
  };
  locked?: boolean;
  humanNotes?: string;
  provenance?: ProvenanceRecord;
}

export interface GuidelinePatch {
  id: string;
  title: string;
  category: string;
  description: string;
  rule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  provenance?: ProvenanceRecord;
}

export interface IngestResult {
  tokens: TokenPatch[];
  components: ComponentPatch[];
  guidelines: GuidelinePatch[];
  provenance: ProvenanceRecord;
  summary: string;
}

export interface IngestAdapter<TInput = unknown> {
  readonly name: string;
  readonly sourceType: IngestSourceType;
  ingest(input: TInput, options?: Record<string, unknown>): Promise<IngestResult>;
}
