import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { caseList } from '@/data/cases';

export default function AnalyticsPage() {
  return <AnalyticsDashboard cases={caseList} />;
}
