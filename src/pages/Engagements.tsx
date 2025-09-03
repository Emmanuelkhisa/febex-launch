import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface VisitorRow {
  id: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  visit_count: number;
  first_visit: string;
  last_visit: string;
  user_agent: string | null;
}

const Engagements = () => {
  const [data, setData] = useState<VisitorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'FEBEX Group Engagements (Private)';
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', 'noindex, nofollow');
    else {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      m.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await (supabase as any)
        .from('visitor_analytics')
        .select('*')
        .order('last_visit', { ascending: false });
      if (error) setError(error.message);
      else setData(data as VisitorRow[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totals = useMemo(() => {
    const uniqueVisitors = data.length;
    const totalVisits = data.reduce((sum, r) => sum + (r.visit_count || 0), 0);
    const byCountry = data.reduce<Record<string, number>>((acc, r) => {
      const key = r.country || 'Unknown';
      acc[key] = (acc[key] || 0) + r.visit_count;
      return acc;
    }, {});
    const countryList = Object.entries(byCountry)
      .map(([country, visits]) => ({ country, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
    return { uniqueVisitors, totalVisits, countryList };
  }, [data]);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Engagement Analytics</h1>
        <p className="text-muted-foreground">Private dashboard for FEBEX Group countdown engagement.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totals.totalVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totals.uniqueVisitors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {totals.countryList.length === 0 && <p className="text-muted-foreground">No data yet.</p>}
            {totals.countryList.map((c) => (
              <div key={c.country} className="flex items-center justify-between">
                <span className="truncate">{c.country}</span>
                <Badge variant="secondary">{c.visits}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="min-w-[240px]">User Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.ip_address}</TableCell>
                        <TableCell>{row.country || 'Unknown'}</TableCell>
                        <TableCell>{row.city || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.visit_count}</Badge>
                        </TableCell>
                        <TableCell>{new Date(row.last_visit).toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[360px]">
                          {row.user_agent || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data.length === 0 && (
                  <p className="text-muted-foreground mt-4">No visitors yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Engagements;
