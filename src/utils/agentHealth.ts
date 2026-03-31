/**
 * Agent Health Scoring Algorithm
 *
 * Calculates a composite health score (0-100) for each deployed agent
 * based on five weighted dimensions. Used across the Agent Ops Dashboard
 * for real-time monitoring and alerting.
 *
 * Scoring weights are calibrated for production AI agent deployments
 * where uptime and accuracy are critical, with latency and exception
 * rates as secondary indicators.
 *
 * Thresholds:
 * - 90-100: Healthy (green) — operating within expected parameters
 * - 75-89:  Warning (yellow) — triggers review alert to operations team
 * - Below 75: Critical (red) — triggers immediate escalation
 */

interface HealthInputs {
  uptime: number;           // Percentage (0-100)
  accuracy: number;         // Rate (0-1)
  latency: number;          // Current average in ms
  baselineLatency: number;  // Expected baseline in ms
  exceptionRate: number;    // Rate (0-1)
  escalationRate: number;   // Rate (0-1)
}

interface HealthScore {
  score: number;
  dimensions: {
    uptime: number;
    accuracy: number;
    latency: number;
    exceptionRate: number;
    escalationRate: number;
  };
  status: 'healthy' | 'warning' | 'critical';
  alerts: string[];
}

const WEIGHTS = {
  uptime: 0.25,
  accuracy: 0.25,
  latency: 0.20,
  exceptionRate: 0.15,
  escalationRate: 0.15,
} as const;

const THRESHOLDS = {
  healthy: 90,
  warning: 75,
} as const;

export function calculateHealthScore(inputs: HealthInputs): HealthScore {
  const alerts: string[] = [];

  // Uptime score: direct percentage mapping
  const uptimeScore = Math.min(inputs.uptime, 100);
  if (uptimeScore < 99) alerts.push(`Uptime below 99%: ${uptimeScore.toFixed(2)}%`);

  // Accuracy score: scale 0-1 to 0-100
  const accuracyScore = inputs.accuracy * 100;
  if (accuracyScore < 95) alerts.push(`Accuracy below 95%: ${accuracyScore.toFixed(1)}%`);

  // Latency score: inverse ratio against baseline
  // At baseline = 100, at 2x baseline = 50, at 3x+ = 0
  const latencyRatio = inputs.latency / inputs.baselineLatency;
  const latencyScore = Math.max(0, Math.min(100, 100 * (2 - latencyRatio)));
  if (latencyRatio > 1.5) alerts.push(`Latency ${latencyRatio.toFixed(1)}x above baseline`);

  // Exception rate score: inverse mapping
  // 0% exceptions = 100, 5% = 50, 10%+ = 0
  const exceptionScore = Math.max(0, Math.min(100, 100 * (1 - inputs.exceptionRate * 10)));
  if (inputs.exceptionRate > 0.05) alerts.push(`Exception rate above 5%: ${(inputs.exceptionRate * 100).toFixed(2)}%`);

  // Escalation rate score: inverse mapping against exceptions
  // Measures what % of exceptions require human escalation
  // 0% escalation = 100, 20% = 60, 50%+ = 0
  const escalationScore = Math.max(0, Math.min(100, 100 * (1 - inputs.escalationRate * 2)));
  if (inputs.escalationRate > 0.15) alerts.push(`Escalation rate above 15%: ${(inputs.escalationRate * 100).toFixed(2)}%`);

  // Weighted composite
  const score =
    uptimeScore * WEIGHTS.uptime +
    accuracyScore * WEIGHTS.accuracy +
    latencyScore * WEIGHTS.latency +
    exceptionScore * WEIGHTS.exceptionRate +
    escalationScore * WEIGHTS.escalationRate;

  const status: HealthScore['status'] =
    score >= THRESHOLDS.healthy ? 'healthy' :
    score >= THRESHOLDS.warning ? 'warning' : 'critical';

  return {
    score,
    dimensions: {
      uptime: uptimeScore,
      accuracy: accuracyScore,
      latency: latencyScore,
      exceptionRate: exceptionScore,
      escalationRate: escalationScore,
    },
    status,
    alerts,
  };
}

export function getHealthColor(score: number): string {
  if (score >= THRESHOLDS.healthy) return '#0A9E8F'; // teal
  if (score >= THRESHOLDS.warning) return '#EAB308'; // yellow
  return '#EF4444'; // red
}

export function getHealthLabel(status: HealthScore['status']): string {
  switch (status) {
    case 'healthy': return 'Healthy';
    case 'warning': return 'Needs Review';
    case 'critical': return 'Critical — Escalated';
  }
}
