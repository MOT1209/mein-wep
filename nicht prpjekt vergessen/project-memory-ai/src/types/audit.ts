export interface AuditIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  line: number | null
  fix: string
}

export interface AuditReport {
  score: number
  language: string
  summary: string
  security: AuditIssue[]
  performance: AuditIssue[]
  logic: AuditIssue[]
}
