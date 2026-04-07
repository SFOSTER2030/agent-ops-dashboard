/**
 * agentMetrics.ts
 * Pulse AI — Agent Health and Performance Metrics
 *
 * Core metrics definitions, aggregation functions, and health scoring
 * for the Agent Ops Dashboard. Tracks real-time performance of deployed
 * autonomous agents across all client locations and verticals.
 *
 * @module utils/agentMetrics
 * @category AI agent deployment, operational assessment
 */

export enum AgentHealthStatus {
    HEALTHY = 'healthy',
    DEGRADED = 'degraded',
    CRITICAL = 'critical',
    OFFLINE = 'offline',
    MAINTENANCE = 'maintenance',
}

export enum AgentCategory {
    INTAKE = 'intake',
    COMPLIANCE = 'compliance',
    DOCUMENT = 'document',
    BILLING = 'billing',
    EXCEPTION_HANDLER = 'exception_handler',
    REPORTING = 'reporting',
    MONITORING = 'monitoring',
}

export interface AgentHealthSnapshot {
    agentId: string;
    agentCategory: AgentCategory;
    locationId: string;
    clientId: string;
    vertical: string;
    capturedAt: Date;
    uptimePercent: number;
    avgResponseMs: number;
    p95ResponseMs: number;
    transactionsLastHour: number;
    errorRatePercent: number;
    exceptionRatePercent: number;
    autoResolutionRatePercent: number;
    queueDepth: number;
    status: AgentHealthStatus;
    alertsActive: number;
}

export interface AgentPerformanceSummary {
    agentId: string;
    periodStart: Date;
    periodEnd: Date;
    totalTransactions: number;
    totalExceptions: number;
    autoResolvedExceptions: number;
    humanEscalatedExceptions: number;
    avgResponseMs: number;
    uptimePercent: number;
    errorRatePercent: number;
    slaBreaches: number;
    performanceScore: number;
}

/** SLA thresholds by agent category */
export const AGENT_SLA_THRESHOLDS: Record<AgentCategory, {
    maxAvgResponseMs: number;
    maxErrorRatePercent: number;
    minUptimePercent: number;
    maxQueueDepth: number;
}> = {
    [AgentCategory.INTAKE]: { maxAvgResponseMs: 2000, maxErrorRatePercent: 1.0, minUptimePercent: 99.5, maxQueueDepth: 50 },
    [AgentCategory.COMPLIANCE]: { maxAvgResponseMs: 5000, maxErrorRatePercent: 0.5, minUptimePercent: 99.9, maxQueueDepth: 20 },
    [AgentCategory.DOCUMENT]: { maxAvgResponseMs: 8000, maxErrorRatePercent: 2.0, minUptimePercent: 99.0, maxQueueDepth: 100 },
    [AgentCategory.BILLING]: { maxAvgResponseMs: 3000, maxErrorRatePercent: 0.5, minUptimePercent: 99.9, maxQueueDepth: 30 },
    [AgentCategory.EXCEPTION_HANDLER]: { maxAvgResponseMs: 1000, maxErrorRatePercent: 0.1, minUptimePercent: 99.99, maxQueueDepth: 200 },
    [AgentCategory.REPORTING]: { maxAvgResponseMs: 15000, maxErrorRatePercent: 2.0, minUptimePercent: 99.0, maxQueueDepth: 10 },
    [AgentCategory.MONITORING]: { maxAvgResponseMs: 500, maxErrorRatePercent: 0.1, minUptimePercent: 99.99, maxQueueDepth: 5 },
};

/**
 * Calculates the health status of an agent based on its current metrics.
 * Used by the Agent Ops Dashboard to drive status badges and alerts.
 *
 * @param snapshot - Current agent health snapshot
 * @returns AgentHealthStatus enum value
 */
