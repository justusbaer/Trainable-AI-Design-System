import { IngestAdapter, IngestResult, TokenPatch, ProvenanceRecord } from "@trainable-ds/core";

export interface TableAdapterInput {
  content: string | Record<string, any>;
  format?: "csv" | "tsv" | "json" | "auto";
  sourceName?: string;
}

export class TableAdapter implements IngestAdapter<TableAdapterInput | string> {
  readonly name = "TableAdapter";
  readonly sourceType = "table" as const;

  async ingest(input: TableAdapterInput | Record<string, any> | string, options?: Record<string, unknown>): Promise<IngestResult> {
    let content: any;
    let format: "csv" | "tsv" | "json" | "auto" = "auto";
    let sourceName = "table-input";

    if (typeof input === "string") {
      content = input;
    } else if (input && typeof input === "object") {
      if ("content" in input) {
        content = (input as TableAdapterInput).content;
        format = (input as TableAdapterInput).format || "auto";
        sourceName = (input as TableAdapterInput).sourceName || "table-data";
      } else {
        content = input;
        format = "json";
        sourceName = "json-tokens";
      }
    }

    const timestamp = new Date().toISOString();
    const provenance: ProvenanceRecord = {
      source: sourceName,
      sourceType: "table",
      confidence: 0.95,
      timestamp,
      method: "tabular-parser"
    };

    let patches: TokenPatch[] = [];

    if (typeof content === "object" && content !== null) {
      patches = this.parseJsonTokens(content, provenance);
    } else {
      const text = String(content || "").trim();
      const resolvedFormat = format === "auto" ? this.detectFormat(text) : format;

      if (resolvedFormat === "json") {
        try {
          const parsed = JSON.parse(text);
          patches = this.parseJsonTokens(parsed, provenance);
        } catch {
          // Fallback to CSV if JSON parsing fails
          patches = this.parseDelimited(text, ",", provenance);
        }
      } else if (resolvedFormat === "tsv") {
        patches = this.parseDelimited(text, "\t", provenance);
      } else {
        // Default CSV (comma or semicolon)
        const delimiter = text.includes(";") && !text.includes(",") ? ";" : ",";
        patches = this.parseDelimited(text, delimiter, provenance);
      }
    }

    return {
      tokens: patches,
      components: [],
      guidelines: [],
      provenance,
      summary: `Parsed ${patches.length} design tokens from tabular source (${sourceName})`
    };
  }

  private detectFormat(content: string): "json" | "tsv" | "csv" {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
    if (trimmed.includes("\t")) return "tsv";
    return "csv";
  }

  private parseDelimited(content: string, delimiter: string, provenance: ProvenanceRecord): TokenPatch[] {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const headers = this.parseRow(lines[0], delimiter).map(h => h.toLowerCase().trim());
    
    // Map column headers
    let nameIdx = headers.findIndex(h => ["name", "token", "token_name", "path", "key", "id"].includes(h));
    let valIdx = headers.findIndex(h => ["value", "val", "hex", "color", "raw_value"].includes(h));
    let typeIdx = headers.findIndex(h => ["type", "category", "token_type"].includes(h));
    let descIdx = headers.findIndex(h => ["description", "desc", "comment", "notes"].includes(h));
    let tierIdx = headers.findIndex(h => ["tier", "level", "role"].includes(h));

    if (nameIdx === -1 && headers.length >= 2) nameIdx = 0;
    if (valIdx === -1 && headers.length >= 2) valIdx = 1;

    const patches: TokenPatch[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseRow(lines[i], delimiter);
      if (row.length <= Math.max(nameIdx, valIdx)) continue;

      const rawName = row[nameIdx]?.trim();
      const rawVal = row[valIdx]?.trim();
      if (!rawName || !rawVal) continue;

      const path = this.normalizePath(rawName);
      const inferredType = typeIdx >= 0 && row[typeIdx]?.trim() 
        ? row[typeIdx].trim().toLowerCase() 
        : this.inferType(rawVal);
      
      const desc = descIdx >= 0 && row[descIdx]?.trim() ? row[descIdx].trim() : undefined;
      const tierVal = tierIdx >= 0 && row[tierIdx]?.trim() ? row[tierIdx].trim().toLowerCase() : undefined;
      const tier = (tierVal === "ref" || tierVal === "sys" || tierVal === "comp") 
        ? tierVal 
        : this.inferTier(path);

      patches.push({
        path,
        value: this.coerceValue(rawVal, inferredType),
        type: inferredType,
        description: desc,
        tier,
        confidence: provenance.confidence,
        provenance: {
          ...provenance,
          notes: `Row ${i + 1}`
        }
      });
    }

    return patches;
  }

  private parseRow(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  private parseJsonTokens(obj: Record<string, any>, provenance: ProvenanceRecord): TokenPatch[] {
    const patches: TokenPatch[] = [];

    const walk = (node: any, currentPath: string[]) => {
      if (!node || typeof node !== "object") return;

      // Check if this is a DTCG / Tokens Studio token node ($value or value present)
      const hasValue = "value" in node || "$value" in node;
      const hasType = "type" in node || "$type" in node;

      if (hasValue) {
        const val = node.value !== undefined ? node.value : node.$value;
        const type = (node.type || node.$type || this.inferType(val)) as string;
        const desc = node.description || node.$description || undefined;
        const fullPath = currentPath.join(".");
        const tier = this.inferTier(fullPath);

        patches.push({
          path: fullPath,
          value: this.coerceValue(val, type),
          type,
          description: desc,
          tier,
          confidence: provenance.confidence,
          provenance: {
            ...provenance,
            notes: `Tokens Studio node at ${fullPath}`
          }
        });
        return;
      }

      // Otherwise, walk deeper
      for (const [key, child] of Object.entries(node)) {
        walk(child, [...currentPath, key]);
      }
    };

    walk(obj, []);
    return patches;
  }

  private normalizePath(raw: string): string {
    return raw
      .replace(/[\/\s_-]+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .toLowerCase();
  }

  private inferType(val: any): string {
    if (typeof val === "number") return "number";
    const str = String(val).trim();
    if (/^#([0-9a-fA-F]{3,8})$/.test(str) || /^rgba?\(/i.test(str) || /^hsla?\(/i.test(str)) {
      return "color";
    }
    if (/^\d+(\.\d+)?(px|rem|em|%)?$/.test(str)) {
      return "dimension";
    }
    return "string";
  }

  private inferTier(path: string): "ref" | "sys" | "comp" {
    if (path.startsWith("sys.") || path.includes("system.")) return "sys";
    if (path.startsWith("comp.") || path.includes("component.")) return "comp";
    return "ref";
  }

  private coerceValue(val: any, type: string): any {
    if (typeof val === "number") return val;
    const str = String(val).trim();
    if (type === "number" && !isNaN(Number(str))) {
      return Number(str);
    }
    if (type === "dimension" && /^\d+px$/.test(str)) {
      return parseInt(str, 10);
    }
    return str;
  }
}
