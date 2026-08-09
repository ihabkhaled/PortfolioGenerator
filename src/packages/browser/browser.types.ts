export interface BrowserLocationSnapshot {
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  readonly href: string;
}

export interface BrowserServiceWorkerUpdate {
  readonly activate: () => void;
}

export type BrowserServiceWorkerUpdateListener = (update: BrowserServiceWorkerUpdate) => void;
