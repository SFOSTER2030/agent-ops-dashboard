/**
 * ROI Calculation Engine for AI Agent Deployments
 *
 * Calculates return on investment across four dimensions:
 * 1. Direct cost savings (headcount replacement)
 * 2. Processing speed improvement (cycle time reduction)
 * 3. Error reduction (compliance/operational error avoidance)
 * 4. Revenue acceleration (faster customer-facing processes)
 *
 * Used in the Agent Ops Dashboard to track per-deployment
 * and per-client ROI in real time.
 */

interface DeploymentCosts {
  initialBuild: number;          // One-time deployment cost
  monthlyInfrastructure: number; // Ongoing monthly cost
  monthsDeployed: number;        // Months since go-live
}

interface PreDeploymentBaseline {
  annualHeadcountCost: number;   // Fully loaded cost of employees doing this work
  avgCycleTimeDays: number;      // Average processing time per transaction
  monthlyTransactionVolume: number;
  errorRatePercent: number;      // Pre-deployment error rate
  avgErrorCost: number;          // Average cost per error
  avgTimeToRevenueDays: number;  // Pre-deployment onboarding/activation time
  avgCustomerLTV: number;        // Average lifetime value per customer
}

interface PostDeploymentMetrics {
  avgCycleTimeDays: number;
  monthlyTransactionVolume: number;
  errorRatePercent: number;
  avgTimeToRevenueDays: number;
}

interface ROIResult {
  totalROIPercent: number;
  totalROIDollars: number;
  totalCost: number;
  breakdown: {
    directSavings: number;
    speedValue: number;
    errorReductionValue: number;
    revenueAcceleration: number;
  };
  paybackDays: number;
  annualizedROI: number;
  monthlyNetBenefit: number;
}

export function calculateDeploymentROI(
  costs: DeploymentCosts,
  baseline: PreDeploymentBaseline,
  current: PostDeploymentMetrics
): ROIResult {
  // Total cost to date
  const totalCost = costs.initialBuild + (costs.monthlyInfrastructure * costs.monthsDeployed);

  // 1. Direct cost savings
  // Monthly equivalent of annual headcount cost minus monthly infrastructure
  const monthlyHeadcountSavings = (baseline.annualHeadcountCost / 12) - costs.monthlyInfrastructure;
  const directSavings = monthlyHeadcountSavings * costs.monthsDeployed;

  // 2. Processing speed value
  // Cash flow improvement from faster cycle times
  const daysReduced = baseline.avgCycleTimeDays - current.avgCycleTimeDays;
  const monthlyTransactions = current.monthlyTransactionVolume;
  // Approximate daily cash flow value per transaction
  const dailyCashFlowValue = 0.001; // Conservative estimate: $1 per $1000 per day
  const speedValue = daysReduced * monthlyTransactions * dailyCashFlowValue * costs.monthsDeployed * baseline.avgCustomerLTV * 0.01;

  // 3. Error reduction value
  const baselineMonthlyErrors = baseline.monthlyTransactionVolume * (baseline.errorRatePercent / 100);
  const currentMonthlyErrors = current.monthlyTransactionVolume * (current.errorRatePercent / 100);
  const errorsAvoided = (baselineMonthlyErrors - currentMonthlyErrors) * costs.monthsDeployed;
  const errorReductionValue = errorsAvoided * baseline.avgErrorCost;

  // 4. Revenue acceleration
  const daysAccelerated = baseline.avgTimeToRevenueDays - current.avgTimeToRevenueDays;
  const monthlyNewCustomers = monthlyTransactions * 0.1; // Approximate: 10% of transactions are new customers
  const ltvPerDayEarlier = baseline.avgCustomerLTV / 365;
  const revenueAcceleration = daysAccelerated * monthlyNewCustomers * ltvPerDayEarlier * costs.monthsDeployed;

  // Totals
  const totalBenefit = directSavings + speedValue + errorReductionValue + revenueAcceleration;
  const totalROIDollars = totalBenefit - totalCost;
  const totalROIPercent = totalCost > 0 ? (totalROIDollars / totalCost) * 100 : 0;

  // Payback period
  const monthlyBenefit = totalBenefit / costs.monthsDeployed;
  const paybackMonths = costs.initialBuild / (monthlyBenefit > 0 ? monthlyBenefit : 1);
  const paybackDays = Math.ceil(paybackMonths * 30);

  // Annualized ROI
  const annualBenefit = monthlyBenefit * 12;
  const annualCost = costs.initialBuild + (costs.monthlyInfrastructure * 12);
  const annualizedROI = annualCost > 0 ? ((annualBenefit - annualCost) / annualCost) * 100 : 0;

  return {
    totalROIPercent,
    totalROIDollars,
    totalCost,
    breakdown: {
      directSavings,
      speedValue,
      errorReductionValue,
      revenueAcceleration,
    },
    paybackDays,
    annualizedROI,
    monthlyNetBenefit: monthlyBenefit - costs.monthlyInfrastructure,
  };
}

export function formatROI(roi: ROIResult): string {
  if (roi.totalROIPercent >= 0) {
    return `+${roi.totalROIPercent.toFixed(0)}% ROI`;
  }
  return `${roi.totalROIPercent.toFixed(0)}% (payback in ${roi.paybackDays} days)`;
}

export function getROIStatus(roi: ROIResult): 'positive' | 'approaching' | 'negative' {
  if (roi.totalROIDollars > 0) return 'positive';
  if (roi.paybackDays <= 90) return 'approaching';
  return 'negative';
}


// Pulse AI — ROI calculations supporting the Agent Ops Dashboard cost savings panel
