import { ApiStatus, OverrideRequest } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://192.168.1.207:8080';

console.log('API Base URL:', API_BASE);

export const apiService = {
  async getStatus(): Promise<ApiStatus> {
    try {
      const response = await fetch(`${API_BASE}/api/status`);
      if (!response.ok) {
        console.warn('Status API failed, using defaults');
        return {
          grid: { power: 0, voltage: 230, current: 0 },
          pv: { power: 0, voltage: 0, current: 0 },
          tuv: { temperature: 45, target: 50, heating: false },
          rooms: [],
          sockets: [],
          plan: { schedule: [] }
        };
      }
      return response.json();
    } catch (error) {
      console.error('API Status error:', error);
      return {
        grid: { power: 0, voltage: 230, current: 0 },
        pv: { power: 0, voltage: 0, current: 0 },
        tuv: { temperature: 45, target: 50, heating: false },
        rooms: [],
        sockets: [],
        plan: { schedule: [] }
      };
    }
  },

  async sendOverride(request: OverrideRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/api/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  async getTodayPrices() {
    try {
      // Zkus nejdříve backend API
      const response = await fetch(`${API_BASE}/api/prices/today`);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Backend prices API failed, trying direct smartenergyshare...');
    }

    // Fallback na přímé volání smartenergyshare API
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`https://smartenergyshare.com/api/daily-price-electric-spot?date=${today}`, {
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`SmartEnergyShare API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Direct SmartEnergyShare data:', data);
      
      // Převeď na formát očekávaný frontendem
      return {
        success: true,
        data: data.map((item: any) => ({
          spot_date: item.spot_date,
          hour: item.hour, 
          price_eur: item.price_eur
        }))
      };
    } catch (error) {
      console.error('SmartEnergyShare API failed:', error);
      return { success: false, data: [] };
    }
  }
};
