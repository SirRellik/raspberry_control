import { useState, useEffect, useCallback } from 'react';
import { DataAdapter, LogEntry, DataMessage } from '../adapters/DataAdapter';
import { WebSocketAdapter } from '../adapters/WebSocketAdapter';
import { MqttWsAdapter } from '../adapters/MqttWsAdapter';

export const useDataAdapter = () => {
  const [adapter, setAdapter] = useState<DataAdapter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [data, setData] = useState<any>({});

  const handleMessage = useCallback((message: DataMessage) => {
    // Aktualizuj stav z adaptéru
    if (adapter) {
      setIsConnected(adapter.isConnected);
      setLogs([...adapter.logs]);
      setData({ ...adapter.data });
    }
  }, [adapter]);

  const connect = useCallback(() => {
    // Vyber adaptér podle env proměnné
    // Defaultně používáme MQTT adapter pro Raspberry Pi (pokud není explicitně vypnutý)
    const useMqtt = import.meta.env.VITE_USE_MQTT !== 'false';

    let newAdapter: DataAdapter;
    if (useMqtt) {
      console.log('Using MQTT WebSocket adapter');
      newAdapter = new MqttWsAdapter();
    } else {
      console.log('Using Backend WebSocket adapter');
      newAdapter = new WebSocketAdapter();
    }
    
    setAdapter(newAdapter);
    newAdapter.connect(handleMessage);
    
    // Polling pro aktualizaci stavu
    const interval = setInterval(() => {
      setIsConnected(newAdapter.isConnected);
      setLogs([...newAdapter.logs]);
      setData({ ...newAdapter.data });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      newAdapter.disconnect();
    };
  }, [handleMessage]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { adapter, isConnected, logs, data };
};