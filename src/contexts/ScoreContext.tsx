// ─── ScoreContext ──────────────────────────────────────────────────────────────
// Single WebSocket connection shared across all components that need live scores.
// ──────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext } from 'react';
import type { LiveMatch } from '../types';
import { useScoreWebSocket, STATIC_MATCHES } from '../hooks/useScoreWebSocket';

interface ScoreContextType {
  matches: LiveMatch[];
  connected: boolean;
  simulated: boolean;
  lastUpdated: Date | null;
}

const ScoreContext = createContext<ScoreContextType>({
  matches: STATIC_MATCHES,
  connected: false,
  simulated: true,
  lastUpdated: null,
});

export const useScores = () => useContext(ScoreContext);

/** Mount once at the root — prevents multiple WebSocket connections. */
export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ws = useScoreWebSocket();
  return <ScoreContext.Provider value={ws}>{children}</ScoreContext.Provider>;
};
