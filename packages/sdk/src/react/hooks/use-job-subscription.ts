import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import type { JobStatus, WebSocketCallbacks } from "../../types";

import { useOCRBaseClient } from "../provider";
import { jobKeys } from "./use-jobs";

export interface UseJobSubscriptionOptions {
  enabled?: boolean;
  onStatus?: (status: JobStatus) => void;
  onComplete?: (data: {
    markdownResult?: string;
    jsonResult?: unknown;
    processingTimeMs?: number;
  }) => void;
  onError?: (error: string) => void;
}

export interface UseJobSubscriptionResult {
  isConnected: boolean;
  status: JobStatus | null;
  error: string | null;
}

export const useJobSubscription = (
  jobId: string | null | undefined,
  options: UseJobSubscriptionOptions = {}
): UseJobSubscriptionResult => {
  const { enabled = true, onComplete, onError, onStatus } = options;

  const client = useOCRBaseClient();
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbacksRef = useRef({ onComplete, onError, onStatus });
  callbacksRef.current = { onComplete, onError, onStatus };

  const invalidateJob = useCallback(() => {
    if (jobId) {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    }
  }, [jobId, queryClient]);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsConnected(false);
      setStatus(null);
      setError(null);
      return;
    }

    const callbacks: WebSocketCallbacks = {
      onComplete: (data) => {
        invalidateJob();
        callbacksRef.current.onComplete?.(data);
      },
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: (err) => {
        setError(err);
        callbacksRef.current.onError?.(err);
      },
      onStatus: (newStatus) => {
        setStatus(newStatus);
        invalidateJob();
        callbacksRef.current.onStatus?.(newStatus);
      },
    };

    const unsubscribe = client.ws.subscribeToJob(jobId, callbacks);

    return () => {
      unsubscribe();
    };
  }, [jobId, enabled, client.ws, invalidateJob]);

  return { error, isConnected, status };
};
