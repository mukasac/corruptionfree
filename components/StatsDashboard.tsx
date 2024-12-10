import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { LineChart, BarChart } from 'recharts';

export function StatsDashboard() {
  const { data: nomineeStats, isLoading: loadingNominee } = useQuery({
    queryKey: ['nomineeStats'],
    queryFn: () => fetch('/api/nominees/stats').then(res => res.json())
  });

  const { data: institutionStats, isLoading: loadingInstitution } = useQuery({
    queryKey: ['institutionStats'],
    queryFn: () => fetch('/api/institutions/stats').then(res => res.json())
  });

  if (loadingNominee || loadingInstitution) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-4">
        <h3>Nominee Statistics</h3>
        <LineChart data={nomineeStats.topNominees} width={400} height={300}>
          {/* Chart configuration */}
        </LineChart>
      </Card>
      
      <Card className="p-4">
        <h3>Institution Statistics</h3>
        <BarChart data={institutionStats.topInstitutions} width={400} height={300}>
          {/* Chart configuration */}
        </BarChart>
      </Card>
    </div>
  );
}