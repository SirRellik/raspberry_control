import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

  // Funkce pro získání barvy podle ceny (teplotní mapa)
  const getBarColor = (price: number, minPrice: number, maxPrice: number, hour: number, isToday: boolean) => {
    const now = new Date();
    const currentHour = now.getHours();
    const isCurrentHour = isToday && hour === currentHour;
    
    // Normalizace ceny na škálu 0-1
    const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
    
    // Teplotní barevné schéma
    let baseColor;
    if (normalizedPrice < 0.2) {
      // Velmi nízké ceny - tmavě zelená
      baseColor = '#065f46';
    } else if (normalizedPrice < 0.4) {
      // Nízké ceny - zelená
      baseColor = '#10b981';
    } else if (normalizedPrice < 0.6) {
      // Střední ceny - žlutá
      baseColor = '#f59e0b';
    } else if (normalizedPrice < 0.8) {
      // Vysoké ceny - oranžová
      baseColor = '#ea580c';
    } else {
      // Velmi vysoké ceny - červená
      baseColor = '#dc2626';
    }
    
    // Zvýraznění aktuální hodiny
    if (isCurrentHour) {
      return '#3b82f6'; // Modrá pro aktuální hodinu
    }
    
    return baseColor;
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const currentHour = new Date().getHours();
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
      
      {/* Legenda */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '12px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#065f46', borderRadius: '2px' }} />
          <span>Velmi nízké</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
          <span>Nízké</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
          <span>Střední</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ea580c', borderRadius: '2px' }} />
          <span>Vysoké</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '2px' }} />
          <span>Velmi vysoké</span>
        </div>
        {isToday && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
            <span>Aktuální hodina</span>
          </div>
        )}
      </div>
      
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '250px',
          color: '#6b7280'
        }}>
          Načítání cen...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="75%">
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
              labelFormatter={(hour) => {
                const hourNum = Number(hour);
                const isCurrentHour = isToday && hourNum === currentHour;
                return `${hour}:00 - ${(hourNum + 1) % 24}:00${isCurrentHour ? ' (Aktuální)' : ''}`;
              }}
              formatter={(value: number, name: string, props: any) => {
                const price = Number(value);
                const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
                let priceLevel = '';
                
                if (normalizedPrice < 0.2) priceLevel = ' (Velmi nízká)';
                else if (normalizedPrice < 0.4) priceLevel = ' (Nízká)';
                else if (normalizedPrice < 0.6) priceLevel = ' (Střední)';
                else if (normalizedPrice < 0.8) priceLevel = ' (Vysoká)';
                else priceLevel = ' (Velmi vysoká)';
                
                return [`${value.toFixed(2)} €/MWh${priceLevel}`, 'Cena'];
              }}
            />
            <Bar dataKey="price" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.price, minPrice, maxPrice, entry.hour, isToday)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};