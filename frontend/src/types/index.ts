export interface ApiStatus {
  grid: { power: number; voltage: number; current: number };
  pv: { power: number; voltage: number; current: number };
  tuv: { temperature: number; target: number; heating: boolean };
  rooms: Room[];
  sockets: Socket[];
  plan: { schedule: any[] };
}

export interface Room {
  id: string;
  name: string;
  target_temp?: number;
}

export interface Socket {
  id: string;
  name: string;
}

export interface DataMessage {
  topic: string;
  payload: any;
}

export interface DataAdapter {
  connect(onMessage: (message: DataMessage) => void): Promise<void>;
  disconnect(): void;
  isConnected: boolean;
  logs: string[];
  data: Record<string, any>;
}

export interface OverrideRequest {
  type: string;
  payload: any;
}
