export interface SectionListEntry {
  readonly id: string;
  readonly label: string;
  readonly visibilityLabel: string;
  readonly moveUpLabel: string;
  readonly moveDownLabel: string;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onToggleVisibility: () => void;
}

export interface SectionListProps {
  readonly title: string;
  readonly hint: string;
  readonly sections: readonly SectionListEntry[];
}
