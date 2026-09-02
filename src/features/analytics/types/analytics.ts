export interface AnalyticsSummary {
  todayPageviews: number;
  todayVisitors: number;
  periodPageviews: number;
  periodVisitors: number;
  periodSessions: number;
  totalEvents: number;
}

export interface AnalyticsPoint {
  label: string;
  value: number;
  visitors?: number;
}

export interface AnalyticsReport {
  days: number;
  summary: AnalyticsSummary;
  hourly: AnalyticsPoint[];
  topPages: Array<{ path: string; views: number; visitors: number }>;
  devices: AnalyticsPoint[];
  referrers: AnalyticsPoint[];
  events: AnalyticsPoint[];
}

export interface RealtimeVisitorSnapshot {
  onlineCount: number;
  paths: AnalyticsPoint[];
  devices: AnalyticsPoint[];
}
