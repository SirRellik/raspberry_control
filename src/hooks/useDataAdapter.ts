import { useState, useEffect, useRef } from 'react';
import { DataAdapter, LogEntry, DataMessage } from '../adapters/DataAdapter';
import { WebSocketAdapter } from '../adapters/WebSocketAdapter';
import { MqttWsAdapter } from '../adapters/MqttWsAdapter';

export const useDataAdapter = () => {
  const [adapter, setAdapter] = useState<DataAdapter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [data, setData] = useState<any>({});
  const adapterRef = useRef<DataAdapter | null>(null);

  useEffect(() => {
    // Vyber adaptér podle env proměnné
    const useMqtt = import.meta.env.VITE_USE_MQTT === 'true';

    let newAdapter: DataAdapter;
    if (useMqtt) {
      console.log('Using MQTT WebSocket adapter');
      newAdapter = new MqttWsAdapter();
    } else {
      console.log('Using Backend WebSocket adapter');
      newAdapter = new WebSocketAdapter();
    }

    adapterRef.current = newAdapter;
    setAdapter(newAdapter);

    // Callback pro zpracování zpráv
    const handleMessage = (message: DataMessage) => {
      // Aktualizuj stav z adaptéru (pouze pokud je stále aktivní)
      if (adapterRef.current) {
        setIsConnected(adapterRef.current.isConnected);
        setLogs([...adapterRef.current.logs]);
        setData({ ...adapterRef.current.data });
      }
    };

    newAdapter.connect(handleMessage);

    // Polling pro aktualizaci stavu
    const interval = setInterval(() => {
      if (adapterRef.current) {
        setIsConnected(adapterRef.current.isConnected);
        setLogs([...adapterRef.current.logs]);
        setData({ ...adapterRef.current.data });
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (adapterRef.current) {
        adapterRef.current.disconnect();
      }
      adapterRef.current = null;
    };
  }, []); // Prázdné dependencies - připojíme se pouze jednou

  return { adapter, isConnected, logs, data };
};