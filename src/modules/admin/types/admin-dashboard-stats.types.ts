export interface AdminDashboardStatsCounts {
  readonly totalUsers: number;
  readonly totalPortfolios: number;
  readonly publishedPortfolios: number;
  readonly draftPortfolios: number;
  readonly unpublishedPortfolios: number;
  readonly signupsLast30Days: number;
}

export interface AdminStatTile {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}
