
import { useExceptions } from '../hooks/useExceptions';
import { classifyException, ExceptionLayer } from '../utils/exceptionClassifier';
import { formatDistanceToNow } from 'date-fns';

interface ExceptionTrackerProps {
  clientId: string;
  locationId?: string;
  limit?: number;
}

const LAYER_CONFIG: Record<ExceptionLayer, { label: string; color: string; bg: string }> = {
  auto_resolve: { label: 'Auto-Resolved', color: 'text-teal-400', bg: 'bg-teal-500/10' },
  assisted: { label: 'Assisted', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  escalated: { label: 'Escalated', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export function ExceptionTracker({ clientId, locationId, limit = 50 }: ExceptionTrackerProps) {
  const { exceptions, stats, isLoading } = useExceptions(clientId, locationId, limit);

  if (isLoading) return <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="Auto-Resolved"
          count={stats.autoResolved}
          total={stats.total}
          color="teal"
        />
        <SummaryCard
          label="Assisted Resolution"
          count={stats.assisted}
          total={stats.total}
          color="yellow"
        />
        <SummaryCard
          label="Emergency Escalation"
          count={stats.escalated}
          total={stats.total}
          color="red"
        />
      </div>

      {/* Exception feed */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Recent Exceptions</h3>
        </div>

        <div className="divide-y divide-gray-800">
          {exceptions.map((exception) => {
            const classification = classifyException(exception);
            const config = LAYER_CONFIG[classification.layer];

            return (
              <div key={exception.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {exception.agentName} · {exception.workflowType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{exception.description}</p>
                    {classification.layer === 'assisted' && exception.recommendation && (
                      <p className="text-xs text-gray-500 mt-1">
                        Recommendation: {exception.recommendation}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(exception.createdAt), { addSuffix: true })}
                  </div>
                </div>

                {exception.resolution && (
                  <div className="mt-2 pl-3 border-l-2 border-gray-700">
                    <p className="text-xs text-gray-500">
                      Resolved: {exception.resolution}
                      {exception.resolvedBy && ` by ${exception.resolvedBy}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold text-${color}-400`}>{count}</div>
      <div className="text-xs text-gray-600">{pct}% of total</div>
    </div>
  );
}
