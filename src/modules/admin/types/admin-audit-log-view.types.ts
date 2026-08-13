/** One `key: value` line of a rendered metadata payload — never raw JSON. */
export interface AdminAuditLogMetadataEntryView {
  readonly key: string;
  readonly value: string;
}

/** One audit event row, fully resolved for display — no ids to translate, no dates to format. */
export interface AdminAuditLogRowView {
  readonly id: string;
  readonly whenLabel: string;
  readonly whenIso: string;
  readonly adminLabel: string;
  readonly actionLabel: string;
  readonly actionCode: string;
  readonly targetTypeLabel: string;
  readonly targetId: string;
  /** `null` for a target type with no admin detail screen to link to (portfolios, other admins). */
  readonly targetHref: string | null;
  readonly metadataEntries: readonly AdminAuditLogMetadataEntryView[];
}

export interface AdminAuditLogTableColumnLabels {
  readonly when: string;
  readonly admin: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly metadata: string;
}

export interface AdminAuditLogTableProps {
  readonly rows: readonly AdminAuditLogRowView[];
  readonly columnLabels: AdminAuditLogTableColumnLabels;
  /** Shown in the metadata cell of a row that carried no metadata. */
  readonly metadataEmptyLabel: string;
}

/** One `<option>` for any of the three filter selects. */
export interface AdminAuditLogFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface AdminAuditLogFiltersProps {
  readonly action: string;
  readonly queryFieldName: string;
  readonly query: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly adminFieldName: string;
  readonly adminValue: string;
  readonly adminLabel: string;
  readonly adminOptions: readonly AdminAuditLogFilterOption[];
  readonly targetTypeFieldName: string;
  readonly targetTypeValue: string;
  readonly targetTypeLabel: string;
  readonly targetTypeOptions: readonly AdminAuditLogFilterOption[];
  readonly actionFieldName: string;
  readonly actionValue: string;
  readonly actionLabel: string;
  readonly actionOptions: readonly AdminAuditLogFilterOption[];
  readonly submitLabel: string;
}
