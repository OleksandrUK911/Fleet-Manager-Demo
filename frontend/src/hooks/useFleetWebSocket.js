// hooks/useFleetWebSocket.js
//
// Custom hook that maintains a WebSocket connection to /api/ws/positions.
// The server pushes fresh vehicle data every 5 seconds, replacing the 15-second
// HTTP polling with lower-latency server-push updates.
//
// Usage:
//   const { wsOnline } = useFleetWebSocket({ onUpdate, onStatusChange });
//
// Falls back gracefully — if WebSocket is unavailable the app still works via
// the HTTP polling that runs as a backup in App.js.

import { useEffect, useRef, useCallback } from 'react';

/** Resolve the correct WebSocket URL for dev / production */
function getWsUrl() {
  if (process.env.NODE_ENV === 'production') {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${window.location.host}/api/ws/positions`;
  }
  // Development: connect directly to the backend port (bypasses CRA proxy)
  return 'ws://localhost:7767/api/ws/positions';
}

const RECONNECT_DELAY_MS = 5000;

/**
 * @param {{ onUpdate: (vehicles: object[]) => void, onStatusChange: (online: boolean) => void }} opts
 */
export function useFleetWebSocket({ onUpdate, onStatusChange }) {
  const wsRef              = useRef(null);
  const reconnectRef       = useRef(null);
  const onUpdateRef        = useRef(onUpdate);
  const onStatusChangeRef  = useRef(onStatusChange);
  const unmountedRef       = useRef(false);

  // Keep callbacks refs in sync without re-triggering the connect effect
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmountedRef.current) return;
        onStatusChangeRef.current(true);
      };

      ws.onmessage = (event) => {
        if (unmountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          onUpdateRef.current(data);
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        onStatusChangeRef.current(false);
        // Schedule reconnect
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        // onclose fires next — handled there
        ws.close();
      };
    } catch {
      // WebSocket constructor can throw in some environments
      reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  }, []); // stable — doesn't depend on changing props

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connect]);
}
