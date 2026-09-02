import "server-only";

import type { AnalyticsReport } from "@/features/analytics/types/analytics";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EMPTY_REPORT: AnalyticsReport = {
  days: 7,
  summary: {
    todayPageviews: 0,
    todayVisitors: 0,
    periodPageviews: 0,
    periodVisitors: 0,
    periodSessions: 0,
    totalEvents: 0,
  },
  hourly: [],
  topPages: [],
  devices: [],
  referrers: [],
  events: [],
};

export async function getAnalyticsReport(days = 7): Promise<AnalyticsReport> {
  const safeDays = [7, 30, 90].includes(days) ? days : 7;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_analytics_dashboard", {
    p_days: safeDays,
    p_timezone: "Asia/Jakarta",
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return { ...EMPTY_REPORT, days: safeDays };
  }
  return data as unknown as AnalyticsReport;
}
