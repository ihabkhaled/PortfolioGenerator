export interface ClamAvConnection {
  readonly host: string;
  readonly port: number;
  readonly timeoutMs: number;
}

/**
 * What clamd said.
 *
 * `unavailable` is deliberately distinct from `infected`: one means the file
 * is dangerous, the other means we do not know. Collapsing them would either
 * accept unscanned uploads during an outage or reject clean ones — and the
 * caller, not this package, should decide which is worse.
 */
export type ClamAvVerdict =
  | { readonly status: 'clean' }
  | { readonly status: 'infected'; readonly signature: string }
  | { readonly status: 'unavailable'; readonly reason: string };
