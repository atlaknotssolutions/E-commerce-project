type Severity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  severity: Severity;
  duration: number | null;
}

type Listener = (notification: Notification) => void;

const listeners: Set<Listener> = new Set();
const activeNotifications = new Map<string, number>();

const DEFAULT_DURATIONS: Record<Severity, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 4000,
};

function generateId(message: string, severity: string): string {
  return `${severity}:${message}`;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function publish(notification: Notification) {
  listeners.forEach((listener) => listener(notification));
}

function notify(message: string, severity: Severity, duration?: number) {
  const id = generateId(message, severity);

  if (activeNotifications.has(id)) {
    return;
  }

  const notification: Notification = {
    id,
    message,
    severity,
    duration: duration ?? DEFAULT_DURATIONS[severity],
  };

  activeNotifications.set(id, Date.now());
  publish(notification);

  const autoClear = notification.duration ?? 3000;
  setTimeout(() => {
    activeNotifications.delete(id);
  }, autoClear + 500);
}

function clearActiveNotifications() {
  activeNotifications.clear();
}

export const notification = {
  success: (message: string) => notify(message, 'success'),
  error: (message: string) => notify(message, 'error'),
  warning: (message: string) => notify(message, 'warning'),
  info: (message: string) => notify(message, 'info'),
  clear: clearActiveNotifications,
  subscribe,
};

export type { Severity, Notification };
