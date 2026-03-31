
import { useAgentStatus } from '../hooks/useAgentStatus';
import { calculateHealthScore } from '../utils/agentHealth';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AgentHealthGridProps {
  clientId: string;
  locationId?: string;
}

export function AgentHealthGrid({ clientId, locationId }: AgentHealthGridProps) {
  const { agents, isLoading } = useAgentStatus(clientId, locationId);

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-800 rounded-lg" />;

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-teal-500" />;
    if (score >= 75) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBorder = (score: number) => {
    if (score >= 90) return 'border-teal-500/30';
    if (score >= 75) return 'border-yellow-500/30';
    return 'border-red-500/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {agents.map((agent) => {
        const health = calculateHealthScore({
          uptime: agent.uptimePercent,
          accuracy: agent.accuracyRate,
          latency: agent.avgLatencyMs,
          baselineLatency: agent.baselineLatencyMs,
          exceptionRate: agent.exceptionRate,
          escalationRate: agent.escalationRate,
        });

        return (
          <div
            key={agent.id}
            className={`bg-gray-900 border ${getStatusBorder(health.score)} rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white truncate">{agent.name}</h3>
              {getStatusIcon(health.score)}
            </div>

            <div className="text-2xl font-bold text-teal-400 mb-1">
              {health.score.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 mb-3">Health Score</div>

            <div className="space-y-1.5">
              <MetricRow label="Uptime" value={`${agent.uptimePercent.toFixed(1)}%`} />
              <MetricRow label="Accuracy" value={`${(agent.accuracyRate * 100).toFixed(1)}%`} />
              <MetricRow label="Avg Latency" value={`${agent.avgLatencyMs}ms`} />
              <MetricRow label="Exceptions" value={`${(agent.exceptionRate * 100).toFixed(2)}%`} />
              <MetricRow label="Escalations" value={`${(agent.escalationRate * 100).toFixed(2)}%`} />
            </div>

            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{agent.workflowType}</span>
                <span className="text-gray-500">{agent.location}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}
