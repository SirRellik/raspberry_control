export interface ApiStatus {
  grid_kw: number;
  pv_kw: number;
  tuv_c: number;
  rooms: Room[];
  sockets: Socket[];
}

export interface Room {
  name: string;
  current_temp?: number;
  target_temp: number;
  contact: boolean;
  motion: boolean;
  last_motion?: string;
}

export interface Socket {
  id: string;
  name: string;
  status: boolean;
  power_w: number;
}

export interface WSMessage {
  topic?: string;
  payload?: any;
  bootstrap?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  topic: string;
  payload: string;
}

export interface ChartDataPoint {
  time: string;
  pv: number;
  grid: number;
}

export interface PriceDataPoint {
  hour: number;
  price: number;
}

export interface OverrideRequest {
  type: string;
  payload: any;
}

export interface DataMessage {
  topic?: string;
  payload?: any;
  bootstrap?: any;
}