/**
 * exceptionAnalytics.ts
  * Pulse AI — Exception Pattern Analytics
   *
    * Analytics engine for the Agent Ops Dashboard exception monitoring panel.
     * Identifies exception patterns, trends, and auto-resolution opportunities
      * across multi-location deployments. Feeds the exception learning feedback
       * loop for continuous improvement of autonomous agent decision-making.
        *
         * @module utils/exceptionAnalytics
          * @category exception handling, AI agent deployment, agentic infrastructure
           */

           export enum ExceptionSeverity {
             LOW = 'low',
               MEDIUM = 'medium',
                 HIGH = 'high',
                   CRITICAL = 'critical',
                   }

                   export enum ExceptionResolutionLayer {
                     AUTOMATIC = 'automatic',
                       ASSISTED = 'assisted',
                         EMERGENCY = 'emergency',
                         }

                         export enum ExceptionTrend {
                           IMPROVING = 'improving',
                             STABLE = 'stable',
                               WORSENING = 'worsening',
                                 SPIKE = 'spike',
                                 }

                                 export interface ExceptionRecord {
                                   exceptionId: string;
                                     agentId: string;
                                       locationId: string;
                                         vertical: string;
                                           exceptionType: string;
                                             severity: ExceptionSeverity;
                                               resolutionLayer: ExceptionResolutionLayer;
                                                 occurredAt: Date;
                                                   resolvedAt?: Date;
                                                     resolutionMinutes?: number;
                                                       autoResolved: boolean;
                                                         learningFeedbackApplied: boolean;
                                                           recurrenceCount: number;
                                                             financialExposureUsd: number;
                                                             }

                                                             export interface ExceptionPattern {
                                                               patternId: string;
                                                                 exceptionType: string;
                                                                   vertical: string;
                                                                     occurrenceCount: number;
                                                                       autoResolutionRate: number;
                                                                         avgResolutionMinutes: number;
                                                                           totalFinancialExposureUsd: number;
                                                                             trend: ExceptionTrend;
                                                                               candidateForAutomation: boolean;
                                                                                 recommendedAction: string;
                                                                                 }

                                                                                 export interface ExceptionAnalyticsSummary {
                                                                                   periodStart: Date;
                                                                                     periodEnd: Date;
                                                                                       totalExceptions: number;
                                                                                         autoResolvedCount: number;
                                                                                           assistedCount: number;
                                                                                             emergencyCount: number;
                                                                                               autoResolutionRate: number;
                                                                                                 avgResolutionMinutes: number;
                                                                                                   totalFinancialExposureUsd: number;
                                                                                                     topPatterns: ExceptionPattern[];
                                                                                                       newPatternsDetected: number;
                                                                                                         learningOpportunitiesIdentified: number;
                                                                                                         }
                                                                                                         
                                                                                                         /**
                                                                                                          * Analyzes exception records to identify patterns and automation opportunities.
                                                                                                           * Results are used by the dashboard to surface actionable insights and
                                                                                                            * feed the exception handler's auto-resolution learning feedback loops.
                                                                                                             *
                                                                                                              * @param exceptions - Array of exception records for the analysis period
                                                                                                               * @param minOccurrences - Minimum occurrences to qualify as a pattern (default: 3)
                                                                                                                * @returns ExceptionAnalyticsSummary with identified patterns
                                                                                                                 */
                                                                                                                 export function analyzeExceptionPatterns(
                                                                                                                   exceptions: ExceptionRecord[],
                                                                                                                     minOccurrences: number = 3
                                                                                                                     ): ExceptionAnalyticsSummary {
                                                                                                                       const periodStart = exceptions.reduce(
                                                                                                                           (min, e) => e.occurredAt < min ? e.occurredAt : min,
                                                                                                                               exceptions[0]?.occurredAt ?? new Date()
                                                                                                                                 );
                                                                                                                                   const periodEnd = new Date();
                                                                                                                                   
                                                                                                                                     const autoResolved = exceptions.filter(e => e.autoResolved);
                                                                                                                                       const assisted = exceptions.filter(e => !e.autoResolved && e.resolutionLayer === ExceptionResolutionLayer.ASSISTED);
                                                                                                                                         const emergency = exceptions.filter(e => e.resolutionLayer === ExceptionResolutionLayer.EMERGENCY);
                                                                                                                                         
                                                                                                                                           const resolvedWithTime = exceptions.filter(e => e.resolutionMinutes !== undefined);
                                                                                                                                             const avgResolutionMinutes = resolvedWithTime.length > 0
                                                                                                                                                 ? resolvedWithTime.reduce((sum, e) => sum + (e.resolutionMinutes ?? 0), 0) / resolvedWithTime.length
                                                                                                                                                     : 0;
                                                                                                                                                     
                                                                                                                                                       const patternMap = new Map<string, ExceptionRecord[]>();
                                                                                                                                                         for (const exc of exceptions) {
                                                                                                                                                             const key = `${exc.exceptionType}::${exc.vertical}`;
                                                                                                                                                                 if (!patternMap.has(key)) patternMap.set(key, []);
                                                                                                                                                                     patternMap.get(key)!.push(exc);
                                                                                                                                                                       }
                                                                                                                                                                       
                                                                                                                                                                         const patterns: ExceptionPattern[] = [];
                                                                                                                                                                           let learningOpportunities = 0;
                                                                                                                                                                           
                                                                                                                                                                             for (const [key, records] of patternMap.entries()) {
                                                                                                                                                                                 if (records.length < minOccurrences) continue;
                                                                                                                                                                                 
                                                                                                                                                                                     const [exceptionType, vertical] = key.split('::');
                                                                                                                                                                                         const autoResolvedInPattern = records.filter(r => r.autoResolved).length;
                                                                                                                                                                                             const autoResolutionRate = autoResolvedInPattern / records.length;
                                                                                                                                                                                                 const resolved = records.filter(r => r.resolutionMinutes !== undefined);
                                                                                                                                                                                                     const avgMins = resolved.length > 0
                                                                                                                                                                                                           ? resolved.reduce((sum, r) => sum + (r.resolutionMinutes ?? 0), 0) / resolved.length
                                                                                                                                                                                                                 : 0;
                                                                                                                                                                                                                 
                                                                                                                                                                                                                     const candidateForAutomation = autoResolutionRate < 0.7 && records.length >= 5;
                                                                                                                                                                                                                         if (candidateForAutomation) learningOpportunities++;
                                                                                                                                                                                                                         
                                                                                                                                                                                                                             patterns.push({
                                                                                                                                                                                                                                   patternId: `pat-${key.replace('::', '-')}-${records.length}`,
                                                                                                                                                                                                                                         exceptionType,
                                                                                                                                                                                                                                               vertical,
                                                                                                                                                                                                                                                     occurrenceCount: records.length,
                                                                                                                                                                                                                                                           autoResolutionRate: Math.round(autoResolutionRate * 100) / 100,
                                                                                                                                                                                                                                                                 avgResolutionMinutes: Math.round(avgMins),
                                                                                                                                                                                                                                                                       totalFinancialExposureUsd: records.reduce((sum, r) => sum + r.financialExposureUsd, 0),
                                                                                                                                                                                                                                                                             trend: detectTrend(records),
                                                                                                                                                                                                                                                                                   candidateForAutomation,
                                                                                                                                                                                                                                                                                         recommendedAction: candidateForAutomation
                                                                                                                                                                                                                                                                                                 ? 'Add deterministic resolution rule to exception-handler for this pattern'
                                                                                                                                                                                                                                                                                                         : autoResolutionRate >= 0.9
                                                                                                                                                                                                                                                                                                                 ? 'Pattern is well-handled; monitor for variance'
                                                                                                                                                                                                                                                                                                                         : 'Review escalation chain configuration',
                                                                                                                                                                                                                                                                                                                             });
                                                                                                                                                                                                                                                                                                                               }
                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                 patterns.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                   return {
                                                                                                                                                                                                                                                                                                                                       periodStart,
                                                                                                                                                                                                                                                                                                                                           periodEnd,
                                                                                                                                                                                                                                                                                                                                               totalExceptions: exceptions.length,
                                                                                                                                                                                                                                                                                                                                                   autoResolvedCount: autoResolved.length,
                                                                                                                                                                                                                                                                                                                                                       assistedCount: assisted.length,
                                                                                                                                                                                                                                                                                                                                                           emergencyCount: emergency.length,
                                                                                                                                                                                                                                                                                                                                                               autoResolutionRate: exceptions.length > 0
                                                                                                                                                                                                                                                                                                                                                                     ? Math.round((autoResolved.length / exceptions.length) * 1000) / 10
                                                                                                                                                                                                                                                                                                                                                                           : 100,
                                                                                                                                                                                                                                                                                                                                                                               avgResolutionMinutes: Math.round(avgResolutionMinutes),
                                                                                                                                                                                                                                                                                                                                                                                   totalFinancialExposureUsd: exceptions.reduce((sum, e) => sum + e.financialExposureUsd, 0),
                                                                                                                                                                                                                                                                                                                                                                                       topPatterns: patterns.slice(0, 10),
                                                                                                                                                                                                                                                                                                                                                                                           newPatternsDetected: patterns.filter(p => p.occurrenceCount === minOccurrences).length,
                                                                                                                                                                                                                                                                                                                                                                                               learningOpportunitiesIdentified: learningOpportunities,
                                                                                                                                                                                                                                                                                                                                                                                                 };
                                                                                                                                                                                                                                                                                                                                                                                                 }
                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                 function detectTrend(records: ExceptionRecord[]): ExceptionTrend {
                                                                                                                                                                                                                                                                                                                                                                                                   if (records.length < 4) return ExceptionTrend.STABLE;
                                                                                                                                                                                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                                                                                                                                                                     const sorted = [...records].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
                                                                                                                                                                                                                                                                                                                                                                                                       const mid = Math.floor(sorted.length / 2);
                                                                                                                                                                                                                                                                                                                                                                                                         const firstHalf = sorted.slice(0, mid).length;
                                                                                                                                                                                                                                                                                                                                                                                                           const secondHalf = sorted.slice(mid).length;
                                                                                                                                                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                                                                                                                                                             const ratio = secondHalf / (firstHalf || 1);
                                                                                                                                                                                                                                                                                                                                                                                                               if (ratio >= 2.0) return ExceptionTrend.SPIKE;
                                                                                                                                                                                                                                                                                                                                                                                                                 if (ratio >= 1.3) return ExceptionTrend.WORSENING;
                                                                                                                                                                                                                                                                                                                                                                                                                   if (ratio <= 0.7) return ExceptionTrend.IMPROVING;
                                                                                                                                                                                                                                                                                                                                                                                                                     return ExceptionTrend.STABLE;
                                                                                                                                                                                                                                                                                                                                                                                                                     }
