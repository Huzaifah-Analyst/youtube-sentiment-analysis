import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

function RadarChartComponent({ data }) {
  if (!data) return null;

  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    A: value,
    fullMark: 100,
  }));

  return (
    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
      {/* Glow filter definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="radar-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="78%" data={chartData}>
          <PolarGrid
            stroke="rgba(99,102,241,0.2)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Emotion %"
            dataKey="A"
            stroke="#a78bfa"
            strokeWidth={2.5}
            fill="#8b5cf6"
            fillOpacity={0.30}
            dot={{ fill: '#a78bfa', r: 4, strokeWidth: 0, filter: 'url(#radar-glow)' }}
            activeDot={{ r: 6, fill: '#c4b5fd', strokeWidth: 0 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10,10,26,0.95)',
              border: '1px solid rgba(139,92,246,0.35)',
              borderRadius: '10px',
              color: '#f1f5f9',
              fontSize: '0.85rem',
              padding: '10px 14px',
            }}
            itemStyle={{ color: '#c4b5fd', fontWeight: 600 }}
            formatter={(value) => [`${value}%`, 'Emotion']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChartComponent;
