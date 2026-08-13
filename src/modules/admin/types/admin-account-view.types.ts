export interface AdminAccountActionState {
  readonly status: 'idle' | 'error' | 'success';
  readonly error: string | null;
}

/** The read-only "what the platform holds about this admin" panel. */
export interface AdminAccountSummaryProps {
  readonly title: string;
  readonly nameLabel: string;
  readonly name: string;
  readonly emailLabel: string;
  readonly email: string;
  readonly roleLabel: string;
  /** The admin's role, already translated for display — named to avoid the reserved `role` prop. */
  readonly roleName: string;
  readonly permissionsLabel: string;
  readonly permissions: readonly string[];
}
