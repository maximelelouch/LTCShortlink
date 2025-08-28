'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimelineData = {
  date: string;
  clicks: number;
};

export function TimelineChart({ data }: { data: TimelineData[] }) {
  const formattedData = data.map(item => ({
      ...item,
      // Formate la date pour un affichage plus lisible
      name: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip />
          <Area type="monotone" dataKey="clicks" name="Clics" stroke="#4f46e5" fill="#c7d2fe" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}