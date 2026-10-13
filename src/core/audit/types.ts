import { FlatToken } from '../tokens/types';

export type Severity = 'error' | 'warning' | 'info';

export interface AuditFinding {
  ruleId: string;
  severity: Severity;
  message: string;
  filePath: string;
  line: number;
  column?: number;
  evidence: string;
  suggestedFix?: string;
  automatedFixAvailable: boolean;
}

export interface AuditRule {
  id: string;
  name: string;
  description: string;
  defaultSeverity: Severity;
  evaluate(context: {
    filePath: string;
    content: string;
    tokens: FlatToken[];
  }): AuditFinding[];
}

export interface AuditReport {
  totalFindings: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  findings: AuditFinding[];
  timestamp: string;
  sarif?: Record<string, any>;
}