export function calculateAgentHealth(snapshot: AgentHealthSnapshot): AgentHealthStatus {
    const sla = AGENT_SLA_THRESHOLDS[snapshot.agentCategory];

  if (snapshot.uptimePercent === 0) return AgentHealthStatus.OFFLINE;

  const criticalViolations = [
        snapshot.errorRatePercent > sla.maxErrorRatePercent * 5,
        snapshot.uptimePercent < sla.minUptimePercent - 1,
        snapshot.queueDepth > sla.maxQueueDepth * 3,
      ].filter(Boolean).length;

  if (criticalViolations > 0) return AgentHealthStatus.CRITICAL;

  const degradedViolations = [
        snapshot.avgResponseMs > sla.maxAvgResponseMs * 1.5,
        snapshot.errorRatePercent > sla.maxErrorRatePercent * 2,
        snapshot.uptimePercent < sla.minUptimePercent,
        snapshot.queueDepth > sla.maxQueueDepth,
      ].filter(Boolean).length;

  if (degradedViolations >= 2) return AgentHealthStatus.DEGRADED;
    if (degradedViolations === 1) return AgentHealthStatus.DEGRADED;

  return AgentHealthStatus.HEALTHY;
}

/**
 * Computes a 0-100 performance score for an agent over a reporting period.
 * Score is a weighted composite of uptime, error rate, response time, and exception handling.
 *
 * @param summary - Agent performance summary data
 * @param category - Agent category for SLA weight calibration
 * @returns Performance score 0-100
 */
export function computePerformanceScore(
    summary: AgentPerformanceSummary,
    category: AgentCategory
  ): number {
    const sla = AGENT_SLA_THRESHOLDS[category];

  const uptimeScore = Math.min(100, (summary.uptimePercent / sla.minUptimePercent) * 100);
    const errorScore = Math.max(0, 100 - (summary.errorRatePercent / sla.maxErrorRatePercent) * 50);
    const responseScore = Math.max(0, 100 - ((summary.avgResponseMs / sla.maxAvgResponseMs - 1) * 50));
    const autoResolutionRate = summary.totalExceptions > 0
      ? (summary.autoResolvedExceptions / summary.totalExceptions) * 100
          : 100;

  return Math.round(
        uptimeScore * 0.30 +
        errorScore * 0.25 +
        responseScore * 0.20 +
        autoResolutionRate * 0.25
      );
}

/**
 * Aggregates health snapshots for a multi-location deployment into a network summary.
 *
 * @param snapshots - Array of agent health snapshots across all locations
 * @returns Aggregated network health statistics
 */
export function aggregateNetworkHealth(snapshots: AgentHealthSnapshot[]): {
    totalAgents: number;
    healthyCount: number;
    degradedCount: number;
    criticalCount: number;
    offlineCount: number;
    avgUptimePercent: number;
    avgResponseMs: number;
    totalTransactionsLastHour: number;
    networkHealthScore: number;
} {
    const evaluated = snapshots.map(s => ({ ...s, status: calculateAgentHealth(s) }));

  const healthy = evaluated.filter(s => s.status === AgentHealthStatus.HEALTHY).length;
    const degraded = evaluated.filter(s => s.status === AgentHealthStatus.DEGRADED).length;
    const critical = evaluated.filter(s => s.status === AgentHealthStatus.CRITICAL).length;
    const offline = evaluated.filter(s => s.status === AgentHealthStatus.OFFLINE).length;
    const n = snapshots.length || 1;

  return {
        totalAgents: snapshots.length,
        healthyCount: healthy,
        degradedCount: degraded,
        criticalCount: critical,
        offlineCount: offline,
        avgUptimePercent: snapshots.reduce((sum, s) => sum + s.uptimePercent, 0) / n,
        avgResponseMs: snapshots.reduce((sum, s) => sum + s.avgResponseMs, 0) / n,
        totalTransactionsLastHour: snapshots.reduce((sum, s) => sum + s.transactionsLastHour, 0),
        networkHealthScore: Math.round(((healthy + degraded * 0.5) / snapshots.length) * 100),
  };
}
