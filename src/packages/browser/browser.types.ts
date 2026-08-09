export interface BrowserLocationSnapshot {
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  readonly href: string;
}

export interface BrowserServiceWorkerUpdate {
  readonly activate: () => Promise<void>;
}

export type BrowserServiceWorkerUpdateListener = (update: BrowserServiceWorkerUpdate) => void;

export interface BrowserInstallPrompt {
  readonly prompt: () => Promise<void>;
}

export type BrowserInstallPromptListener = (prompt: BrowserInstallPrompt | null) => void;
