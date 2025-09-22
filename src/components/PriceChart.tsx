import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceDataPoint } from '../types';
import { apiService } from '../services/api';

interface PriceChartProps {
  initialDate?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ initialDate }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return initialDate || new Date().toISOString().split('T')[0];
  });
  const [data, setData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPriceData = async (date: string) => {
    setLoading(true);
    try {
      const prices = await apiService.getSpotPrices(date);
      const priceData = prices.map((price, hour) => ({
        hour,
        price
      }));
      setData(priceData);
    } catch (error) {
      console.error('Error loading price data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Dnes';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Zítra';
    } else {
      return date.toLocaleDateString('cs-CZ');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      height: '400px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Ceny elektřiny - {formatDateLabel(selectedDate)}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={() => navigateDate('prev')}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ←
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          <button
            onClick={() => navigateDate('next')}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            →
          </button>
        </div>
      </div>
      
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          color: '#6b7280'
        }}>
          Načítání cen...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 12 }}
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis 
              label={{ value: '€/MWh', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              labelFormatter={(hour) => `${hour}:00 - ${(hour + 1) % 24}:00`}
              formatter={(value: number) => [`${value.toFixed(2)} €/MWh`, 'Cena']}
            />
            <Bar 
              dataKey="price" 
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};