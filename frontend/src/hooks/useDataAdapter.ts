import { useState, useEffect, useRef } from 'react';
import { DataAdapter, DataMessage } from '../adapters/DataAdapter';
import { WebSocketAdapter } from '../adapters/WebSocketAdapter';
import { MqttWsAdapter } from '../adapters/MqttWsAdapter';

export const useDataAdapter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>>({});
  const adapterRef = useRef<DataAdapter | null>(null);

  useEffect(() => {
    console.log('useDataAdapter: Inicializace...');
    
    // Výběr adaptéru
    const useMqtt = import.meta.env.VITE_USE_MQTT === 'true';
    
    let adapter: DataAdapter;
    if (useMqtt) {
      console.log('Using MQTT WebSocket adapter');
      adapter = new MqttWsAdapter();
    } else {
      console.log('Using Backend WebSocket adapter');
      adapter = new WebSocketAdapter();
    }
    
    adapterRef.current = adapter;

    // Callback pro zpracování zpráv
    const handleMessage = (message: DataMessage) => {
      console.log('Received data:', message);
      
      // Aktualizuj lokální stav
      setData(prevData => ({
        ...prevData,
        [message.topic]: message.payload
      }));
      
      // Aktualizuj logy
      const logEntry = `${new Date().toLocaleTimeString()}: ${message.topic} = ${JSON.stringify(message.payload)}`;
      setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 99)]);
    };

    // Připojení
    adapter.connect(handleMessage);
    
    // Polling pro stav připojení (MQTT knihovna neemituje všechny events správně)
    const statusInterval = setInterval(() => {
      if (adapter.isConnected !== isConnected) {
        console.log('Connection status changed:', adapter.isConnected);
        setIsConnected(adapter.isConnected);
      }
    }, 1000);

    // Cleanup
    return () => {
      console.log('useDataAdapter cleanup');
      clearInterval(statusInterval);
      if (adapter) {
        adapter.disconnect();
      }
    };
  }, []); // Prázdný dependency array - spustí se jen jednou

  return {
    isConnected,
    logs,
    data
  };
};
