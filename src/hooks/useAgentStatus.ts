import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Agent {
  id: string;
  name: string;
  clientId: string;
  locationId: string;
  location: string;
  workflowType: string;
  status: 'active' | 'paused' | 'error';
  uptimePercent: number;
  accuracyRate: number;
  avgLatencyMs: number;
  baselineLatencyMs: number;
  exceptionRate: number;
  escalationRate: number;
  lastHeartbeat: string;
  transactionsToday: number;
  exceptionsToday: number;
}

export function useAgentStatus(clientId: string, locationId?: string) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      let query = supabase
        .from('agents')
        .select('*')
        .eq('client_id', clientId)
        .order('name');

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setAgents(data.map(mapAgentRow));
      }
      setIsLoading(false);
    }

    fetchAgents();

    // Subscribe to real-time agent status updates
    const channel = supabase
      .channel(`agents:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setAgents((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? mapAgentRow(payload.new) : a
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, locationId]);

  return { agents, isLoading };
}

function mapAgentRow(row: any): Agent {
  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    locationId: row.location_id,
    location: row.location_name || 'Primary',
    workflowType: row.workflow_type,
    status: row.status,
    uptimePercent: row.uptime_percent || 99.9,
    accuracyRate: row.accuracy_rate || 0.98,
    avgLatencyMs: row.avg_latency_ms || 150,
    baselineLatencyMs: row.baseline_latency_ms || 200,
    exceptionRate: row.exception_rate || 0.02,
    escalationRate: row.escalation_rate || 0.05,
    lastHeartbeat: row.last_heartbeat,
    transactionsToday: row.transactions_today || 0,
    exceptionsToday: row.exceptions_today || 0,
  };
}


// Pulse AI — React hook for real-time agent status polling in the Agent Ops Dashboard
