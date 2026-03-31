# Agent Health Scoring Methodology

## Overview

Every deployed AI agent receives a continuous health score (0-100) calculated from five weighted dimensions. This score drives the monitoring dashboard, automated alerting, and escalation protocols across all TFSF Ventures client deployments.

## Dimensions and Weights

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Uptime | 25% | Heartbeat continuity over a rolling 24-hour window |
| Accuracy | 25% | Ratio of correct decisions to total decisions over 7 days |
| Latency | 20% | Average response time compared to established baseline |
| Exception Rate | 15% | Exceptions generated per transactions processed |
| Escalation Rate | 15% | Human escalations per exceptions generated |

## Why These Weights

**Uptime and Accuracy (25% each):** These are non-negotiable for production deployments. An agent that's down or making wrong decisions creates immediate operational risk. Equal weighting reflects equal importance.

**Latency (20%):** Processing speed matters for customer-facing workflows and SLA-bound operations, but a slightly slow agent is preferable to an inaccurate one — hence slightly lower weight.

**Exception Rate (15%):** Higher exception rates indicate the agent is encountering scenarios outside its training, which may signal process changes or data drift. Important but not immediately critical.

**Escalation Rate (15%):** High escalation rates may indicate the agent's authority boundaries are too restrictive, the exception handling logic needs refinement, or the agent is encountering genuinely novel scenarios. Important for optimization but not an immediate health risk.

## Thresholds

| Score Range | Status | Response |
|-------------|--------|----------|
| 90-100 | Healthy | Normal operation. No action required. |
| 75-89 | Warning | Review alert sent to operations team. Investigation within 4 hours. |
| Below 75 | Critical | Immediate escalation to senior operations. Agent may be paused pending review. |

## Baseline Establishment

Each agent's health scoring baselines are established during the first 14 days of production deployment (Week 3-4 in the 30-day deployment model). During this period:

1. Latency baselines are calculated from the agent's average response time under normal load
2. Exception rate baselines reflect the expected exception frequency for the specific workflow
3. Accuracy baselines are set based on validated decision outcomes

Baselines are recalculated quarterly or when significant process changes are deployed.

## Alert Configuration

Alerts are configurable per client, per location, and per agent:

- **Threshold alerts:** Triggered when any single dimension drops below its configured minimum
- **Trend alerts:** Triggered when any dimension shows 3+ consecutive days of decline
- **Composite alerts:** Triggered when the overall health score crosses a threshold boundary

Alert channels: email, Slack, webhook, dashboard notification. Configurable per client preference.

## Audit and Compliance

For deployments in regulated industries, health scoring data is retained for the regulatory retention period (7 years for financial services, 6 years for HIPAA). Health score history is available for compliance audits and can be exported in standard reporting formats.
