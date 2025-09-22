import { useState, useEffect, useCallback } from 'react';
import { WSMessage, LogEntry } from '../types';

export const useWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [data, setData] = useState<any>({});

  const connect = useCallback(() => {
    const host = location.host.replace(':3000', ':8080');
    const wsUrl = `ws://${host}/ws`;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setWs(websocket);
      };
      
      websocket.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          
          // Add to logs
          const logEntry: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            topic: message.topic || 'bootstrap',
            payload: JSON.stringify(message.payload || message, null, 2)
          };
          
          setLogs(prev => [logEntry, ...prev.slice(0, 999)]);
          
          // Update data based on topic
          if (message.topic) {
            setData((prev: any) => ({
              ...prev,
              [message.topic]: message.payload
            }));
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setWs(null);
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          connect();
        }, 5000);
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setTimeout(() => {
        connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return { ws, isConnected, logs, data };
};