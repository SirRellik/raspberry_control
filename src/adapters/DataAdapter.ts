export interface LogEntry {
  id: string;
  timestamp: string;
  topic: string;
  payload: string;
}

export interface DataMessage {
  topic?: string;
  payload?: any;
  bootstrap?: any;
}

export interface DataAdapter {
  isConnected: boolean;
  logs: LogEntry[];
  data: Record<string, any>;
  
  connect(onMessage: (message: DataMessage) => void): void;
  disconnect(): void;
}