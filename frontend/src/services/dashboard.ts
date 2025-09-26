const API_BASE_URL = 'http://192.168.1.207:8001';

export interface DashboardData {
  power: {
    grid: number;
    pv: number;
    timestamp: number;
  };
  devices: {
    [key: string]: {
      power: number;
      status: string;
      name: string;
    };
  };
  prices: {
    current: number;
    hourly: Array<{hour: number, price_eur: number}>;
  };
  mqtt: {
    connected: boolean;
    topics: number;
  };
}

export const dashboardAPI = {
  getData: (): Promise<DashboardData> => 
    fetch(`${API_BASE_URL}/api/dashboard/data`).then(r => r.json()),
    
  getPowerHistory: () => 
    fetch(`${API_BASE_URL}/api/power/history`).then(r => r.json()),
    
  getDevicesStatus: () => 
    fetch(`${API_BASE_URL}/api/devices/status`).then(r => r.json())
};
