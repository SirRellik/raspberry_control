import mqtt from 'mqtt';
import { DataAdapter, LogEntry, DataMessage } from './DataAdapter';

export class MqttWsAdapter implements DataAdapter {
  private client: mqtt.MqttClient | null = null;
  private onMessageCallback: ((message: DataMessage) => void) | null = null;
  
  public isConnected = false;
  public logs: LogEntry[] = [];
  public data: Record<string, any> = {};

  private readonly topics = [
    'home/tele/grid',
    'home/tele/inverter', 
    'home/tele/temps',
    'home/plan/prices/day/+',
    'home/intent/hvac/+',
    'home/cmd/pump/rad',
    'home/cmd/tank/discharge',
    'home/status/+',
    'home/tele/loads',
    'home/tele/room/+/temp',
    'home/tele/room/+/motion',
    'home/tele/room/+/contact'
  ];

  connect(onMessage: (message: DataMessage) => void): void {
    this.onMessageCallback = onMessage;
    
    // Použij MQTT WebSocket URL z env nebo defaultní port 9001
    const mqttUrl = import.meta.env.VITE_MQTT_URL || `ws://${location.hostname}:9001`;
    
    try {
      console.log('Connecting to MQTT WebSocket:', mqttUrl);
      
      this.client = mqtt.connect(mqttUrl, {
        clientId: `ses-frontend-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000
      });
      
      this.client.on('connect', () => {
        console.log('MQTT WebSocket connected');
        this.isConnected = true;
        
        // Subscribe to all topics
        this.topics.forEach(topic => {
          this.client?.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}:`, err);
            } else {
              console.log(`Subscribed to ${topic}`);
            }
          });
        });
      });
      
      this.client.on('message', (topic, payload) => {
        try {
          let parsedPayload;
          try {
            parsedPayload = JSON.parse(payload.toString());
          } catch {
            parsedPayload = payload.toString();
          }
          
          // Přidáme do logů
          const logEntry: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            topic,
            payload: JSON.stringify(parsedPayload, null, 2)
          };
          
          this.logs = [logEntry, ...this.logs.slice(0, 999)];
          
          // Aktualizace dat
          this.data = {
            ...this.data,
            [topic]: parsedPayload
          };
          
          // Zavolej callback ve formátu kompatibilním s WebSocketAdapter
          if (this.onMessageCallback) {
            this.onMessageCallback({
              topic,
              payload: parsedPayload
            });
          }
          
        } catch (error) {
          console.error('Error processing MQTT message:', error);
        }
      });
      
      this.client.on('disconnect', () => {
        console.log('MQTT WebSocket disconnected');
        this.isConnected = false;
      });
      
      this.client.on('error', (error) => {
        console.error('MQTT WebSocket error:', error);
        this.isConnected = false;
      });
      
      this.client.on('close', () => {
        console.log('MQTT WebSocket connection closed');
        this.isConnected = false;
      });
      
    } catch (error) {
      console.error('Failed to create MQTT WebSocket connection:', error);
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.isConnected = false;
    this.onMessageCallback = null;
  }
}