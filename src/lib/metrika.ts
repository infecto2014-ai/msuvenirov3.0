// Yandex Metrika goals. The counter itself is loaded lazily by the layout.
declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

const COUNTER = 108361089;

export const reachGoal = (goal: string, params?: Record<string, unknown>) => {
  try {
    window.ym?.(COUNTER, 'reachGoal', goal, params);
  } catch {
    /* analytics must never break the page */
  }
};
