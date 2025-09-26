const API_BASE_URL = 'http://192.168.1.207:8001';

export const api = {
  health: () => fetch(`${API_BASE_URL}/health`).then(r => r.json()),
  
  boiler: {
    set: (on: boolean) => 
      fetch(`${API_BASE_URL}/api/boiler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on })
      }).then(r => r.json())
  },
  
  prices: {
    today: () => fetch(`${API_BASE_URL}/api/prices/today`).then(r => r.json()),
    day: (day: string) => fetch(`${API_BASE_URL}/api/prices/${day}`).then(r => r.json())
  },
  
  power: {
    current: () => fetch(`${API_BASE_URL}/api/power/current`).then(r => r.json()),
    history: () => fetch(`${API_BASE_URL}/api/power/history`).then(r => r.json())
  }
};
