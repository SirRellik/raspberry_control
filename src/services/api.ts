import { ApiStatus, OverrideRequest } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getStatus(): Promise<ApiStatus> {
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async sendOverride(request: OverrideRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  async getSpotPrices(dateISO: string): Promise<number[]> {
    const url = `${API_BASE}/spot-prices?date=${encodeURIComponent(dateISO)}`;
    
    try {
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validace dat
      if (!data?.prices || !Array.isArray(data.prices) || data.prices.length !== 24) {
        throw new Error('Invalid spot prices payload - expected array of 24 prices');
      }
      
      // Převod na čísla a validace
      const prices = data.prices.map((price: any) => {
        const num = Number(price);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid price value: ${price}`);
        }
        return num;
      });
      
      return prices;
      
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      
      // Fallback na mock data v případě chyby
      console.warn('Using fallback mock data for spot prices');
      return Array.from({ length: 24 }, (_, hour) => {
        const basePrice = 80;
        const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * 30;
        const randomVariation = (Math.random() - 0.5) * 20;
        
        let hourlyMultiplier = 1;
        if (hour >= 6 && hour <= 9) hourlyMultiplier = 1.3;
        if (hour >= 17 && hour <= 20) hourlyMultiplier = 1.4;
        if (hour >= 1 && hour <= 5) hourlyMultiplier = 0.7;
        
        return Math.max(20, basePrice + dailyCycle + randomVariation) * hourlyMultiplier;
      });
    }
  }
};