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
        throw new Error(`Spot prices API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validace dat podle specifikace backendu
      if (!data || !Array.isArray(data.prices) || data.prices.length !== 24) {
        throw new Error('Invalid spot prices response format');
      }
      
      // Převod všech hodnot na čísla
      const prices = data.prices.map((price: any) => {
        const num = Number(price);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid price value: ${price}`);
        }
        return num;
      });
      
      console.log(`Loaded spot prices for ${dateISO}:`, prices.slice(0, 3), '...');
      return prices;
      
    } catch (error) {
      console.error(`Failed to fetch spot prices for ${dateISO}:`, error);
      throw error;
    }
  }
};