import mqtt from 'mqtt';
import { DataAdapter, DataMessage } from './DataAdapter';

export class MqttWsAdapter implements DataAdapter {
  private client: mqtt.MqttClient | null = null;
  private onMessageCallback: ((message: DataMessage) => void) | null = null;
  
  public isConnected = false;
  public logs: string[] = [];
  public data: Record<string, any> = {};

  private readonly topics = [
    // Původní témata z dokumentace
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
    'home/tele/room/+/contact',
    // Přidaná témata pro Shelly zařízení
    'shellypro1pm-ec6260828c90/status',
    'shellypro2-2cbcbb9e7908/status',
    'shellypro3em63-2cbcbbb3318c/status',
    // Testovací téma
    'test/topic'
  ];

  connect(onMessage: (message: DataMessage) => void): void {
    this.onMessageCallback = onMessage;
    
    const mqttUrl = import.meta.env.VITE_MQTT_URL || 'ws://192.168.1.207:9001';
    const mqttUser = import.meta.env.VITE_MQTT_USER || 'skaly57';
    const mqttPass = import.meta.env.VITE_MQTT_PASS || '8602056243';
    
    console.log('MQTT WebSocket connecting to:', mqttUrl, 'User:', mqttUser);
    
    try {
      this.client = mqtt.connect(mqttUrl, {
        clientId: `ses-frontend-${Math.random().toString(16).substr(2, 8)}`,
        username: mqttUser,
        password: mqttPass,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000
      });
      
      this.client.on('connect', () => {
        console.log('✅ MQTT WebSocket connected successfully');
        this.isConnected = true;
        
        // Subscribe ke všem tématům
        this.topics.forEach(topic => {
          this.client?.subscribe(topic, { qos: 0 }, (err) => {
            if (err) {
              console.error(`❌ Subscribe failed for ${topic}:`, err);
            } else {
              console.log(`✅ Subscribed to: ${topic}`);
            }
          });
        });
      });
      
      this.client.on('message', (topic, payload) => {
        console.log(`📨 MQTT message received: ${topic}`, payload.toString());
        
        try {
          let parsedPayload;
          try {
            parsedPayload = JSON.parse(payload.toString());
          } catch {
            parsedPayload = payload.toString();
          }
          
          // Uložit do lokálních dat
          this.data[topic] = parsedPayload;
          
          // Přidat do logů
          const logEntry = `${new Date().toLocaleTimeString()}: ${topic} = ${payload.toString()}`;
          this.logs = [logEntry, ...this.logs.slice(0, 99)];
          
          // Zavolat callback
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
        console.error('❌ MQTT WebSocket error:', error);
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

  // Přidej témata která skutečně používáš
  private readonly topics = [
    'shellypro1pm-ec6260828c90/status',
    'shellypro2-2cbcbb9e7908/status', 
    'shellypro3em63-2cbcbbb3318c/status',
    'home/tele/grid',
    'test/topic',
    '+/status',  // Všechna status témata
    '+/events'   // Všechna events témata
  ];
