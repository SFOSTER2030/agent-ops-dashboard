/**
 * Exception Classification Engine
 *
 * Classifies agent exceptions into three layers based on
 * exception type, severity, regulatory context, and
 * historical resolution patterns.
 *
 * Layer 1 — Auto-Resolve: Known patterns with documented resolution logic
 * Layer 2 — Assisted: Complex situations requiring human review with AI recommendation
 * Layer 3 — Escalated: Compliance-critical or novel scenarios requiring immediate human action
 */

export type ExceptionLayer = 'auto_resolve' | 'assisted' | 'escalated';

export type ExceptionCategory =
  | 'data_mismatch'
  | 'authority_exceeded'
  | 'compliance_flag'
  | 'system_error'
  | 'novel_scenario'
  | 'threshold_breach'
  | 'integration_failure'
  | 'validation_error';

interface ExceptionInput {
  id: string;
  category: ExceptionCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  regulatedIndustry: boolean;
  transactionValue?: number;
  authorityThreshold?: number;
  previousOccurrences: number;
  autoResolutionConfidence: number; // 0-1
}

interface ClassificationResult {
  layer: ExceptionLayer;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
  slaMinutes: number;
}

// Authority thresholds by industry for automatic escalation
const INDUSTRY_THRESHOLDS = {
  financial_services: { transactionLimit: 10000, complianceAutoEscalate: true },
  healthcare: { transactionLimit: 5000, complianceAutoEscalate: true },
  insurance: { transactionLimit: 25000, complianceAutoEscalate: true },
  legal: { transactionLimit: 0, complianceAutoEscalate: true }, // Always escalate compliance
  general: { transactionLimit: 50000, complianceAutoEscalate: false },
} as const;

// SLA targets by layer (minutes to resolution)
const SLA_TARGETS: Record<ExceptionLayer, number> = {
  auto_resolve: 1,    // 1 minute — agent handles immediately
  assisted: 60,       // 1 hour — human reviews agent recommendation
  escalated: 15,      // 15 minutes — immediate human action required
};

export function classifyException(input: ExceptionInput): ClassificationResult {
  // Layer 3: Immediate escalation conditions
  if (input.severity === 'critical') {
    return {
      layer: 'escalated',
      confidence: 1.0,
      reasoning: 'Critical severity triggers immediate escalation regardless of category',
      suggestedAction: 'Route to senior operations immediately with full context',
      slaMinutes: SLA_TARGETS.escalated,
    };
  }

  if (input.category === 'compliance_flag') {
    return {
      layer: 'escalated',
      confidence: 0.95,
      reasoning: 'Compliance flags require human review in all regulated deployments',
      suggestedAction: 'Route to compliance officer with transaction details and screening results',
      slaMinutes: SLA_TARGETS.escalated,
    };
  }

  if (input.category === 'authority_exceeded' && input.transactionValue && input.authorityThreshold) {
    if (input.transactionValue > input.authorityThreshold * 3) {
      return {
        layer: 'escalated',
        confidence: 0.9,
        reasoning: `Transaction value ($${input.transactionValue}) exceeds 3x authority threshold ($${input.authorityThreshold})`,
        suggestedAction: 'Route to authorized approver with transaction context and risk assessment',
        slaMinutes: SLA_TARGETS.escalated,
      };
    }
  }

  // Layer 1: Auto-resolve conditions
  if (input.category === 'system_error' && input.previousOccurrences > 10) {
    return {
      layer: 'auto_resolve',
      confidence: 0.85,
      reasoning: 'Known system error pattern with established retry resolution',
      suggestedAction: 'Auto-retry with exponential backoff, log outcome',
      slaMinutes: SLA_TARGETS.auto_resolve,
    };
  }

  if (input.category === 'data_mismatch' && input.autoResolutionConfidence > 0.9) {
    return {
      layer: 'auto_resolve',
      confidence: input.autoResolutionConfidence,
      reasoning: 'Data mismatch with high-confidence resolution available',
      suggestedAction: 'Apply matching algorithm, resolve, log decision with full audit trail',
      slaMinutes: SLA_TARGETS.auto_resolve,
    };
  }

  if (input.category === 'validation_error' && input.severity === 'low') {
    return {
      layer: 'auto_resolve',
      confidence: 0.8,
      reasoning: 'Low-severity validation error with standard correction available',
      suggestedAction: 'Apply validation correction, notify submitter, log resolution',
      slaMinutes: SLA_TARGETS.auto_resolve,
    };
  }

  // Layer 2: Assisted resolution (default for everything else)
  return {
    layer: 'assisted',
    confidence: 0.7,
    reasoning: `${input.category} with ${input.severity} severity requires human review`,
    suggestedAction: 'Generate recommendation with supporting data, route to appropriate reviewer',
    slaMinutes: SLA_TARGETS.assisted,
  };
}

export function getLayerLabel(layer: ExceptionLayer): string {
  switch (layer) {
    case 'auto_resolve': return 'Auto-Resolved';
    case 'assisted': return 'Assisted Resolution';
    case 'escalated': return 'Emergency Escalation';
  }
}

export function getSLAStatus(layer: ExceptionLayer, elapsedMinutes: number): 'within' | 'warning' | 'breached' {
  const target = SLA_TARGETS[layer];
  if (elapsedMinutes <= target) return 'within';
  if (elapsedMinutes <= target * 1.5) return 'warning';
  return 'breached';
}


// Pulse AI — Exception classifier for the three-layer exception handling architecture
