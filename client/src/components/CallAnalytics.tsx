import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CallAnalyticsProps {
  userId: number;
}

interface DayData {
  date: string;
  count: number;
}

interface OutcomeData {
  outcome: string;
  count: number;
}

export default function CallAnalytics({ userId }: CallAnalyticsProps) {
  const [dataByDay, setDataByDay] = useState<DayData[]>([]);
  const [outcomeData, setOutcomeData] = useState<OutcomeData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/call-logs/analytics?userId=${userId}`);
        const data = await res.json();

        setDataByDay(data.byDay);
        setOutcomeData(data.byOutcome);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    };

    if (userId) fetchAnalytics();
  }, [userId]);

  const COLORS = ['#34D399', '#60A5FA', '#FBBF24', '#F87171'];

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">Call Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-semibold mb-2">Calls per Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-2">Call Outcomes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={outcomeData} dataKey="count" nameKey="outcome" outerRadius={70}>
                {outcomeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}