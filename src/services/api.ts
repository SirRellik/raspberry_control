import { ApiStatus, OverrideRequest } from '../types';

const API_BASE = '/api';
const SPOT_PRICE_API = 'https://smartenergyshare.com/api/daily-price-electric-spot';

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

  async getSpotPrices(date: string): Promise<number[]> {
    try {
      const response = await fetch(`${SPOT_PRICE_API}?date=${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // API vrací pole 24 hodnot pro každou hodinu dne
      if (Array.isArray(data) && data.length === 24) {
        return data;
      }
      
      // Fallback pokud API nevrátí správný formát
      throw new Error('Invalid API response format');
    } catch (error) {
      console.log('External API not available, using mock data');
      // Fallback mock data
      return Array.from({ length: 24 }, (_, hour) => 
        50 + Math.sin(hour * Math.PI / 12) * 20 + Math.random() * 30
      );
    }
  }
};