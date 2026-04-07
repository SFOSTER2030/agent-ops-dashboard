# Agent Ops Dashboard

### Internal Operations Dashboard for AI Agent Deployments
**Built by [TFSF Ventures FZ-LLC](https://tfsfventures.com) — Venture Architects**

[![Status](https://img.shields.io/badge/Status-Active-0A9E8F)](https://tfsfventures.com)
[![Stack](https://img.shields.io/badge/Stack-React_Vite_Tailwind-0A9E8F)](https://tfsfventures.com)
## Recent Updates

> **April 2026** — Added advanced analytics, exception pattern detection, and ROI tracking modules
>
> ### What's New
> - `src/utils/agentMetrics.ts` — Agent health scoring, SLA threshold enforcement, and network aggregation utilities
> - - `src/utils/exceptionAnalytics.ts` — Exception pattern analytics with auto-resolution learning feedback loop
>   - - `src/hooks/useRoiTracker.ts` — React hook for real-time ROI tracking and deployment savings aggregation
>    
>     - **[Take the free Operational Intelligence Assessment →](https://tfsfventures.com/assessment)**
>     - **[TFSF Ventures FZ-LLC](https://tfsfventures.com)** — AI Agent Deployment | RAKEZ License 47013955
>    
>     - ---
>
> 
A real-time monitoring and management dashboard for production AI agent deployments. Tracks agent performance, exception rates, transaction volumes, escalation patterns, and ROI metrics across multi-client, multi-location deployments.

Built on React/Vite/TypeScript/Tailwind with Supabase for real-time data and Vercel edge functions for API routing.

---

## Features

- **Agent Health Monitor** — Real-time status across all deployed agents with heartbeat tracking, latency monitoring, and automatic alerting when agents fall below performance thresholds
- **Exception Tracking** — Three-layer exception dashboard showing automatic resolutions, assisted resolutions, and emergency escalations with full audit trail per event
- **Transaction Volume Analytics** — Live transaction processing metrics per agent, per workflow, per location with historical trending and anomaly detection
- **ROI Calculator** — Automated ROI tracking per deployment measuring direct cost savings, processing speed improvement, error reduction, and revenue acceleration
- **Escalation Management** — Time-bounded escalation tracking with SLA monitoring per exception type and per client deployment
- **Multi-Location View** — Centralized dashboard with location-level drill-down for franchise and multi-site deployments
- **Client Isolation** — Row-level security ensuring each client only sees their own agent data and metrics
- **Compliance Audit Trail** — Full decision logging with timestamp, action, data inputs, and outcome per agent decision for regulated industry deployments

---

## Architecture

```
src/
├── components/
│   ├── AgentHealthGrid.tsx        # Real-time agent status grid
│   ├── ExceptionTracker.tsx       # Three-layer exception dashboard
│   ├── TransactionVolume.tsx      # Live transaction metrics
│   ├── ROICalculator.tsx          # Per-deployment ROI tracking
│   ├── EscalationManager.tsx      # SLA-bounded escalation tracking
│   ├── LocationSelector.tsx       # Multi-location navigation
│   ├── ComplianceAuditLog.tsx     # Decision audit trail viewer
│   ├── PerformanceBaseline.tsx    # Agent performance trending
│   └── AlertConfigPanel.tsx       # Threshold and alert configuration
├── hooks/
│   ├── useAgentStatus.ts          # Real-time agent heartbeat hook
│   ├── useExceptions.ts           # Exception stream subscription
│   ├── useTransactions.ts         # Transaction volume aggregation
│   ├── useEscalations.ts          # Escalation SLA tracking
│   └── useROIMetrics.ts           # ROI calculation engine
├── utils/
│   ├── agentHealth.ts             # Health scoring algorithms
│   ├── exceptionClassifier.ts     # Exception type classification
│   ├── roiCalculations.ts         # ROI formula implementations
│   ├── alertThresholds.ts         # Configurable alert thresholds
│   └── complianceLogger.ts        # Audit trail formatting
├── pages/
│   ├── Dashboard.tsx              # Main operations dashboard
│   ├── AgentDetail.tsx            # Per-agent deep dive
│   ├── ClientView.tsx             # Client-specific dashboard
│   ├── LocationView.tsx           # Location-specific metrics
│   ├── ExceptionReview.tsx        # Exception review and resolution
│   └── ComplianceReport.tsx       # Regulatory compliance reporting
api/
├── agent-status.ts                # Agent heartbeat endpoint
├── exceptions.ts                  # Exception logging and retrieval
├── transactions.ts                # Transaction metrics aggregation
├── escalations.ts                 # Escalation management
└── compliance.ts                  # Audit trail queries
docs/
├── DEPLOYMENT.md                  # Deployment configuration guide
├── AGENT_HEALTH.md                # Agent health scoring methodology
├── EXCEPTION_HANDLING.md          # Exception classification guide
└── ROI_METHODOLOGY.md             # ROI calculation documentation
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand for client state, Supabase Realtime for server state |
| Backend | Vercel Edge Functions, Supabase Edge Functions |
| Database | Supabase PostgreSQL with Row Level Security |
| Real-time | Supabase Realtime subscriptions for live agent data |
| Auth | Supabase Auth with client-level role isolation |
| Hosting | Vercel with preview deployments per branch |

---

## Agent Health Scoring

Each deployed agent receives a continuous health score based on five dimensions:

| Dimension | Weight | Measurement |
|-----------|--------|-------------|
| Uptime | 25% | Heartbeat continuity over rolling 24h window |
| Accuracy | 25% | Correct decisions / total decisions in rolling 7d window |
| Latency | 20% | Average response time vs baseline for agent type |
| Exception Rate | 15% | Exceptions generated / transactions processed |
| Escalation Rate | 15% | Human escalations / exceptions generated |

**Score Thresholds:**
- 90–100: Healthy (green)
- 75–89: Warning (yellow) — triggers review alert
- Below 75: Critical (red) — triggers immediate escalation to operations team

---

## Exception Classification

Exceptions are classified into five categories with different handling protocols:

| Category | Example | Default Handler |
|----------|---------|----------------|
| Data Mismatch | Invoice doesn't match PO | Layer 1 — Auto-resolve with matching algorithm |
| Authority Exceeded | Transaction above approval threshold | Layer 2 — Route to approver with recommendation |
| Compliance Flag | Sanctions screening hit | Layer 3 — Immediate escalation to compliance |
| System Error | Integration timeout | Layer 1 — Auto-retry with exponential backoff |
| Novel Scenario | Pattern not in training data | Layer 2 — Route to operations with full context |

---

## ROI Tracking Methodology

The dashboard calculates ROI per deployment across four metrics:

### Direct Cost Savings
```
Annual employee cost for automated workflows
- Annual agent infrastructure cost
= Direct savings
```

### Processing Speed
```
Pre-deployment average cycle time
- Post-deployment average cycle time
= Time saved per transaction
× Transaction volume
= Total processing speed value
```

### Error Reduction
```
Pre-deployment error rate × error cost per incident
- Post-deployment error rate × error cost per incident
= Error reduction value
```

### Revenue Acceleration
```
Pre-deployment time-to-revenue
- Post-deployment time-to-revenue
= Days accelerated per customer
× Average customer LTV impact
= Revenue acceleration value
```

---

## Multi-Location Support

The dashboard supports hierarchical location structures:

```
Organization
├── Region (e.g., East Coast, West Coast, MENA)
│   ├── Location (e.g., Miami Office, Dubai Office)
│   │   ├── Department (e.g., Finance, Operations, Sales)
│   │   │   ├── Agent (e.g., AP Processing Agent)
│   │   │   ├── Agent (e.g., Customer Onboarding Agent)
│   │   │   └── Agent (e.g., Compliance Monitor Agent)
```

Each level supports:
- Aggregate metrics (roll up from agents to department to location to region to org)
- Drill-down navigation (click through from org-level to individual agent)
- Comparison views (side-by-side location or department performance)
- Anomaly detection (flag locations performing significantly below peer average)

---

## Compliance and Audit

For deployments in regulated industries (financial services, healthcare, insurance, legal), the dashboard provides:

- **Full Decision Audit Trail** — Every agent decision logged with timestamp, action, data inputs, decision logic, and outcome
- **Authority Boundary Monitoring** — Alerts when agents approach or exceed defined authority limits
- **Regulatory Report Generation** — Pre-formatted reports for SEC/FINRA, HIPAA, state insurance regulators, and VARA compliance
- **Retention Policy Management** — Configurable data retention per regulatory requirement (7 years for financial services, 6 years for HIPAA)

---

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NOTIFY_EMAIL=
```

---

## Deployment

```bash
npm install
npm run dev          # Local development
npm run build        # Production build
vercel --prod        # Deploy to production
```

---

## About

Built and maintained by [TFSF Ventures FZ-LLC](https://tfsfventures.com), a UAE-headquartered venture architect (RAKEZ License 47013955) deploying intelligent agents across agentic infrastructure, nontraditional payment rails, and a venture engine. This dashboard is the operational layer that manages production agent deployments across multiple clients, verticals, and geographies.

**Contact:** s.foster@tfsf.io
