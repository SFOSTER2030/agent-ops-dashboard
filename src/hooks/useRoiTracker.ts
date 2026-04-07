/**
 * useRoiTracker.ts
 * Pulse AI — ROI Tracking Hook
 *
 * React hook for tracking and displaying real-time ROI metrics across
 * deployed agent workflows in the Agent Ops Dashboard. Computes cumulative
 * savings, projected annualized returns, and payback progress for each
 * client deployment.
 *
 * @module hooks/useRoiTracker
 * @category ROI measurement, AI agent deployment
 */

import { useState, useEffect, useCallback } from 'react';

export interface WorkflowRoiData {
    workflowId: string;
    workflowName: string;
    vertical: string;
    locationId: string;
    clientId: string;
    deployedAt: Date;
    monthlyLaborSavingsUsd: number;
    monthlyErrorSavingsUsd: number;
    monthlyInfrastructureCostUsd: number;
    initialInvestmentUsd: number;
    cumulativeSavingsUsd: number;
    cumulativeCostUsd: number;
    netSavingsUsd: number;
    paybackAchieved: boolean;
    paybackDate?: Date;
    monthsLive: number;
}

export interface RoiTrackerState {
    workflows: WorkflowRoiData[];
    totalNetSavingsUsd: number;
    totalAnnualizedSavingsUsd: number;
    avgPaybackMonths: number;
    workflowsInPayback: number;
    workflowsPaybackComplete: number;
    isLoading: boolean;
    lastRefreshedAt: Date | null;
    error: string | null;
}

export interface UseRoiTrackerOptions {
    clientId?: string;
    locationId?: string;
    refreshIntervalMs?: number;
    autoRefresh?: boolean;
}

/**
 * React hook for tracking deployment ROI across all workflows.
 * Aggregates savings data from active agent deployments and computes
 * cumulative financial performance for display in the dashboard.
 *
 * @param workflows - Array of workflow ROI data points
 * @param options - Hook configuration options
 * @returns RoiTrackerState with aggregated metrics and refresh controls
 */
export function useRoiTracker(
    workflows: WorkflowRoiData[],
    options: UseRoiTrackerOptions = {}
  ): RoiTrackerState & { refresh: () => void } {
    const {
          clientId,
          locationId,
          refreshIntervalMs = 300_000,
          autoRefresh = true,
    } = options;

  const [state, setState] = useState<RoiTrackerState>({
        workflows: [],
        totalNetSavingsUsd: 0,
        totalAnnualizedSavingsUsd: 0,
        avgPaybackMonths: 0,
        workflowsInPayback: 0,
        workflowsPaybackComplete: 0,
        isLoading: false,
        lastRefreshedAt: null,
        error: null,
  });

  const computeMetrics = useCallback((data: WorkflowRoiData[]): Omit<RoiTrackerState, 'isLoading' | 'error'> => {
        const filtered = data.filter(w => {
                if (clientId && w.clientId !== clientId) return false;
                if (locationId && w.locationId !== locationId) return false;
                return true;
        });

                                         const totalNetSavings = filtered.reduce((sum, w) => sum + w.netSavingsUsd, 0);
        const monthlyTotal = filtered.reduce((sum, w) => {
                return sum + w.monthlyLaborSavingsUsd + w.monthlyErrorSavingsUsd - w.monthlyInfrastructureCostUsd;
        }, 0);

                                         const paybackComplete = filtered.filter(w => w.paybackAchieved);
        const inPayback = filtered.filter(w => !w.paybackAchieved);

                                         const paybackMonths = paybackComplete
          .filter(w => w.paybackDate)
          .map(w => w.monthsLive);

                                         const avgPayback = paybackMonths.length > 0
          ? paybackMonths.reduce((sum, m) => sum + m, 0) / paybackMonths.length
                                                 : 0;

                                         return {
                                                 workflows: filtered,
                                                 totalNetSavingsUsd: Math.round(totalNetSavings),
                                                 totalAnnualizedSavingsUsd: Math.round(monthlyTotal * 12),
                                                 avgPaybackMonths: Math.round(avgPayback * 10) / 10,
                                                 workflowsInPayback: inPayback.length,
                                                 workflowsPaybackComplete: paybackComplete.length,
                                                 lastRefreshedAt: new Date(),
                                         };
  }, [clientId, locationId]);

  const refresh = useCallback(() => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
                const metrics = computeMetrics(workflows);
                setState(prev => ({ ...prev, ...metrics, isLoading: false }));
        } catch (err) {
                setState(prev => ({
                          ...prev,
                          isLoading: false,
                          error: err instanceof Error ? err.message : 'Failed to compute ROI metrics',
                }));
        }
  }, [workflows, computeMetrics]);

  useEffect(() => {
        refresh();
  }, [refresh]);

  useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(refresh, refreshIntervalMs);
        return () => clearInterval(interval);
  }, [autoRefresh, refresh, refreshIntervalMs]);

  return { ...state, refresh };
}

/**
 * Formats a USD savings amount for display in the dashboard.
 *
 * @param amount - Amount in USD
 * @param compact - Whether to use compact notation (e.g., "$12.4K")
 * @returns Formatted string
 */
export function formatSavingsAmount(amount: number, compact: boolean = false): string {
    if (compact) {
          if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
          if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
    }).format(amount);
}
