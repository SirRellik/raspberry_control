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
    // Použití mock dat (externí API není dostupné)
    return Array.from({ length: 24 }, (_, hour) => {
      // Simulace realistických cen s denním cyklem
      const basePrice = 80; // Základní cena
      const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * 30; // Denní cyklus
      const randomVariation = (Math.random() - 0.5) * 20; // Náhodná variace
      
      // Vyšší ceny ráno a večer, nižší v noci a poledne
      let hourlyMultiplier = 1;
      if (hour >= 6 && hour <= 9) hourlyMultiplier = 1.3; // Ranní špička
      if (hour >= 17 && hour <= 20) hourlyMultiplier = 1.4; // Večerní špička
      if (hour >= 1 && hour <= 5) hourlyMultiplier = 0.7; // Noční minimum
      
      return Math.max(20, basePrice + dailyCycle + randomVariation) * hourlyMultiplier;
    });
  }
};