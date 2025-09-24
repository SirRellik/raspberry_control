import { DataAdapter, LogEntry, DataMessage } from './DataAdapter';

export class WebSocketAdapter implements DataAdapter {
  private ws: WebSocket | null = null;
  private onMessageCallback: ((message: DataMessage) => void) | null = null;
  
  public isConnected = false;
  public logs: LogEntry[] = [];
  public data: Record<string, any> = {};

  connect(onMessage: (message: DataMessage) => void): void {
    this.onMessageCallback = onMessage;
    
    // Nahradíme port 3000 -> 8080 nebo 4173 -> 8080 pro backend na Raspberry Pi
    const host = location.host.replace(':3000', ':8080').replace(':4173', ':8080');
    const wsUrl = `ws://${host}/ws`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to backend:', wsUrl);
        this.isConnected = true;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: DataMessage = JSON.parse(event.data);
          
          // Přidáme do logů
          const logEntry: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            topic: message.topic || 'bootstrap',
            payload: JSON.stringify(message.payload || message, null, 2)
          };
          
          this.logs = [logEntry, ...this.logs.slice(0, 999)];
          
          // Zpracování bootstrap zprávy (počáteční stav)
          if (message.bootstrap) {
            console.log('Received bootstrap data:', message.bootstrap);
            this.data = {
              ...this.data,
              bootstrap: message.bootstrap
            };
          }
          
          // Aktualizace dat podle topic (MQTT zprávy)
          else if (message.topic) {
            this.data = {
              ...this.data,
              [message.topic]: message.payload
            };
          }
          
          // Zavolej callback
          if (this.onMessageCallback) {
            this.onMessageCallback(message);
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (this.onMessageCallback) {
            this.connect(this.onMessageCallback);
          }
        }, 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setTimeout(() => {
        if (this.onMessageCallback) {
          this.connect(this.onMessageCallback);
        }
      }, 5000);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.onMessageCallback = null;
  }
}