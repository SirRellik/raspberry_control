import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface PowerChartProps {
  data: ChartDataPoint[];
}

export const PowerChart: React.FC<PowerChartProps> = ({ data }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      height: '400px'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151'
      }}>
        Výkon - posledních 24h
      </h3>
      
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            labelFormatter={(label) => `Čas: ${label}`}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)} kW`,
              name === 'pv' ? 'Fotovoltaika' : 'Síť'
            ]}
          />
          <Legend 
            formatter={(value) => value === 'pv' ? 'Fotovoltaika' : 'Síť'}
          />
          <Line 
            type="monotone" 
            dataKey="pv" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="grid" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};